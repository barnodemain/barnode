import { useState, useMemo } from 'react'
import { IoSearch, IoAddOutline } from 'react-icons/io5'
import Modal from '../components/Modal'
import FloatingActionButton from '../components/FloatingActionButton'
import { useArticoli } from '../hooks/useArticoli'
import { useMissingItems } from '../hooks/useMissingItems'
import { normalizeArticleName } from '../lib/normalize'
import type { Articolo } from '../types'

function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number): T {
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  return ((...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      fn(...args)
    }, delay)
  }) as T
}

function Archivio() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [editingArticle, setEditingArticle] = useState<Articolo | null>(null)
  const [editName, setEditName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { 
    articoli, 
    loading, 
    error,
    createArticolo,
    updateArticolo,
    deleteArticolo
  } = useArticoli()

  const { addMissingItem, isArticoloMissing } = useMissingItems()

  const setSearchQueryDebounced = useMemo(() => debounce(setSearchQuery, 250), [])

  const filteredArticoli = searchQuery.trim()
    ? articoli.filter(a => a.nome.toLowerCase().includes(searchQuery.toLowerCase()))
    : articoli

  const handleAddArticle = async () => {
    if (!newItemName.trim()) return
    
    setIsSubmitting(true)
    try {
      await createArticolo(normalizeArticleName(newItemName))
      setNewItemName('')
      setIsAddModalOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditClick = (articolo: Articolo) => {
    setEditingArticle(articolo)
    setEditName(articolo.nome)
    setIsEditModalOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingArticle || !editName.trim()) return
    
    setIsSubmitting(true)
    try {
      await updateArticolo(editingArticle.id, normalizeArticleName(editName))
      setIsEditModalOpen(false)
      setEditingArticle(null)
      setEditName('')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteFromEdit = async () => {
    if (!editingArticle) return
    
    if (confirm(`Sei sicuro di voler eliminare "${editingArticle.nome}"? Verrà rimosso anche dalla lista articoli mancanti.`)) {
      setIsSubmitting(true)
      try {
        await deleteArticolo(editingArticle.id)
        setIsEditModalOpen(false)
        setEditingArticle(null)
        setEditName('')
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleQuickAdd = async (e: React.MouseEvent, articolo: Articolo) => {
    e.stopPropagation()
    await addMissingItem(articolo)
  }

  return (
    <div className="page-wrapper">
      <div className="page-header-fixed">
        <div className="page-header">
          <img src="/logo.png" alt="BARnode" className="logo" />
          <h1 className="page-title">Archivio articoli</h1>
        </div>

        <div className="search-container">
          <IoSearch className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Cerca per nome articolo..."
            value={searchQuery}
            onChange={(e) => setSearchQueryDebounced(e.target.value)}
          />
        </div>
      </div>

      <div className="page-content-scrollable">
        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : filteredArticoli.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <p className="empty-state-text">
              {searchQuery ? 'Nessun articolo trovato' : 'Nessun articolo in archivio'}
            </p>
          </div>
        ) : (
          <div className="item-list">
            {filteredArticoli.map(articolo => (
              <div key={articolo.id} className="item-card archivio-card" onClick={() => handleEditClick(articolo)}>
                <span className="item-name">{articolo.nome}</span>
                <div className="item-actions">
                  {!isArticoloMissing(articolo.id) && (
                    <button
                      className="icon-button add"
                      onClick={(e) => handleQuickAdd(e, articolo)}
                      aria-label="Aggiungi a mancanti"
                    >
                      <IoAddOutline size={22} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <FloatingActionButton onClick={() => setIsAddModalOpen(true)} />

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setNewItemName('')
        }}
        title="Nuovo articolo"
      >
        <label className="modal-input-label">Nome articolo</label>
        <input
          type="text"
          className="modal-input"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder="Es. Gin Mare"
          autoFocus
        />
        <div className="modal-buttons">
          <button
            className="btn btn-secondary"
            onClick={() => {
              setIsAddModalOpen(false)
              setNewItemName('')
            }}
          >
            Annulla
          </button>
          <button
            className="btn btn-primary"
            onClick={handleAddArticle}
            disabled={isSubmitting || !newItemName.trim()}
          >
            {isSubmitting ? '...' : 'Salva'}
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingArticle(null)
          setEditName('')
        }}
        title="Modifica articolo"
      >
        <label className="modal-input-label">Nome articolo</label>
        <input
          type="text"
          className="modal-input"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          autoFocus
        />
        <div className="modal-buttons">
          <button
            className="btn btn-danger"
            onClick={handleDeleteFromEdit}
            disabled={isSubmitting}
          >
            Elimina
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSaveEdit}
            disabled={isSubmitting || !editName.trim()}
          >
            {isSubmitting ? '...' : 'Salva'}
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default Archivio
