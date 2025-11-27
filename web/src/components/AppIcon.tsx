import type { ComponentProps } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Home as HomeIcon,
  Archive as ArchiveIcon,
  Settings as SettingsIcon,
  Search as SearchIcon,
  Trash2 as TrashIcon,
  Plus as PlusIcon,
  Upload as UploadIcon,
  FileText as FileTextIcon,
  Tag as TagIcon,
  Cloud as CloudIcon,
} from 'lucide-react';

export type AppIconName =
  | 'home'
  | 'archive'
  | 'settings'
  | 'search'
  | 'trash'
  | 'plus'
  | 'upload'
  | 'file-text'
  | 'tag'
  | 'cloud';

const ICON_MAP: Record<AppIconName, LucideIcon> = {
  home: HomeIcon,
  archive: ArchiveIcon,
  settings: SettingsIcon,
  search: SearchIcon,
  trash: TrashIcon,
  plus: PlusIcon,
  upload: UploadIcon,
  'file-text': FileTextIcon,
  tag: TagIcon,
  cloud: CloudIcon,
};

export interface AppIconProps extends ComponentProps<LucideIcon> {
  name: AppIconName;
  size?: number;
}

export function AppIcon({ name, size = 20, ...rest }: AppIconProps) {
  const IconComponent = ICON_MAP[name];
  return <IconComponent width={size} height={size} strokeWidth={1.8} {...rest} />;
}
