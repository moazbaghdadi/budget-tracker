import type { ComponentType } from 'react';
import type { Screen } from '../types';
import { ICats, IDash, IHistory, ITrans } from './icons';

export const NAV_ITEMS: ReadonlyArray<{
  id: Screen;
  label: string;
  Icon: ComponentType<{ s?: number }>;
}> = [
  { id: 'dashboard', label: 'لوحة التحكم', Icon: IDash },
  { id: 'transactions', label: 'المعاملات', Icon: ITrans },
  { id: 'categories', label: 'الفئات', Icon: ICats },
  { id: 'history', label: 'السجل', Icon: IHistory },
];
