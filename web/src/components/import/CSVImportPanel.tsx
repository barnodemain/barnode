import React, { useState } from 'react';
import type { ParsedItem } from './TextImportPanel';

function normalizeName(input: string): string {
  const trimmed = input.trim().replace(/[.,;:]+$/u, '');
  if (!trimmed) return '';

  const singleSpaced = trimmed.replace(/\s+/gu, ' ');
  const lower = singleSpaced.toLowerCase();
  const words = lower.split(' ');

  const titled = words
    .filter((w) => w.length > 0)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return titled;
}

type CSVImportPanelProps = {
  onConfirmSelection?: (items: ParsedItem[]) => void;
};

function CSVImportPanel({ onConfirmSelection }: CSVImportPanelProps) {
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [csvContent, setCsvContent] = useState('');
  const [parsedItems, setParsedItems] = useState<ParsedItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setParsedItems([]);
    setErrorMessage(null);

    if (!file) {
      setSelectedFileName(null);
      setCsvContent('');
      return;
    }

    setSelectedFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      setCsvContent(text);
    };
    reader.onerror = () => {
      setErrorMessage('Impossibile leggere il file CSV selezionato.');
      setCsvContent('');
    };
    reader.readAsText(file);
  };

  const handleAnalyzeCsv = () => {
    setErrorMessage(null);
    setParsedItems([]);

    if (!csvContent.trim()) {
      setErrorMessage('Nessun contenuto CSV da analizzare.');
      return;
    }

    const lines = csvContent.split(/\r?\n/u);
    const byKey = new Map<string, ParsedItem>();

    lines.forEach((line, index) => {
      const cleaned = line.trim();
      if (!cleaned) return;

      let columns = cleaned.split(';');
      if (columns.length < 1 || !columns[0]) {
        columns = cleaned.split(',');
      }

      const rawName = (columns[0] ?? '').trim();
      if (!rawName) return;
      if (rawName.length < 3) return;
      if (/^[0-9\s]+$/u.test(rawName)) return;

      const normalizedName = normalizeName(rawName);
      if (!normalizedName) return;

      const key = normalizedName.toLowerCase();
      if (byKey.has(key)) return;

      const item: ParsedItem = {
        id: `${Date.now()}-${index}`,
        rawName,
        normalizedName,
        included: true,
      };

      byKey.set(key, item);
    });

    const items = Array.from(byKey.values());

    if (items.length === 0) {
      setErrorMessage('Nessun articolo valido trovato nel CSV.');
      setParsedItems([]);
      return;
    }

    setParsedItems(items);
  };

  const toggleIncluded = (id: string) => {
    setParsedItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              included: !item.included,
            }
          : item
      )
    );
  };

  const handleConfirmSelection = () => {
    if (!onConfirmSelection) return;
    const includedItems = parsedItems.filter((item) => item.included);
    if (includedItems.length === 0) return;
    onConfirmSelection(includedItems);
  };

  return (
    <section className="import-panel">
      <h2>Importa da CSV</h2>
      <p>
        Seleziona un file CSV con una colonna <strong>nome</strong> come prima colonna. Righe vuote o
        non valide verranno ignorate.
      </p>

      <div className="import-actions">
        <input type="file" accept=".csv" onChange={handleFileChange} />
        {selectedFileName && <p>File selezionato: {selectedFileName}</p>}
        <button
          type="button"
          className="db-box settings-button"
          onClick={handleAnalyzeCsv}
          disabled={!csvContent.trim()}
        >
          Analizza CSV
        </button>
      </div>

      {errorMessage && <p className="import-note">{errorMessage}</p>}

      {parsedItems.length > 0 && (
        <div className="import-results">
          <p>Articoli trovati nel CSV: {parsedItems.length}</p>
          <ul>
            {parsedItems.map((item) => (
              <li key={item.id} className="import-item">
                <label className="import-item-row">
                  <input
                    type="checkbox"
                    checked={item.included}
                    onChange={() => toggleIncluded(item.id)}
                  />
                  <div className="import-item-text">
                    <span className="import-item-name">{item.normalizedName}</span>
                    <span className="import-item-raw">Origine: {item.rawName}</span>
                  </div>
                </label>
              </li>
            ))}
          </ul>
          {parsedItems.some((item) => item.included) && (
            <div className="import-actions">
              <button
                type="button"
                className="db-box settings-button"
                onClick={handleConfirmSelection}
              >
                Prosegui alla revisione
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default CSVImportPanel;
