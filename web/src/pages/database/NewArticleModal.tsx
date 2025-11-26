import { useState } from 'react';
import AppModal from '../../shared/components/AppModal';

interface NewArticleModalProps {
  isOpen: boolean;
  tipologie: { id: string; nome: string }[];
  fornitori: { id: string; nome: string }[];
  onSave: (payload: { nome: string; tipologiaId: string; fornitoreId: string }) => void;
  onClose: () => void;
}

function NewArticleModal({ isOpen, tipologie, fornitori, onSave, onClose }: NewArticleModalProps) {
  const [nome, setNome] = useState('');
  const [tipologiaId, setTipologiaId] = useState('');
  const [fornitoreId, setFornitoreId] = useState('');

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
        <label className="modal-field">
          <span>Fornitore</span>
          <select
            value={fornitoreId}
            onChange={(event) => setFornitoreId(event.target.value)}
            className="modal-select"
          >
            <option value="">Seleziona fornitore</option>
            {fornitori.map((fornitore) => (
              <option key={fornitore.id} value={fornitore.id}>
                {fornitore.nome}
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
            if (!trimmed || !tipologiaId || !fornitoreId) return;
            onSave({ nome: trimmed, tipologiaId, fornitoreId });
            setNome('');
            setTipologiaId('');
            setFornitoreId('');
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
