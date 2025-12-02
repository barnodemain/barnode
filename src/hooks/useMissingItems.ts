import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { MissingItemWithRelation, Articolo } from '../types'

interface MissingItemRow {
  id: string
  articolo_id: string
  articoli: { nome: string }[] | { nome: string } | null
}

function getArticoloNome(articoli: MissingItemRow['articoli']): string {
  if (!articoli) return 'Articolo sconosciuto'
  if (Array.isArray(articoli)) {
    return articoli[0]?.nome || 'Articolo sconosciuto'
  }
  return articoli.nome || 'Articolo sconosciuto'
}

export function useMissingItems() {
  const [missingItems, setMissingItems] = useState<MissingItemWithRelation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMissingItems = useCallback(async () => {
    if (!isSupabaseConfigured() || !supabase) {
      setError('Supabase non configurato. Aggiungi VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const { data, error: fetchError } = await supabase
        .from('missing_items')
        .select(`
          id,
          articolo_id,
          articoli (
            nome
          )
        `)
        .order('created_at', { ascending: true })

      if (fetchError) throw fetchError

      const mappedItems: MissingItemWithRelation[] = ((data || []) as unknown as MissingItemRow[]).map((item) => ({
        id: item.id,
        articoloId: item.articolo_id,
        articoloNome: getArticoloNome(item.articoli)
      })).sort((a, b) => a.articoloNome.localeCompare(b.articoloNome))

      setMissingItems(mappedItems)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel caricamento degli articoli mancanti')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMissingItems()
  }, [fetchMissingItems])

  const addMissingItem = async (articolo: Articolo): Promise<boolean> => {
    if (!isSupabaseConfigured() || !supabase) {
      setError('Supabase non configurato')
      return false
    }

    const exists = missingItems.some(m => m.articoloId === articolo.id)
    if (exists) {
      return true
    }

    try {
      setError(null)
      const { data, error: insertError } = await supabase
        .from('missing_items')
        .insert([{
          articolo_id: articolo.id
        }])
        .select(`
          id,
          articolo_id,
          articoli (
            nome
          )
        `)
        .single()

      if (insertError) throw insertError

      const row = data as unknown as MissingItemRow
      const newItem: MissingItemWithRelation = {
        id: row.id,
        articoloId: row.articolo_id,
        articoloNome: getArticoloNome(row.articoli) || articolo.nome
      }

      setMissingItems(prev => 
        [...prev, newItem].sort((a, b) => a.articoloNome.localeCompare(b.articoloNome))
      )
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nell\'aggiunta dell\'articolo mancante')
      return false
    }
  }

  const removeMissingItem = async (id: string): Promise<boolean> => {
    if (!isSupabaseConfigured() || !supabase) {
      setError('Supabase non configurato')
      return false
    }

    try {
      setError(null)
      const { error: deleteError } = await supabase
        .from('missing_items')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      setMissingItems(prev => prev.filter(m => m.id !== id))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nella rimozione dell\'articolo mancante')
      return false
    }
  }

  const isArticoloMissing = (articoloId: string): boolean => {
    return missingItems.some(m => m.articoloId === articoloId)
  }

  return {
    missingItems,
    loading,
    error,
    fetchMissingItems,
    addMissingItem,
    removeMissingItem,
    isArticoloMissing,
    clearError: () => setError(null)
  }
}
