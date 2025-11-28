import { useMemo, useState } from 'react';
import logo from '../assets/logo.png';
import { AppIcon } from '../components/AppIcon';
import { useCatalog } from '../shared/state/catalogStore';
import type { Tipologia } from '../shared/types/items';
import TipologiaModalAdd from '../components/tipologie/TipologiaModalAdd';
import TipologiaModalEdit from '../components/tipologie/TipologiaModalEdit';

function TipologiePage() {
  const { tipologie, addTipologia, updateTipologia, deleteTipologia } = useCatalog();
  const [query, setQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editing, setEditing] = useState<Tipologia | null>(null);

  const filteredTipologie = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return tipologie;
    return tipologie.filter((t) => t.nome.toLowerCase().includes(normalized));
  }, [tipologie, query]);

  return (
    <main className="page archive-page">
      <header className="archive-header">
        <div className="page-logo-wrapper">
          <img src={logo} alt="Barnode" className="page-logo" />
        </div>
        <h1 className="page-title">Tipologie articoli</h1>
        <div className="search-row">
          <span className="search-icon" aria-hidden="true">
            <AppIcon name="search" size={16} />
          </span>
          <input
            type="search"
            placeholder="Cerca per nome tipologia…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="search-input"
          />
        </div>
      </header>

      <div className="archive-scroll">
        <ul className="archive-item-list tipologie-item-list">
          {filteredTipologie.map((tipologia) => {
            const colore = tipologia.colore ?? '#2D9CDB';

            return (
              <li key={tipologia.id} className="item-card tipologie-item-card">
                <div className="bn-card">
                  <div className="bn-card-color" style={{ backgroundColor: colore }} />
                  <div className="bn-card-content">
                    <button
                      type="button"
                      className="db-item-button"
                      onClick={() => setEditing(tipologia)}
                    >
                      <div className="db-item-main">
                        <div className="db-item-name">{tipologia.nome}</div>
                      </div>
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
          {filteredTipologie.length === 0 && (
            <li className="item-card">
              <div className="db-item-button">
                <div className="db-item-main">
                  <div className="db-item-name">Nessuna tipologia trovata.</div>
                </div>
              </div>
            </li>
          )}
        </ul>
      </div>

      <button
        type="button"
        className="floating-add-button"
        onClick={() => setIsAddOpen(true)}
        aria-label="Aggiungi tipologia"
        style={{
          backgroundColor: '#EFB700',
        }}
      >
        <AppIcon name="plus" size={22} color="#8B5A00" />
      </button>

      <TipologiaModalAdd
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        tipologie={tipologie}
        onSave={({ nome, colore }) => {
          addTipologia({ nome, colore });
          setIsAddOpen(false);
        }}
      />

      <TipologiaModalEdit
        isOpen={editing != null}
        tipologia={editing}
        onClose={() => setEditing(null)}
        tipologie={tipologie}
        onSave={({ id, nome, colore }) => {
          updateTipologia(id, { nome, colore });
          setEditing(null);
        }}
        onDelete={(id) => {
          deleteTipologia(id);
          setEditing(null);
        }}
      />
    </main>
  );
}

export default TipologiePage;
