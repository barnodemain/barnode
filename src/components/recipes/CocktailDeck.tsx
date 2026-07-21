import { useState } from 'react'
import { IoClose } from 'react-icons/io5'
import { LuPencilLine } from 'react-icons/lu'
import CocktailCard from './CocktailCard'
import PreparationDetail from './PreparationDetail'
import type { Cocktail, Preparation } from '../../types'

interface Props {
  cocktails: Cocktail[]
  prepById: Map<string, Preparation>
  onEditCocktail?: (cocktail: Cocktail) => void
  onEditPreparation?: (prep: Preparation) => void
}

function CocktailDeck({ cocktails, prepById, onEditCocktail, onEditPreparation }: Props) {
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
            onEdit={onEditCocktail}
          />
        ))}
      </div>

      {openPrep && (
        <div className="sheet-overlay" onClick={() => setOpenPrep(null)}>
          <div className="sheet-panel" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            {onEditPreparation && (
              <button className="sheet-edit" onClick={() => { const p = openPrep; setOpenPrep(null); onEditPreparation(p) }} aria-label="Modifica preparazione">
                <LuPencilLine size={20} />
              </button>
            )}
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
