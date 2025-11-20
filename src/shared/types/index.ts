/**
 * Articolo del database di bar.
 *
 * Schema minimo logico (anche lato Supabase in futuro):
 * - id (PK)
 * - nome (nome commerciale, es. "Bombay Dry")
 * - tipologiaId (FK verso Tipologia)
 * - fornitoreId (FK verso Fornitore)
 */
export interface Articolo {
  id: string;
  nome: string;
  tipologiaId: string;
  fornitoreId: string;
}

/**
 * Tipologia (categoria logica dell'articolo).
 *
 * Campo chiave ai fini funzionali: `nome`.
 * `descrizione` è un campo extra/facoltativo (non richiesto dallo schema minimo).
 */
export interface Tipologia {
  id: string;
  nome: string;
  descrizione?: string; // extra/legacy, opzionale rispetto al solo "nome" richiesto
}

/**
 * Fornitore.
 *
 * Campo chiave ai fini funzionali: `nome`.
 * Tutti gli altri campi sono considerati opzionali/di dettaglio
 * e non fanno parte del nucleo minimo richiesto dalla scheda tecnica.
 */
export interface Fornitore {
  id: string;
  nome: string;
  contatto?: string; // extra, opzionale
  email?: string; // extra, opzionale
  telefono?: string; // extra, opzionale
  indirizzo?: string; // extra, opzionale
}

export interface Ordine {
  id: string;
  fornitoreId: string;
  dataCreazione: string;
  dataConsegna?: string;
  stato: 'bozza' | 'inviato' | 'ricevuto' | 'archiviato';
  articoli: OrdineArticolo[];
  note?: string;
}

export interface OrdineArticolo {
  articoloId: string;
}
