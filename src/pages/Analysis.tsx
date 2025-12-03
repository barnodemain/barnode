import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { IoArrowBack } from 'react-icons/io5'
import { useArticoli } from '../hooks/useArticoli'
import { createAndSaveCurrentSnapshot } from '../lib/backupService'
import { normalizeArticleName } from '../lib/normalize'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Articolo } from '../types'

interface ArticleGroup {
  id: string
  articles: Articolo[]
  sharedKeywords: string[]
}

function getCategory(name: string): string | null {
  const normalized = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
  const firstWord = normalized.split(/\s+/).find(Boolean)
  return firstWord || null
}

function groupArticlesBySharedKeywords(articoli: Articolo[]): ArticleGroup[] {
  if (articoli.length === 0) return []

  // Raggruppa per parola chiave principale (prima parola normalizzata)
  const categoryMap = new Map<string, Articolo[]>()
  articoli.forEach(article => {
    const category = getCategory(article.nome)
    if (!category) return
    if (!categoryMap.has(category)) {
      categoryMap.set(category, [])
    }
    categoryMap.get(category)!.push(article)
  })

  const allGroups: ArticleGroup[] = []

  categoryMap.forEach(categoryArticles => {
    if (categoryArticles.length < 2) return
    // Tutti gli articoli con la stessa categoria (prima parola) formano un unico gruppo
    const sortedArticles = [...categoryArticles].sort((a, b) => a.nome.localeCompare(b.nome))
    const groupIds = sortedArticles.map(a => a.id)
    const groupKey = groupIds.join('|')

    allGroups.push({
      id: groupKey,
      articles: sortedArticles,
      sharedKeywords: [getCategory(sortedArticles[0].nome) || '']
    })
  })

  // Deduplica globalmente per insieme di articoli
  const uniqueGroups = new Map<string, ArticleGroup>()
  allGroups.forEach(group => {
    const key = group.articles.map(a => a.id).sort().join('|')
    if (!uniqueGroups.has(key)) {
      uniqueGroups.set(key, group)
    }
  })

  return Array.from(uniqueGroups.values()).sort((a, b) => b.articles.length - a.articles.length)
}

function Analysis() {
  const navigate = useNavigate()
  const { articoli, loading, error, fetchArticoli } = useArticoli()
  const [selectedByGroup, setSelectedByGroup] = useState<Record<string, string[]>>({})
  const [finalNameModeByGroup, setFinalNameModeByGroup] = useState<Record<string, 'existing' | 'new'>>({})
  const [selectedNameSourceByGroup, setSelectedNameSourceByGroup] = useState<Record<string, string | null>>({})
  const [finalNameInputByGroup, setFinalNameInputByGroup] = useState<Record<string, string>>({})
  const [consolidating, setConsolidating] = useState(false)
  const [consolidationMessage, setConsolidationMessage] = useState<string | null>(null)
  const [ignoredGroupIds, setIgnoredGroupIds] = useState<Set<string>>(new Set())

  const groups = useMemo(() => {
    return groupArticlesBySharedKeywords(articoli)
  }, [articoli])

  // Filter out ignored groups
  const visibleGroups = groups.filter(g => !ignoredGroupIds.has(g.id))

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

      setSelectedByGroup(prev => {
        const updated = { ...prev }
        delete updated[group.id]
        return updated
      })

      setFinalNameModeByGroup(prev => {
        const updated = { ...prev }
        delete updated[group.id]
        return updated
      })

      setSelectedNameSourceByGroup(prev => {
        const updated = { ...prev }
        delete updated[group.id]
        return updated
      })

      setFinalNameInputByGroup(prev => {
        const updated = { ...prev }
        delete updated[group.id]
        return updated
      })

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
      return updated
    })
  }

  return (
    <div className="page-wrapper">
      <div className="page-header-fixed">
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', width: '100%', paddingLeft: '16px' }}>
            <button
              onClick={() => navigate('/settings')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '8px',
                marginLeft: '-8px'
              }}
              aria-label="Indietro"
            >
              <IoArrowBack size={28} color="var(--color-text)" />
            </button>
            <img src="/logo.png" alt="BARnode" className="logo" style={{ marginLeft: 'auto', marginRight: 'auto' }} />
            <div style={{ width: '44px' }} />
          </div>
          <h1 className="page-title">Analysis</h1>
        </div>
      </div>

      <div className="page-content-scrollable">
        {consolidationMessage && (
          <div style={{
            padding: '12px 16px',
            marginBottom: '8px',
            backgroundColor: consolidationMessage.includes('Errore') ? '#ffebee' : '#e8f5e9',
            color: consolidationMessage.includes('Errore') ? '#c62828' : '#2e7d32',
            borderRadius: '8px',
            textAlign: 'center',
            fontSize: '14px'
          }}>
            {consolidationMessage}
          </div>
        )}

        {error && <div className="error-message" style={{ marginBottom: '16px' }}>{error}</div>}

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : visibleGroups.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">✓</div>
            <p className="empty-state-text">
              {ignoredGroupIds.size > 0 
                ? 'Tutti i gruppi sono stati ignorati' 
                : 'Nessun articolo duplicato o simile trovato'}
            </p>
          </div>
        ) : (
          <div style={{ paddingBottom: '80px' }}>
            {visibleGroups.map(group => {
              const selectedIds = selectedByGroup[group.id] || []
              const mode = finalNameModeByGroup[group.id] || 'existing'
              const canConsolidate =
                selectedIds.length > 0 &&
                ((mode === 'existing' && (selectedNameSourceByGroup[group.id] || selectedIds[0])) ||
                  (mode === 'new' && (finalNameInputByGroup[group.id] || '').trim().length > 0))

              return (
                <div
                  key={group.id}
                  className="item-card"
                  style={{
                    marginBottom: '16px',
                    cursor: 'default',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div
                    style={{
                      marginBottom: '12px',
                      textAlign: 'center'
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 'bold',
                        fontSize: '16px',
                        color: 'var(--color-green-dark)',
                        marginBottom: '4px'
                      }}
                    >
                      Analizza somiglianze
                    </div>
                    {group.sharedKeywords.length > 0 && (
                      <div
                        style={{
                          fontSize: '12px',
                          color: 'var(--color-text-light)',
                          fontStyle: 'italic'
                        }}
                      >
                        Parole chiave: {group.sharedKeywords.join(', ')}
                      </div>
                    )}
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {group.articles.map(article => {
                        const normalizedName = normalizeArticleName(article.nome)
                        const isChecked = selectedIds.includes(article.id)
                        return (
                          <label
                            key={article.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '10px',
                              backgroundColor: 'var(--color-cream-light)',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '14px'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                setSelectedByGroup(prev => {
                                  const current = prev[group.id] || []
                                  const exists = current.includes(article.id)
                                  const next = exists
                                    ? current.filter(id => id !== article.id)
                                    : [...current, article.id]
                                  return { ...prev, [group.id]: next }
                                })
                              }}
                              style={{ cursor: 'pointer', flexShrink: 0 }}
                            />
                            <span>{normalizedName}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: '14px',
                        marginBottom: '8px'
                      }}
                    >
                      Nome finale
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '14px'
                        }}
                      >
                        <input
                          type="radio"
                          name={`final-mode-${group.id}`}
                          checked={mode === 'existing'}
                          onChange={() =>
                            setFinalNameModeByGroup(prev => ({ ...prev, [group.id]: 'existing' }))
                          }
                          style={{ cursor: 'pointer' }}
                        />
                        <span>Usa nome esistente</span>
                      </label>

                      {mode === 'existing' && selectedIds.length > 0 && (
                        <div style={{ marginLeft: '24px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {group.articles
                            .filter(a => selectedIds.includes(a.id))
                            .map(article => {
                              const normalizedName = normalizeArticleName(article.nome)
                              const selectedSourceId =
                                selectedNameSourceByGroup[group.id] || selectedIds[0]
                              return (
                                <label
                                  key={article.id}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '14px'
                                  }}
                                >
                                  <input
                                    type="radio"
                                    name={`final-existing-${group.id}`}
                                    checked={selectedSourceId === article.id}
                                    onChange={() =>
                                      setSelectedNameSourceByGroup(prev => ({
                                        ...prev,
                                        [group.id]: article.id
                                      }))
                                    }
                                    style={{ cursor: 'pointer' }}
                                  />
                                  <span>{normalizedName}</span>
                                </label>
                              )
                            })}
                        </div>
                      )}

                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '14px'
                        }}
                      >
                        <input
                          type="radio"
                          name={`final-mode-${group.id}`}
                          checked={mode === 'new'}
                          onChange={() =>
                            setFinalNameModeByGroup(prev => ({ ...prev, [group.id]: 'new' }))
                          }
                          style={{ cursor: 'pointer' }}
                        />
                        <span>Inserisci nuovo nome</span>
                      </label>

                      {mode === 'new' && (
                        <input
                          type="text"
                          value={finalNameInputByGroup[group.id] || ''}
                          onChange={e =>
                            setFinalNameInputByGroup(prev => ({
                              ...prev,
                              [group.id]: e.target.value
                            }))
                          }
                          placeholder="Nuovo nome finale"
                          style={{
                            marginLeft: '24px',
                            padding: '8px 10px',
                            borderRadius: '6px',
                            border: '1px solid #ddd',
                            fontSize: '14px',
                            width: '100%'
                          }}
                        />
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                    <button
                      onClick={() => handleConsolidate(group)}
                      disabled={!canConsolidate || consolidating}
                      style={{
                        flex: 1,
                        minHeight: '44px',
                        padding: '10px',
                        backgroundColor:
                          canConsolidate && !consolidating
                            ? 'var(--color-green-light)'
                            : '#ccc',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor:
                          canConsolidate && !consolidating ? 'pointer' : 'not-allowed',
                        opacity: canConsolidate ? 1 : 0.7
                      }}
                    >
                      {consolidating ? 'Consolidamento...' : 'Consolida'}
                    </button>
                    <button
                      onClick={() => handleIgnore(group.id)}
                      style={{
                        flex: 1,
                        minHeight: '44px',
                        padding: '10px',
                        backgroundColor: 'var(--color-red)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Ignora
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Analysis
