import { useEffect, useMemo, useState } from 'react';
import { ArticoloWithRelations, MissingItemWithRelations } from '../types/items';
import { mockArticoli, mockMissingItems } from '../data';
import { getArticoliWithRelations } from '../repositories/catalogRepository';
import {
  addMissingItem as repoAddMissingItem,
  getMissingItems as repoGetMissingItems,
  removeMissingItem as repoRemoveMissingItem,
} from '../repositories/missingItemsRepository';
import { isSupabaseConfigured } from '../services/supabaseClient';

export function useMissingItems() {
  const [allItems, setAllItems] = useState<ArticoloWithRelations[]>(mockArticoli);
  const [missingItems, setMissingItems] = useState<MissingItemWithRelations[]>([]);
  const [missingIds, setMissingIds] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [loadedFromSupabase, setLoadedFromSupabase] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadInitial() {
      if (!isSupabaseConfigured) {
        setAllItems(mockArticoli);
        setMissingItems([]);
        setMissingIds(mockMissingItems.map((item: ArticoloWithRelations) => item.id));
        setLoadedFromSupabase(false);
        return;
      }

      const [artRes, missRes] = await Promise.all([
        getArticoliWithRelations(),
        repoGetMissingItems(),
      ]);

      if (!active) return;

      if (artRes.error || missRes.error) {
        console.error(
          '[useMissingItems] Errore caricamento da Supabase',
          artRes.error || missRes.error
        );
        setAllItems([]);
        setMissingItems([]);
        setMissingIds([]);
        setLoadedFromSupabase(false);
        return;
      }

      setAllItems(artRes.data ?? []);
      const loadedMissing = missRes.data ?? [];
      setMissingItems(loadedMissing);
      setMissingIds(loadedMissing.map((item) => item.articoloId));
      setLoadedFromSupabase(true);
    }

    loadInitial();

    return () => {
      active = false;
    };
  }, []);

  const missingItemsForView = useMemo(() => {
    if (!loadedFromSupabase) {
      return allItems
        .filter((item) => missingIds.includes(item.id))
        .sort((a, b) => a.nome.localeCompare(b.nome));
    }

    return [...missingItems].sort((a, b) => a.articoloNome.localeCompare(b.articoloNome));
  }, [allItems, loadedFromSupabase, missingIds, missingItems]);

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
    if (!loadedFromSupabase || !isSupabaseConfigured) {
      setMissingIds((previous) => {
        if (previous.includes(id)) return previous;
        return [...previous, id];
      });
      return;
    }

    const { data, error } = await repoAddMissingItem(id);
    if (error || !data) return;

    setMissingItems((previous) => {
      if (previous.some((item) => item.articoloId === data.articoloId)) return previous;
      return [...previous, data];
    });

    setMissingIds((previous) => {
      if (previous.includes(data.articoloId)) return previous;
      return [...previous, data.articoloId];
    });
  };

  const removeMissing = async (id: string) => {
    if (!loadedFromSupabase || !isSupabaseConfigured) {
      setMissingIds((previous) => previous.filter((itemId) => itemId !== id));
      return;
    }

    const { error } = await repoRemoveMissingItem(id);
    if (error) return;

    setMissingItems((previous) => previous.filter((item) => item.id !== id));

    setMissingIds((previous) => {
      const toRemove = missingItems.find((item) => item.id === id);
      if (!toRemove) return previous;
      return previous.filter((itemId) => itemId !== toRemove.articoloId);
    });
  };

  return {
    missingItems: missingItemsForView,
    suggestedItems,
    missingIds,
    query,
    setQuery,
    addMissing,
    removeMissing,
  };
}
