import type { ComponentProps } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Home as HomeIcon,
  Archive as ArchiveIcon,
  Settings as SettingsIcon,
  Search as SearchIcon,
  Trash2 as TrashIcon,
} from 'lucide-react';

export type AppIconName = 'home' | 'archive' | 'settings' | 'search' | 'trash';

const ICON_MAP: Record<AppIconName, LucideIcon> = {
  home: HomeIcon,
  archive: ArchiveIcon,
  settings: SettingsIcon,
  search: SearchIcon,
  trash: TrashIcon,
};

export interface AppIconProps extends ComponentProps<LucideIcon> {
  name: AppIconName;
  size?: number;
}

export function AppIcon({ name, size = 20, ...rest }: AppIconProps) {
  const IconComponent = ICON_MAP[name];
  return <IconComponent width={size} height={size} strokeWidth={1.8} {...rest} />;
}
