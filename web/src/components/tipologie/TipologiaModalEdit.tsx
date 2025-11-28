/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react';
import AppModal from '../../shared/components/AppModal';
import ColorPicker, { DEFAULT_COLORS } from './ColorPicker';
import type { Tipologia } from '../../shared/types/items';

interface TipologiaModalEditProps {
  isOpen: boolean;
  tipologia: Tipologia | null;
  onClose: () => void;
  onSave: (payload: { id: string; nome: string; colore: string }) => void;
  onDelete: (id: string) => void;
  tipologie: Tipologia[];
}

function TipologiaModalEdit({
  isOpen,
  tipologia,
  onClose,
  onSave,
  onDelete,
  tipologie,
}: TipologiaModalEditProps) {
  const [nome, setNome] = useState('');
  const [colore, setColore] = useState('#374151');

  const basePalette = DEFAULT_COLORS;

  const availableColors = useMemo(() => {
    if (!tipologia) return basePalette;

    const usedColors = tipologie
      .filter((t: Tipologia) => t.id !== tipologia.id)
      .map((t: Tipologia) => t.colore);

    const palette = basePalette.filter(
      (color) => !usedColors.includes(color) || color === tipologia.colore
    );

    return palette.length > 0 ? palette : basePalette;
  }, [basePalette, tipologia, tipologie]);

  useEffect(() => {
    if (isOpen && tipologia) {
      setNome(tipologia.nome);
      const initialColor = tipologia.colore ?? availableColors[0] ?? '#374151';
      setColore(initialColor);
    }
  }, [isOpen, tipologia, availableColors]);

  if (!isOpen || !tipologia) return null;

  const normalizeNome = (value: string) => {
    const lower = value.toLowerCase();
    if (!lower) return '';
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  };

  const handleSave = () => {
    const trimmed = nome.trim();
    if (!trimmed) return;
    const normalized = normalizeNome(trimmed);
    onSave({ id: tipologia.id, nome: normalized, colore });
  };

  const handleDelete = () => {
    if (!tipologia) return;
    if (!window.confirm('Sei sicuro di voler eliminare questa tipologia?')) return;
    onDelete(tipologia.id);
  };

  return (
    <AppModal isOpen={isOpen} title="Modifica tipologia" onClose={onClose}>
      <div className="modal-body-fields">
        <label className="modal-field">
          <span>Nome tipologia</span>
          <input
            value={nome}
            onChange={(event) => setNome(event.target.value)}
            className="modal-input"
          />
        </label>
        <label className="modal-field">
          <span>Colore</span>
          <ColorPicker value={colore} onChange={setColore} colors={availableColors} />
        </label>
      </div>
      <div className="modal-actions modal-actions-edit">
        <button type="button" className="btn-danger" onClick={handleDelete}>
          Elimina
        </button>
        <div className="modal-actions-edit-right">
          <button type="button" className="btn-primary" onClick={handleSave}>
            Aggiorna
          </button>
        </div>
      </div>
    </AppModal>
  );
}

export default TipologiaModalEdit;
