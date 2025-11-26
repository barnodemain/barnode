import type { ArticoloWithRelations } from '../../shared/types/items';
import type { CreateOrderLineInput } from '../../types';

interface OrderConfirmModalProps {
  isOpen: boolean;
  supplierName: string | null;
  lines: Array<{
    article: ArticoloWithRelations;
    line: CreateOrderLineInput;
    fromMissing: boolean;
  }>;
  onConfirm: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

function OrderConfirmModal({
  isOpen,
  supplierName,
  lines,
  onConfirm,
  onCancel,
  isSubmitting,
}: OrderConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-container">
        <h2 className="modal-title">Conferma ordine</h2>
        <div className="modal-body">
          <p className="orders-confirm-supplier">Fornitore: {supplierName ?? 'N/D'}</p>
          <div className="modal-list orders-confirm-list">
            {lines.length === 0 ? (
              <p className="empty-state">Nessuna riga ordine selezionata.</p>
            ) : (
              lines.map(({ article, line, fromMissing }) => (
                <div key={article.id} className="modal-list-item orders-confirm-item">
                  <div className="modal-list-text">
                    <div className="orders-confirm-item-name">{article.nome}</div>
                    <div className="orders-confirm-item-meta">
                      <span>
                        {line.quantity}{' '}
                        {line.unit === 'scatola' ? 'cartoni' : 'pezzi'}
                      </span>
                      {fromMissing && <span className="orders-confirm-badge">da mancanti</span>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="modal-actions modal-actions-center">
          <button
            type="button"
            className="btn-secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Annulla
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={onConfirm}
            disabled={isSubmitting || lines.length === 0}
          >
            {isSubmitting ? 'Invio…' : 'Conferma creazione ordine'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderConfirmModal;
