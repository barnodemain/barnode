import { useMemo, useState } from 'react';
import { useCatalog } from '../shared/state/catalogStore';
import logo from '../assets/logo.png';
import { AppIcon } from '../components/AppIcon';
import { COLORE_VARIE } from '../shared/constants/tipologie';
import { toTitleCaseWords } from '../shared/utils/text';
import EditArticleModal from './archive/EditArticleModal';
import NewArticleModal from './archive/NewArticleModal';

function ArchivePage() {
  const { articoli, tipologie, deleteArticolo, addArticolo, updateArticolo } = useCatalog();

  const [query, setQuery] = useState('');
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [isEditArticleOpen, setIsEditArticleOpen] = useState(false);
  const [isNewArticleOpen, setIsNewArticleOpen] = useState(false);

  const filteredArticoli = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return articoli;
    return articoli.filter((item) => item.nome.toLowerCase().includes(normalized));
  }, [articoli, query]);

  const selectedArticle =
    selectedArticleId != null
      ? (articoli.find((item) => item.id === selectedArticleId) ?? null)
      : null;

  return (
    <main className="page archive-page">
      <header className="archive-header">
        <div className="page-logo-wrapper">
          <img src={logo} alt="Barnode" className="page-logo" />
        </div>
        <h1 className="page-title">Archivio articoli</h1>
        <div className="search-row">
          <span className="search-icon" aria-hidden="true">
            <AppIcon name="search" size={16} />
          </span>
          <input
            type="search"
            placeholder="Cerca per nome articolo…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="search-input"
          />
        </div>
      </header>

      <div className="archive-scroll">
        <ul className="archive-item-list">
          {filteredArticoli.map((item) => {
            const tipo = tipologie.find((t) => t.id === item.tipologiaId);
            const isVarie = tipo && tipo.nome.trim().toLowerCase() === 'varie';
            const colore = isVarie ? COLORE_VARIE : (tipo?.colore ?? COLORE_VARIE);

            return (
              <li key={item.id} className="item-card">
                <div className="bn-card">
                  <div className="bn-card-color" style={{ backgroundColor: colore }} />
                  <div className="bn-card-content">
                    <button
                      type="button"
                      className="db-item-button"
                      onClick={() => {
                        setSelectedArticleId(item.id);
                        setIsEditArticleOpen(true);
                      }}
                    >
                      <div className="db-item-main">
                        <div className="db-item-name">{toTitleCaseWords(item.nome)}</div>
                        <div className="db-item-meta">
                          <span>{item.tipologiaNome}</span>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <EditArticleModal
        isOpen={isEditArticleOpen && selectedArticle != null}
        article={selectedArticle}
        tipologie={tipologie}
        onSave={({ id, nome, tipologiaId }) => {
          updateArticolo({ id, nome, tipologiaId });
          setIsEditArticleOpen(false);
          setSelectedArticleId(null);
        }}
        onDelete={(id) => {
          if (window.confirm('Sei sicuro di voler eliminare questo articolo?')) {
            deleteArticolo(id);
            setIsEditArticleOpen(false);
            setSelectedArticleId(null);
          }
        }}
        onClose={() => {
          setIsEditArticleOpen(false);
          setSelectedArticleId(null);
        }}
      />

      <button
        type="button"
        className="floating-add-button"
        onClick={() => {
          setIsNewArticleOpen(true);
        }}
        aria-label="Aggiungi articolo"
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

export default ArchivePage;
