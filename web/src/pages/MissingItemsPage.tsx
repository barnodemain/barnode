import { useState } from 'react';
import { useMissingItems } from '../shared/state/missingItemsStore';
import logo from '../assets/logo.png';
import { AppIcon } from '../components/AppIcon';
import { useCatalog } from '../shared/state/catalogStore';
import { COLORE_VARIE } from '../shared/constants/tipologie';
import NewArticleModal from './archive/NewArticleModal';

function MissingItemsPage() {
  const { missingItems, suggestedItems, query, setQuery, addMissing, removeMissing } =
    useMissingItems();
  const { tipologie } = useCatalog();
  const { addArticolo } = useCatalog();
  const [isNewArticleOpen, setIsNewArticleOpen] = useState(false);

  return (
    <main className="page home-page">
      <header className="home-header">
        <div className="page-logo-wrapper">
          <img src={logo} alt="Barnode" className="page-logo" />
        </div>
        <h1 className="page-title">Lista articoli mancanti</h1>
        <div className="search-row">
          <span className="search-icon" aria-hidden="true">
            <AppIcon name="search" size={16} />
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
      <div className="home-scroll">
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
            <ul className="home-item-list">
              {missingItems.map((item) => {
                const nomeArticolo = 'articoloNome' in item ? item.articoloNome : item.nome;
                const tipo = tipologie.find(
                  (t) => t.nome.trim().toLowerCase() === item.tipologiaNome?.trim().toLowerCase()
                );
                const isVarie = tipo && tipo.nome.trim().toLowerCase() === 'varie';
                const colore = isVarie ? COLORE_VARIE : (tipo?.colore ?? COLORE_VARIE);

                return (
                  <li key={item.id} className="item-card">
                    <div className="bn-card">
                      <div className="bn-card-color" style={{ backgroundColor: colore }} />
                      <div className="bn-card-content">
                        <div className="item-row">
                          <span className="item-name">{nomeArticolo}</span>
                          <button
                            type="button"
                            className="item-delete-button"
                            onClick={() => removeMissing(item.id)}
                            aria-label={`Rimuovi ${nomeArticolo} dalla lista`}
                          >
                            <AppIcon name="trash" size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <button
        type="button"
        className="floating-add-button"
        onClick={() => {
          setIsNewArticleOpen(true);
        }}
      >
        <AppIcon name="plus" size={22} />
      </button>
      <NewArticleModal
        isOpen={isNewArticleOpen}
        onClose={() => setIsNewArticleOpen(false)}
        tipologie={tipologie}
        onSave={({ nome, tipologiaId }) => {
          addArticolo({ nome, tipologiaId });
          setIsNewArticleOpen(false);
        }}
      />
    </main>
  );
}

export default MissingItemsPage;
