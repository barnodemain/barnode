import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IoArrowBack, IoAddOutline, IoPencilOutline, IoTrashOutline } from 'react-icons/io5'
import { useRecipes } from '../hooks/useRecipes'
import { useRecipeAdmin } from '../hooks/useRecipeAdmin'
import type { EditableIngredient } from '../hooks/useRecipeAdmin'
import IngredientEditor from '../components/recipes/IngredientEditor'
import type { Cocktail, Preparation } from '../types'

type Tab = 'cocktail' | 'preparazioni'

const PREP_CATEGORIES = ['sciroppo', 'cordiale', 'shrub', 'soda', 'estratto', 'infusione', 'aria', 'prebatch', 'altro']

function RecipeAdmin() {
  const navigate = useNavigate()
  const { cocktails, preparations, loading, fetchRecipes } = useRecipes()
  const admin = useRecipeAdmin()
  const [tab, setTab] = useState<Tab>('cocktail')

  // stato form cocktail
  const [editCocktail, setEditCocktail] = useState<Cocktail | null | 'new'>(null)
  const [cForm, setCForm] = useState({ nome: '', bicchiere: '', ghiaccio: '', metodo: '', garnish: '' })
  const [cIngs, setCIngs] = useState<EditableIngredient[]>([])

  // stato form preparazione
  const [editPrep, setEditPrep] = useState<Preparation | null | 'new'>(null)
  const [pForm, setPForm] = useState({ nome: '', categoria: '', procedimento: '' })
  const [pIngs, setPIngs] = useState<EditableIngredient[]>([])

  const openCocktail = (c: Cocktail | 'new') => {
    if (c === 'new') {
      setCForm({ nome: '', bicchiere: '', ghiaccio: '', metodo: '', garnish: '' })
      setCIngs([{ nome: '', misura: '', unita: '' }])
    } else {
      setCForm({ nome: c.nome, bicchiere: c.bicchiere || '', ghiaccio: c.ghiaccio || '', metodo: c.metodo || '', garnish: c.garnish || '' })
      setCIngs(admin.toEditable(c.ingredienti))
    }
    setEditCocktail(c)
  }

  const openPrep = (p: Preparation | 'new') => {
    if (p === 'new') {
      setPForm({ nome: '', categoria: 'altro', procedimento: '' })
      setPIngs([{ nome: '', misura: '', unita: '' }])
    } else {
      setPForm({ nome: p.nome, categoria: p.categoria || 'altro', procedimento: p.procedimento || '' })
      setPIngs(admin.toEditable(p.ingredienti))
    }
    setEditPrep(p)
  }

  const saveCocktail = async () => {
    const existing = editCocktail === 'new' ? undefined : editCocktail || undefined
    const ok = await admin.saveCocktail({ ...cForm, ingredienti: cIngs }, existing)
    if (ok) { setEditCocktail(null); await fetchRecipes() }
  }
  const savePrep = async () => {
    const existing = editPrep === 'new' ? undefined : editPrep || undefined
    const ok = await admin.savePreparation({ ...pForm, ingredienti: pIngs }, existing)
    if (ok) { setEditPrep(null); await fetchRecipes() }
  }

  const delCocktail = async (c: Cocktail) => {
    if (!confirm(`Eliminare il cocktail "${c.nome}"?`)) return
    if (await admin.deleteCocktail(c.id)) await fetchRecipes()
  }
  const delPrep = async (p: Preparation) => {
    if (!confirm(`Eliminare la preparazione "${p.nome}"?`)) return
    if (await admin.deletePreparation(p.id)) await fetchRecipes()
  }

  return (
    <div className="page-wrapper">
      <div className="page-header-fixed">
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', width: '100%', paddingLeft: 16 }}>
            <button onClick={() => navigate('/settings')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 8, marginLeft: -8 }} aria-label="Indietro">
              <IoArrowBack size={28} color="var(--color-text)" />
            </button>
            <h1 className="page-title" style={{ marginLeft: 'auto', marginRight: 'auto' }}>Ricettario</h1>
            <div style={{ width: 44 }} />
          </div>
        </div>
        <div className="recipes-tabs" style={{ marginTop: 8 }}>
          <button className={`recipes-tab ${tab === 'cocktail' ? 'active' : ''}`} onClick={() => setTab('cocktail')}>Cocktail ({cocktails.length})</button>
          <button className={`recipes-tab ${tab === 'preparazioni' ? 'active' : ''}`} onClick={() => setTab('preparazioni')}>Preparazioni ({preparations.length})</button>
        </div>
      </div>

      <div className="page-content-scrollable">
        {admin.error && <div className="error-message" style={{ marginBottom: 12 }}>{admin.error}</div>}
        {loading ? (
          <div className="loading-spinner"><div className="spinner" /></div>
        ) : (
          <div className="item-list">
            {(tab === 'cocktail' ? cocktails : preparations).map(item => (
              <div key={item.id} className="item-card">
                <span className="item-name">{item.nome}</span>
                <div className="item-actions">
                  <button className="icon-button edit" aria-label="Modifica"
                    onClick={() => tab === 'cocktail' ? openCocktail(item as Cocktail) : openPrep(item as Preparation)}>
                    <IoPencilOutline size={20} />
                  </button>
                  <button className="icon-button delete" aria-label="Elimina"
                    onClick={() => tab === 'cocktail' ? delCocktail(item as Cocktail) : delPrep(item as Preparation)}>
                    <IoTrashOutline size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button className="fab" onClick={() => tab === 'cocktail' ? openCocktail('new') : openPrep('new')} aria-label="Aggiungi">
        <IoAddOutline size={28} />
      </button>

      {/* Form Cocktail */}
      {editCocktail !== null && (
        <div className="modal-overlay" onClick={() => setEditCocktail(null)}>
          <div className="modal-content recipe-form" onClick={e => e.stopPropagation()}>
            <h2 className="recipe-form-title">{editCocktail === 'new' ? 'Nuovo cocktail' : 'Modifica cocktail'}</h2>
            <label className="modal-input-label">Nome *</label>
            <input className="modal-input" value={cForm.nome} onChange={e => setCForm({ ...cForm, nome: e.target.value })} autoFocus />
            <div className="recipe-form-grid">
              <div>
                <label className="modal-input-label">Bicchiere</label>
                <input className="modal-input" value={cForm.bicchiere} onChange={e => setCForm({ ...cForm, bicchiere: e.target.value })} />
              </div>
              <div>
                <label className="modal-input-label">Ghiaccio</label>
                <input className="modal-input" value={cForm.ghiaccio} onChange={e => setCForm({ ...cForm, ghiaccio: e.target.value })} />
              </div>
            </div>
            <label className="modal-input-label">Ingredienti</label>
            <IngredientEditor ingredienti={cIngs} onChange={setCIngs} />
            <label className="modal-input-label">Metodo</label>
            <textarea className="modal-input" rows={2} value={cForm.metodo} onChange={e => setCForm({ ...cForm, metodo: e.target.value })} />
            <label className="modal-input-label">Garnish</label>
            <input className="modal-input" value={cForm.garnish} onChange={e => setCForm({ ...cForm, garnish: e.target.value })} />
            <div className="modal-buttons">
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
        <div className="modal-overlay" onClick={() => setEditPrep(null)}>
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
            <div className="modal-buttons">
              <button className="btn btn-secondary" onClick={() => setEditPrep(null)}>Annulla</button>
              <button className="btn btn-primary" onClick={savePrep} disabled={admin.saving || !pForm.nome.trim()}>
                {admin.saving ? '...' : 'Salva'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RecipeAdmin
