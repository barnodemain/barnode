import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IoArrowBack, IoAddOutline, IoPencilOutline, IoTrashOutline } from 'react-icons/io5'
import { useRecipes } from '../hooks/useRecipes'
import { useRecipeAdmin } from '../hooks/useRecipeAdmin'
import RecipeForms from '../components/recipes/RecipeForms'
import type { RecipeFormsHandle } from '../components/recipes/RecipeForms'
import ConfirmationDialog from '../components/ConfirmationDialog'
import type { Cocktail, Preparation } from '../types'

type Tab = 'cocktail' | 'preparazioni'

function RecipeAdmin() {
  const navigate = useNavigate()
  const { cocktails, preparations, loading, fetchRecipes } = useRecipes()
  const admin = useRecipeAdmin()
  const forms = useRef<RecipeFormsHandle>(null)
  const [tab, setTab] = useState<Tab>('cocktail')

  // conferma eliminazione dalla lista (coerente con l'app)
  const [toDelete, setToDelete] = useState<{ kind: 'cocktail' | 'prep'; id: string; nome: string } | null>(null)

  const confirmDelete = async () => {
    if (!toDelete) return
    const ok = toDelete.kind === 'cocktail'
      ? await admin.deleteCocktail(toDelete.id)
      : await admin.deletePreparation(toDelete.id)
    setToDelete(null)
    if (ok) await fetchRecipes()
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
                    onClick={() => tab === 'cocktail' ? forms.current?.openCocktail(item as Cocktail) : forms.current?.openPrep(item as Preparation)}>
                    <IoPencilOutline size={20} />
                  </button>
                  <button className="icon-button delete" aria-label="Elimina"
                    onClick={() => setToDelete({ kind: tab === 'cocktail' ? 'cocktail' : 'prep', id: item.id, nome: item.nome })}>
                    <IoTrashOutline size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button className="fab" onClick={() => tab === 'cocktail' ? forms.current?.openCocktail('new') : forms.current?.openPrep('new')} aria-label="Aggiungi">
        <IoAddOutline size={28} />
      </button>

      <RecipeForms ref={forms} onSaved={fetchRecipes} />

      <ConfirmationDialog
        isOpen={toDelete !== null}
        title={toDelete?.kind === 'prep' ? 'Elimina preparazione' : 'Elimina cocktail'}
        message={`Vuoi eliminare "${toDelete?.nome ?? ''}"? L'operazione non è reversibile.`}
        cancelText="Annulla"
        confirmText="Elimina"
        isDangerous
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}

export default RecipeAdmin
