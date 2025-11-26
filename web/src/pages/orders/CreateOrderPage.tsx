import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCatalog } from '../../shared/state/catalogStore';
import { useMissingItems } from '../../shared/state/missingItemsStore';
import { useOrders } from '../../state/ordersStore';
import { createOrderWithLines } from '../../repositories/ordersRepository';
import type { ArticoloWithRelations } from '../../shared/types/items';
import type { CreateOrderLineInput, CreateOrderWithLinesInput, OrderUnit } from '../../types';
import OrderSupplierSelect from '../../components/orders/OrderSupplierSelect';
import OrderArticleBox from '../../components/orders/OrderArticleBox';
import OrderConfirmModal from '../../components/orders/OrderConfirmModal';

interface OrderEditorPageBaseProps {
  mode: 'create' | 'edit';
  supplierLocked: boolean;
  submitLabel: string;
  onSubmit: (
    supplierId: string,
    draftLines: Array<{
      article: ArticoloWithRelations;
      line: CreateOrderLineInput;
      fromMissing: boolean;
    }>
  ) => Promise<void>;
}

function OrderEditorPageBase({
  mode,
  supplierLocked,
  submitLabel,
  onSubmit,
}: OrderEditorPageBaseProps) {
  const navigate = useNavigate();
  const { fornitori, articoli } = useCatalog();
  const { missingIds } = useMissingItems();
  const { draftSupplierId, setDraftSupplierId, draftLinesByArticleId, setDraftLine, canSendOrder } =
    useOrders();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredArticles: ArticoloWithRelations[] = useMemo(() => {
    if (!draftSupplierId) return [];
    return articoli
      .filter((articolo) => articolo.fornitoreId === draftSupplierId)
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [articoli, draftSupplierId]);

  const sortedArticlesWithMissingFirst = useMemo(() => {
    return [...filteredArticles].sort((a, b) => {
      const aMissing = missingIds.includes(a.id) ? 1 : 0;
      const bMissing = missingIds.includes(b.id) ? 1 : 0;
      if (aMissing !== bMissing) return bMissing - aMissing;
      return a.nome.localeCompare(b.nome);
    });
  }, [filteredArticles, missingIds]);

  const supplierName = useMemo(() => {
    if (!draftSupplierId) return null;
    return fornitori.find((f) => f.id === draftSupplierId)?.nome ?? null;
  }, [draftSupplierId, fornitori]);

  const draftLinesArray: Array<{
    article: ArticoloWithRelations;
    line: CreateOrderLineInput;
    fromMissing: boolean;
  }> = useMemo(() => {
    const entries = Object.values(draftLinesByArticleId);
    return entries
      .filter((entry) => entry.quantity > 0)
      .map((entry) => {
        const article = articoli.find((a) => a.id === entry.articleId) as
          | ArticoloWithRelations
          | undefined;
        if (!article) {
          return null;
        }
        const fromMissing = missingIds.includes(entry.articleId);
        const line: CreateOrderLineInput = {
          articleId: entry.articleId,
          quantity: entry.quantity,
          unit: entry.unit as OrderUnit,
          note: entry.note,
        };
        return { article, line, fromMissing };
      })
      .filter(
        (
          item
        ): item is {
          article: ArticoloWithRelations;
          line: CreateOrderLineInput;
          fromMissing: boolean;
        } => item != null
      );
  }, [articoli, draftLinesByArticleId, missingIds]);

  const handleConfirm = async () => {
    if (!draftSupplierId || draftLinesArray.length === 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit(draftSupplierId, draftLinesArray);
      setIsSubmitting(false);
      setIsConfirmOpen(false);
    } catch (error) {
      console.error('[OrderEditorPageBase] Errore durante submit ordine', error);
      alert("Errore durante il salvataggio dell'ordine. Riprova.");
      setIsSubmitting(false);
    }
  };

  const title = mode === 'create' ? 'Crea ordine' : 'Modifica ordine';

  return (
    <main className="page">
      <div className="orders-page">
        <header className="page-header orders-header">
          <button type="button" className="orders-back-button" onClick={() => navigate(-1)}>
            ← Indietro
          </button>
          <h1 className="page-title">{title}</h1>
        </header>

        {supplierLocked ? (
          <section className="orders-section">
            <h2 className="section-title">1. Fornitore</h2>
            {supplierName ? (
              <p className="orders-supplier-readonly">{supplierName}</p>
            ) : (
              <p className="empty-state">Impossibile determinare il fornitore dell&apos;ordine.</p>
            )}
          </section>
        ) : (
          <OrderSupplierSelect
            suppliers={fornitori}
            selectedSupplierId={draftSupplierId}
            onChange={setDraftSupplierId}
          />
        )}

        <section className="orders-section list">
          <h2 className="section-title">2. Seleziona articoli e quantità</h2>
          {draftSupplierId == null ? (
            <p className="empty-state">Seleziona prima un fornitore per vedere i suoi articoli.</p>
          ) : sortedArticlesWithMissingFirst.length === 0 ? (
            <p className="empty-state">Nessun articolo associato a questo fornitore.</p>
          ) : (
            <ul className="orders-article-list">
              {sortedArticlesWithMissingFirst.map((article) => {
                const draftLine = draftLinesByArticleId[article.id];
                const quantity = draftLine?.quantity ?? 0;
                const unit = (draftLine?.unit as OrderUnit | undefined) ?? null;
                const isMissing = missingIds.includes(article.id);

                return (
                  <OrderArticleBox
                    key={article.id}
                    article={article}
                    isMissing={isMissing}
                    quantity={quantity}
                    unit={unit}
                    onChange={(nextQuantity, nextUnit) => {
                      if (!nextUnit || nextQuantity <= 0) {
                        setDraftLine(article.id, 0, (draftLine?.unit ?? 'pezzo') as OrderUnit);
                        return;
                      }
                      setDraftLine(article.id, nextQuantity, nextUnit);
                    }}
                  />
                );
              })}
            </ul>
          )}
        </section>

        <div className="orders-footer">
          <button
            type="button"
            className="btn-primary orders-send-button"
            disabled={!canSendOrder}
            onClick={() => setIsConfirmOpen(true)}
          >
            {submitLabel}
          </button>
        </div>
      </div>

      <OrderConfirmModal
        isOpen={isConfirmOpen}
        supplierName={supplierName}
        lines={draftLinesArray}
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirm}
        isSubmitting={isSubmitting}
      />
    </main>
  );
}

function CreateOrderPage() {
  const navigate = useNavigate();
  const { removeMissing } = useMissingItems();
  const { loadActiveOrders } = useOrders();

  const handleSubmit = async (
    supplierId: string,
    draftLines: Array<{
      article: ArticoloWithRelations;
      line: CreateOrderLineInput;
      fromMissing: boolean;
    }>
  ) => {
    console.log('[CreateOrderPage] handleSubmit START', { supplierId, draftLines });

    const lines = draftLines.map((item) => item.line);

    if (!supplierId || lines.length === 0) {
      console.warn('[CreateOrderPage] STOP: supplier o righe mancanti', {
        supplierId,
        linesLength: lines.length,
      });
      return;
    }

    const payload: CreateOrderWithLinesInput = {
      supplierId,
      lines,
    };

    console.log('[CreateOrderPage] createOrderWithLines payload', payload);

    const result = await createOrderWithLines(payload as CreateOrderWithLinesInput);

    console.log('[CreateOrderPage] createOrderWithLines result', result);

    // Supporta sia { data, error } sia ritorno diretto
    const data = result && 'data' in result ? result.data : result;
    const error = result && 'error' in result ? result.error : null;

    if (!data || error) {
      console.error('[CreateOrderPage] Errore creazione ordine', { error, data });
      alert('Errore durante la creazione dell’ordine. Controlla la console.');
      return;
    }

    // Depennamento articoli mancanti
    const fromMissingIds = draftLines
      .filter((item) => item.fromMissing)
      .map((item) => item.article.id);

    for (const articoloId of fromMissingIds) {
      await removeMissing(articoloId);
    }

    await loadActiveOrders();

    console.log('[CreateOrderPage] navigate to', `/orders/created/${data.id}`);
    navigate(`/orders/created/${data.id}`);
  };

  return (
    <OrderEditorPageBase
      mode="create"
      supplierLocked={false}
      submitLabel="Invia ordine"
      onSubmit={handleSubmit}
    />
  );
}

export default CreateOrderPage;
