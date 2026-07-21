import { forwardRef, useImperativeHandle, useState, useRef } from 'react'
import { IoTrashOutline } from 'react-icons/io5'
import { useRecipeAdmin } from '../../hooks/useRecipeAdmin'
import type { EditableIngredient } from '../../hooks/useRecipeAdmin'
import IngredientEditor from './IngredientEditor'
import ConfirmationDialog from '../ConfirmationDialog'
import type { Cocktail, Preparation } from '../../types'

const PREP_CATEGORIES = ['sciroppo', 'cordiale', 'shrub', 'soda', 'estratto', 'infusione', 'aria', 'prebatch', 'altro']

// Handle imperativo: le pagine aprono i form senza duplicare stato/logica.
export interface RecipeFormsHandle {
  openCocktail: (c: Cocktail | 'new') => void
  openPrep: (p: Preparation | 'new') => void
}

interface Props {
  // savedCocktailId: id del cocktail appena salvato, per portarlo in vista nel deck (undefined per le preparazioni)
  onSaved: (savedCocktailId?: string) => void | Promise<void>
  // preparazioni disponibili: abilitano il collegamento ingrediente→preparazione nel form cocktail
  preparations?: Preparation[]
}

// Form condivisi (cocktail + preparazione) con CRUD completo.
// Usato sia dalla pagina Cocktail (barman) sia da Admin → Ricettario.
const RecipeForms = forwardRef<RecipeFormsHandle, Props>(({ onSaved, preparations }, ref) => {
  const admin = useRecipeAdmin()

  const [editCocktail, setEditCocktail] = useState<Cocktail | null | 'new'>(null)
  const [cForm, setCForm] = useState({ nome: '', bicchiere: '', ghiaccio: '', metodo: '', garnish: '' })
  const [cIngs, setCIngs] = useState<EditableIngredient[]>([])

  const [editPrep, setEditPrep] = useState<Preparation | null | 'new'>(null)
  const [pForm, setPForm] = useState({ nome: '', categoria: '', procedimento: '' })
  const [pIngs, setPIngs] = useState<EditableIngredient[]>([])

  // conferma eliminazione (coerente con l'app, non confirm nativo)
  const [confirmDelete, setConfirmDelete] = useState<null | 'cocktail' | 'prep'>(null)
  // conferma "uscire senza salvare" quando ci sono modifiche non salvate
  const [confirmDiscard, setConfirmDiscard] = useState<null | 'cocktail' | 'prep'>(null)

  // snapshot dei valori all'apertura del form: serve a capire se l'utente ha modificato qualcosa
  const cSnapshot = useRef('')
  const pSnapshot = useRef('')
  const snapCocktail = (form: typeof cForm, ings: EditableIngredient[]) => JSON.stringify({ form, ings })
  const snapPrep = (form: typeof pForm, ings: EditableIngredient[]) => JSON.stringify({ form, ings })

  const openCocktail = (c: Cocktail | 'new') => {
    let form, ings: EditableIngredient[]
    if (c === 'new') {
      form = { nome: '', bicchiere: '', ghiaccio: '', metodo: '', garnish: '' }
      ings = [{ nome: '', misura: '', unita: '' }]
    } else {
      form = { nome: c.nome, bicchiere: c.bicchiere || '', ghiaccio: c.ghiaccio || '', metodo: c.metodo || '', garnish: c.garnish || '' }
      ings = admin.toEditable(c.ingredienti)
    }
    setCForm(form)
    setCIngs(ings)
    cSnapshot.current = snapCocktail(form, ings)
    setEditCocktail(c)
  }

  const openPrep = (p: Preparation | 'new') => {
    let form, ings: EditableIngredient[]
    if (p === 'new') {
      form = { nome: '', categoria: 'altro', procedimento: '' }
      ings = [{ nome: '', misura: '', unita: '' }]
    } else {
      form = { nome: p.nome, categoria: p.categoria || 'altro', procedimento: p.procedimento || '' }
      ings = admin.toEditable(p.ingredienti)
    }
    setPForm(form)
    setPIngs(ings)
    pSnapshot.current = snapPrep(form, ings)
    setEditPrep(p)
  }

  useImperativeHandle(ref, () => ({ openCocktail, openPrep }))

  // ci sono modifiche non salvate?
  const isCocktailDirty = () => snapCocktail(cForm, cIngs) !== cSnapshot.current
  const isPrepDirty = () => snapPrep(pForm, pIngs) !== pSnapshot.current

  // chiusura dall'esterno (tap fuori dal modale): se ci sono modifiche, chiedi conferma
  const tryCloseCocktail = () => {
    if (isCocktailDirty()) setConfirmDiscard('cocktail')
    else setEditCocktail(null)
  }
  const tryClosePrep = () => {
    if (isPrepDirty()) setConfirmDiscard('prep')
    else setEditPrep(null)
  }
  // conferma "esci senza salvare": chiude davvero
  const doDiscard = () => {
    if (confirmDiscard === 'cocktail') setEditCocktail(null)
    else if (confirmDiscard === 'prep') setEditPrep(null)
    setConfirmDiscard(null)
  }

  const saveCocktail = async () => {
    const existing = editCocktail === 'new' ? undefined : editCocktail || undefined
    const savedId = await admin.saveCocktail({ ...cForm, ingredienti: cIngs }, existing)
    if (savedId) { setEditCocktail(null); await onSaved(savedId) }
  }
  const savePrep = async () => {
    const existing = editPrep === 'new' ? undefined : editPrep || undefined
    const ok = await admin.savePreparation({ ...pForm, ingredienti: pIngs }, existing)
    if (ok) { setEditPrep(null); await onSaved() }
  }

  const doDeleteCocktail = async () => {
    if (editCocktail === 'new' || !editCocktail) return
    if (await admin.deleteCocktail(editCocktail.id)) {
      setConfirmDelete(null); setEditCocktail(null); await onSaved()
    } else {
      setConfirmDelete(null)
    }
  }
  const doDeletePrep = async () => {
    if (editPrep === 'new' || !editPrep) return
    if (await admin.deletePreparation(editPrep.id)) {
      setConfirmDelete(null); setEditPrep(null); await onSaved()
    } else {
      setConfirmDelete(null)
    }
  }

  const deleteName =
    confirmDelete === 'cocktail' && editCocktail !== 'new' && editCocktail ? editCocktail.nome
    : confirmDelete === 'prep' && editPrep !== 'new' && editPrep ? editPrep.nome
    : ''

  return (
    <>
      {admin.error && (editCocktail !== null || editPrep !== null) && (
        <div className="error-message recipe-form-error">{admin.error}</div>
      )}

      {/* Form Cocktail */}
      {editCocktail !== null && (
        <div className="modal-overlay" onClick={tryCloseCocktail}>
          <div className="modal-content recipe-form" onClick={e => e.stopPropagation()}>
            <h2 className="recipe-form-title">{editCocktail === 'new' ? 'Nuovo cocktail' : 'Modifica cocktail'}</h2>
            <label className="modal-input-label">Nome *</label>
            <input className="modal-input" value={cForm.nome} onChange={e => setCForm({ ...cForm, nome: e.target.value })} autoFocus />
            <label className="modal-input-label">Bicchiere</label>
            <input className="modal-input" value={cForm.bicchiere} onChange={e => setCForm({ ...cForm, bicchiere: e.target.value })} />
            <label className="modal-input-label">Ghiaccio</label>
            <input className="modal-input" value={cForm.ghiaccio} onChange={e => setCForm({ ...cForm, ghiaccio: e.target.value })} />
            <label className="modal-input-label">Ingredienti</label>
            <IngredientEditor ingredienti={cIngs} onChange={setCIngs} preparations={preparations} />
            <label className="modal-input-label">Metodo</label>
            <textarea className="modal-input" rows={3} value={cForm.metodo} onChange={e => setCForm({ ...cForm, metodo: e.target.value })} />
            <label className="modal-input-label">Garnish</label>
            <input className="modal-input" value={cForm.garnish} onChange={e => setCForm({ ...cForm, garnish: e.target.value })} />
            <div className="recipe-form-actions">
              {editCocktail !== 'new' && (
                <button className="btn recipe-form-delete" onClick={() => setConfirmDelete('cocktail')} disabled={admin.saving} type="button" aria-label="Elimina cocktail">
                  <IoTrashOutline size={18} />
                </button>
              )}
              <button className="btn btn-secondary" onClick={() => setEditCocktail(null)}>Annulla</button>
              <button className="btn btn-primary" onClick={saveCocktail} disabled={admin.saving || !cForm.nome.trim()}>
                {admin.saving ? '...' : 'Salva'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Preparazione */}
      {editPrep !== null && (
        <div className="modal-overlay" onClick={tryClosePrep}>
          <div className="modal-content recipe-form" onClick={e => e.stopPropagation()}>
            <h2 className="recipe-form-title">{editPrep === 'new' ? 'Nuova preparazione' : 'Modifica preparazione'}</h2>
            <label className="modal-input-label">Nome *</label>
            <input className="modal-input" value={pForm.nome} onChange={e => setPForm({ ...pForm, nome: e.target.value })} autoFocus />
            <label className="modal-input-label">Categoria</label>
            <select className="modal-input" value={pForm.categoria} onChange={e => setPForm({ ...pForm, categoria: e.target.value })}>
              {PREP_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <label className="modal-input-label">Ingredienti</label>
            <IngredientEditor ingredienti={pIngs} onChange={setPIngs} />
            <label className="modal-input-label">Procedimento</label>
            <textarea className="modal-input" rows={4} value={pForm.procedimento} onChange={e => setPForm({ ...pForm, procedimento: e.target.value })} />
            <div className="recipe-form-actions">
              {editPrep !== 'new' && (
                <button className="btn recipe-form-delete" onClick={() => setConfirmDelete('prep')} disabled={admin.saving} type="button" aria-label="Elimina preparazione">
                  <IoTrashOutline size={18} />
                </button>
              )}
              <button className="btn btn-secondary" onClick={() => setEditPrep(null)}>Annulla</button>
              <button className="btn btn-primary" onClick={savePrep} disabled={admin.saving || !pForm.nome.trim()}>
                {admin.saving ? '...' : 'Salva'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationDialog
        isOpen={confirmDelete !== null}
        title={confirmDelete === 'prep' ? 'Elimina preparazione' : 'Elimina cocktail'}
        message={`Vuoi eliminare "${deleteName}"? L'operazione non è reversibile.`}
        cancelText="Annulla"
        confirmText="Elimina"
        isDangerous
        onCancel={() => setConfirmDelete(null)}
        onConfirm={confirmDelete === 'prep' ? doDeletePrep : doDeleteCocktail}
      />

      <ConfirmationDialog
        isOpen={confirmDiscard !== null}
        title="Modifiche non salvate"
        message="Hai delle modifiche non salvate. Vuoi uscire senza salvare?"
        cancelText="Continua a modificare"
        confirmText="Esci senza salvare"
        isDangerous
        onCancel={() => setConfirmDiscard(null)}
        onConfirm={doDiscard}
      />
    </>
  )
})

RecipeForms.displayName = 'RecipeForms'

export default RecipeForms
