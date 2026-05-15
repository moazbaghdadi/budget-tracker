import type { ComponentType } from 'react';
import type { Screen } from '../types';
import type { MessageKey } from '../i18n/messages';
import { ICats, IDash, IHistory, IImportExport, ISettings, ITrans } from './icons';

export const NAV_ITEMS: ReadonlyArray<{
  id: Screen;
  labelKey: MessageKey;
  Icon: ComponentType<{ s?: number }>;
}> = [
  { id: 'dashboard', labelKey: 'nav.dashboard', Icon: IDash },
  { id: 'transactions', labelKey: 'nav.transactions', Icon: ITrans },
  { id: 'categories', labelKey: 'nav.categories', Icon: ICats },
  { id: 'history', labelKey: 'nav.history', Icon: IHistory },
  { id: 'import-export', labelKey: 'nav.importExport', Icon: IImportExport },
  { id: 'settings', labelKey: 'nav.settings', Icon: ISettings },
];
