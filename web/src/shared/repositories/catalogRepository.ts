import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import type { Articolo, ArticoloWithRelations, Tipologia } from '../types/items';
import { COLORE_VARIE } from '../constants/tipologie';

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
      .select('id, nome, colore, created_at')
      .order('nome', { ascending: true });
  });
}

export async function updateArticolo(
  id: string,
  input: UpdateArticoloInput
): Promise<RepositoryResult<Articolo>> {
  const { nome, tipologiaId } = input;

  return wrapQuery(async () => {
    const { data, error } = await supabase
      .from('articoli')
      .update({ nome, tipologia_id: tipologiaId })
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

export interface CreateTipologiaInput {
  nome: string;
  colore: string;
}

export interface UpdateTipologiaInput {
  nome: string;
  colore: string;
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

export interface UpdateArticoloInput {
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

export async function createTipologia(
  input: CreateTipologiaInput
): Promise<RepositoryResult<Tipologia>> {
  const { nome, colore } = input;

  return wrapQuery(async () => {
    const normalized = nome.trim().toLowerCase();

    if (normalized === 'varie') {
      const { data: existing, error: checkError } = await supabase
        .from('tipologie')
        .select('id')
        .ilike('nome', 'varie')
        .limit(1)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        return { data: null, error: checkError };
      }

      if (existing) {
        return { data: null, error: new Error('Esiste già la tipologia Varie') };
      }
    }

    const insertPayload = {
      nome,
      colore: normalized === 'varie' ? COLORE_VARIE : colore,
    };

    const { data, error } = await supabase
      .from('tipologie')
      .insert(insertPayload)
      .select('id, nome, colore')
      .single();

    const mapped: Tipologia | null = data
      ? {
          id: data.id,
          nome: data.nome,
          colore: data.colore,
        }
      : null;

    return { data: mapped, error };
  });
}

export async function updateTipologia(
  id: string,
  input: UpdateTipologiaInput
): Promise<RepositoryResult<Tipologia>> {
  return wrapQuery(async () => {
    const { data: current, error: loadError } = await supabase
      .from('tipologie')
      .select('id, nome, colore')
      .eq('id', id)
      .single();

    if (loadError || !current) {
      return { data: null, error: loadError };
    }

    const currentIsVarie = current.nome.trim().toLowerCase() === 'varie';
    const inputName = input.nome ?? current.nome;
    const normalizedInputName = inputName.trim().toLowerCase();

    if (currentIsVarie) {
      const { data, error } = await supabase
        .from('tipologie')
        .update({ nome: 'Varie', colore: COLORE_VARIE })
        .eq('id', id)
        .select('id, nome, colore')
        .single();

      const mapped: Tipologia | null = data
        ? {
            id: data.id,
            nome: data.nome,
            colore: data.colore,
          }
        : null;

      return { data: mapped, error };
    }

    if (normalizedInputName === 'varie') {
      const { data: existing, error: checkError } = await supabase
        .from('tipologie')
        .select('id')
        .ilike('nome', 'varie')
        .neq('id', id)
        .limit(1)
        .single();

      if (!checkError && existing) {
        return { data: null, error: new Error('Esiste già la tipologia Varie') };
      }
    }

    const payload = {
      nome: input.nome ?? current.nome,
      colore: normalizedInputName === 'varie' ? COLORE_VARIE : (input.colore ?? current.colore),
    };

    const { data, error } = await supabase
      .from('tipologie')
      .update(payload)
      .eq('id', id)
      .select('id, nome, colore')
      .single();

    const mapped: Tipologia | null = data
      ? {
          id: data.id,
          nome: data.nome,
          colore: data.colore,
        }
      : null;

    return { data: mapped, error };
  });
}

export async function deleteTipologia(id: string): Promise<RepositoryResult<null>> {
  return wrapQuery(async () => {
    const { data: current, error: loadError } = await supabase
      .from('tipologie')
      .select('id, nome')
      .eq('id', id)
      .single();

    if (loadError || !current) {
      return { data: null, error: loadError };
    }

    if (current.nome.trim().toLowerCase() === 'varie') {
      return { data: null, error: new Error('Non puoi eliminare la tipologia predefinita Varie') };
    }

    // Reassegna gli articoli collegati a questa tipologia alla tipologia "Varie", se esiste
    const { data: varie, error: varieError } = await supabase
      .from('tipologie')
      .select('id, nome')
      .ilike('nome', 'varie')
      .limit(1)
      .single();

    if (varieError && varieError.code !== 'PGRST116') {
      return { data: null, error: varieError };
    }

    if (varie) {
      const { error: reassignmentError } = await supabase
        .from('articoli')
        .update({ tipologia_id: varie.id })
        .eq('tipologia_id', id);

      if (reassignmentError) {
        return { data: null, error: reassignmentError };
      }
    }

    const { error } = await supabase.from('tipologie').delete().eq('id', id);
    return { data: null, error };
  });
}
