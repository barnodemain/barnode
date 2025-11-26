import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

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

export async function getMissingIds(): Promise<RepositoryResult<string[]>> {
  return wrapQuery(async () => {
    const { data, error } = await supabase
      .from('articoli_mancanti')
      .select('articolo_id')
      .order('created_at', { ascending: true });

    const ids = (data ?? []).map((row) => row.articolo_id as string);
    return { data: ids, error };
  });
}

export async function addMissing(articoloId: string): Promise<RepositoryResult<null>> {
  return wrapQuery(async () => {
    const { error } = await supabase.from('articoli_mancanti').insert({ articolo_id: articoloId });

    // Violazione unique (già presente) → la trattiamo come non-bloccante.
    if (error && String(error.code) !== '23505') {
      return { data: null, error };
    }

    return { data: null, error: null };
  });
}

export async function removeMissing(articoloId: string): Promise<RepositoryResult<null>> {
  return wrapQuery(async () => {
    const { error } = await supabase
      .from('articoli_mancanti')
      .delete()
      .eq('articolo_id', articoloId);

    return { data: null, error };
  });
}
