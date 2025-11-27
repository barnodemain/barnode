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
      .select('id, nome, created_at')
      .order('nome', { ascending: true });
  });
}

type ArticoloWithRelationsRow = {
  id: string;
  nome: string;
  tipologia_id: string | null;
  tipologie?: { id: string; nome: string } | { id: string; nome: string }[];
};

export interface CreateArticoloInput {
  nome: string;
  tipologiaId: string;
}

export async function createArticolo(
  input: CreateArticoloInput
): Promise<RepositoryResult<Articolo>> {
  const { nome, tipologiaId } = input;

  return wrapQuery(async () => {
    const { data, error } = await supabase
      .from('articoli')
      .insert({ nome, tipologia_id: tipologiaId })
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
      .order('nome', { ascending: true });

    if (error) {
      return { data: null, error };
    }

    const mapped: ArticoloWithRelations[] = (data ?? []).map((row: ArticoloWithRelationsRow) => {
      const firstTipologia = Array.isArray(row.tipologie) ? row.tipologie[0] : row.tipologie;

      return {
        id: row.id,
        nome: row.nome,
        tipologiaId: row.tipologia_id ?? '',
        tipologiaNome: firstTipologia?.nome ?? 'N/A',
      };
    });

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
