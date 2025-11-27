import { useMemo, useState } from 'react';
import { useCatalog } from '../shared/state/catalogStore';
import logo from '../assets/logo.png';
import { AppIcon } from '../components/AppIcon';
import EditArticleModal from './archive/EditArticleModal';

function ArchivePage() {
  const { articoli, updateArticoloNome, deleteArticolo } = useCatalog();

  const [query, setQuery] = useState('');
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [isEditArticleOpen, setIsEditArticleOpen] = useState(false);

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
      <header className="page-header">
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

      <ul className="archive-item-list">
        {filteredArticoli.map((item) => (
          <li key={item.id} className="item-card">
            <button
              type="button"
              className="db-item-button"
              onClick={() => {
                setSelectedArticleId(item.id);
                setIsEditArticleOpen(true);
              }}
            >
              <div className="db-item-main">
                <div className="db-item-name">{item.nome}</div>
                <div className="db-item-meta">
                  <span>{item.tipologiaNome}</span>
                </div>
              </div>
            </button>
          </li>
        ))}
      </ul>

      <EditArticleModal
        isOpen={isEditArticleOpen && selectedArticle != null}
        article={selectedArticle}
        onSave={(id, nuovoNome) => {
          updateArticoloNome(id, nuovoNome);
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
    </main>
  );
}

export default ArchivePage;
