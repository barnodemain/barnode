import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import type { Articolo, ArticoloWithRelations, Fornitore, Tipologia } from '../types';

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

export async function getFornitori(): Promise<RepositoryResult<Fornitore[]>> {
  return wrapQuery(async () => {
    return supabase.from('fornitori').select('id, nome').order('nome', { ascending: true });
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
        fornitore_id,
        tipologie ( id, nome ),
        fornitori ( id, nome )
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
      fornitoreId: row.fornitore_id ?? '',
      tipologiaNome: row.tipologie?.nome ?? 'N/A',
      fornitoreNome: row.fornitori?.nome ?? 'N/A',
    }));

    return { data: mapped, error: null };
  });
}

export async function createTipologia(nome: string): Promise<RepositoryResult<Tipologia>> {
  return wrapQuery(async () => {
    const { data, error } = await supabase
      .from('tipologie')
      .insert({ nome })
      .select('id, nome, descrizione')
      .single();
    return { data, error };
  });
}

export async function updateTipologia(
  id: string,
  nome: string
): Promise<RepositoryResult<Tipologia>> {
  return wrapQuery(async () => {
    const { data, error } = await supabase
      .from('tipologie')
      .update({ nome })
      .eq('id', id)
      .select('id, nome, descrizione')
      .single();
    return { data, error };
  });
}

export async function deleteTipologia(id: string): Promise<RepositoryResult<null>> {
  return wrapQuery(async () => {
    const { error } = await supabase.from('tipologie').delete().eq('id', id);
    return { data: null, error };
  });
}

export async function createFornitore(nome: string): Promise<RepositoryResult<Fornitore>> {
  return wrapQuery(async () => {
    const { data, error } = await supabase
      .from('fornitori')
      .insert({ nome })
      .select('id, nome')
      .single();
    return { data, error };
  });
}

export async function updateFornitore(
  id: string,
  nome: string
): Promise<RepositoryResult<Fornitore>> {
  return wrapQuery(async () => {
    const { data, error } = await supabase
      .from('fornitori')
      .update({ nome })
      .eq('id', id)
      .select('id, nome')
      .single();
    return { data, error };
  });
}

export async function deleteFornitore(id: string): Promise<RepositoryResult<null>> {
  return wrapQuery(async () => {
    const { error } = await supabase.from('fornitori').delete().eq('id', id);
    return { data: null, error };
  });
}

interface CreateArticoloInput {
  nome: string;
  tipologiaId: string;
  fornitoreId: string;
}

export async function createArticolo(
  input: CreateArticoloInput
): Promise<RepositoryResult<ArticoloWithRelations>> {
  return wrapQuery(async () => {
    const { data, error } = await supabase
      .from('articoli')
      .insert({
        nome: input.nome,
        tipologia_id: input.tipologiaId || null,
        fornitore_id: input.fornitoreId || null,
      })
      .select(
        `
        id,
        nome,
        tipologia_id,
        fornitore_id,
        tipologie ( id, nome ),
        fornitori ( id, nome )
      `
      )
      .single();

    if (error) {
      return { data: null, error };
    }

    const articolo: ArticoloWithRelations | null = data
      ? {
          id: data.id,
          nome: data.nome,
          tipologiaId: data.tipologia_id ?? '',
          fornitoreId: data.fornitore_id ?? '',
          tipologiaNome: data.tipologie?.nome ?? 'N/A',
          fornitoreNome: data.fornitori?.nome ?? 'N/A',
        }
      : null;

    return { data: articolo, error: null };
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
      .select('id, nome, tipologia_id, fornitore_id')
      .single();

    const mapped: Articolo | null = data
      ? {
          id: data.id,
          nome: data.nome,
          tipologiaId: data.tipologia_id ?? '',
          fornitoreId: data.fornitore_id ?? '',
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
