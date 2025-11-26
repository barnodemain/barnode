import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useOrders } from '../../state/ordersStore';
import type { OrderWithLines } from '../../types';

function openWhatsApp(text: string | undefined) {
  if (!text || !text.trim()) {
    console.warn('[OrderCreatedPage] Nessun testo WhatsApp disponibile per questo ordine.');
    return;
  }

  const encoded = encodeURIComponent(text);
  window.location.href = `https://wa.me/?text=${encoded}`;
}

function OrderCreatedPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { finalizeCreatedOrder } = useOrders();

  const [order, setOrder] = useState<OrderWithLines | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!id) {
        setIsLoading(false);
        return;
      }

      const result = await finalizeCreatedOrder(id);
      if (!active) return;
      setOrder(result);
      setIsLoading(false);
    }

    load();

    return () => {
      active = false;
    };
  }, [finalizeCreatedOrder, id]);

  if (isLoading) {
    return (
      <main className="page">
        <p className="empty-state">Caricamento ordine…</p>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="page">
        <p className="empty-state">Ordine non trovato.</p>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="orders-created-page">
        <header className="page-header">
          <h1 className="page-title">Ordine creato</h1>
        </header>
        <section className="orders-created-main">
          <div className="orders-created-icon" aria-hidden="true">
            ✓
          </div>
          <p className="orders-created-text">Il tuo ordine è stato generato correttamente.</p>
          <button
            type="button"
            className="orders-created-whatsapp-btn"
            onClick={() => openWhatsApp(order.whatsappText)}
          >
            Apri WhatsApp
          </button>
          <button
            type="button"
            className="orders-created-secondary-btn"
            onClick={() => navigate('/orders')}
          >
            Torna agli ordini
          </button>
        </section>
      </div>
    </main>
  );
}

export default OrderCreatedPage;
