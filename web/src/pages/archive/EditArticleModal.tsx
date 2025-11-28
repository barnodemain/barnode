/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import AppModal from '../../shared/components/AppModal';

interface EditArticleModalProps {
  isOpen: boolean;
  article: { id: string; nome: string; tipologiaId: string } | null;
  tipologie: { id: string; nome: string }[];
  onSave: (payload: { id: string; nome: string; tipologiaId: string }) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

function EditArticleModal({
  isOpen,
  article,
  tipologie,
  onSave,
  onDelete,
  onClose,
}: EditArticleModalProps) {
  const [nome, setNome] = useState('');
  const [tipologiaId, setTipologiaId] = useState('');

  useEffect(() => {
    if (isOpen && article) {
      setNome(article.nome);
      setTipologiaId(article.tipologiaId);
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
        <label className="modal-field">
          <span>Tipologia</span>
          <select
            className="modal-input"
            value={tipologiaId}
            onChange={(event) => setTipologiaId(event.target.value)}
          >
            {tipologie.map((tipologia) => (
              <option key={tipologia.id} value={tipologia.id}>
                {tipologia.nome}
              </option>
            ))}
          </select>
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
              if (!trimmed || !tipologiaId) return;
              onSave({ id: article.id, nome: trimmed, tipologiaId });
            }}
          >
            Salva
          </button>
        </div>
      </div>
    </AppModal>
  );
}

export default EditArticleModal;
