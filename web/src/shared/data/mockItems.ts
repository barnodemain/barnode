import { ArticoloWithRelations } from '../types/items';

export const mockMissingItems: ArticoloWithRelations[] = [
  {
    id: 'art-1',
    nome: 'Bombay Dry',
    tipologiaId: 'tip-gin',
    tipologiaNome: 'Gin',
    fornitoreId: 'for-1',
    fornitoreNome: 'Fornitore Principale',
    descrizione: 'Gin secco per cocktail classici.',
  },
  {
    id: 'art-2',
    nome: 'Lime fresco',
    tipologiaId: 'tip-frutta',
    tipologiaNome: 'Frutta fresca',
    fornitoreId: 'for-2',
    fornitoreNome: 'Orto & Co.',
    descrizione: 'Lime per drink sour e garnish.',
  },
];
