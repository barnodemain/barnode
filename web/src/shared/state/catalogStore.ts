import { useEffect, useMemo, useState } from 'react';
import { ArticoloWithRelations, Tipologia } from '../types/items';
import { mockArticoli, mockTipologie } from '../data';
import {
  createArticolo as repoCreateArticolo,
  createTipologia as repoCreateTipologia,
  deleteArticolo as repoDeleteArticolo,
  deleteTipologia as repoDeleteTipologia,
  getArticoliWithRelations,
  getTipologie,
  updateArticoloNome as repoUpdateArticoloNome,
  updateTipologia as repoUpdateTipologia,
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

  const addArticolo = async (params: { nome: string; tipologiaId: string }) => {
    const tipologia = tipologie.find((t) => t.id === params.tipologiaId);
    if (!tipologia) return;

    if (!loadedFromSupabase) {
      const nuovo: ArticoloWithRelations = {
        id: `art_${Date.now().toString(36)}`,
        nome: params.nome,
        tipologiaId: tipologia.id,
        tipologiaNome: tipologia.nome,
      };
      setArticoli((current) => [...current, nuovo]);
      return;
    }

    const { data, error } = await repoCreateArticolo({
      nome: params.nome,
      tipologiaId: params.tipologiaId,
    });
    if (error || !data) return;
    setArticoli((current) => [...current, data]);
  };

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

  const addTipologia = async (nome: string) => {
    if (!loadedFromSupabase) {
      const fallback: Tipologia = {
        id: `tip_${Date.now().toString(36)}`,
        nome,
      };
      setTipologie((current) => [...current, fallback]);
      return;
    }

    const { data, error } = await repoCreateTipologia(nome);
    if (error || !data) return;
    setTipologie((current) => [...current, data]);
  };

  const updateTipologia = async (id: string, nuovoNome: string) => {
    if (!loadedFromSupabase) {
      setTipologie((current) =>
        current.map((tip) => (tip.id === id ? { ...tip, nome: nuovoNome } : tip))
      );
      return;
    }

    const { data, error } = await repoUpdateTipologia(id, nuovoNome);
    if (error || !data) return;

    setTipologie((current) =>
      current.map((tip) => (tip.id === id ? { ...tip, nome: data.nome } : tip))
    );
  };

  const deleteTipologia = async (id: string) => {
    if (!loadedFromSupabase) {
      setTipologie((current) => current.filter((tip) => tip.id !== id));
      return;
    }

    const { error } = await repoDeleteTipologia(id);
    if (error) return;
    setTipologie((current) => current.filter((tip) => tip.id !== id));
  };

  return {
    tipologie: sortedTipologie,
    articoli: sortedArticoli,
    addArticolo,
    updateArticoloNome,
    deleteArticolo,
    addTipologia,
    updateTipologia,
    deleteTipologia,
  };
}
