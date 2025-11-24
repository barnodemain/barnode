import { supabase } from './supabaseClient';
import type { Articolo, Tipologia, Fornitore, Ordine } from '../types';

// Helper di mapping dalle righe Supabase (snake_case) ai tipi TypeScript (camelCase)

type ArticoloRow = {
  id: string;
  nome: string;
  tipologia_id: string | null;
  fornitore_id: string | null;
  is_attivo: boolean;
};

function mapArticolo(row: ArticoloRow): Articolo {
  return {
    id: row.id,
    nome: row.nome,
    tipologiaId: row.tipologia_id ?? '',
    fornitoreId: row.fornitore_id ?? '',
  };
}

type TipologiaRow = {
  id: string;
  nome: string;
  descrizione?: string | null;
};

function mapTipologia(row: TipologiaRow): Tipologia {
  return {
    id: row.id,
    nome: row.nome,
    descrizione: row.descrizione ?? undefined,
  };
}

type FornitoreRow = {
  id: string;
  nome: string;
};

function mapFornitore(row: FornitoreRow): Fornitore {
  return {
    id: row.id,
    nome: row.nome,
  };
}

// Ordini: lo schema Supabase usa "status" (order_status) mentre il tipo TS usa "stato".
// Per ora facciamo un mapping best-effort verso il tipo Ordine, lasciando articoli come array vuoto.

type OrdineRow = {
  id: string;
  fornitore_id: string;
  status: 'attivo' | 'archiviato';
  created_at: string;
  note?: string | null;
};

function mapOrdine(row: OrdineRow): Ordine {
  // Mapping semplice da status Supabase a stato applicativo.
  // In assenza di corrispondenza perfetta, usiamo 'archiviato' per gli ordini archiviati
  // e 'bozza' per gli ordini ancora attivi.
  const stato: Ordine['stato'] = row.status === 'archiviato' ? 'archiviato' : 'bozza';

  return {
    id: row.id,
    fornitoreId: row.fornitore_id,
    dataCreazione: row.created_at,
    stato,
    articoli: [],
    note: row.note ?? undefined,
  };
}

export const supabaseDataClient = {
  articoli: {
    async getAll(): Promise<Articolo[]> {
      const { data, error } = await supabase
        .from('articoli')
        .select('id, nome, tipologia_id, fornitore_id, is_attivo')
        .eq('is_attivo', true);

      if (error) {
        console.error('[Supabase] articoli.getAll error', error.message);
        return [];
      }

      return (data as ArticoloRow[] | null)?.map(mapArticolo) ?? [];
    },

    async getById(id: string): Promise<Articolo | null> {
      const { data, error } = await supabase
        .from('articoli')
        .select('id, nome, tipologia_id, fornitore_id, is_attivo')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('[Supabase] articoli.getById error', error.message);
        return null;
      }

      if (!data) return null;
      return mapArticolo(data as ArticoloRow);
    },
  },

  tipologie: {
    async getAll(): Promise<Tipologia[]> {
      const { data, error } = await supabase
        .from('tipologie')
        .select('id, nome, descrizione, is_attiva')
        .eq('is_attiva', true);

      if (error) {
        console.error('[Supabase] tipologie.getAll error', error.message);
        return [];
      }

      return (data as TipologiaRow[] | null)?.map(mapTipologia) ?? [];
    },

    async create(nome: string, descrizione?: string): Promise<Tipologia | null> {
      const { data, error } = await supabase
        .from('tipologie')
        .insert({ nome, descrizione: descrizione ?? null })
        .select('id, nome, descrizione')
        .maybeSingle();

      if (error) {
        console.error('[Supabase] tipologie.create error', error.message);
        return null;
      }

      if (!data) return null;
      return mapTipologia(data as TipologiaRow);
    },

    async update(id: string, nome: string, descrizione?: string): Promise<Tipologia | null> {
      const { data, error } = await supabase
        .from('tipologie')
        .update({ nome, descrizione: descrizione ?? null })
        .eq('id', id)
        .select('id, nome, descrizione')
        .maybeSingle();

      if (error) {
        console.error('[Supabase] tipologie.update error', error.message);
        return null;
      }

      if (!data) return null;
      return mapTipologia(data as TipologiaRow);
    },

    async remove(id: string): Promise<boolean> {
      // Soft delete: imposta is_attiva = false invece di cancellare fisicamente
      const { error } = await supabase
        .from('tipologie')
        .update({ is_attiva: false })
        .eq('id', id);

      if (error) {
        console.error('[Supabase] tipologie.remove error', error.message);
        return false;
      }

      return true;
    },
  },

  fornitori: {
    async getAll(): Promise<Fornitore[]> {
      const { data, error } = await supabase.from('fornitori').select('id, nome');

      if (error) {
        console.error('[Supabase] fornitori.getAll error', error.message);
        return [];
      }

      return (data as FornitoreRow[] | null)?.map(mapFornitore) ?? [];
    },
  },

  ordini: {
    async getAll(): Promise<Ordine[]> {
      const { data, error } = await supabase
        .from('ordini')
        .select('id, fornitore_id, status, created_at, note');

      if (error) {
        console.error('[Supabase] ordini.getAll error', error.message);
        return [];
      }

      return (data as OrdineRow[] | null)?.map(mapOrdine) ?? [];
    },

    async getById(id: string): Promise<Ordine | null> {
      const { data, error } = await supabase
        .from('ordini')
        .select('id, fornitore_id, status, created_at, note')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('[Supabase] ordini.getById error', error.message);
        return null;
      }

      if (!data) return null;
      return mapOrdine(data as OrdineRow);
    },
  },

  articoliMancanti: {
    // Restituisce gli ID degli articoli marcati come mancanti
    async getAllIds(): Promise<string[]> {
      const { data, error } = await supabase
        .from('articoli_mancanti')
        .select('articolo_id');

      if (error) {
        console.error('[Supabase] articoliMancanti.getAllIds error', error.message);
        return [];
      }

      return ((data as { articolo_id: string }[] | null) ?? []).map((row) => row.articolo_id);
    },

    async add(articoloId: string): Promise<boolean> {
      const { error } = await supabase.from('articoli_mancanti').insert({ articolo_id: articoloId });

      if (error) {
        console.error('[Supabase] articoliMancanti.add error', error.message);
        return false;
      }

      return true;
    },

    async remove(articoloId: string): Promise<boolean> {
      const { error } = await supabase
        .from('articoli_mancanti')
        .delete()
        .eq('articolo_id', articoloId);

      if (error) {
        console.error('[Supabase] articoliMancanti.remove error', error.message);
        return false;
      }

      return true;
    },
  },
};
