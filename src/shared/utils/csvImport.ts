export type CsvArticleRow = {
  articolo: string;
  tipologia: string;
  fornitore: string;
};

export type ParsedCsvImport = {
  articoli: CsvArticleRow[];
  tipologieUniche: string[];
  fornitoriUnici: string[];
};

// Parsing molto semplice: CSV con intestazione
// articolo,tipologia,fornitore
export function parseArticlesCsv(text: string): ParsedCsvImport {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    return { articoli: [], tipologieUniche: [], fornitoriUnici: [] };
  }

  const [headerLine, ...dataLines] = lines;
  const headers = headerLine
    .split(',')
    .map((h) => h.trim().toLowerCase());

  const idxArticolo = headers.indexOf('articolo');
  const idxTipologia = headers.indexOf('tipologia');
  const idxFornitore = headers.indexOf('fornitore');

  if (idxArticolo === -1 || idxTipologia === -1 || idxFornitore === -1) {
    throw new Error(
      'Header CSV non valido. Attesi: articolo, tipologia, fornitore (in qualsiasi ordine).'
    );
  }

  const articoli: CsvArticleRow[] = [];
  const tipologieSet = new Set<string>();
  const fornitoriSet = new Set<string>();

  for (const line of dataLines) {
    const cells = line.split(',');
    const articolo = (cells[idxArticolo] ?? '').trim();
    const tipologia = (cells[idxTipologia] ?? '').trim();
    const fornitore = (cells[idxFornitore] ?? '').trim();

    if (!articolo && !tipologia && !fornitore) continue;

    articoli.push({ articolo, tipologia, fornitore });
    if (tipologia) tipologieSet.add(tipologia);
    if (fornitore) fornitoriSet.add(fornitore);
  }

  return {
    articoli,
    tipologieUniche: Array.from(tipologieSet).sort(),
    fornitoriUnici: Array.from(fornitoriSet).sort(),
  };
}
