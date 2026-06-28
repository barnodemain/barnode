import { useState } from 'react'
import { createAndSaveCurrentSnapshot } from '../lib/backupService'
import { normalizeArticleName } from '../lib/normalize'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { ArticleGroup } from '../lib/analysisGrouping'

const IGNORED_KEY = 'analysis_ignored_group_ids'

function loadIgnoredGroupIds(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = window.localStorage.getItem(IGNORED_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return new Set()
    return new Set(parsed.map(String))
  } catch {
    return new Set()
  }
}

export function useConsolidation(fetchArticoli: () => Promise<void>) {
  const [selectedByGroup, setSelectedByGroup] = useState<Record<string, string[]>>({})
  const [finalNameModeByGroup, setFinalNameModeByGroup] = useState<Record<string, 'existing' | 'new'>>({})
  const [selectedNameSourceByGroup, setSelectedNameSourceByGroup] = useState<Record<string, string | null>>({})
  const [finalNameInputByGroup, setFinalNameInputByGroup] = useState<Record<string, string>>({})
  const [consolidating, setConsolidating] = useState(false)
  const [consolidationMessage, setConsolidationMessage] = useState<string | null>(null)
  const [ignoredGroupIds, setIgnoredGroupIds] = useState<Set<string>>(loadIgnoredGroupIds)

  const toggleSelected = (groupId: string, articleId: string) => {
    setSelectedByGroup(prev => {
      const current = prev[groupId] || []
      const exists = current.includes(articleId)
      const next = exists
        ? current.filter(id => id !== articleId)
        : [...current, articleId]
      return { ...prev, [groupId]: next }
    })
  }

  const setMode = (groupId: string, mode: 'existing' | 'new') =>
    setFinalNameModeByGroup(prev => ({ ...prev, [groupId]: mode }))

  const setNameSource = (groupId: string, articleId: string) =>
    setSelectedNameSourceByGroup(prev => ({ ...prev, [groupId]: articleId }))

  const setNameInput = (groupId: string, value: string) =>
    setFinalNameInputByGroup(prev => ({ ...prev, [groupId]: value }))

  const handleConsolidate = async (group: ArticleGroup) => {
    const selectedIds = selectedByGroup[group.id] || []
    if (selectedIds.length === 0) return

    if (!isSupabaseConfigured() || !supabase) {
      setConsolidationMessage('Supabase non configurato')
      return
    }

    const mode = finalNameModeByGroup[group.id] || 'existing'
    const articlesById = new Map(group.articles.map(a => [a.id, a]))

    let finalNameRaw: string
    if (mode === 'existing') {
      const sourceId = selectedNameSourceByGroup[group.id] || selectedIds[0]
      const sourceArticle = articlesById.get(sourceId)
      if (!sourceArticle) return
      finalNameRaw = sourceArticle.nome
    } else {
      const input = (finalNameInputByGroup[group.id] || '').trim()
      if (!input) return
      finalNameRaw = input
    }

    const finalName = normalizeArticleName(finalNameRaw)

    const masterId = selectedIds[0]
    const masterArticle = articlesById.get(masterId)
    if (!masterArticle) return

    setConsolidating(true)
    setConsolidationMessage(null)

    try {
      // Aggiorna il nome del master
      const { error: updateMasterError } = await supabase
        .from('articoli')
        .update({ nome: finalName })
        .eq('id', masterId)

      if (updateMasterError) throw updateMasterError

      // Reindirizza i missing_items dagli articoli eliminati al master
      const idsToRemove = selectedIds.filter(id => id !== masterId)

      for (const id of idsToRemove) {
        const { error: updateMissingError } = await supabase
          .from('missing_items')
          .update({ articolo_id: masterId, articolo_nome: finalName })
          .eq('articolo_id', id)

        if (updateMissingError) throw updateMissingError

        const { error: deleteArticleError } = await supabase
          .from('articoli')
          .delete()
          .eq('id', id)

        if (deleteArticleError) throw deleteArticleError
      }

      await createAndSaveCurrentSnapshot().catch(e => console.error('Backup failed:', e))
      await fetchArticoli()

      setConsolidationMessage('Articoli consolidati con successo')

      const clearGroup = <T,>(setter: React.Dispatch<React.SetStateAction<Record<string, T>>>) =>
        setter(prev => {
          const updated = { ...prev }
          delete updated[group.id]
          return updated
        })

      clearGroup(setSelectedByGroup)
      clearGroup(setFinalNameModeByGroup)
      clearGroup(setSelectedNameSourceByGroup)
      clearGroup(setFinalNameInputByGroup)

      setTimeout(() => setConsolidationMessage(null), 3000)
    } catch (err) {
      setConsolidationMessage(`Errore: ${err instanceof Error ? err.message : 'Consolidamento fallito'}`)
    } finally {
      setConsolidating(false)
    }
  }

  const handleIgnore = (groupId: string) => {
    setIgnoredGroupIds(prev => {
      const updated = new Set(prev)
      updated.add(groupId)
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(IGNORED_KEY, JSON.stringify(Array.from(updated)))
        } catch {
          // Ignora eventuali errori di storage senza bloccare la UI
        }
      }
      return updated
    })
  }

  return {
    selectedByGroup,
    finalNameModeByGroup,
    selectedNameSourceByGroup,
    finalNameInputByGroup,
    consolidating,
    consolidationMessage,
    ignoredGroupIds,
    toggleSelected,
    setMode,
    setNameSource,
    setNameInput,
    handleConsolidate,
    handleIgnore,
  }
}
