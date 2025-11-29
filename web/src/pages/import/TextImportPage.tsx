import React, { useEffect, useMemo, useState } from 'react';
import logo from '../../assets/logo.png';
import TextImportPanel, { type ParsedItem } from '../../components/import/TextImportPanel';
import TextImportWizard, { type ReviewDecision } from '../../components/import/TextImportWizard';
import { useCatalog } from '../../shared/state/catalogStore';
import type { Articolo, Tipologia } from '../../shared/types/items';
import { addArticolo, getArticoli } from '../../shared/repositories/catalogRepository';

function TextImportPage() {
  const { tipologie } = useCatalog();
  const [reviewItems, setReviewItems] = useState<ParsedItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [decisions, setDecisions] = useState<Record<string, ReviewDecision>>({});
  const [existingArticoli, setExistingArticoli] = useState<Articolo[]>([]);
  const [importResultMessage, setImportResultMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadExistingArticoli = async () => {
      const result = await getArticoli();
      if (!active) return;

      if (result.error || !result.data) {
        // eslint-disable-next-line no-console
        console.error('Errore durante il caricamento degli articoli esistenti per il wizard', result.error);
        return;
      }

      setExistingArticoli(result.data);
    };

    void loadExistingArticoli();

    return () => {
      active = false;
    };
  }, []);

  const handleConfirmSelection = (items: ParsedItem[]) => {
    setReviewItems(items);
    setCurrentIndex(0);
    setDecisions({});
    setImportResultMessage(null);
  };

  const handleChangeDecision = (id: string, decision: ReviewDecision) => {
    setDecisions((prev) => ({
      ...prev,
      [id]: decision,
    }));
  };

  const handleResetReview = () => {
    setReviewItems([]);
    setDecisions({});
    setCurrentIndex(0);
  };

  const handleApplyImport = async () => {
    if (reviewItems.length === 0) {
      return;
    }

    const existingResult = await getArticoli();
    if (existingResult.error || !existingResult.data) {
      // eslint-disable-next-line no-console
      console.error('Errore durante il caricamento degli articoli esistenti', existingResult.error);
      return;
    }

    const existingArticoli = existingResult.data;
    const normalizeName = (value: string) => value.trim().toLowerCase();

    const seenNames = new Set<string>(existingArticoli.map((articolo) => normalizeName(articolo.nome)));

    let totalToCreate = 0;
    let actuallyCreated = 0;
    let skippedDuplicates = 0;
    let invalidItems = 0;

    for (const item of reviewItems) {
      const decision = decisions[item.id];

      if (!decision || decision.action !== 'create') {
        continue;
      }

      totalToCreate += 1;

      const nome = decision.updatedName.trim();
      const tipologiaId = decision.tipologiaId ?? '';

      if (!nome || !tipologiaId) {
        invalidItems += 1;
        continue;
      }

      const normalized = normalizeName(nome);
      if (!normalized || seenNames.has(normalized)) {
        // Duplicato esistente o già creato in questa sessione: skip senza errore.
        skippedDuplicates += 1;
        continue;
      }

      const result = await addArticolo({ nome, tipologiaId });
      if (result.error || !result.data) {
        // eslint-disable-next-line no-console
        console.error('Errore durante la creazione articolo da import', result.error);
        continue;
      }

      seenNames.add(normalized);
      actuallyCreated += 1;
    }

    setImportResultMessage(
      `Importazione completata:\n• Creati: ${actuallyCreated}\n• Duplicati saltati: ${skippedDuplicates}\n• Elementi non validi: ${invalidItems}`
    );

    // Reset del wizard dopo l'importazione.
    setReviewItems([]);
    setDecisions({});
    setCurrentIndex(0);

    // eslint-disable-next-line no-console
    console.log('Importazione completata');
  };

  const normalizeName = (value: string) => value.trim().toLowerCase();

  const existingNames = useMemo(
    () => existingArticoli.map((articolo) => normalizeName(articolo.nome)).filter((name) => name.length > 0),
    [existingArticoli]
  );

  return (
    <main className="page settings-page">
      <header className="page-header">
        <div className="page-logo-wrapper">
          <img src={logo} alt="Barnode" className="page-logo" />
        </div>
        <h1 className="page-title">Importa da testo</h1>
      </header>
      <TextImportPanel onConfirmSelection={handleConfirmSelection} />

      {reviewItems.length > 0 && (
        <TextImportWizard
          items={reviewItems}
          currentIndex={currentIndex}
          decisions={decisions}
          onChangeIndex={setCurrentIndex}
          onChangeDecision={handleChangeDecision}
          onReset={handleResetReview}
          tipologie={tipologie as Tipologia[]}
          onApplyImport={handleApplyImport}
          existingNames={existingNames}
        />
      )}

      {importResultMessage && <p className="import-note">{importResultMessage}</p>}
    </main>
  );
}

export default TextImportPage;
