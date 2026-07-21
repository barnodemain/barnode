import { useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { clearRecipesCache } from './useRecipes'
import type { Cocktail, Preparation, RecipeIngredient } from '../types'

// Payload editabili (senza id lato ingredienti: gli id vengono ricreati al save)
export interface EditableIngredient {
  nome: string
  misura: string
  unita: string
  preparationId?: string | null
}
export interface CocktailInput {
  nome: string
  bicchiere: string
  ghiaccio: string
  metodo: string
  garnish: string
  ingredienti: EditableIngredient[]
}
export interface PreparationInput {
  nome: string
  categoria: string
  procedimento: string
  ingredienti: EditableIngredient[]
}

export function useRecipeAdmin() {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function ensure() {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase non configurato')
    }
    return supabase
  }

  // --- COCKTAIL ---
  async function saveCocktail(input: CocktailInput, existing?: Cocktail): Promise<boolean> {
    setSaving(true); setError(null)
    try {
      const sb = ensure()
      const base = {
        nome: input.nome.trim(),
        bicchiere: input.bicchiere.trim() || null,
        ghiaccio: input.ghiaccio.trim() || null,
        metodo: input.metodo.trim() || null,
        garnish: input.garnish.trim() || null,
      }
      let cocktailId: string
      if (existing) {
        const { error: e } = await sb.from('cocktails').update(base).eq('id', existing.id)
        if (e) throw e
        cocktailId = existing.id
        // rimpiazzo gli ingredienti (delete + insert): semplice e robusto
        const { error: de } = await sb.from('cocktail_ingredients').delete().eq('cocktail_id', cocktailId)
        if (de) throw de
      } else {
        const { data, error: e } = await sb.from('cocktails')
          .insert({ ...base, sort_order: 9999 }).select('id').single()
        if (e) throw e
        cocktailId = (data as { id: string }).id
      }
      const rows = input.ingredienti
        .filter(i => i.nome.trim())
        .map((i, idx) => ({
          cocktail_id: cocktailId,
          nome: i.nome.trim(),
          misura: i.misura.trim() || null,
          unita: i.unita.trim() || null,
          preparation_id: i.preparationId || null,
          sort_order: idx,
        }))
      if (rows.length) {
        const { error: ie } = await sb.from('cocktail_ingredients').insert(rows)
        if (ie) throw ie
      }
      clearRecipesCache()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore salvataggio cocktail')
      return false
    } finally {
      setSaving(false)
    }
  }

  async function deleteCocktail(id: string): Promise<boolean> {
    setSaving(true); setError(null)
    try {
      const sb = ensure()
      const { error: e } = await sb.from('cocktails').delete().eq('id', id) // cascade sugli ingredienti
      if (e) throw e
      clearRecipesCache()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore eliminazione cocktail')
      return false
    } finally {
      setSaving(false)
    }
  }

  // --- PREPARAZIONI ---
  async function savePreparation(input: PreparationInput, existing?: Preparation): Promise<boolean> {
    setSaving(true); setError(null)
    try {
      const sb = ensure()
      const base = {
        nome: input.nome.trim(),
        categoria: input.categoria.trim() || null,
        procedimento: input.procedimento.trim() || null,
      }
      let prepId: string
      if (existing) {
        const { error: e } = await sb.from('preparations').update(base).eq('id', existing.id)
        if (e) throw e
        prepId = existing.id
        const { error: de } = await sb.from('preparation_ingredients').delete().eq('preparation_id', prepId)
        if (de) throw de
      } else {
        const { data, error: e } = await sb.from('preparations')
          .insert({ ...base, sort_order: 9999 }).select('id').single()
        if (e) throw e
        prepId = (data as { id: string }).id
      }
      const rows = input.ingredienti
        .filter(i => i.nome.trim())
        .map((i, idx) => ({
          preparation_id: prepId,
          nome: i.nome.trim(),
          misura: i.misura.trim() || null,
          unita: i.unita.trim() || null,
          sort_order: idx,
        }))
      if (rows.length) {
        const { error: ie } = await sb.from('preparation_ingredients').insert(rows)
        if (ie) throw ie
      }
      clearRecipesCache()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore salvataggio preparazione')
      return false
    } finally {
      setSaving(false)
    }
  }

  async function deletePreparation(id: string): Promise<boolean> {
    setSaving(true); setError(null)
    try {
      const sb = ensure()
      const { error: e } = await sb.from('preparations').delete().eq('id', id)
      if (e) throw e
      clearRecipesCache()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore eliminazione preparazione')
      return false
    } finally {
      setSaving(false)
    }
  }

  function toEditable(ings: RecipeIngredient[]): EditableIngredient[] {
    return ings.map(i => ({
      nome: i.nome,
      misura: i.misura || '',
      unita: i.unita || '',
      preparationId: i.preparationId ?? null,
    }))
  }

  return { saving, error, saveCocktail, deleteCocktail, savePreparation, deletePreparation, toEditable }
}
