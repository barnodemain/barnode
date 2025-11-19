import { Articolo, Tipologia, Fornitore, Ordine } from "../types";

export const mockTipologie: Tipologia[] = [
  { id: "1", nome: "Spirits", descrizione: "Distillati e liquori" },
  { id: "2", nome: "Mixers", descrizione: "Mixer e bibite" },
  { id: "3", nome: "Fresh", descrizione: "Frutta e ingredienti freschi" },
  { id: "4", nome: "Garnish", descrizione: "Guarnizioni e decorazioni" },
];

export const mockFornitori: Fornitore[] = [
  {
    id: "1",
    nome: "Beverage Solutions",
    email: "ordini@beveragesolutions.it",
    telefono: "+39 02 1234567",
    contatto: "Marco Rossi",
  },
  {
    id: "2",
    nome: "Fresh Food Supply",
    email: "info@freshfoodsupply.it",
    telefono: "+39 02 7654321",
    contatto: "Laura Bianchi",
  },
  {
    id: "3",
    nome: "Bar Essentials",
    email: "sales@baressentials.it",
    telefono: "+39 02 9876543",
    contatto: "Giuseppe Verdi",
  },
];

export const mockArticoli: Articolo[] = [
  {
    id: "1",
    nome: "Gin Bombay Sapphire",
    tipologiaId: "1",
    fornitoreId: "1",
    quantita: 2,
    quantitaMinima: 3,
    prezzoUnitario: 24.5,
  },
  {
    id: "2",
    nome: "Vodka Absolut",
    tipologiaId: "1",
    fornitoreId: "1",
    quantita: 1,
    quantitaMinima: 4,
    prezzoUnitario: 18.9,
  },
  {
    id: "3",
    nome: "Tonic Water Fever Tree",
    tipologiaId: "2",
    fornitoreId: "1",
    quantita: 12,
    quantitaMinima: 24,
    prezzoUnitario: 1.8,
  },
  {
    id: "4",
    nome: "Limoni Bio",
    tipologiaId: "3",
    fornitoreId: "2",
    quantita: 0,
    quantitaMinima: 10,
    prezzoUnitario: 2.5,
    note: "Urgente - scorta terminata",
  },
  {
    id: "5",
    nome: "Menta Fresca",
    tipologiaId: "3",
    fornitoreId: "2",
    quantita: 3,
    quantitaMinima: 5,
    prezzoUnitario: 1.2,
  },
  {
    id: "6",
    nome: "Angostura Bitters",
    tipologiaId: "1",
    fornitoreId: "3",
    quantita: 5,
    quantitaMinima: 2,
    prezzoUnitario: 12.0,
  },
  {
    id: "7",
    nome: "Rum Havana Club 7",
    tipologiaId: "1",
    fornitoreId: "1",
    quantita: 8,
    quantitaMinima: 5,
    prezzoUnitario: 22.0,
  },
  {
    id: "8",
    nome: "Olive Verdi",
    tipologiaId: "4",
    fornitoreId: "2",
    quantita: 1,
    quantitaMinima: 3,
    prezzoUnitario: 4.5,
  },
];

export const mockOrdini: Ordine[] = [
  {
    id: "1",
    fornitoreId: "1",
    dataCreazione: "2024-11-15T10:00:00Z",
    stato: "inviato",
    articoli: [
      { articoloId: "1", quantita: 6, prezzoUnitario: 24.5 },
      { articoloId: "2", quantita: 6, prezzoUnitario: 18.9 },
    ],
    totale: 260.4,
    note: "Consegna prevista entro venerdì",
  },
  {
    id: "2",
    fornitoreId: "2",
    dataCreazione: "2024-11-18T14:30:00Z",
    stato: "bozza",
    articoli: [
      { articoloId: "4", quantita: 15, prezzoUnitario: 2.5 },
      { articoloId: "5", quantita: 10, prezzoUnitario: 1.2 },
    ],
    totale: 49.5,
  },
];
