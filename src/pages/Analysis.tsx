import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { IoArrowBack } from 'react-icons/io5'
import { useArticoli } from '../hooks/useArticoli'
import { createAndSaveCurrentSnapshot } from '../lib/backupService'
import type { Articolo } from '../types'

interface ArticleGroup {
  keyword: string
  articles: Articolo[]
}

const STOPWORDS = new Set([
  'vodka', 'rum', 'gin', 'vino', 'birra', 'amaro', 'liquore', 'soda', 'acqua', 'cibo', 'articolo', 'drink', 'bottle',
  'di', 'al', 'alla', 'con', 'the', 'a', 'da', 'per', 'and', 'or', 'la', 'le', 'il', 'lo', 'un', 'uno', 'una',
  'è', 'su', 'da', 'e', 'che', 'this', 'it', 'in', 'on', 'at', 'by'
])

function normalizeAndTokenize(name: string): string[] {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 0 && !STOPWORDS.has(word))
}

function groupArticlesByKeywords(articoli: Articolo[]): ArticleGroup[] {
  const keywordMap = new Map<string, Set<string>>()
  
  articoli.forEach(article => {
    const keywords = normalizeAndTokenize(article.nome)
    keywords.forEach(keyword => {
      if (!keywordMap.has(keyword)) {
        keywordMap.set(keyword, new Set())
      }
      keywordMap.get(keyword)!.add(article.id)
    })
  })

  const groups = new Map<string, Articolo[]>()
  const articleById = new Map(articoli.map(a => [a.id, a]))

  keywordMap.forEach((articleIds, keyword) => {
    if (articleIds.size >= 2) {
      const groupArticles = Array.from(articleIds)
        .map(id => articleById.get(id)!)
        .sort((a, b) => a.nome.localeCompare(b.nome))
      
      groups.set(keyword, groupArticles)
    }
  })

  return Array.from(groups.entries())
    .map(([keyword, articles]) => ({ keyword, articles }))
    .sort((a, b) => b.articles.length - a.articles.length)
}

function Analysis() {
  const navigate = useNavigate()
  const { articoli, loading, error, updateArticolo } = useArticoli()
  const [selectedPrimary, setSelectedPrimary] = useState<{[groupKeyword: string]: string}>({})
  const [consolidating, setConsolidating] = useState(false)
  const [consolidationMessage, setConsolidationMessage] = useState<string | null>(null)

  const groups = useMemo(() => {
    return groupArticlesByKeywords(articoli)
  }, [articoli])

  const handleConsolidate = async (group: ArticleGroup) => {
    const primaryId = selectedPrimary[group.keyword]
    if (!primaryId) return

    const primaryArticle = group.articles.find(a => a.id === primaryId)
    if (!primaryArticle) return

    setConsolidating(true)
    setConsolidationMessage(null)

    try {
      for (const article of group.articles) {
        if (article.id !== primaryId) {
          await updateArticolo(article.id, primaryArticle.nome)
        }
      }

      setConsolidationMessage(`Consolidamento completato: ${group.articles.length} articoli raggruppati`)
      setSelectedPrimary(prev => {
        const updated = { ...prev }
        delete updated[group.keyword]
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
            backgroundColor: '#e8f5e9',
            color: '#2e7d32',
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
        ) : groups.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">✓</div>
            <p className="empty-state-text">Nessun articolo duplicato o simile trovato</p>
          </div>
        ) : (
          <div style={{ paddingBottom: '80px' }}>
            {groups.map((group, groupIndex) => (
              <div key={groupIndex} className="item-card" style={{ marginBottom: '16px', cursor: 'default' }}>
                <div style={{
                  fontWeight: 'bold',
                  fontSize: '16px',
                  marginBottom: '12px',
                  color: 'var(--color-green-dark)',
                  textTransform: 'capitalize'
                }}>
                  {group.keyword} ({group.articles.length})
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
                        name={`primary-${group.keyword}`}
                        checked={selectedPrimary[group.keyword] === article.id}
                        onChange={() => setSelectedPrimary(prev => ({
                          ...prev,
                          [group.keyword]: article.id
                        }))}
                        style={{ cursor: 'pointer' }}
                      />
                      <span>{article.nome}</span>
                    </label>
                  ))}
                </div>

                <button
                  onClick={() => handleConsolidate(group)}
                  disabled={!selectedPrimary[group.keyword] || consolidating}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: selectedPrimary[group.keyword] ? 'var(--color-green-light)' : '#ccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: selectedPrimary[group.keyword] && !consolidating ? 'pointer' : 'not-allowed',
                    opacity: selectedPrimary[group.keyword] ? 1 : 0.6
                  }}
                >
                  {consolidating ? 'Consolidamento...' : 'Consolida'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Analysis
