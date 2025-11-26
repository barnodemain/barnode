import { useState } from 'react';
import AppModal from '../../shared/components/AppModal';

interface SuppliersManagerModalProps {
  isOpen: boolean;
  fornitori: { id: string; nome: string }[];
  addFornitore: (nome: string) => void;
  updateFornitore: (id: string, nuovoNome: string) => void;
  deleteFornitore: (id: string) => void;
  onClose: () => void;
}

function SuppliersManagerModal({
  isOpen,
  fornitori,
  addFornitore,
  updateFornitore,
  deleteFornitore,
  onClose,
}: SuppliersManagerModalProps) {
  const [search, setSearch] = useState('');
  const [nomeNuovo, setNomeNuovo] = useState('');

  if (!isOpen) return null;

  const filtered = fornitori.filter((forn) =>
    forn.nome.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <AppModal isOpen={isOpen} title="Gestisci fornitori" onClose={onClose}>
      <div className="modal-body-fields">
        <label className="modal-field">
          <span>Cerca fornitore</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="modal-input"
            placeholder="Digita per cercare..."
          />
        </label>

        <div className="modal-list">
          {filtered.map((forn) => (
            <div key={forn.id} className="modal-list-item">
              <span className="modal-list-text">{forn.nome}</span>
              <div className="modal-list-actions">
                <button
                  type="button"
                  className="btn-primary btn-small"
                  onClick={() => {
                    const nuovo = window.prompt('Nuovo nome fornitore', forn.nome);
                    if (!nuovo) return;
                    const trimmed = nuovo.trim();
                    if (!trimmed) return;
                    updateFornitore(forn.id, trimmed);
                  }}
                >
                  Modifica
                </button>
                <button
                  type="button"
                  className="btn-icon-danger"
                  onClick={() => {
                    if (window.confirm('Eliminare questo fornitore?')) {
                      deleteFornitore(forn.id);
                    }
                  }}
                  aria-label="Elimina fornitore"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>

        <label className="modal-field">
          <span>Nuovo fornitore</span>
          <input
            value={nomeNuovo}
            onChange={(event) => setNomeNuovo(event.target.value)}
            className="modal-input"
            placeholder="Nome nuovo fornitore"
          />
        </label>
        <div className="modal-actions-inline">
          <button
            type="button"
            className="btn-primary btn-small"
            onClick={() => {
              const trimmed = nomeNuovo.trim();
              if (!trimmed) return;
              addFornitore(trimmed);
              setNomeNuovo('');
            }}
          >
            Salva fornitore
          </button>
        </div>
      </div>
      <div className="modal-actions modal-actions-center">
        <button
          type="button"
          className="btn-secondary btn-secondary-soft-danger"
          onClick={onClose}
        >
          Chiudi
        </button>
      </div>
    </AppModal>
  );
}

export default SuppliersManagerModal;
