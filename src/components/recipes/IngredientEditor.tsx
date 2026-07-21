import { IoAddOutline, IoTrashOutline } from 'react-icons/io5'
import type { EditableIngredient } from '../../hooks/useRecipeAdmin'

interface Props {
  ingredienti: EditableIngredient[]
  onChange: (next: EditableIngredient[]) => void
}

// Editor righe ingrediente: nome + misura + unità, aggiungibili/rimovibili.
function IngredientEditor({ ingredienti, onChange }: Props) {
  const update = (idx: number, field: keyof EditableIngredient, value: string) => {
    const next = ingredienti.map((ing, i) => i === idx ? { ...ing, [field]: value } : ing)
    onChange(next)
  }
  const add = () => onChange([...ingredienti, { nome: '', misura: '', unita: '' }])
  const remove = (idx: number) => onChange(ingredienti.filter((_, i) => i !== idx))

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
          <input
            className="ing-editor-misura"
            placeholder="Dose"
            value={ing.misura}
            onChange={e => update(idx, 'misura', e.target.value)}
          />
          <input
            className="ing-editor-unita"
            placeholder="Unità"
            value={ing.unita}
            onChange={e => update(idx, 'unita', e.target.value)}
          />
          <button className="ing-editor-del" onClick={() => remove(idx)} aria-label="Rimuovi ingrediente" type="button">
            <IoTrashOutline size={18} />
          </button>
        </div>
      ))}
      <button className="ing-editor-add" onClick={add} type="button">
        <IoAddOutline size={18} /> Aggiungi ingrediente
      </button>
    </div>
  )
}

export default IngredientEditor
