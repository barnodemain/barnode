import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Cocktail, Preparation, RecipeIngredient } from '../types'

// Cache in-memory condivisa (stesso pattern di articoliStore): niente refetch
// tra le navigazioni interne alla sezione ricettario.
let cocktailsCache: Cocktail[] | null = null
let preparationsCache: Preparation[] | null = null
const listeners = new Set<() => void>()
function notify() { listeners.forEach(l => l()) }

export function clearRecipesCache() {
  cocktailsCache = null
  preparationsCache = null
}

interface IngRow {
  id: string
  nome: string
  misura: string | null
  unita: string | null
  preparation_id?: string | null
  sort_order: number
}

function mapIng(rows: IngRow[] | null | undefined): RecipeIngredient[] {
  return (rows || [])
    .map(r => ({
      id: r.id,
      nome: r.nome,
      misura: r.misura,
      unita: r.unita,
      preparationId: r.preparation_id ?? null,
      sortOrder: r.sort_order,
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

export function useRecipes() {
  const [cocktails, setCocktails] = useState<Cocktail[]>(() => cocktailsCache ?? [])
  const [preparations, setPreparations] = useState<Preparation[]>(() => preparationsCache ?? [])
  const [loading, setLoading] = useState(() => cocktailsCache === null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const l = () => {
      setCocktails(cocktailsCache ?? [])
      setPreparations(preparationsCache ?? [])
    }
    listeners.add(l)
    return () => { listeners.delete(l) }
  }, [])

  const fetchRecipes = useCallback(async () => {
    if (!isSupabaseConfigured() || !supabase) {
      setError('Supabase non configurato.')
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      setError(null)

      const [{ data: cData, error: cErr }, { data: pData, error: pErr }] = await Promise.all([
        supabase
          .from('cocktails')
          .select('id,nome,bicchiere,ghiaccio,metodo,garnish,note,sort_order,cocktail_ingredients(id,nome,misura,unita,preparation_id,sort_order)')
          // cocktail sempre in ordine alfabetico per nome
          .order('nome', { ascending: true }),
        supabase
          .from('preparations')
          .select('id,nome,categoria,procedimento,note,sort_order,preparation_ingredients(id,nome,misura,unita,sort_order)')
          .order('sort_order', { ascending: true }),
      ])

      if (cErr) throw cErr
      if (pErr) throw pErr

      cocktailsCache = (cData || []).map((c: Record<string, unknown>) => ({
        id: c.id as string,
        nome: c.nome as string,
        bicchiere: (c.bicchiere as string) ?? null,
        ghiaccio: (c.ghiaccio as string) ?? null,
        metodo: (c.metodo as string) ?? null,
        garnish: (c.garnish as string) ?? null,
        note: (c.note as string) ?? null,
        sortOrder: (c.sort_order as number) ?? 0,
        ingredienti: mapIng(c.cocktail_ingredients as IngRow[]),
      }))
        // ordine alfabetico "umano" (ignora maiuscole/accenti)
        .sort((a, b) => a.nome.localeCompare(b.nome, 'it', { sensitivity: 'base' }))

      preparationsCache = (pData || []).map((p: Record<string, unknown>) => ({
        id: p.id as string,
        nome: p.nome as string,
        categoria: (p.categoria as string) ?? null,
        procedimento: (p.procedimento as string) ?? null,
        note: (p.note as string) ?? null,
        sortOrder: (p.sort_order as number) ?? 0,
        ingredienti: mapIng(p.preparation_ingredients as IngRow[]),
      }))

      notify()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel caricamento del ricettario')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (cocktailsCache === null) fetchRecipes()
  }, [fetchRecipes])

  return { cocktails, preparations, loading, error, fetchRecipes }
}
