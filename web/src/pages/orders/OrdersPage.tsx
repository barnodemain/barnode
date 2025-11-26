import { useNavigate } from 'react-router-dom';

function OrdersPage() {
  const navigate = useNavigate();

  return (
    <main className="page">
      <div className="orders-home">
        <header className="page-header">
          <h1 className="page-title">Ordini</h1>
        </header>
        <section className="orders-home-grid">
          <button
            type="button"
            className="orders-home-card orders-home-card-primary"
            onClick={() => navigate('/orders/create')}
          >
            <h2>Crea ordine</h2>
            <p>Seleziona fornitore e articoli da inviare.</p>
          </button>
          <button
            type="button"
            className="orders-home-card orders-home-card-secondary"
            onClick={() => navigate('/orders/manage')}
          >
            <h2>Gestisci ordini</h2>
            <p>Vedi ordini in corso e archiviati.</p>
          </button>
        </section>
      </div>
    </main>
  );
}

export default OrdersPage;
