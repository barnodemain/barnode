import { useState } from 'react'
import { IoClose } from 'react-icons/io5'
import { normalizeForCompare } from '../../lib/analysisGrouping'
import type { Preparation } from '../../types'

interface Props {
  preparations: Preparation[]
  onPick: (prep: Preparation) => void
  onClose: () => void
}

// Bottom-sheet per scegliere una preparazione esistente (ordine alfabetico,
// senza badge categoria, con ricerca). Riusato dal form ingredienti e dal
// campo garnish. La selezione usa onPointerDown+preventDefault: scatta al primo
// contatto, prima che il blur della tastiera "consumi" il tap → un solo tocco
// su mobile.
function PreparationPicker({ preparations, onPick, onClose }: Props) {
  const [query, setQuery] = useState('')
  const q = normalizeForCompare(query)
  const filtered = (!q
    ? preparations
    : preparations.filter(p =>
        normalizeForCompare(p.nome).includes(q) ||
        (p.categoria && normalizeForCompare(p.categoria).includes(q))
      )
  )
    .slice()
    .sort((a, b) => a.nome.localeCompare(b.nome, 'it', { sensitivity: 'base' }))

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet-panel prep-picker" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <button className="sheet-close" onClick={onClose} aria-label="Chiudi">
          <IoClose size={24} />
        </button>
        <h3 className="prep-picker-title">Aggiungi preparazione</h3>
        <div className="search-container prep-picker-search">
          <input
            type="text"
            className="search-input"
            placeholder="Cerca preparazione…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <div className="prep-picker-list">
          {filtered.length === 0 ? (
            <p className="prep-picker-empty">Nessuna preparazione trovata</p>
          ) : (
            filtered.map(p => (
              <button
                key={p.id}
                className="prep-picker-item"
                type="button"
                onPointerDown={e => { e.preventDefault(); onPick(p) }}
              >
                <span className="prep-picker-item-name">{p.nome}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default PreparationPicker
