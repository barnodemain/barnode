export interface Articolo {
  id: string;
  nome: string;
  tipologiaId: string;
  fornitoreId: string;
  quantita: number;
  quantitaMinima: number;
  prezzoUnitario: number;
  note?: string;
}

export interface Tipologia {
  id: string;
  nome: string;
  descrizione?: string;
}

export interface Fornitore {
  id: string;
  nome: string;
  contatto?: string;
  email?: string;
  telefono?: string;
  indirizzo?: string;
}

export interface Ordine {
  id: string;
  fornitoreId: string;
  dataCreazione: string;
  dataConsegna?: string;
  stato: "bozza" | "inviato" | "ricevuto" | "archiviato";
  articoli: OrdineArticolo[];
  totale: number;
  note?: string;
}

export interface OrdineArticolo {
  articoloId: string;
  quantita: number;
  prezzoUnitario: number;
}
