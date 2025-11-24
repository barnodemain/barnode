import React from 'react';
import { Feather, SimpleLineIcons } from '@expo/vector-icons';

type IconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number; // accettato per compatibilità, non sempre usato
  style?: any;
};

type FeatherName = React.ComponentProps<typeof Feather>['name'];
type SimpleLineName = React.ComponentProps<typeof SimpleLineIcons>['name'];

const createFeatherIcon = (name: FeatherName): React.FC<IconProps> =>
  function Icon({ size = 22, color, style }: IconProps) {
    return React.createElement(Feather, { name, size, color, style });
  };

const createSimpleLineIcon = (name: SimpleLineName): React.FC<IconProps> =>
  function Icon({ size = 22, color, style }: IconProps) {
    return React.createElement(SimpleLineIcons, { name, size, color, style });
  };

export const HomeIcon = createSimpleLineIcon('home');
export const DatabaseIcon = createSimpleLineIcon('layers');
export const OrdersIcon = createSimpleLineIcon('basket');
export const CheckCircle = createFeatherIcon('check-circle');
export const Search = createFeatherIcon('search');
export const X = createFeatherIcon('x');
export const AlertCircle = createFeatherIcon('alert-circle');
export const PlusCircle = createFeatherIcon('plus-circle');
export const List = createFeatherIcon('list');
export const ArrowLeft = createFeatherIcon('arrow-left');
export const Tag = createFeatherIcon('tag');
export const Truck = createFeatherIcon('truck');
export const Trash = createFeatherIcon('trash-2');
export const Upload = createFeatherIcon('upload-cloud');
export const Edit = createFeatherIcon('edit-2');
