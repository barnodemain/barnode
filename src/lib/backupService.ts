import { supabase, isSupabaseConfigured } from './supabase'

const SINGLETON_BACKUP_ID = '00000000-0000-0000-0000-000000000001' as const

// Snapshot completo dei dati dell'app (catalogo + lista mancanti + ricettario).
// Una sola riga singleton su backups_barnode, sovrascritta ad ogni salvataggio.
// Il ripristino avviene lato DB (funzione `restore_last_backup`), che ignora le
// chiavi che non conosce: aggiungere sezioni qui è sempre retro-compatibile.
interface BackupPayload {
  articoli: Array<{ id: string; nome: string; created_at?: string }>
  missing_items: Array<{ id: string; articolo_id: string; articolo_nome: string; created_at?: string }>
  cocktails: Array<{
    id: string; nome: string; bicchiere: string | null; ghiaccio: string | null
    metodo: string | null; garnish: string | null; note: string | null
    sort_order: number; created_at?: string
  }>
  cocktail_ingredients: Array<{
    id: string; cocktail_id: string; nome: string; misura: string | null
    unita: string | null; preparation_id: string | null; sort_order: number
  }>
  preparations: Array<{
    id: string; nome: string; categoria: string | null; procedimento: string | null
    note: string | null; sort_order: number; created_at?: string
  }>
  preparation_ingredients: Array<{
    id: string; preparation_id: string; nome: string; misura: string | null
    unita: string | null; sort_order: number
  }>
}

export async function createAndSaveCurrentSnapshot(): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) {
    return
  }

  try {
    const [
      articoliResult,
      missingItemsResult,
      cocktailsResult,
      cocktailIngsResult,
      preparationsResult,
      preparationIngsResult,
    ] = await Promise.all([
      supabase.from('articoli').select('id, nome, created_at'),
      supabase.from('missing_items').select('id, articolo_id, articolo_nome, created_at'),
      supabase.from('cocktails').select('id, nome, bicchiere, ghiaccio, metodo, garnish, note, sort_order, created_at'),
      supabase.from('cocktail_ingredients').select('id, cocktail_id, nome, misura, unita, preparation_id, sort_order'),
      supabase.from('preparations').select('id, nome, categoria, procedimento, note, sort_order, created_at'),
      supabase.from('preparation_ingredients').select('id, preparation_id, nome, misura, unita, sort_order'),
    ])

    const articoli = articoliResult.data || []
    const missing_items = missingItemsResult.data || []
    const cocktails = cocktailsResult.data || []
    const cocktail_ingredients = cocktailIngsResult.data || []
    const preparations = preparationsResult.data || []
    const preparation_ingredients = preparationIngsResult.data || []

    // niente snapshot se il DB risulta completamente vuoto (probabile errore di rete):
    // meglio tenere l'ultimo snapshot buono che sovrascriverlo con il nulla
    const totale = articoli.length + missing_items.length + cocktails.length + preparations.length
    if (totale === 0) {
      return
    }

    const payload: BackupPayload = {
      articoli,
      missing_items,
      cocktails,
      cocktail_ingredients,
      preparations,
      preparation_ingredients,
    }

    const created_at = new Date().toISOString()

    await supabase
      .from('backups_barnode')
      .upsert(
        [{
          id: SINGLETON_BACKUP_ID,
          payload,
          created_at,
        }],
        { onConflict: 'id' },
      )
  } catch (error) {
    console.error('Backup failed:', error)
  }
}
