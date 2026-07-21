import { formatDose } from '../../lib/recipeFormat'
import type { Preparation } from '../../types'

interface Props {
  preparation: Preparation
}

function PreparationDetail({ preparation: p }: Props) {
  return (
    <div className="prep-detail">
      <div className="prep-detail-head">
        {p.categoria && <span className="prep-category-chip">{p.categoria}</span>}
        <h2 className="prep-detail-title">{p.nome}</h2>
      </div>

      {p.ingredienti.length > 0 && (
        <div className="cocktail-section">
          <div className="cocktail-section-title">Ingredienti</div>
          <ul className="ingredient-list">
            {p.ingredienti.map(ing => {
              const dose = formatDose(ing.misura, ing.unita)
              return (
                <li key={ing.id} className="ingredient-row">
                  <span className="ingredient-name">{ing.nome}</span>
                  {dose && <span className="ingredient-dose">{dose}</span>}
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {p.procedimento && (
        <div className="cocktail-method">
          <div className="cocktail-section-title">Procedimento</div>
          <p className="cocktail-method-text prep-procedure">{p.procedimento}</p>
        </div>
      )}
    </div>
  )
}

export default PreparationDetail
