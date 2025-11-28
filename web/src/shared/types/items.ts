export interface Articolo {
  id: string;
  nome: string;
  tipologiaId: string;
}

export interface Tipologia {
  id: string;
  nome: string;
  descrizione?: string;
  colore: string;
}

export interface ArticoloWithRelations extends Articolo {
  tipologiaNome: string;
  descrizione?: string;
}

export interface MissingItemWithRelations {
  id: string;
  articoloId: string;
  articoloNome: string;
  tipologiaNome: string;
}
