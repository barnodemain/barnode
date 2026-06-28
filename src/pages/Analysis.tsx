import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { IoArrowBack } from 'react-icons/io5'
import { useArticoli } from '../hooks/useArticoli'
import { useConsolidation } from '../hooks/useConsolidation'
import { groupArticlesBySharedKeywords } from '../lib/analysisGrouping'
import AnalysisGroupCard from '../components/AnalysisGroupCard'

function Analysis() {
  const navigate = useNavigate()
  const { articoli, loading, error, fetchArticoli } = useArticoli()
  const {
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
  } = useConsolidation(fetchArticoli)

  const groups = useMemo(() => groupArticlesBySharedKeywords(articoli), [articoli])
  const visibleGroups = groups.filter(g => !ignoredGroupIds.has(g.id))

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
            {visibleGroups.map(group => (
              <AnalysisGroupCard
                key={group.id}
                group={group}
                selectedIds={selectedByGroup[group.id] || []}
                mode={finalNameModeByGroup[group.id] || 'existing'}
                nameSource={selectedNameSourceByGroup[group.id] || null}
                nameInput={finalNameInputByGroup[group.id] || ''}
                consolidating={consolidating}
                onToggleSelected={(articleId) => toggleSelected(group.id, articleId)}
                onSetMode={(mode) => setMode(group.id, mode)}
                onSetNameSource={(articleId) => setNameSource(group.id, articleId)}
                onSetNameInput={(value) => setNameInput(group.id, value)}
                onConsolidate={() => handleConsolidate(group)}
                onIgnore={() => handleIgnore(group.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Analysis
