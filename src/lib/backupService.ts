import { supabase, isSupabaseConfigured } from './supabase'

interface BackupPayload {
  articoli: Array<{ id: string; nome: string; created_at?: string }>
  missing_items: Array<{ id: string; articolo_id: string; created_at?: string }>
}

export async function createAndSaveCurrentSnapshot(): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) {
    return
  }

  try {
    const [articoliResult, missingItemsResult] = await Promise.all([
      supabase.from('articoli').select('id, nome, created_at'),
      supabase.from('missing_items').select('id, articolo_id, created_at')
    ])

    const articoli = articoliResult.data || []
    const missing_items = missingItemsResult.data || []

    if (articoli.length === 0 && missing_items.length === 0) {
      return
    }

    const payload: BackupPayload = {
      articoli: articoli.map(a => ({
        id: a.id,
        nome: a.nome,
        created_at: a.created_at
      })),
      missing_items: missing_items.map(m => ({
        id: m.id,
        articolo_id: m.articolo_id,
        created_at: m.created_at
      }))
    }

    await supabase
      .from('backups_barnode')
      .insert([{ payload }])
  } catch (error) {
    console.error('Backup failed:', error)
  }
}
