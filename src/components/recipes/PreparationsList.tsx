import { useState, useMemo } from 'react'
import { IoClose } from 'react-icons/io5'
import PreparationDetail from './PreparationDetail'
import type { Preparation } from '../../types'

interface Props {
  preparations: Preparation[]
}

// etichette leggibili per le categorie
const CATEGORY_LABELS: Record<string, string> = {
  soda: 'Soda home-made',
  cordiale: 'Cordiali',
  shrub: 'Shrub',
  estratto: 'Estratti',
  prebatch: 'Pre-batch',
  infusione: 'Infusioni',
  sciroppo: 'Sciroppi & basi',
  aria: 'Arie',
  altro: 'Altre preparazioni',
}

// ordine di visualizzazione dei gruppi
const CATEGORY_ORDER = ['sciroppo', 'cordiale', 'shrub', 'soda', 'estratto', 'infusione', 'aria', 'prebatch', 'altro']

function PreparationsList({ preparations }: Props) {
  const [open, setOpen] = useState<Preparation | null>(null)

  const grouped = useMemo(() => {
    const map = new Map<string, Preparation[]>()
    preparations.forEach(p => {
      const key = (p.categoria || 'altro').toLowerCase()
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(p)
    })
    // ordina i gruppi secondo CATEGORY_ORDER, gli sconosciuti in fondo
    return Array.from(map.entries()).sort((a, b) => {
      const ia = CATEGORY_ORDER.indexOf(a[0]); const ib = CATEGORY_ORDER.indexOf(b[0])
      return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib)
    })
  }, [preparations])

  if (preparations.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🧪</div>
        <p className="empty-state-text">Nessuna preparazione trovata</p>
      </div>
    )
  }

  return (
    <>
      <div className="prep-list-scroll">
        {grouped.map(([cat, preps]) => (
          <div key={cat} className="prep-group">
            <div className="prep-group-title">{CATEGORY_LABELS[cat] || cat}</div>
            <div className="prep-group-items">
              {preps.map(p => (
                <button key={p.id} className="prep-item" onClick={() => setOpen(p)}>
                  <span className="prep-item-name">{p.nome}</span>
                  <span className="prep-item-count">
                    {p.ingredienti.length > 0 ? `${p.ingredienti.length} ingr.` : 'ricetta'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {open && (
        <div className="sheet-overlay" onClick={() => setOpen(null)}>
          <div className="sheet-panel" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <button className="sheet-close" onClick={() => setOpen(null)} aria-label="Chiudi">
              <IoClose size={24} />
            </button>
            <PreparationDetail preparation={open} />
          </div>
        </div>
      )}
    </>
  )
}

export default PreparationsList
