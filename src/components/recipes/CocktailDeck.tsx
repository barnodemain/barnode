import { useState, useEffect, useRef } from 'react'
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
  // id del cocktail da portare in vista (es. dopo un salvataggio); onScrolled resetta
  scrollToId?: string | null
  onScrolled?: () => void
}

function CocktailDeck({ cocktails, prepById, onEditCocktail, onEditPreparation, scrollToId, onScrolled }: Props) {
  const [openPrep, setOpenPrep] = useState<Preparation | null>(null)
  const deckRef = useRef<HTMLDivElement>(null)

  // porta in vista la scheda del cocktail appena salvato
  useEffect(() => {
    if (!scrollToId || !deckRef.current) return
    const card = deckRef.current.querySelector<HTMLElement>(`[data-cocktail-id="${scrollToId}"]`)
    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' })
    onScrolled?.()
  }, [scrollToId, cocktails, onScrolled])

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
      <div className="cocktail-deck" ref={deckRef}>
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
