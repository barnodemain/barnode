import { useState } from 'react';
import type { ArticoloWithRelations } from '../../shared/types/items';
import { OrderUnit } from '../../types';

interface OrderArticleBoxProps {
  article: ArticoloWithRelations;
  isMissing: boolean;
  quantity: number;
  unit: OrderUnit | null;
  onChange: (quantity: number, unit: OrderUnit | null) => void;
}

function OrderArticleBox({ article, isMissing, quantity, unit, onChange }: OrderArticleBoxProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleQuantityChange = (value: string) => {
    const parsed = Number(value.replace(/[^0-9]/g, ''));
    if (Number.isNaN(parsed)) {
      onChange(0, unit);
      return;
    }
    onChange(parsed, unit);
  };

  const handleUnitChange = (nextUnit: OrderUnit) => {
    if (unit === nextUnit) {
      onChange(quantity, null);
      return;
    }
    onChange(quantity || 1, nextUnit);
  };

  const displayQuantity = quantity > 0 ? quantity : 0;
  const displayUnitLabel = unit === OrderUnit.Box ? 'cart.' : unit === OrderUnit.Piece ? 'pz' : '';

  return (
    <li className={isMissing ? 'orders-article-card orders-article-card-missing' : 'orders-article-card'}>
      <button
        type="button"
        className="orders-article-header"
        onClick={() => setIsOpen((current) => !current)}
      >
        <div className="orders-article-title">
          <div className="orders-article-name">{article.nome}</div>
          <div className="orders-article-meta">
            <span>{article.tipologiaNome}</span>
            <span>{article.fornitoreNome}</span>
          </div>
        </div>
        <div className="orders-article-qty-pill">
          <span className="orders-article-qty-value">{displayQuantity}</span>
          {displayUnitLabel && <span className="orders-article-qty-unit">{displayUnitLabel}</span>}
        </div>
      </button>
      {isOpen && (
        <div className="orders-article-body">
          <div className="orders-article-units">
            <button
              type="button"
              className={
                unit === OrderUnit.Piece
                  ? 'orders-toggle orders-toggle-active'
                  : 'orders-toggle'
              }
              onClick={() => handleUnitChange(OrderUnit.Piece)}
            >
              Pezzi
            </button>
            <button
              type="button"
              className={
                unit === OrderUnit.Box ? 'orders-toggle orders-toggle-active' : 'orders-toggle'
              }
              onClick={() => handleUnitChange(OrderUnit.Box)}
            >
              Cartoni
            </button>
          </div>
          <div className="orders-article-qty-input-row">
            <label className="orders-article-qty-label">
              Quantità
              <input
                type="number"
                inputMode="numeric"
                min={0}
                className="orders-article-qty-input"
                value={displayQuantity}
                onChange={(event) => handleQuantityChange(event.target.value)}
              />
            </label>
          </div>
        </div>
      )}
    </li>
  );
}

export default OrderArticleBox;
