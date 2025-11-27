import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import type { Articolo, ArticoloWithRelations, Tipologia } from '../types/items';

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
    console.error('[catalogRepository] Errore Supabase', error);
    const message =
      typeof error === 'object' && error !== null && 'message' in error
        ? String((error as { message?: unknown }).message ?? error)
        : String(error);
    return { data: null, error: new Error(message) };
  }

  return { data: data ?? null, error: null };
}

export async function getTipologie(): Promise<RepositoryResult<Tipologia[]>> {
  return wrapQuery(async () => {
    return supabase
      .from('tipologie')
      .select('id, nome, descrizione')
      .eq('is_attiva', true)
      .order('nome', { ascending: true });
  });
}

export async function getArticoliWithRelations(): Promise<
  RepositoryResult<ArticoloWithRelations[]>
> {
  return wrapQuery(async () => {
    const { data, error } = await supabase
      .from('articoli')
      .select(
        `
        id,
        nome,
        tipologia_id,
        tipologie ( id, nome )
      `
      )
      .eq('is_attivo', true)
      .order('nome', { ascending: true });

    if (error) {
      return { data: null, error };
    }

    const mapped: ArticoloWithRelations[] = (data ?? []).map((row) => ({
      id: row.id,
      nome: row.nome,
      tipologiaId: row.tipologia_id ?? '',
      tipologiaNome: row.tipologie?.nome ?? 'N/A',
    }));

    return { data: mapped, error: null };
  });
}

export async function updateArticoloNome(
  id: string,
  nuovoNome: string
): Promise<RepositoryResult<Articolo>> {
  return wrapQuery(async () => {
    const { data, error } = await supabase
      .from('articoli')
      .update({ nome: nuovoNome })
      .eq('id', id)
      .select('id, nome, tipologia_id')
      .single();

    const mapped: Articolo | null = data
      ? {
          id: data.id,
          nome: data.nome,
          tipologiaId: data.tipologia_id ?? '',
        }
      : null;

    return { data: mapped, error };
  });
}

export async function deleteArticolo(id: string): Promise<RepositoryResult<null>> {
  return wrapQuery(async () => {
    const { error } = await supabase.from('articoli').delete().eq('id', id);
    return { data: null, error };
  });
}
