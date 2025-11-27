import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import type { MissingItemWithRelations } from '../types/items';

export interface RepositoryResult<T> {
  data: T | null;
  error: Error | null;
}

async function wrapQuery<T>(
  fn: () => Promise<{ data: T | null; error: unknown }>
): Promise<RepositoryResult<T>> {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase non configurato (env mancanti).') };
  }

  const { data, error } = await fn();
  if (error) {
    console.error('[missingItemsRepository] Errore Supabase', error);
    const message =
      typeof error === 'object' && error !== null && 'message' in error
        ? String((error as { message?: unknown }).message ?? error)
        : String(error);
    return { data: null, error: new Error(message) };
  }

  return { data: data ?? null, error: null };
}

type MissingItemRow = {
  id: string;
  articolo_id: string | null;
  articoli?: {
    id: string;
    nome: string;
    tipologia_id: string | null;
    tipologie?: { id: string; nome: string } | { id: string; nome: string }[];
  } | null;
};

export async function getMissingItems(): Promise<RepositoryResult<MissingItemWithRelations[]>> {
  return wrapQuery(async () => {
    const { data, error } = await supabase
      .from('missing_items')
      .select(
        `
        id,
        articolo_id,
        articoli (
          id,
          nome,
          tipologia_id,
          tipologie ( id, nome )
        )
      `
      )
      .order('created_at', { ascending: true });

    const rows: MissingItemRow[] = (data ?? []) as unknown as MissingItemRow[];

    const mapped: MissingItemWithRelations[] = rows.map((row) => {
      const articolo = row.articoli;
      const firstTipologia = Array.isArray(articolo?.tipologie)
        ? articolo?.tipologie[0]
        : articolo?.tipologie;

      return {
        id: row.id,
        articoloId: row.articolo_id ?? '',
        articoloNome: articolo?.nome ?? 'N/A',
        tipologiaNome: firstTipologia?.nome ?? 'N/A',
      };
    });

    return { data: mapped, error };
  });
}

export async function addMissingItem(
  articoloId: string
): Promise<RepositoryResult<MissingItemWithRelations>> {
  return wrapQuery(async () => {
    const { data, error } = await supabase
      .from('missing_items')
      .insert({ articolo_id: articoloId })
      .select(
        `
        id,
        articolo_id,
        articoli (
          id,
          nome,
          tipologia_id,
          tipologie ( id, nome )
        )
      `
      )
      .single();

    const row = data as MissingItemRow | null;

    const articolo = row?.articoli ?? null;
    const firstTipologia = Array.isArray(articolo?.tipologie)
      ? articolo?.tipologie[0]
      : articolo?.tipologie;

    const mapped: MissingItemWithRelations | null = row
      ? {
          id: row.id,
          articoloId: row.articolo_id ?? '',
          articoloNome: articolo?.nome ?? 'N/A',
          tipologiaNome: firstTipologia?.nome ?? 'N/A',
        }
      : null;

    return { data: mapped, error };
  });
}

export async function removeMissingItem(id: string): Promise<RepositoryResult<null>> {
  return wrapQuery(async () => {
    const { error } = await supabase.from('missing_items').delete().eq('id', id);

    return { data: null, error };
  });
}
