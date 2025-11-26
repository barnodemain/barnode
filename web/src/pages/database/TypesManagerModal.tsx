import { useState } from 'react';
import AppModal from '../../shared/components/AppModal';

interface TypesManagerModalProps {
  isOpen: boolean;
  tipologie: { id: string; nome: string }[];
  addTipologia: (nome: string) => void;
  updateTipologia: (id: string, nuovoNome: string) => void;
  deleteTipologia: (id: string) => void;
  onClose: () => void;
}

function TypesManagerModal({
  isOpen,
  tipologie,
  addTipologia,
  updateTipologia,
  deleteTipologia,
  onClose,
}: TypesManagerModalProps) {
  const [search, setSearch] = useState('');
  const [nomeNuova, setNomeNuova] = useState('');

  if (!isOpen) return null;

  const filtered = tipologie.filter((tip) =>
    tip.nome.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <AppModal isOpen={isOpen} title="Gestisci tipologie" onClose={onClose}>
      <div className="modal-body-fields">
        <label className="modal-field">
          <span>Cerca tipologia</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="modal-input"
          />
        </label>
        <div className="modal-list">
          {filtered.map((tip) => (
            <div key={tip.id} className="modal-list-item">
              <span className="modal-list-text">{tip.nome}</span>
              <div className="modal-list-actions">
                <button
                  type="button"
                  className="item-add-button"
                  onClick={() => {
                    const nuovo = window.prompt('Nuovo nome tipologia', tip.nome);
                    if (!nuovo) return;
                    const trimmed = nuovo.trim();
                    if (!trimmed) return;
                    updateTipologia(tip.id, trimmed);
                  }}
                >
                  Modifica
                </button>
                <button
                  type="button"
                  className="btn-danger"
                  onClick={() => {
                    if (window.confirm('Eliminare questa tipologia?')) {
                      deleteTipologia(tip.id);
                    }
                  }}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
        <label className="modal-field">
          <span>Nuova tipologia</span>
          <input
            value={nomeNuova}
            onChange={(event) => setNomeNuova(event.target.value)}
            className="modal-input"
          />
        </label>
        <div className="modal-actions-inline">
          <button
            type="button"
            className="item-add-button"
            onClick={() => {
              const trimmed = nomeNuova.trim();
              if (!trimmed) return;
              addTipologia(trimmed);
              setNomeNuova('');
            }}
          >
            Salva tipologia
          </button>
        </div>
      </div>
      <div className="modal-actions">
        <button type="button" className="btn-secondary" onClick={onClose}>
          Chiudi
        </button>
      </div>
    </AppModal>
  );
}

export default TypesManagerModal;
