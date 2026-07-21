import { useState } from 'react'
import { IoClose } from 'react-icons/io5'
import CocktailCard from './CocktailCard'
import PreparationDetail from './PreparationDetail'
import type { Cocktail, Preparation } from '../../types'

interface Props {
  cocktails: Cocktail[]
  prepById: Map<string, Preparation>
}

function CocktailDeck({ cocktails, prepById }: Props) {
  const [openPrep, setOpenPrep] = useState<Preparation | null>(null)

  if (cocktails.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🍸</div>
        <p className="empty-state-text">Nessun cocktail trovato</p>
      </div>
    )
  }

  return (
    <>
      <div className="cocktail-deck">
        {cocktails.map(c => (
          <CocktailCard
            key={c.id}
            cocktail={c}
            prepById={prepById}
            onOpenPreparation={setOpenPrep}
          />
        ))}
      </div>

      {openPrep && (
        <div className="sheet-overlay" onClick={() => setOpenPrep(null)}>
          <div className="sheet-panel" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <button className="sheet-close" onClick={() => setOpenPrep(null)} aria-label="Chiudi">
              <IoClose size={24} />
            </button>
            <PreparationDetail preparation={openPrep} />
          </div>
        </div>
      )}
    </>
  )
}

export default CocktailDeck
