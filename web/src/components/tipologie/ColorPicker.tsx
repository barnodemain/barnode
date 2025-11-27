import type React from 'react';

export interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  colors?: string[];
}

export const DEFAULT_COLORS: string[] = [
  '#D7263D',
  '#F46036',
  '#EFB700',
  '#2E8540',
  '#2D9CDB',
  '#1B4D89',
  '#7B2CBF',
  '#C32BAD',
  '#5C3C0D',
  '#374151',
];

const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange, colors }) => {
  const palette = colors && colors.length > 0 ? colors : DEFAULT_COLORS;

  return (
    <div className="bn-color-picker-row">
      {palette.map((color) => {
        const isActive = color === value;
        return (
          <button
            key={color}
            type="button"
            className={isActive ? 'bn-color-swatch bn-color-swatch--selected' : 'bn-color-swatch'}
            onClick={() => onChange(color)}
            style={{ backgroundColor: color }}
            aria-label={color}
          />
        );
      })}
    </div>
  );
};

export default ColorPicker;
