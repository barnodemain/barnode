import React, { useState } from 'react';

export type ParsedItem = {
  id: string;
  rawName: string;
  normalizedName: string;
  included: boolean;
};

type TextImportPanelProps = {
  onConfirmSelection?: (items: ParsedItem[]) => void;
};

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

function TextImportPanel({ onConfirmSelection }: TextImportPanelProps) {
  const [textInput, setTextInput] = useState('');
  const [parsedItems, setParsedItems] = useState<ParsedItem[]>([]);

  const handleAnalyzeText = () => {
    const lines = textInput.split(/\r?\n/u);

    const byKey = new Map<string, ParsedItem>();

    lines.forEach((line, index) => {
      const cleaned = line.replace(/\s+/gu, ' ').trim();
      if (!cleaned) return;
      if (cleaned.length < 3) return;
      if (/^[0-9\s]+$/u.test(cleaned)) return;

      const normalizedName = normalizeName(cleaned);
      if (!normalizedName) return;

      if (byKey.has(normalizedName)) {
        return;
      }

      const id = `${Date.now()}-${index}`;

      byKey.set(normalizedName, {
        id,
        rawName: cleaned,
        normalizedName,
        included: true,
      });
    });

    setParsedItems(Array.from(byKey.values()));
  };

  const toggleIncluded = (id: string) => {
    setParsedItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              included: !item.included,
            }
          : item,
      ),
    );
  };

  return (
    <section className="list">
      <div className="import-panel">
        <h2>Importa da testo</h2>
        <p>
          Incolla qui l&apos;elenco di articoli, uno per riga. Righe vuote o non valide verranno
          ignorate.
        </p>
        <textarea
          className="import-textarea"
          rows={10}
          value={textInput}
          onChange={(event) => setTextInput(event.target.value)}
          placeholder={"Es. latte intero\nPasta integrale\nBiscotti senza zucchero"}
        />
        <div className="import-actions">
          <button type="button" className="db-box settings-button" onClick={handleAnalyzeText}>
            Analizza testo
          </button>
        </div>

        {parsedItems.length > 0 && (
          <div className="import-results">
            <p>Articoli trovati: {parsedItems.length}</p>
            <ul>
              {parsedItems.map((item) => (
                <li
                  key={item.id}
                  className={item.included ? 'import-item' : 'import-item import-item-excluded'}
                >
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
                  onClick={() => {
                    const includedItems = parsedItems.filter((item) => item.included);
                    if (!includedItems.length || !onConfirmSelection) return;
                    onConfirmSelection(includedItems);
                  }}
                >
                  Prosegui alla revisione
                </button>
              </div>
            )}
            <p className="import-note">
              In uno step successivo questi articoli verranno usati per la revisione uno-per-uno e
              il confronto con il database. Al momento non viene ancora salvato nulla.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default TextImportPanel;
