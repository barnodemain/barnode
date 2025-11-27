/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from 'react';
import AppModal from '../../shared/components/AppModal';
import ColorPicker, { DEFAULT_COLORS } from './ColorPicker';
import type { Tipologia } from '../../shared/types/items';

interface TipologiaModalAddProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: { nome: string; colore: string }) => void;
  tipologie: Tipologia[];
}

function TipologiaModalAdd({ isOpen, onClose, onSave, tipologie }: TipologiaModalAddProps) {
  const [nome, setNome] = useState('');
  const [colore, setColore] = useState('#374151');

  const basePalette = DEFAULT_COLORS;

  const effectiveColors = useMemo(() => {
    const usedColors = tipologie.map((t) => t.colore);
    const availableColors = basePalette.filter((color) => !usedColors.includes(color));
    return availableColors.length > 0 ? availableColors : basePalette;
  }, [basePalette, tipologie]);

  useEffect(() => {
    if (isOpen) {
      setNome('');
      setColore(effectiveColors[0] ?? '#374151');
    }
  }, [isOpen, effectiveColors]);

  if (!isOpen) return null;

  const normalizeNome = (value: string) => {
    const lower = value.toLowerCase();
    if (!lower) return '';
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  };

  const handleSave = () => {
    const trimmed = nome.trim();
    if (!trimmed) return;
    const normalized = normalizeNome(trimmed);
    onSave({ nome: normalized, colore });
  };

  return (
    <AppModal isOpen={isOpen} title="Nuova tipologia" onClose={onClose}>
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
          <ColorPicker value={colore} onChange={setColore} colors={effectiveColors} />
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

export default TipologiaModalAdd;
