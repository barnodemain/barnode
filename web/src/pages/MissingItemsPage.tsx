import { useMissingItems } from '../shared/state/missingItemsStore';
import logo from '../assets/logo.png';

function MissingItemsPage() {
  const { missingItems, suggestedItems, query, setQuery, addMissing, removeMissing } =
    useMissingItems();

  return (
    <main className="page">
      <header className="page-header">
        <div className="page-logo-wrapper">
          <img src={logo} alt="Barnode" className="page-logo" />
        </div>
        <h1 className="page-title">Articoli mancanti</h1>
        <div className="search-row">
          <span className="search-icon" aria-hidden="true">
            🔍
          </span>
          <input
            type="search"
            placeholder="Cerca per nome"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="search-input"
          />
        </div>
      </header>
      {query.trim().length > 0 && suggestedItems.length > 0 && (
        <section className="suggestions-panel">
          <ul className="suggestions-list">
            {suggestedItems.map((item) => (
              <li
                key={item.id}
                className="suggestions-item"
                onClick={() => {
                  addMissing(item.id);
                  setQuery('');
                }}
              >
                <span className="item-name">{item.nome}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section className="list">
        {missingItems.length === 0 ? (
          <p className="empty-state">Nessun articolo in lista da acquistare.</p>
        ) : (
          <ul className="item-list">
            {missingItems.map((item) => (
              <li key={item.id} className="item-card">
                <div className="item-row">
                  <span className="item-name">{item.nome}</span>
                  <button
                    type="button"
                    className="item-delete-button"
                    onClick={() => removeMissing(item.id)}
                    aria-label={`Rimuovi ${item.nome} dalla lista`}
                  >
                    🗑️
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export default MissingItemsPage;
