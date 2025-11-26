import type { Fornitore } from '../../shared/types/items';
import { OrderStatus, type Order } from '../../types';
import { openWhatsapp } from '../../utils/whatsapp';

interface OrderCardProps {
  order: Order;
  supplier: Fornitore | null;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}

function formatDate(iso: string | undefined) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString();
}

function OrderCard({ order, supplier, onArchive, onDelete }: OrderCardProps) {
  const createdLabel = formatDate(order.createdAt);
  const isArchived = order.status === OrderStatus.Archived;

  return (
    <li className="orders-card-item">
      <div className="orders-card">
        <div className="orders-card-header">
          <div className="orders-card-title-block">
            <div className="orders-card-supplier">{supplier?.nome ?? 'Fornitore sconosciuto'}</div>
            <div className="orders-card-meta">
              {createdLabel && <span>{createdLabel}</span>}
              <span className={isArchived ? 'orders-status-badge orders-status-badge-archived' : 'orders-status-badge orders-status-badge-active'}>
                {isArchived ? 'Archiviato' : 'In corso'}
              </span>
            </div>
          </div>
        </div>
        <div className="orders-card-body">
          <div className="orders-card-body-row">
            <span className="orders-card-body-label">Righe</span>
            <span className="orders-card-body-value">{order.totalLines ?? 0}</span>
          </div>
        </div>
        <div className="orders-card-actions">
          {!isArchived && (
            <button
              type="button"
              className="btn-secondary orders-card-btn"
              onClick={() => onArchive(order.id)}
            >
              Archivia
            </button>
          )}
          <button
            type="button"
            className="btn-secondary orders-card-btn"
            onClick={() => openWhatsapp(order.whatsappText)}
          >
            WhatsApp
          </button>
          <button
            type="button"
            className="btn-danger orders-card-btn orders-card-btn-danger"
            onClick={() => onDelete(order.id)}
          >
            Elimina
          </button>
        </div>
      </div>
    </li>
  );
}

export default OrderCard;
