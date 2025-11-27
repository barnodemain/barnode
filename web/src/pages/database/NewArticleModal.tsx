import { useState } from 'react';
import AppModal from '../../shared/components/AppModal';

interface NewArticleModalProps {
  isOpen: boolean;
  tipologie: { id: string; nome: string }[];
  onSave: (payload: { nome: string; tipologiaId: string }) => void;
  onClose: () => void;
}

function NewArticleModal({ isOpen, tipologie, onSave, onClose }: NewArticleModalProps) {
  const [nome, setNome] = useState('');
  const [tipologiaId, setTipologiaId] = useState('');

  if (!isOpen) return null;

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
            value={tipologiaId}
            onChange={(event) => setTipologiaId(event.target.value)}
            className="modal-select"
          >
            <option value="">Seleziona tipologia</option>
            {tipologie.map((tipologia) => (
              <option key={tipologia.id} value={tipologia.id}>
                {tipologia.nome}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="modal-actions">
        <button
          type="button"
          className="btn-primary"
          onClick={() => {
            const trimmed = nome.trim();
            if (!trimmed || !tipologiaId) return;
            onSave({ nome: trimmed, tipologiaId });
            setNome('');
            setTipologiaId('');
          }}
        >
          Salva
        </button>
        <button type="button" className="btn-secondary btn-secondary-danger" onClick={onClose}>
          Annulla
        </button>
      </div>
    </AppModal>
  );
}

export default NewArticleModal;
