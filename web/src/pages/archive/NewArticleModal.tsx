/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import AppModal from '../../shared/components/AppModal';

interface NewArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: { nome: string; tipologiaId: string }) => void;
  tipologie: { id: string; nome: string }[];
}

function NewArticleModal({ isOpen, onClose, onSave, tipologie }: NewArticleModalProps) {
  const [nome, setNome] = useState('');
  const [tipologiaId, setTipologiaId] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNome('');
      const first = tipologie[0];
      setTipologiaId(first ? first.id : '');
    }
  }, [isOpen, tipologie]);

  if (!isOpen) return null;

  const handleSave = () => {
    const trimmed = nome.trim();
    if (!trimmed || !tipologiaId) return;
    onSave({ nome: trimmed, tipologiaId });
  };

  return (
    <AppModal isOpen={isOpen} title="Aggiungi articolo" onClose={onClose}>
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
        <button type="button" className="btn-secondary btn-outline-danger" onClick={onClose}>
          Annulla
        </button>
        <div className="modal-actions-edit-right">
          <button type="button" className="btn-primary" onClick={handleSave}>
            Salva
          </button>
        </div>
      </div>
    </AppModal>
  );
}

export default NewArticleModal;
