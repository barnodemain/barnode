import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import type { ArticoloWithRelations, Tipologia, MissingItemWithRelations } from '../types/items';
import { getTipologie, getArticoliWithRelations } from './catalogRepository';
import { getMissingItems } from './missingItemsRepository';

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
    console.error('[backupRepository] Errore Supabase', error);
    const message =
      typeof error === 'object' && error !== null && 'message' in error
        ? String((error as { message?: unknown }).message ?? error)
        : String(error);
    return { data: null, error: new Error(message) };
  }

  return { data: data ?? null, error: null };
}

export type BackupPayload = {
  tipologie: Tipologia[];
  articoli: ArticoloWithRelations[];
  missingItems: MissingItemWithRelations[];
};

export async function hasAnyBackup(): Promise<boolean> {
  if (!isSupabaseConfigured) {
    return false;
  }

  try {
    const { data, error } = await supabase
      .from('backups_barnode')
      .select('id')
      .limit(1);

    if (error) {
      console.error('[backupRepository] Errore verifica backup esistenti', error);
      return false;
    }

    if (!data) {
      return false;
    }

    return Array.isArray(data) ? data.length > 0 : true;
  } catch (error) {
    console.error('[backupRepository] Errore inatteso in hasAnyBackup', error);
    return false;
  }
}

export async function saveBackupSnapshot(payload: BackupPayload): Promise<RepositoryResult<null>> {
  return wrapQuery(async () => {
    const { error } = await supabase
      .from('backups_barnode')
      .insert({ payload })
      .select('id')
      .single();

    return { data: null, error };
  });
}

export async function getLatestBackupSnapshot(): Promise<RepositoryResult<BackupPayload | null>> {
  return wrapQuery(async () => {
    const { data, error } = await supabase
      .from('backups_barnode')
      .select('payload')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const payload = (data as { payload?: BackupPayload } | null)?.payload ?? null;

    return { data: payload, error };
  });
}

export async function restoreBackupSnapshot(): Promise<RepositoryResult<null>> {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase non configurato (env mancanti).') };
  }

  const latest = await getLatestBackupSnapshot();
  if (latest.error) {
    return { data: null, error: latest.error };
  }

  if (!latest.data) {
    return { data: null, error: new Error('Nessun backup disponibile da ripristinare.') };
  }

  const { tipologie, articoli, missingItems } = latest.data;

  return wrapQuery(async () => {
    const { error: delMissingError } = await supabase.from('missing_items').delete().neq('id', '');

    if (delMissingError) {
      return { data: null, error: delMissingError };
    }

    const { error: delArticoliError } = await supabase.from('articoli').delete().neq('id', '');

    if (delArticoliError) {
      return { data: null, error: delArticoliError };
    }

    const { error: delTipologieError } = await supabase.from('tipologie').delete().neq('id', '');

    if (delTipologieError) {
      return { data: null, error: delTipologieError };
    }

    if (tipologie.length > 0) {
      const insertTipPayload = tipologie.map((t) => ({
        id: t.id,
        nome: t.nome,
        colore: t.colore,
      }));

      const { error: insertTipError } = await supabase.from('tipologie').insert(insertTipPayload);
      if (insertTipError) {
        return { data: null, error: insertTipError };
      }
    }

    if (articoli.length > 0) {
      const insertArtPayload = articoli.map((a) => ({
        id: a.id,
        nome: a.nome,
        tipologia_id: a.tipologiaId,
      }));

      const { error: insertArtError } = await supabase.from('articoli').insert(insertArtPayload);
      if (insertArtError) {
        return { data: null, error: insertArtError };
      }
    }

    if (missingItems.length > 0) {
      const insertMissingPayload = missingItems.map((m) => ({
        id: m.id,
        articolo_id: m.articoloId,
      }));

      const { error: insertMissingError } = await supabase
        .from('missing_items')
        .insert(insertMissingPayload);
      if (insertMissingError) {
        return { data: null, error: insertMissingError };
      }
    }

    return { data: null, error: null };
  });
}

export async function createAndSaveCurrentSnapshot(): Promise<RepositoryResult<null>> {
  if (!isSupabaseConfigured) {
    return { data: null, error: new Error('Supabase non configurato (env mancanti).') };
  }

  const [tipRes, artRes, missRes] = await Promise.all([
    getTipologie(),
    getArticoliWithRelations(),
    getMissingItems(),
  ]);

  if (tipRes.error || artRes.error || missRes.error) {
    const firstError = tipRes.error || artRes.error || missRes.error;
    return { data: null, error: firstError ?? null };
  }

  const countTipologie = tipRes.data?.length ?? 0;
  const countArticoli = artRes.data?.length ?? 0;
  const countMissing = missRes.data?.length ?? 0;

  const latest = await getLatestBackupSnapshot();

  if (!latest.error && latest.data && countTipologie === 0 && countArticoli === 0 && countMissing === 0) {
    return { data: null, error: null };
  }

  const payload: BackupPayload = {
    tipologie: tipRes.data ?? [],
    articoli: artRes.data ?? [],
    missingItems: missRes.data ?? [],
  };

  return saveBackupSnapshot(payload);
}
