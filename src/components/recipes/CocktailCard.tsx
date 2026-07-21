import { LuPencilLine } from 'react-icons/lu'
import { IoDocumentTextOutline } from 'react-icons/io5'
import { formatDose } from '../../lib/recipeFormat'
import type { Cocktail, Preparation } from '../../types'

interface Props {
  cocktail: Cocktail
  prepById: Map<string, Preparation>
  onOpenPreparation: (prep: Preparation) => void
  onEdit?: (cocktail: Cocktail) => void
}

function CocktailCard({ cocktail, prepById, onOpenPreparation, onEdit }: Props) {
  const c = cocktail
  return (
    <div className="cocktail-card" data-cocktail-id={c.id}>
      <div className="cocktail-card-inner">
        {onEdit && (
          <button className="cocktail-edit-btn" onClick={() => onEdit(c)} aria-label="Modifica cocktail" type="button">
            <LuPencilLine size={18} />
          </button>
        )}
        <div className="cocktail-title-row">
          <h2 className="cocktail-title">{c.nome}</h2>
        </div>

        {(c.bicchiere || c.ghiaccio) && (
          <div className="cocktail-badges">
            {c.bicchiere && (
              <span className="cocktail-badge">
                <span className="cocktail-badge-label">Bicchiere</span>
                <span className="cocktail-badge-value">{c.bicchiere}</span>
              </span>
            )}
            {c.ghiaccio && (
              <span className="cocktail-badge">
                <span className="cocktail-badge-label">Ghiaccio</span>
                <span className="cocktail-badge-value">{c.ghiaccio}</span>
              </span>
            )}
          </div>
        )}

        <div className="cocktail-section">
          <div className="cocktail-section-title">Ingredienti</div>
          <ul className="ingredient-list">
            {c.ingredienti.map(ing => {
              const prep = ing.preparationId ? prepById.get(ing.preparationId) : undefined
              const dose = formatDose(ing.misura, ing.unita)
              return (
                <li
                  key={ing.id}
                  className={`ingredient-row ${prep ? 'linked' : ''}`}
                  onClick={prep ? () => onOpenPreparation(prep) : undefined}
                >
                  <span className="ingredient-name">
                    {ing.nome}
                    {prep && (
                      <IoDocumentTextOutline className="ingredient-link-icon" aria-label="Vedi ricetta" />
                    )}
                  </span>
                  {dose && <span className="ingredient-dose">{dose}</span>}
                </li>
              )
            })}
          </ul>
        </div>

        {c.metodo && (
          <div className="cocktail-method">
            <div className="cocktail-section-title">Metodo</div>
            <p className="cocktail-method-text">{c.metodo}</p>
          </div>
        )}

        {c.garnish && (
          <div className="cocktail-garnish">
            <span className="cocktail-garnish-label">Garnish</span>
            <span className="cocktail-garnish-value">{c.garnish}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default CocktailCard
