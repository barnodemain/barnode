import React, { useState } from 'react';
import type { ParsedItem } from './TextImportPanel';
import type { Tipologia } from '../../shared/types/items';

export type ReviewAction = 'create' | 'skip';

export type ReviewDecision = {
  action: ReviewAction;
  updatedName: string;
  tipologiaId: string | null;
};

type TextImportWizardProps = {
  items: ParsedItem[];
  currentIndex: number;
  decisions: Record<string, ReviewDecision>;
  onChangeIndex: (nextIndex: number) => void;
  onChangeDecision: (id: string, decision: ReviewDecision) => void;
  onReset: () => void;
  tipologie: Tipologia[];
  onApplyImport: () => void;
  existingNames: string[];
};

function TextImportWizard({
  items,
  currentIndex,
  decisions,
  onChangeIndex,
  onChangeDecision,
  onReset,
  tipologie,
  onApplyImport,
  existingNames,
}: TextImportWizardProps) {
  if (!items.length) return null;

  const currentItem = items[currentIndex];
  if (!currentItem) return null;

  const [isApplyingImport, setIsApplyingImport] = useState(false);

  const defaultTipologia = tipologie.length
    ? tipologie.find((t) => t.nome.trim().toLowerCase() === 'varie') || tipologie[0]
    : null;
  const defaultTipologiaId = defaultTipologia?.id ?? null;

  const existing = decisions[currentItem.id];
  const currentDecision: ReviewDecision =
    existing ?? {
      action: 'create',
      updatedName: currentItem.normalizedName,
      tipologiaId: defaultTipologiaId,
    };

  const normalizeName = (value: string) => value.trim().toLowerCase();
  const normalizedCurrentName = normalizeName(currentDecision.updatedName || currentItem.normalizedName);
  const isDuplicate = normalizedCurrentName.length > 0 && existingNames.includes(normalizedCurrentName);

  const handleNameChange = (value: string) => {
    onChangeDecision(currentItem.id, {
      ...currentDecision,
      updatedName: value,
    });
  };

  const handleActionChange = (action: ReviewAction) => {
    onChangeDecision(currentItem.id, {
      ...currentDecision,
      action,
    });
  };

  const handleTipologiaChange = (tipologiaId: string) => {
    onChangeDecision(currentItem.id, {
      ...currentDecision,
      tipologiaId: tipologiaId || null,
    });
  };

  const total = items.length;
  const decidedIds = Object.keys(decisions);
  const decided = decidedIds.length;
  const createCount = decidedIds.filter((id) => decisions[id]?.action === 'create').length;
  const skipCount = decidedIds.filter((id) => decisions[id]?.action === 'skip').length;
  const pending = total - decided;

  const handleApplyClick = () => {
    if (isApplyingImport || pending > 0 || createCount === 0) return;

    setIsApplyingImport(true);
    try {
      onApplyImport();
    } finally {
      setIsApplyingImport(false);
    }
  };

  return (
    <section className="list">
      <div className="import-wizard">
        <h2>Revisione articoli</h2>
        <p>
          Articolo {currentIndex + 1} di {total}
        </p>

        <div className="import-wizard-section">
          <div className="import-wizard-field">
            <span className="import-wizard-label">Nome originale</span>
            <div className="import-wizard-original">{currentItem.rawName}</div>
          </div>

          <div className="import-wizard-field">
            <label className="import-wizard-label" htmlFor="import-updated-name">
              Nome da usare
            </label>
            <input
              id="import-updated-name"
              type="text"
              className="import-wizard-input"
              value={currentDecision.updatedName}
              onChange={(event) => handleNameChange(event.target.value)}
            />
          </div>

          <div className="import-wizard-field">
            <span className="import-wizard-label">Tipologia</span>
            {tipologie.length > 0 ? (
              <select
                className="import-wizard-select"
                value={currentDecision.tipologiaId ?? defaultTipologiaId ?? ''}
                onChange={(event) => handleTipologiaChange(event.target.value)}
              >
                {tipologie.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome}
                  </option>
                ))}
              </select>
            ) : (
              <select className="import-wizard-select" disabled value="">
                <option value="">Nessuna tipologia disponibile</option>
              </select>
            )}
          </div>

          {isDuplicate && (
            <p className="import-wizard-duplicate">
              Attenzione: esiste già un articolo con questo nome. Se prosegui, l'importazione lo
              salterà automaticamente.
            </p>
          )}
        </div>

        <div className="import-wizard-actions">
          <button
            type="button"
            className={
              currentDecision.action === 'create'
                ? 'db-box settings-button import-wizard-action-primary'
                : 'db-box settings-button import-wizard-action-secondary'
            }
            onClick={() => handleActionChange('create')}
          >
            Creare nuovo articolo
          </button>
          <button
            type="button"
            className={
              currentDecision.action === 'skip'
                ? 'db-box settings-button import-wizard-action-primary'
                : 'db-box settings-button import-wizard-action-secondary'
            }
            onClick={() => handleActionChange('skip')}
          >
            Saltare questo articolo
          </button>
        </div>

        <div className="import-wizard-nav">
          <button
            type="button"
            className="db-box settings-button"
            onClick={() => onChangeIndex(currentIndex - 1)}
            disabled={currentIndex === 0}
          >
            Precedente
          </button>
          <button
            type="button"
            className="db-box settings-button"
            onClick={() => onChangeIndex(currentIndex + 1)}
            disabled={currentIndex === total - 1}
          >
            Successivo
          </button>
        </div>

        <div className="import-wizard-summary">
          <p>
            Da creare: {createCount} — Da saltare: {skipCount} — Da decidere: {pending} (totale{' '}
            {total})
          </p>
          <button type="button" className="db-box settings-button" onClick={onReset}>
            Azzera revisione
          </button>
        </div>

        <button
          type="button"
          className="db-box settings-button import-wizard-apply"
          onClick={handleApplyClick}
          disabled={isApplyingImport || pending > 0 || createCount === 0}
        >
          Applica importazione
        </button>
      </div>
    </section>
  );
}

export default TextImportWizard;
