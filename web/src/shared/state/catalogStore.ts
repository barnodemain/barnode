import { useEffect, useMemo, useState } from 'react';
import { ArticoloWithRelations, Tipologia } from '../types/items';
import { mockArticoli, mockTipologie } from '../data';
import {
  deleteArticolo as repoDeleteArticolo,
  getArticoliWithRelations,
  getTipologie,
  updateArticoloNome as repoUpdateArticoloNome,
  createArticolo as repoCreateArticolo,
  updateArticolo as repoUpdateArticolo,
  createTipologia as repoCreateTipologia,
  updateTipologia as repoUpdateTipologia,
  deleteTipologia as repoDeleteTipologia,
} from '../repositories/catalogRepository';
import { isSupabaseConfigured } from '../services/supabaseClient';
import { createAndSaveCurrentSnapshot, hasAnyBackup } from '../repositories/backupRepository';
import { toTitleCaseWords } from '../utils/text';

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
        console.error('[useCatalog] Errore caricamento da Supabase', tipRes.error || artRes.error);
        setTipologie([]);
        setArticoli([]);
        setLoadedFromSupabase(false);
        return;
      }

      setTipologie(tipRes.data ?? []);
      setArticoli(artRes.data ?? []);
      setLoadedFromSupabase(true);

      try {
        const alreadyHasBackup = await hasAnyBackup();
        if (!alreadyHasBackup && isSupabaseConfigured) {
          void createAndSaveCurrentSnapshot();
        }
      } catch {
        // In caso di errore nel controllo backup iniziale non blocchiamo il caricamento.
      }
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
    const normalized = toTitleCaseWords(nuovoNome);

    if (!loadedFromSupabase) {
      setArticoli((current) =>
        current.map((art) => (art.id === id ? { ...art, nome: normalized } : art))
      );
      return;
    }

    const { data, error } = await repoUpdateArticoloNome(id, normalized);
    if (error || !data) return;

    setArticoli((current) =>
      current.map((art) => (art.id === id ? { ...art, nome: data.nome } : art))
    );

    if (loadedFromSupabase && isSupabaseConfigured) {
      void createAndSaveCurrentSnapshot();
    }
  };

  const deleteArticolo = async (id: string) => {
    if (!loadedFromSupabase) {
      setArticoli((current) => current.filter((art) => art.id !== id));
      return;
    }

    const { error } = await repoDeleteArticolo(id);
    if (error) return;
    setArticoli((current) => current.filter((art) => art.id !== id));

    if (loadedFromSupabase && isSupabaseConfigured) {
      void createAndSaveCurrentSnapshot();
    }
  };

  type AddArticoloInput = {
    nome: string;
    tipologiaId: string;
  };

  const addArticolo = async ({ nome, tipologiaId }: AddArticoloInput) => {
    const trimmed = nome.trim();
    if (!trimmed) return;
    const normalized = toTitleCaseWords(trimmed);

    if (!loadedFromSupabase || !isSupabaseConfigured) {
      setArticoli((current) => {
        const fallbackTipologia =
          tipologie.find((t) => t.id === tipologiaId) ?? tipologie[0] ?? null;

        if (!fallbackTipologia) {
          return current;
        }

        const newId = `mock-${Date.now()}`;

        const nuovo: ArticoloWithRelations = {
          id: newId,
          nome: normalized,
          tipologiaId: fallbackTipologia.id,
          tipologiaNome: fallbackTipologia.nome,
        };

        return [...current, nuovo];
      });

      return;
    }

    const { data, error } = await repoCreateArticolo({ nome: normalized, tipologiaId });
    if (error || !data) return;

    setArticoli((current) => {
      const fallbackTipologia =
        tipologie.find((t) => t.id === data.tipologiaId) ?? tipologie[0] ?? null;

      const nuovo: ArticoloWithRelations = {
        id: data.id,
        nome: data.nome,
        tipologiaId: data.tipologiaId,
        tipologiaNome: fallbackTipologia?.nome ?? 'N/A',
      };

      return [...current, nuovo];
    });

    if (loadedFromSupabase && isSupabaseConfigured) {
      void createAndSaveCurrentSnapshot();
    }
  };

  type UpdateArticoloInput = {
    id: string;
    nome: string;
    tipologiaId: string;
  };

  const updateArticolo = async ({ id, nome, tipologiaId }: UpdateArticoloInput) => {
    const trimmed = nome.trim();
    if (!trimmed) return;
    const normalized = toTitleCaseWords(trimmed);

    if (!loadedFromSupabase || !isSupabaseConfigured) {
      setArticoli((current) => {
        const fallbackTipologia =
          tipologie.find((t) => t.id === tipologiaId) ?? tipologie[0] ?? null;

        if (!fallbackTipologia) return current;

        return current.map((art) =>
          art.id === id
            ? {
                ...art,
                nome: normalized,
                tipologiaId: fallbackTipologia.id,
                tipologiaNome: fallbackTipologia.nome,
              }
            : art
        );
      });

      return;
    }

    const { data, error } = await repoUpdateArticolo(id, { nome: normalized, tipologiaId });
    if (error || !data) return;

    setArticoli((current) => {
      const fallbackTipologia =
        tipologie.find((t) => t.id === data.tipologiaId) ?? tipologie[0] ?? null;

      const updated = current.map((art) =>
        art.id === id
          ? {
              ...art,
              nome: data.nome,
              tipologiaId: data.tipologiaId,
              tipologiaNome: fallbackTipologia?.nome ?? art.tipologiaNome,
            }
          : art
      );

      return updated;
    });

    if (loadedFromSupabase && isSupabaseConfigured) {
      void createAndSaveCurrentSnapshot();
    }
  };

  type AddTipologiaInput = {
    nome: string;
    colore: string;
  };

  const addTipologia = async ({ nome, colore }: AddTipologiaInput) => {
    const trimmed = nome.trim();
    if (!trimmed) return;

    if (!loadedFromSupabase || !isSupabaseConfigured) {
      setTipologie((current) => {
        const newId = `mock-tipologia-${Date.now()}`;
        const nuova: Tipologia = {
          id: newId,
          nome: trimmed,
          colore,
        };

        return [...current, nuova];
      });

      return;
    }

    const { data, error } = await repoCreateTipologia({ nome: trimmed, colore });
    if (error || !data) return;

    setTipologie((current) => [...current, data]);

    if (loadedFromSupabase && isSupabaseConfigured) {
      void createAndSaveCurrentSnapshot();
    }
  };

  const updateTipologia = async (id: string, payload: { nome: string; colore: string }) => {
    const trimmed = payload.nome.trim();
    if (!trimmed) return;

    if (!loadedFromSupabase || !isSupabaseConfigured) {
      setTipologie((current) =>
        current.map((t) =>
          t.id === id
            ? {
                ...t,
                nome: trimmed,
                colore: payload.colore,
              }
            : t
        )
      );
      return;
    }

    const { data, error } = await repoUpdateTipologia(id, {
      nome: trimmed,
      colore: payload.colore,
    });
    if (error || !data) return;

    setTipologie((current) => current.map((t) => (t.id === id ? data : t)));

    if (loadedFromSupabase && isSupabaseConfigured) {
      void createAndSaveCurrentSnapshot();
    }
  };

  const deleteTipologia = async (id: string) => {
    if (!loadedFromSupabase || !isSupabaseConfigured) {
      setTipologie((current) => current.filter((t) => t.id !== id));
      return;
    }

    const { error } = await repoDeleteTipologia(id);
    if (error) return;

    setTipologie((current) => current.filter((t) => (t.id === id ? false : true)));

    if (loadedFromSupabase && isSupabaseConfigured) {
      void createAndSaveCurrentSnapshot();
    }
  };

  return {
    tipologie: sortedTipologie,
    articoli: sortedArticoli,
    updateArticoloNome,
    deleteArticolo,
    addArticolo,
    updateArticolo,
    addTipologia,
    updateTipologia,
    deleteTipologia,
  };
}
