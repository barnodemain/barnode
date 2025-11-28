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

  const { error } = await supabase.rpc('restore_last_backup');

  if (error) {
    console.error('[backupRepository] Errore restore_last_backup', error);
    return { data: null, error: new Error(error.message) };
  }

  return { data: null, error: null };
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
