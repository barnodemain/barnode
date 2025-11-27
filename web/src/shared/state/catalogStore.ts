import { useEffect, useMemo, useState } from 'react';
import { ArticoloWithRelations, Tipologia } from '../types/items';
import { mockArticoli, mockTipologie } from '../data';
import {
  deleteArticolo as repoDeleteArticolo,
  getArticoliWithRelations,
  getTipologie,
  updateArticoloNome as repoUpdateArticoloNome,
} from '../repositories/catalogRepository';
import { isSupabaseConfigured } from '../services/supabaseClient';

export function useCatalog() {
  const [tipologie, setTipologie] = useState<Tipologia[]>([]);
  const [articoli, setArticoli] = useState<ArticoloWithRelations[]>([]);
  const [loadedFromSupabase, setLoadedFromSupabase] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadInitial() {
      if (!isSupabaseConfigured) {
        setTipologie([...mockTipologie]);
        setArticoli([...mockArticoli]);
        setLoadedFromSupabase(false);
        return;
      }

      const [tipRes, artRes] = await Promise.all([getTipologie(), getArticoliWithRelations()]);

      if (!active) return;

      if (tipRes.error || artRes.error) {
        console.error('[useCatalog] Errore caricamento iniziale, fallback ai mock');
        setTipologie([...mockTipologie]);
        setArticoli([...mockArticoli]);
        setLoadedFromSupabase(false);
        return;
      }

      setTipologie(tipRes.data ?? []);
      setArticoli(artRes.data ?? []);
      setLoadedFromSupabase(true);
    }

    loadInitial();

    return () => {
      active = false;
    };
  }, []);

  const sortedTipologie = useMemo(
    () => [...tipologie].sort((a, b) => a.nome.localeCompare(b.nome)),
    [tipologie]
  );

  const sortedArticoli = useMemo(
    () => [...articoli].sort((a, b) => a.nome.localeCompare(b.nome)),
    [articoli]
  );

  const updateArticoloNome = async (id: string, nuovoNome: string) => {
    if (!loadedFromSupabase) {
      setArticoli((current) =>
        current.map((art) => (art.id === id ? { ...art, nome: nuovoNome } : art))
      );
      return;
    }

    const { data, error } = await repoUpdateArticoloNome(id, nuovoNome);
    if (error || !data) return;

    setArticoli((current) =>
      current.map((art) => (art.id === id ? { ...art, nome: data.nome } : art))
    );
  };

  const deleteArticolo = async (id: string) => {
    if (!loadedFromSupabase) {
      setArticoli((current) => current.filter((art) => art.id !== id));
      return;
    }

    const { error } = await repoDeleteArticolo(id);
    if (error) return;
    setArticoli((current) => current.filter((art) => art.id !== id));
  };

  return {
    tipologie: sortedTipologie,
    articoli: sortedArticoli,
    updateArticoloNome,
    deleteArticolo,
  };
}
