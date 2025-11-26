// NOTE: EditOrderPage disattivata temporaneamente.
// La funzione "Modifica ordine" non è supportata in questa versione della web app.

import { useNavigate } from 'react-router-dom';

function EditOrderPage() {
  const navigate = useNavigate();

  return (
    <main className="page">
      <div className="orders-page">
        <header className="page-header orders-header">
          <button
            type="button"
            className="orders-back-button"
            onClick={() => navigate(-1)}
          >
            ← Indietro
          </button>
          <h1 className="page-title">Modifica ordine non disponibile</h1>
        </header>

        <section className="orders-section">
          <p className="empty-state">
            La funzione di modifica ordine non è disponibile in questa versione. Puoi creare
            nuovi ordini o gestire quelli esistenti dalla schermata "Ordini".
          </p>
        </section>
      </div>
    </main>
  );
}

export default EditOrderPage;
