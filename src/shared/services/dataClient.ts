import { Articolo, Tipologia, Fornitore, Ordine } from "../types";

export const dataClient = {
  articoli: {
    async getAll(): Promise<Articolo[]> {
      throw new Error("TODO: Implement Supabase integration");
    },
    async getById(id: string): Promise<Articolo | null> {
      throw new Error("TODO: Implement Supabase integration");
    },
    async create(articolo: Omit<Articolo, "id">): Promise<Articolo> {
      throw new Error("TODO: Implement Supabase integration");
    },
    async update(
      id: string,
      articolo: Partial<Omit<Articolo, "id">>,
    ): Promise<Articolo> {
      throw new Error("TODO: Implement Supabase integration");
    },
    async delete(id: string): Promise<void> {
      throw new Error("TODO: Implement Supabase integration");
    },
  },

  tipologie: {
    async getAll(): Promise<Tipologia[]> {
      throw new Error("TODO: Implement Supabase integration");
    },
    async create(tipologia: Omit<Tipologia, "id">): Promise<Tipologia> {
      throw new Error("TODO: Implement Supabase integration");
    },
    async update(
      id: string,
      tipologia: Partial<Omit<Tipologia, "id">>,
    ): Promise<Tipologia> {
      throw new Error("TODO: Implement Supabase integration");
    },
    async delete(id: string): Promise<void> {
      throw new Error("TODO: Implement Supabase integration");
    },
  },

  fornitori: {
    async getAll(): Promise<Fornitore[]> {
      throw new Error("TODO: Implement Supabase integration");
    },
    async create(fornitore: Omit<Fornitore, "id">): Promise<Fornitore> {
      throw new Error("TODO: Implement Supabase integration");
    },
    async update(
      id: string,
      fornitore: Partial<Omit<Fornitore, "id">>,
    ): Promise<Fornitore> {
      throw new Error("TODO: Implement Supabase integration");
    },
    async delete(id: string): Promise<void> {
      throw new Error("TODO: Implement Supabase integration");
    },
  },

  ordini: {
    async getAll(): Promise<Ordine[]> {
      throw new Error("TODO: Implement Supabase integration");
    },
    async getById(id: string): Promise<Ordine | null> {
      throw new Error("TODO: Implement Supabase integration");
    },
    async create(ordine: Omit<Ordine, "id">): Promise<Ordine> {
      throw new Error("TODO: Implement Supabase integration");
    },
    async update(
      id: string,
      ordine: Partial<Omit<Ordine, "id">>,
    ): Promise<Ordine> {
      throw new Error("TODO: Implement Supabase integration");
    },
    async delete(id: string): Promise<void> {
      throw new Error("TODO: Implement Supabase integration");
    },
  },
};
