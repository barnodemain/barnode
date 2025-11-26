export interface Articolo {
  id: string;
  nome: string;
  tipologiaId: string;
  fornitoreId: string;
}

export interface Tipologia {
  id: string;
  nome: string;
  descrizione?: string;
}

export interface Fornitore {
  id: string;
  nome: string;
}

export interface OrdineArticolo {
  articoloId: string;
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

export interface ArticoloWithRelations extends Articolo {
  tipologiaNome: string;
  fornitoreNome: string;
  descrizione?: string;
}
