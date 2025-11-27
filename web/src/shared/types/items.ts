export interface Articolo {
  id: string;
  nome: string;
  tipologiaId: string;
}

export interface Tipologia {
  id: string;
  nome: string;
  descrizione?: string;
}

export interface ArticoloWithRelations extends Articolo {
  tipologiaNome: string;
  descrizione?: string;
}
