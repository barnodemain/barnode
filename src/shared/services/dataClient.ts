import { Articolo, Tipologia, Fornitore, Ordine } from '../types';
import { mockArticoli, mockTipologie, mockFornitori, mockOrdini } from '../utils/mockData';

/**
 * dataClient mock di sola lettura.
 *
 * In questa fase tutte le funzioni leggono da mockData.ts in memoria.
 * In uno step successivo, queste implementazioni potranno essere
 * sostituite con chiamate reali a Supabase mantenendo le stesse firme.
 */
export const dataClient = {
  articoli: {
    async getAll(): Promise<Articolo[]> {
      return Promise.resolve(mockArticoli);
    },
    async getById(id: string): Promise<Articolo | null> {
      const found = mockArticoli.find((a) => a.id === id) ?? null;
      return Promise.resolve(found);
    },
  },

  tipologie: {
    async getAll(): Promise<Tipologia[]> {
      return Promise.resolve(mockTipologie);
    },
  },

  fornitori: {
    async getAll(): Promise<Fornitore[]> {
      return Promise.resolve(mockFornitori);
    },
  },

  ordini: {
    async getAll(): Promise<Ordine[]> {
      return Promise.resolve(mockOrdini);
    },
    async getById(id: string): Promise<Ordine | null> {
      const found = mockOrdini.find((o) => o.id === id) ?? null;
      return Promise.resolve(found);
    },
  },
};
