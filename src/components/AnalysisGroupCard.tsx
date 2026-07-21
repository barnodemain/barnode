import { normalizeArticleName } from '../lib/normalize'
import type { ArticleGroup } from '../lib/analysisGrouping'

interface Props {
  group: ArticleGroup
  selectedIds: string[]
  mode: 'existing' | 'new'
  nameSource: string | null
  nameInput: string
  consolidating: boolean
  onToggleSelected: (articleId: string) => void
  onSetMode: (mode: 'existing' | 'new') => void
  onSetNameSource: (articleId: string) => void
  onSetNameInput: (value: string) => void
  onConsolidate: () => void
  onIgnore: () => void
}

function AnalysisGroupCard({
  group,
  selectedIds,
  mode,
  nameSource,
  nameInput,
  consolidating,
  onToggleSelected,
  onSetMode,
  onSetNameSource,
  onSetNameInput,
  onConsolidate,
  onIgnore,
}: Props) {
  const canConsolidate =
    selectedIds.length > 0 &&
    ((mode === 'existing' && (nameSource || selectedIds[0])) ||
      (mode === 'new' && nameInput.trim().length > 0))

  return (
    <div
      className="item-card"
      style={{
        marginBottom: '16px',
        cursor: 'default',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div style={{ marginBottom: '12px', textAlign: 'center' }}>
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
            Motivo: {group.sharedKeywords.join(', ')}
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
                  onChange={() => onToggleSelected(article.id)}
                  style={{ cursor: 'pointer', flexShrink: 0 }}
                />
                <span>{normalizedName}</span>
              </label>
            )
          })}
        </div>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '8px' }}>
          Nome finale
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <input
              type="radio"
              name={`final-mode-${group.id}`}
              checked={mode === 'existing'}
              onChange={() => onSetMode('existing')}
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
                  const selectedSourceId = nameSource || selectedIds[0]
                  return (
                    <label
                      key={article.id}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}
                    >
                      <input
                        type="radio"
                        name={`final-existing-${group.id}`}
                        checked={selectedSourceId === article.id}
                        onChange={() => onSetNameSource(article.id)}
                        style={{ cursor: 'pointer' }}
                      />
                      <span>{normalizedName}</span>
                    </label>
                  )
                })}
            </div>
          )}

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <input
              type="radio"
              name={`final-mode-${group.id}`}
              checked={mode === 'new'}
              onChange={() => onSetMode('new')}
              style={{ cursor: 'pointer' }}
            />
            <span>Inserisci nuovo nome</span>
          </label>

          {mode === 'new' && (
            <input
              type="text"
              value={nameInput}
              onChange={e => onSetNameInput(e.target.value)}
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
          onClick={onConsolidate}
          disabled={!canConsolidate || consolidating}
          style={{
            flex: 1,
            minHeight: '44px',
            padding: '10px',
            backgroundColor:
              canConsolidate && !consolidating ? 'var(--color-green-light)' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: canConsolidate && !consolidating ? 'pointer' : 'not-allowed',
            opacity: canConsolidate ? 1 : 0.7
          }}
        >
          {consolidating ? 'Consolidamento...' : 'Consolida'}
        </button>
        <button
          onClick={onIgnore}
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
}

export default AnalysisGroupCard
