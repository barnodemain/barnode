import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { createAndSaveCurrentSnapshot } from '../lib/backupService'
import {
  getArticoliCache,
  setArticoliCache,
  subscribeArticoli,
} from '../lib/articoliStore'
import { getMissingCache, setMissingCache } from '../lib/missingItemsStore'
import type { Articolo } from '../types'

export function useArticoli() {
  // Parte dalla cache condivisa se già popolata: niente refetch ad ogni cambio pagina.
  const [articoli, setArticoli] = useState<Articolo[]>(() => getArticoliCache() ?? [])
  const [loading, setLoading] = useState(() => getArticoliCache() === null)
  const [error, setError] = useState<string | null>(null)

  // Tiene sincronizzate tutte le viste montate quando la cache cambia.
  useEffect(() => {
    return subscribeArticoli(() => setArticoli(getArticoliCache() ?? []))
  }, [])

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
      setArticoliCache(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel caricamento degli articoli')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Fetch solo se la cache è vuota; altrimenti riusa i dati già caricati.
    if (getArticoliCache() === null) {
      fetchArticoli()
    }
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
      
      setArticoliCache([...(getArticoliCache() ?? []), data].sort((a, b) => a.nome.localeCompare(b.nome)))
      createAndSaveCurrentSnapshot().catch(e => console.error('Backup failed:', e))
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

      // Propaga il rename alla lista Home (missing_items): la colonna copia
      // `articolo_nome` sul DB e la cache in-memory, così Home si aggiorna subito
      // senza ricaricare l'app.
      const { error: updateMissingError } = await supabase
        .from('missing_items')
        .update({ articolo_nome: nome })
        .eq('articolo_id', id)

      if (updateMissingError) throw updateMissingError

      setArticoliCache(
        (getArticoliCache() ?? [])
          .map(a => a.id === id ? { ...a, nome } : a)
          .sort((a, b) => a.nome.localeCompare(b.nome))
      )

      const missingCache = getMissingCache()
      if (missingCache) {
        setMissingCache(
          missingCache
            .map(m => m.articoloId === id ? { ...m, articoloNome: nome } : m)
            .sort((a, b) => a.articoloNome.localeCompare(b.articoloNome))
        )
      }

      createAndSaveCurrentSnapshot().catch(e => console.error('Backup failed:', e))
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

      setArticoliCache((getArticoliCache() ?? []).filter(a => a.id !== id))
      createAndSaveCurrentSnapshot().catch(e => console.error('Backup failed:', e))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nell\'eliminazione dell\'articolo')
      return false
    }
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
    searchArticoli,
    clearError: () => setError(null)
  }
}
