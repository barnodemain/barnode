/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import AppModal from '../../shared/components/AppModal';

interface EditArticleModalProps {
  isOpen: boolean;
  article: { id: string; nome: string } | null;
  onSave: (id: string, nuovoNome: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

function EditArticleModal({ isOpen, article, onSave, onDelete, onClose }: EditArticleModalProps) {
  const [nome, setNome] = useState('');

  useEffect(() => {
    if (isOpen && article) {
      setNome(article.nome);
    }
  }, [isOpen, article]);

  if (!isOpen || !article) return null;

  return (
    <AppModal isOpen={isOpen} title="Modifica articolo" onClose={onClose}>
      <div className="modal-body-fields">
        <label className="modal-field">
          <span>Nome articolo</span>
          <input
            value={nome}
            onChange={(event) => setNome(event.target.value)}
            className="modal-input"
          />
        </label>
      </div>
      <div className="modal-actions modal-actions-edit">
        <button type="button" className="btn-danger" onClick={() => onDelete(article.id)}>
          Elimina
        </button>
        <div className="modal-actions-edit-right">
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              const trimmed = nome.trim();
              if (!trimmed) return;
              onSave(article.id, trimmed);
            }}
          >
            Salva
          </button>
          <button type="button" className="btn-secondary btn-outline-danger" onClick={onClose}>
            Annulla
          </button>
        </div>
      </div>
    </AppModal>
  );
}

export default EditArticleModal;
