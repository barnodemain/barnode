import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { MissingItem, Articolo } from '../types'

export function useMissingItems() {
  const [missingItems, setMissingItems] = useState<MissingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMissingItems = useCallback(async () => {
    if (!isSupabaseConfigured() || !supabase) {
      setError('Supabase non configurato. Aggiungi VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('missing_items')
        .select('*')
        .order('articolo_nome', { ascending: true })

      if (fetchError) throw fetchError
      setMissingItems(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel caricamento degli articoli mancanti')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMissingItems()
  }, [fetchMissingItems])

  const addMissingItem = async (articolo: Articolo): Promise<boolean> => {
    if (!isSupabaseConfigured() || !supabase) {
      setError('Supabase non configurato')
      return false
    }

    const exists = missingItems.some(m => m.articolo_id === articolo.id)
    if (exists) {
      return true
    }

    try {
      setError(null)
      const { data, error: insertError } = await supabase
        .from('missing_items')
        .insert([{
          articolo_id: articolo.id,
          articolo_nome: articolo.nome
        }])
        .select()
        .single()

      if (insertError) throw insertError

      setMissingItems(prev => 
        [...prev, data].sort((a, b) => a.articolo_nome.localeCompare(b.articolo_nome))
      )
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nell\'aggiunta dell\'articolo mancante')
      return false
    }
  }

  const removeMissingItem = async (id: string): Promise<boolean> => {
    if (!isSupabaseConfigured() || !supabase) {
      setError('Supabase non configurato')
      return false
    }

    try {
      setError(null)
      const { error: deleteError } = await supabase
        .from('missing_items')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      setMissingItems(prev => prev.filter(m => m.id !== id))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nella rimozione dell\'articolo mancante')
      return false
    }
  }

  const isArticoloMissing = (articoloId: string): boolean => {
    return missingItems.some(m => m.articolo_id === articoloId)
  }

  return {
    missingItems,
    loading,
    error,
    fetchMissingItems,
    addMissingItem,
    removeMissingItem,
    isArticoloMissing,
    clearError: () => setError(null)
  }
}
