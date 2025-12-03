import { useState, useEffect, useRef, useMemo } from 'react'
import { IoSearch, IoTrashOutline } from 'react-icons/io5'
import Modal from '../components/Modal'
import FloatingActionButton from '../components/FloatingActionButton'
import { useArticoli } from '../hooks/useArticoli'
import { useMissingItems } from '../hooks/useMissingItems'
import { normalizeArticleName } from '../lib/normalize'
import type { Articolo } from '../types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout> | null = null

  return ((...args: Parameters<T>) => {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn(...args)
    }, delay)
  }) as T
}

function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  
  const { 
    loading: articoliLoading, 
    error: articoliError,
    createArticolo,
    searchArticoli,
    findByName
  } = useArticoli()
  
  const { 
    missingItems, 
    loading: missingLoading, 
    error: missingError,
    addMissingItem,
    removeMissingItem,
    isArticoloMissing
  } = useMissingItems()

  const setSearchQueryDebounced = useMemo(() => debounce(setSearchQuery, 250), [])

  const suggestions = searchQuery.trim() 
    ? searchArticoli(searchQuery).filter(a => !isArticoloMissing(a.id))
    : []

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSuggestionClick = async (articolo: Articolo) => {
    setShowSuggestions(false)
    setSearchQuery('')
    await addMissingItem(articolo)
  }

  const handleRemoveItem = async (id: string) => {
    await removeMissingItem(id)
  }

  const handleAddNewItem = async () => {
    if (!newItemName.trim()) return
    
    setIsSubmitting(true)
    try {
      const normalizedName = normalizeArticleName(newItemName)
      let articolo: Articolo | null | undefined = findByName(normalizedName)
      
      if (!articolo) {
        articolo = await createArticolo(normalizedName)
      }
      
      setNewItemName('')
      setIsModalOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const loading = articoliLoading || missingLoading
  const error = articoliError || missingError

  return (
    <div className="page-wrapper">
      <div className="page-header-fixed">
        <div className="page-header">
          <img src="/logo.png" alt="BARnode" className="logo" />
          <h1 className="page-title">Lista articoli mancanti</h1>
        </div>

        <div className="search-container" ref={searchContainerRef}>
          <IoSearch className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Cerca per nome"
            value={searchQuery}
            onChange={(e) => {
              setSearchQueryDebounced(e.target.value)
              setShowSuggestions(true)
            }}
            onFocus={() => setShowSuggestions(true)}
          />
          
          {showSuggestions && suggestions.length > 0 && (
            <div className="suggestions-dropdown">
              {suggestions.map(articolo => (
                <div
                  key={articolo.id}
                  className="suggestion-item"
                  onClick={() => handleSuggestionClick(articolo)}
                >
                  {articolo.nome}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="page-content-scrollable">
        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : missingItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <p className="empty-state-text">Nessun articolo mancante</p>
          </div>
        ) : (
          <div className="item-list">
            {missingItems.map(item => (
              <div key={item.id} className="item-card">
                <span className="item-name">{item.articoloNome}</span>
                <div className="item-actions">
                  <button
                    className="icon-button delete"
                    onClick={() => handleRemoveItem(item.id)}
                    aria-label="Rimuovi"
                  >
                    <IoTrashOutline size={22} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <FloatingActionButton onClick={() => setIsModalOpen(true)} />

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setNewItemName('')
        }}
        title="Aggiungi articolo"
      >
        <label className="modal-input-label">Nome articolo</label>
        <input
          type="text"
          className="modal-input"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder="Es. Vodka Premium"
          autoFocus
        />
        <div className="modal-buttons">
          <button
            className="btn btn-secondary"
            onClick={() => {
              setIsModalOpen(false)
              setNewItemName('')
            }}
          >
            Annulla
          </button>
          <button
            className="btn btn-primary"
            onClick={handleAddNewItem}
            disabled={isSubmitting || !newItemName.trim()}
          >
            {isSubmitting ? '...' : 'Conferma'}
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default Home
