import { ArticoloWithRelations } from '../types/items';

// Dati mock per la Home (lista articoli mancanti), usati solo quando Supabase non è configurato.
export const mockMissingItems: ArticoloWithRelations[] = [
  {
    id: 'art-1',
    nome: 'Bombay Dry',
    tipologiaId: 'tip-gin',
    tipologiaNome: 'Gin',
    descrizione: 'Gin secco per cocktail classici.',
  },
  {
    id: 'art-2',
    nome: 'Lime fresco',
    tipologiaId: 'tip-frutta',
    tipologiaNome: 'Frutta fresca',
    descrizione: 'Lime per drink sour e garnish.',
  },
];
