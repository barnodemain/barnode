import { useState } from 'react'
import { IoAddOutline, IoTrashOutline, IoClose } from 'react-icons/io5'
import { normalizeForCompare } from '../../lib/analysisGrouping'
import { RECIPE_UNITS } from '../../lib/recipeFormat'
import type { EditableIngredient } from '../../hooks/useRecipeAdmin'
import type { Preparation } from '../../types'

interface Props {
  ingredienti: EditableIngredient[]
  onChange: (next: EditableIngredient[]) => void
  // se fornite, compare "Aggiungi preparazione" per inserire una preparazione esistente come ingrediente
  preparations?: Preparation[]
}

// Editor righe ingrediente. Ogni riga: nome a tutta larghezza (leggibile),
// sotto dose + unità affiancate + cestino. Il cestino rimuove subito la riga
// (azione reversibile: nulla è salvato finché non premi "Salva").
// "Aggiungi preparazione" apre l'elenco delle preparazioni esistenti: quella
// scelta viene aggiunta come riga ingrediente già collegata (preparationId).
// Da lì in poi è un ingrediente come gli altri.
function IngredientEditor({ ingredienti, onChange, preparations }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerQuery, setPickerQuery] = useState('')

  const update = (idx: number, field: keyof EditableIngredient, value: string) => {
    const next = ingredienti.map((ing, i) => i === idx ? { ...ing, [field]: value } : ing)
    onChange(next)
  }
  const add = () => onChange([...ingredienti, { nome: '', misura: '', unita: '' }])
  const remove = (idx: number) => onChange(ingredienti.filter((_, i) => i !== idx))

  // aggiunge la preparazione scelta come nuova riga ingrediente (già collegata)
  const addPreparation = (prep: Preparation) => {
    onChange([...ingredienti, { nome: prep.nome, misura: '', unita: '', preparationId: prep.id }])
    setPickerOpen(false)
    setPickerQuery('')
  }

  const canAddPrep = !!preparations && preparations.length > 0

  const q = normalizeForCompare(pickerQuery)
  const filteredPreps = (!preparations ? [] : (
    !q ? preparations
      : preparations.filter(p =>
          normalizeForCompare(p.nome).includes(q) ||
          (p.categoria && normalizeForCompare(p.categoria).includes(q))
        )
  ))
    // sempre in ordine alfabetico
    .slice()
    .sort((a, b) => a.nome.localeCompare(b.nome, 'it', { sensitivity: 'base' }))

  return (
    <div className="ing-editor">
      {ingredienti.map((ing, idx) => (
        <div key={idx} className="ing-editor-row">
          <input
            className="ing-editor-name"
            placeholder="Ingrediente"
            value={ing.nome}
            onChange={e => update(idx, 'nome', e.target.value)}
          />
          <div className="ing-editor-line2">
            <input
              className="ing-editor-misura"
              placeholder="Dose"
              value={ing.misura}
              onChange={e => update(idx, 'misura', e.target.value)}
            />
            <select
              className="ing-editor-unita"
              value={ing.unita}
              onChange={e => update(idx, 'unita', e.target.value)}
              aria-label="Unità di misura"
            >
              <option value="">— unità</option>
              {RECIPE_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              {/* valore legacy non in lista: lo mostro per non perderlo */}
              {ing.unita && !RECIPE_UNITS.includes(ing.unita as typeof RECIPE_UNITS[number]) && (
                <option value={ing.unita}>{ing.unita}</option>
              )}
            </select>
            <button className="ing-editor-del" onClick={() => remove(idx)} aria-label="Rimuovi ingrediente" type="button">
              <IoTrashOutline size={18} />
            </button>
          </div>
        </div>
      ))}

      <div className="ing-editor-add-row">
        <button className="ing-editor-add" onClick={add} type="button">
          <IoAddOutline size={18} /> Ingrediente
        </button>
        {canAddPrep && (
          <button className="ing-editor-add ing-editor-add-prep" onClick={() => { setPickerOpen(true); setPickerQuery('') }} type="button">
            <IoAddOutline size={18} /> Preparazione
          </button>
        )}
      </div>

      {/* Elenco preparazioni (bottom-sheet) */}
      {pickerOpen && (
        <div className="sheet-overlay" onClick={() => setPickerOpen(false)}>
          <div className="sheet-panel prep-picker" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <button className="sheet-close" onClick={() => setPickerOpen(false)} aria-label="Chiudi">
              <IoClose size={24} />
            </button>
            <h3 className="prep-picker-title">Aggiungi preparazione</h3>
            <div className="search-container prep-picker-search">
              <input
                type="text"
                className="search-input"
                placeholder="Cerca preparazione…"
                value={pickerQuery}
                onChange={e => setPickerQuery(e.target.value)}
              />
            </div>
            <div className="prep-picker-list">
              {filteredPreps.length === 0 ? (
                <p className="prep-picker-empty">Nessuna preparazione trovata</p>
              ) : (
                filteredPreps.map(p => (
                  <button
                    key={p.id}
                    className="prep-picker-item"
                    type="button"
                    // onPointerDown (non onClick): scatta al primo contatto, prima che il
                    // blur della tastiera/ricerca "consumi" il tap → niente doppio tocco su mobile
                    onPointerDown={e => { e.preventDefault(); addPreparation(p) }}
                  >
                    <span className="prep-picker-item-name">{p.nome}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default IngredientEditor
