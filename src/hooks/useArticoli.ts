import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Articolo } from '../types'

export function useArticoli() {
  const [articoli, setArticoli] = useState<Articolo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchArticoli = useCallback(async () => {
    if (!isSupabaseConfigured() || !supabase) {
      setError('Supabase non configurato. Aggiungi VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('articoli')
        .select('*')
        .order('nome', { ascending: true })

      if (fetchError) throw fetchError
      setArticoli(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel caricamento degli articoli')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchArticoli()
  }, [fetchArticoli])

  const createArticolo = async (nome: string): Promise<Articolo | null> => {
    if (!isSupabaseConfigured() || !supabase) {
      setError('Supabase non configurato')
      return null
    }

    try {
      setError(null)
      const { data, error: insertError } = await supabase
        .from('articoli')
        .insert([{ nome }])
        .select()
        .single()

      if (insertError) throw insertError
      
      setArticoli(prev => [...prev, data].sort((a, b) => a.nome.localeCompare(b.nome)))
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nella creazione dell\'articolo')
      return null
    }
  }

  const updateArticolo = async (id: string, nome: string): Promise<boolean> => {
    if (!isSupabaseConfigured() || !supabase) {
      setError('Supabase non configurato')
      return false
    }

    try {
      setError(null)
      const { error: updateError } = await supabase
        .from('articoli')
        .update({ nome })
        .eq('id', id)

      if (updateError) throw updateError

      const { error: syncError } = await supabase
        .from('missing_items')
        .update({ articolo_nome: nome })
        .eq('articolo_id', id)

      if (syncError) throw syncError

      setArticoli(prev => 
        prev.map(a => a.id === id ? { ...a, nome } : a)
          .sort((a, b) => a.nome.localeCompare(b.nome))
      )
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nell\'aggiornamento dell\'articolo')
      return false
    }
  }

  const deleteArticolo = async (id: string): Promise<boolean> => {
    if (!isSupabaseConfigured() || !supabase) {
      setError('Supabase non configurato')
      return false
    }

    try {
      setError(null)
      const { error: deleteMissingError } = await supabase
        .from('missing_items')
        .delete()
        .eq('articolo_id', id)

      if (deleteMissingError) throw deleteMissingError

      const { error: deleteError } = await supabase
        .from('articoli')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      setArticoli(prev => prev.filter(a => a.id !== id))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nell\'eliminazione dell\'articolo')
      return false
    }
  }

  const findByName = (nome: string): Articolo | undefined => {
    return articoli.find(a => a.nome.toLowerCase() === nome.toLowerCase())
  }

  const searchArticoli = (query: string): Articolo[] => {
    if (!query.trim()) return []
    const lowerQuery = query.toLowerCase()
    return articoli.filter(a => a.nome.toLowerCase().includes(lowerQuery))
  }

  return {
    articoli,
    loading,
    error,
    fetchArticoli,
    createArticolo,
    updateArticolo,
    deleteArticolo,
    findByName,
    searchArticoli,
    clearError: () => setError(null)
  }
}
