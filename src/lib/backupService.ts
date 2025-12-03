import { supabase, isSupabaseConfigured } from './supabase'

const SINGLETON_BACKUP_ID = '00000000-0000-0000-0000-000000000001' as const

interface BackupPayload {
  articoli: Array<{ id: string; nome: string; created_at?: string }>
  missing_items: Array<{ id: string; articolo_id: string; articolo_nome: string; created_at?: string }>
}

export async function createAndSaveCurrentSnapshot(): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) {
    return
  }

  try {
    const [articoliResult, missingItemsResult] = await Promise.all([
      supabase.from('articoli').select('id, nome, created_at'),
      supabase.from('missing_items').select('id, articolo_id, articolo_nome, created_at')
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
        articolo_nome: m.articolo_nome,
        created_at: m.created_at
      }))
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
