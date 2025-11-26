/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCatalog } from '../../shared/state/catalogStore';
import { useOrders } from '../../state/ordersStore';
import OrderCard from '../../components/orders/OrderCard';

function ManageOrdersPage() {
  const navigate = useNavigate();
  const { fornitori } = useCatalog();
  const {
    activeOrders,
    archivedOrders,
    loadActiveOrders,
    loadArchivedOrders,
    archiveOrder,
    deleteOrder,
  } = useOrders();

  const [tab, setTab] = useState<'active' | 'archived'>('active');
  const [hasLoadedArchived, setHasLoadedArchived] = useState(false);

  useEffect(() => {
    loadActiveOrders();
  }, [loadActiveOrders]);

  useEffect(() => {
    if (tab === 'archived' && !hasLoadedArchived) {
      loadArchivedOrders();
      setHasLoadedArchived(true);
    }
  }, [hasLoadedArchived, loadArchivedOrders, tab]);

  const list = tab === 'active' ? activeOrders : archivedOrders;

  return (
    <main className="page">
      <div className="orders-page">
        <header className="page-header orders-header">
          <button type="button" className="orders-back-button" onClick={() => navigate(-1)}>
            ← Indietro
          </button>
          <h1 className="page-title">Gestisci ordini</h1>
        </header>

        <div className="orders-tabs">
          <button
            type="button"
            className={tab === 'active' ? 'orders-tab orders-tab-active' : 'orders-tab'}
            onClick={() => setTab('active')}
          >
            In corso
          </button>
          <button
            type="button"
            className={tab === 'archived' ? 'orders-tab orders-tab-active' : 'orders-tab'}
            onClick={() => setTab('archived')}
          >
            Archiviati
          </button>
        </div>

        <section className="orders-section list">
          {list.length === 0 ? (
            <p className="empty-state">Nessun ordine in questa sezione.</p>
          ) : (
            <ul className="orders-list">
              {list.map((order) => {
                const supplier = fornitori.find((f) => f.id === order.supplierId) ?? null;
                return (
                  <OrderCard
                    key={order.id}
                    order={order}
                    supplier={supplier}
                    onArchive={async (id) => {
                      await archiveOrder(id);
                      await loadActiveOrders();
                      await loadArchivedOrders();
                    }}
                    onDelete={async (id) => {
                      if (!window.confirm('Sei sicuro di voler eliminare questo ordine?')) return;
                      await deleteOrder(id);
                      await loadActiveOrders();
                      await loadArchivedOrders();
                    }}
                  />
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

export default ManageOrdersPage;
