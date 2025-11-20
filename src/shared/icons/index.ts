import React from 'react';

type IconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: any;
};

// Placeholder neutro: non mostra icone reali, ma evita crash e mantiene le API.
const BaseIcon: React.FC<IconProps> = () => null;

export const HomeIcon = BaseIcon;
export const DatabaseIcon = BaseIcon;
export const OrdersIcon = BaseIcon;
export const CheckCircle = BaseIcon;
export const Search = BaseIcon;
export const X = BaseIcon;
export const AlertCircle = BaseIcon;
export const PlusCircle = BaseIcon;
export const List = BaseIcon;
export const ArrowLeft = BaseIcon;
export const Tag = BaseIcon;
export const Truck = BaseIcon;
