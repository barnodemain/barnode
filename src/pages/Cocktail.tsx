import { useState, useMemo } from 'react'
import { IoSearch } from 'react-icons/io5'
import { useRecipes } from '../hooks/useRecipes'
import { normalizeForCompare } from '../lib/analysisGrouping'
import CocktailDeck from '../components/recipes/CocktailDeck'
import PreparationsList from '../components/recipes/PreparationsList'
import type { Preparation } from '../types'

type Tab = 'cocktail' | 'preparazioni'

function Cocktail() {
  const { cocktails, preparations, loading, error } = useRecipes()
  const [tab, setTab] = useState<Tab>('cocktail')
  const [query, setQuery] = useState('')

  const q = normalizeForCompare(query)

  const filteredCocktails = useMemo(() => {
    if (!q) return cocktails
    return cocktails.filter(c => {
      if (normalizeForCompare(c.nome).includes(q)) return true
      // cerca anche negli ingredienti (trova un drink dal suo ingrediente)
      return c.ingredienti.some(i => normalizeForCompare(i.nome).includes(q))
    })
  }, [cocktails, q])

  const filteredPreparations = useMemo(() => {
    if (!q) return preparations
    return preparations.filter(p =>
      normalizeForCompare(p.nome).includes(q) ||
      (p.categoria && normalizeForCompare(p.categoria).includes(q)) ||
      p.ingredienti.some(i => normalizeForCompare(i.nome).includes(q))
    )
  }, [preparations, q])

  // mappa preparazioni per id: serve ai link dagli ingredienti cocktail
  const prepById = useMemo(() => {
    const m = new Map<string, Preparation>()
    preparations.forEach(p => m.set(p.id, p))
    return m
  }, [preparations])

  return (
    <div className="page-wrapper page-wrapper-recipes">
      <div className="page-header-fixed recipes-header">
        <div className="recipes-tabs">
          <button
            className={`recipes-tab ${tab === 'cocktail' ? 'active' : ''}`}
            onClick={() => setTab('cocktail')}
          >
            Cocktail
          </button>
          <button
            className={`recipes-tab ${tab === 'preparazioni' ? 'active' : ''}`}
            onClick={() => setTab('preparazioni')}
          >
            Preparazioni
          </button>
        </div>

        <div className="search-container recipes-search">
          <IoSearch className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder={tab === 'cocktail' ? 'Cerca cocktail o ingrediente…' : 'Cerca preparazione…'}
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="error-message" style={{ margin: 16 }}>{error}</div>}

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : tab === 'cocktail' ? (
        <CocktailDeck cocktails={filteredCocktails} prepById={prepById} />
      ) : (
        <PreparationsList preparations={filteredPreparations} />
      )}
    </div>
  )
}

export default Cocktail
