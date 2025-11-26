import type { Fornitore } from '../../shared/types/items';

interface OrderSupplierSelectProps {
  suppliers: Fornitore[];
  selectedSupplierId: string | null;
  onChange: (supplierId: string | null) => void;
}

function OrderSupplierSelect({ suppliers, selectedSupplierId, onChange }: OrderSupplierSelectProps) {
  return (
    <section className="orders-section">
      <h2 className="section-title">1. Seleziona il fornitore</h2>
      <div className="orders-supplier-select-row">
        <select
          className="orders-supplier-select"
          aria-label="Seleziona fornitore"
          value={selectedSupplierId ?? ''}
          onChange={(event) => {
            const value = event.target.value;
            onChange(value ? value : null);
          }}
        >
          <option value="">Scegli un fornitore…</option>
          {suppliers.map((fornitore) => (
            <option key={fornitore.id} value={fornitore.id}>
              {fornitore.nome}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}

export default OrderSupplierSelect;
