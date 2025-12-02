import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { IoArrowBack, IoClose } from 'react-icons/io5'
import { useArticoli } from '../hooks/useArticoli'
import { createAndSaveCurrentSnapshot } from '../lib/backupService'
import type { Articolo } from '../types'

interface ArticleGroup {
  id: string
  articles: Articolo[]
  sharedKeywords: string[]
}

const STOPWORDS = new Set([
  'vodka', 'rum', 'gin', 'vino', 'birra', 'amaro', 'liquore', 'soda', 'acqua', 'cibo', 'articolo', 'drink', 'bottle',
  'di', 'al', 'alla', 'con', 'the', 'a', 'da', 'per', 'and', 'or', 'la', 'le', 'il', 'lo', 'un', 'uno', 'una',
  'è', 'su', 'da', 'e', 'che', 'this', 'it', 'in', 'on', 'at', 'by', 'l', 'is', 'mini', 'size', 'bottle', 'ml', 'cc'
])

function normalizeAndTokenize(name: string): string[] {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/\s+/)
    .filter(word => {
      // Filter: length > 2, not pure numbers, not in stopwords
      return word.length > 2 && !/^\d+$/.test(word) && !STOPWORDS.has(word)
    })
}

function groupArticlesBySharedKeywords(articoli: Articolo[]): ArticleGroup[] {
  if (articoli.length === 0) return []

  // Build keyword signatures for each article
  const articleKeywords = new Map<string, Set<string>>()
  const keywordToArticles = new Map<string, Set<string>>()

  articoli.forEach(article => {
    const keywords = normalizeAndTokenize(article.nome)
    if (keywords.length > 0) {
      articleKeywords.set(article.id, new Set(keywords))
      
      keywords.forEach(keyword => {
        if (!keywordToArticles.has(keyword)) {
          keywordToArticles.set(keyword, new Set())
        }
        keywordToArticles.get(keyword)!.add(article.id)
      })
    }
  })

  // Find articles that share keywords
  const grouped = new Set<Set<string>>()
  const groups: ArticleGroup[] = []
  const articleById = new Map(articoli.map(a => [a.id, a]))

  articleKeywords.forEach((keywords, articleId) => {
    // Find all article IDs that share at least one keyword with this article
    const relatedArticleIds = new Set<string>([articleId])
    
    keywords.forEach(keyword => {
      keywordToArticles.get(keyword)?.forEach(id => {
        relatedArticleIds.add(id)
      })
    })

    // Only create a group if there are 2+ distinct articles
    if (relatedArticleIds.size >= 2) {
      const groupKey = Array.from(relatedArticleIds).sort().join('|')
      
      if (!grouped.has(new Set(relatedArticleIds))) {
        grouped.add(new Set(relatedArticleIds))
        
        const groupArticles = Array.from(relatedArticleIds)
          .map(id => articleById.get(id)!)
          .sort((a, b) => a.nome.localeCompare(b.nome))
        
        const sharedKeywords = relatedArticleIds.size >= 2
          ? Array.from(keywords).slice(0, 3)
          : []
        
        groups.push({
          id: groupKey,
          articles: groupArticles,
          sharedKeywords
        })
      }
    }
  })

  // Deduplicate groups (remove if same article set already exists)
  const uniqueGroups = new Map<string, ArticleGroup>()
  groups.forEach(group => {
    const key = group.articles.map(a => a.id).sort().join('|')
    if (!uniqueGroups.has(key)) {
      uniqueGroups.set(key, group)
    }
  })

  return Array.from(uniqueGroups.values())
    .sort((a, b) => b.articles.length - a.articles.length)
}

function Analysis() {
  const navigate = useNavigate()
  const { articoli, loading, error, updateArticolo } = useArticoli()
  const [selectedPrimary, setSelectedPrimary] = useState<{[groupId: string]: string}>({})
  const [consolidating, setConsolidating] = useState(false)
  const [consolidationMessage, setConsolidationMessage] = useState<string | null>(null)
  const [ignoredGroupIds, setIgnoredGroupIds] = useState<Set<string>>(new Set())

  const groups = useMemo(() => {
    return groupArticlesBySharedKeywords(articoli)
  }, [articoli])

  // Filter out ignored groups
  const visibleGroups = groups.filter(g => !ignoredGroupIds.has(g.id))

  const handleConsolidate = async (group: ArticleGroup) => {
    const primaryId = selectedPrimary[group.id]
    if (!primaryId) return

    const primaryArticle = group.articles.find(a => a.id === primaryId)
    if (!primaryArticle) return

    setConsolidating(true)
    setConsolidationMessage(null)

    try {
      // Update all other articles in the group to have the primary name
      for (const article of group.articles) {
        if (article.id !== primaryId) {
          await updateArticolo(article.id, primaryArticle.nome)
        }
      }

      setConsolidationMessage('Articoli consolidati con successo')
      setSelectedPrimary(prev => {
        const updated = { ...prev }
        delete updated[group.id]
        return updated
      })

      await createAndSaveCurrentSnapshot().catch(e => console.error('Backup failed:', e))

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
            {visibleGroups.map((group) => (
              <div key={group.id} className="item-card" style={{ marginBottom: '16px', cursor: 'default' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '12px'
                }}>
                  <div>
                    <div style={{
                      fontWeight: 'bold',
                      fontSize: '16px',
                      color: 'var(--color-green-dark)',
                      marginBottom: '4px'
                    }}>
                      Gruppo duplicato ({group.articles.length} articoli)
                    </div>
                    {group.sharedKeywords.length > 0 && (
                      <div style={{
                        fontSize: '12px',
                        color: 'var(--color-text-light)',
                        fontStyle: 'italic'
                      }}>
                        Keywords: {group.sharedKeywords.join(', ')}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleIgnore(group.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-gray)'
                    }}
                    aria-label="Ignora questo gruppo"
                  >
                    <IoClose size={22} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                  {group.articles.map(article => (
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
                        type="radio"
                        name={`primary-${group.id}`}
                        checked={selectedPrimary[group.id] === article.id}
                        onChange={() => setSelectedPrimary(prev => ({
                          ...prev,
                          [group.id]: article.id
                        }))}
                        style={{ cursor: 'pointer', flexShrink: 0 }}
                      />
                      <span>{article.nome}</span>
                    </label>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleConsolidate(group)}
                    disabled={!selectedPrimary[group.id] || consolidating}
                    style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: selectedPrimary[group.id] ? 'var(--color-green-light)' : '#ccc',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: selectedPrimary[group.id] && !consolidating ? 'pointer' : 'not-allowed',
                      opacity: selectedPrimary[group.id] ? 1 : 0.6
                    }}
                  >
                    {consolidating ? 'Consolidamento...' : 'Consolida'}
                  </button>
                  <button
                    onClick={() => handleIgnore(group.id)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: '#f0f0f0',
                      color: 'var(--color-text)',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Ignora
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Analysis
