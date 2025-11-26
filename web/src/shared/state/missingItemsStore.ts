import { useEffect, useMemo, useState } from 'react';
import { ArticoloWithRelations } from '../types/items';
import { mockArticoli } from '../data';
import { getArticoliWithRelations } from '../repositories/catalogRepository';
import {
  addMissing as repoAddMissing,
  getMissingIds as repoGetMissingIds,
  removeMissing as repoRemoveMissing,
} from '../repositories/missingItemsRepository';
import { isSupabaseConfigured } from '../services/supabaseClient';

export function useMissingItems() {
  const [allItems, setAllItems] = useState<ArticoloWithRelations[]>(mockArticoli);
  const [missingIds, setMissingIds] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [loadedFromSupabase, setLoadedFromSupabase] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadInitial() {
      if (!isSupabaseConfigured) {
        setAllItems(mockArticoli);
        setMissingIds([]);
        setLoadedFromSupabase(false);
        return;
      }

      const [artRes, missRes] = await Promise.all([
        getArticoliWithRelations(),
        repoGetMissingIds(),
      ]);

      if (!active) return;

      if (artRes.error || missRes.error) {
        console.error('[useMissingItems] Errore caricamento iniziale, fallback ai mock');
        setAllItems(mockArticoli);
        setMissingIds([]);
        setLoadedFromSupabase(false);
        return;
      }

      setAllItems(artRes.data ?? []);
      setMissingIds(missRes.data ?? []);
      setLoadedFromSupabase(true);
    }

    loadInitial();

    return () => {
      active = false;
    };
  }, []);

  const missingItems = useMemo(() => {
    return allItems
      .filter((item) => missingIds.includes(item.id))
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [allItems, missingIds]);

  const suggestedItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];

    return allItems
      .filter((item) => {
        if (missingIds.includes(item.id)) return false;
        return item.nome.toLowerCase().includes(normalized);
      })
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [allItems, missingIds, query]);

  const addMissing = async (id: string) => {
    if (!loadedFromSupabase) {
      setMissingIds((previous) => {
        if (previous.includes(id)) return previous;
        return [...previous, id];
      });
      return;
    }

    const { error } = await repoAddMissing(id);
    if (error) return;

    setMissingIds((previous) => {
      if (previous.includes(id)) return previous;
      return [...previous, id];
    });
  };

  const removeMissing = async (id: string) => {
    if (!loadedFromSupabase) {
      setMissingIds((previous) => previous.filter((itemId) => itemId !== id));
      return;
    }

    const { error } = await repoRemoveMissing(id);
    if (error) return;

    setMissingIds((previous) => previous.filter((itemId) => itemId !== id));
  };

  return {
    missingItems,
    suggestedItems,
    missingIds,
    query,
    setQuery,
    addMissing,
    removeMissing,
  };
}
