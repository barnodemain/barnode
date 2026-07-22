import { forwardRef, useImperativeHandle, useState, useRef } from 'react'
import { IoTrashOutline, IoAddOutline, IoClose } from 'react-icons/io5'
import { useRecipeAdmin } from '../../hooks/useRecipeAdmin'
import type { EditableIngredient } from '../../hooks/useRecipeAdmin'
import IngredientEditor from './IngredientEditor'
import PreparationPicker from './PreparationPicker'
import FullscreenTextEditor from './FullscreenTextEditor'
import ConfirmationDialog from '../ConfirmationDialog'
import { RECIPE_ICE, splitGarnish, joinGarnish } from '../../lib/recipeFormat'
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
  // picker preparazione per il campo garnish
  const [garnishPickerOpen, setGarnishPickerOpen] = useState(false)
  // preparazione collegata al garnish: mostrata come chip NON modificabile (solo eliminabile).
  // Il campo cForm.garnish contiene solo il testo libero; al salvataggio si ricompongono insieme.
  const [garnishPrep, setGarnishPrep] = useState<Preparation | null>(null)
  // editor testo a tutta pagina (per il Procedimento della preparazione)
  const [textEditor, setTextEditor] = useState<null | 'procedimento'>(null)

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
  const snapCocktail = (form: typeof cForm, ings: EditableIngredient[], prep: Preparation | null) => JSON.stringify({ form, ings, prepId: prep?.id ?? null })
  const snapPrep = (form: typeof pForm, ings: EditableIngredient[]) => JSON.stringify({ form, ings })

  const openCocktail = (c: Cocktail | 'new') => {
    let form, ings: EditableIngredient[]
    let prep: Preparation | null = null
    if (c === 'new') {
      form = { nome: '', bicchiere: '', ghiaccio: '', metodo: '', garnish: '' }
      ings = [{ nome: '', misura: '', unita: '' }]
    } else {
      // separo il garnish: la preparazione citata diventa chip, il resto è testo libero
      const split = splitGarnish(c.garnish, preparations || [])
      prep = split.prep
      form = { nome: c.nome, bicchiere: c.bicchiere || '', ghiaccio: c.ghiaccio || '', metodo: c.metodo || '', garnish: split.rest }
      ings = admin.toEditable(c.ingredienti)
    }
    setCForm(form)
    setCIngs(ings)
    setGarnishPrep(prep)
    cSnapshot.current = snapCocktail(form, ings, prep)
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
  const isCocktailDirty = () => snapCocktail(cForm, cIngs, garnishPrep) !== cSnapshot.current
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
    // ricompongo il garnish: nome della preparazione collegata + testo libero
    const garnish = joinGarnish(garnishPrep?.nome, cForm.garnish)
    const savedId = await admin.saveCocktail({ ...cForm, garnish, ingredienti: cIngs }, existing)
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
            <select className="modal-input modal-select" value={cForm.ghiaccio} onChange={e => setCForm({ ...cForm, ghiaccio: e.target.value })}>
              <option value="">-</option>
              {RECIPE_ICE.map(g => <option key={g} value={g}>{g}</option>)}
              {/* valore legacy non in lista: lo mostro per non perderlo */}
              {cForm.ghiaccio && !RECIPE_ICE.includes(cForm.ghiaccio as typeof RECIPE_ICE[number]) && (
                <option value={cForm.ghiaccio}>{cForm.ghiaccio}</option>
              )}
            </select>
            <label className="modal-input-label">Ingredienti</label>
            <IngredientEditor ingredienti={cIngs} onChange={setCIngs} preparations={preparations} />
            <label className="modal-input-label">Metodo</label>
            <textarea className="modal-input" rows={3} value={cForm.metodo} onChange={e => setCForm({ ...cForm, metodo: e.target.value })} />
            <label className="modal-input-label">Garnish</label>
            {/* Il campo garnish è un contenitore che ospita, inline: la preparazione
                collegata come pillola verde NON modificabile (testo verde + ×, senza
                icona) e, accanto, l'input di testo libero. Così l'utente scrive prima
                o dopo la preparazione, e il nome non è alterabile (solo rimuovibile). */}
            <div className="garnish-field">
              {garnishPrep && (
                <span className="garnish-prep-inline">
                  <span className="garnish-prep-inline-name">{garnishPrep.nome}</span>
                  <button type="button" className="garnish-prep-inline-remove" onClick={() => setGarnishPrep(null)} aria-label="Rimuovi preparazione">
                    <IoClose size={15} />
                  </button>
                </span>
              )}
              <input
                className="garnish-input-inline"
                value={cForm.garnish}
                onChange={e => setCForm({ ...cForm, garnish: e.target.value })}
                placeholder={garnishPrep ? '' : 'Garnish…'}
              />
            </div>
            {/* il bottone appare solo se non c'è già una preparazione collegata (una per garnish) */}
            {!garnishPrep && preparations && preparations.length > 0 && (
              <button type="button" className="ing-editor-add ing-editor-add-prep garnish-add-prep" onClick={() => setGarnishPickerOpen(true)}>
                <IoAddOutline size={18} /> Preparazione
              </button>
            )}
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
            {/* box cliccabile: apre l'editor a tutta pagina per gestire meglio il testo lungo */}
            <button type="button" className="modal-input textarea-open" onClick={() => setTextEditor('procedimento')}>
              {pForm.procedimento
                ? <span className="textarea-open-text">{pForm.procedimento}</span>
                : <span className="textarea-open-placeholder">Tocca per scrivere il procedimento…</span>}
            </button>
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

      {garnishPickerOpen && preparations && (
        <PreparationPicker
          preparations={preparations}
          onPick={prep => {
            // la preparazione scelta diventa il chip non modificabile (non testo libero)
            setGarnishPrep(prep)
            setGarnishPickerOpen(false)
          }}
          onClose={() => setGarnishPickerOpen(false)}
        />
      )}

      {textEditor === 'procedimento' && (
        <FullscreenTextEditor
          title="Procedimento"
          value={pForm.procedimento}
          placeholder="Scrivi il procedimento…"
          onConfirm={val => { setPForm({ ...pForm, procedimento: val }); setTextEditor(null) }}
          onCancel={() => setTextEditor(null)}
        />
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
