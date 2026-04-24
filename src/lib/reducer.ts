import type { AppData, Transaction, TxType } from '../types';

export type Action =
  | { kind: 'addTx'; tx: Omit<Transaction, 'id'>; id: string }
  | { kind: 'deleteTx'; id: string }
  | { kind: 'addCategory'; type: TxType; name: string }
  | { kind: 'removeCategory'; type: TxType; name: string };

export const INIT_DATA: AppData = {
  cats: {
    income: ['التبرعات', 'رسوم العضوية', 'الفعاليات', 'النوادي'],
    expense: ['الإيجار والمرافق', 'اللوازم المكتبية', 'الرواتب'],
  },
  tx: [
    {
      id: 'seed-1',
      date: '2026-04-01',
      type: 'income',
      category: 'التبرعات',
      description: 'تبرع شهري من أحد الأعضاء',
      amount: 500,
    },
    {
      id: 'seed-2',
      date: '2026-04-03',
      type: 'expense',
      category: 'الإيجار والمرافق',
      description: 'إيجار المكتب — أبريل',
      amount: 350,
    },
    {
      id: 'seed-3',
      date: '2026-04-05',
      type: 'income',
      category: 'رسوم العضوية',
      description: 'رسوم عضوية أبريل',
      amount: 200,
    },
    {
      id: 'seed-4',
      date: '2026-04-10',
      type: 'expense',
      category: 'اللوازم المكتبية',
      description: 'ورق وطابعة',
      amount: 45,
    },
    {
      id: 'seed-5',
      date: '2026-03-15',
      type: 'income',
      category: 'الفعاليات',
      description: 'حفل جمع التبرعات',
      amount: 800,
    },
    {
      id: 'seed-6',
      date: '2026-03-20',
      type: 'expense',
      category: 'الرواتب',
      description: 'رواتب شهر مارس',
      amount: 600,
    },
    {
      id: 'seed-7',
      date: '2026-02-10',
      type: 'income',
      category: 'التبرعات',
      description: 'تبرع من شركة محلية',
      amount: 1200,
    },
    {
      id: 'seed-8',
      date: '2026-02-18',
      type: 'expense',
      category: 'الإيجار والمرافق',
      description: 'فاتورة الكهرباء',
      amount: 95,
    },
  ],
};

function trimmedNonEmpty(s: string): string | null {
  const t = s.trim();
  return t.length === 0 ? null : t;
}

export function reduce(state: AppData, action: Action): AppData {
  switch (action.kind) {
    case 'addTx': {
      const tx: Transaction = { ...action.tx, id: action.id };
      return { ...state, tx: [...state.tx, tx] };
    }
    case 'deleteTx': {
      return { ...state, tx: state.tx.filter((t) => t.id !== action.id) };
    }
    case 'addCategory': {
      const name = trimmedNonEmpty(action.name);
      if (!name) return state;
      if (state.cats[action.type].includes(name)) return state;
      return {
        ...state,
        cats: { ...state.cats, [action.type]: [...state.cats[action.type], name] },
      };
    }
    case 'removeCategory': {
      const list = state.cats[action.type];
      if (!list.includes(action.name)) return state;
      return {
        ...state,
        cats: {
          ...state.cats,
          [action.type]: list.filter((c) => c !== action.name),
        },
      };
    }
  }
}

export function describeAction(state: AppData, action: Action): string {
  switch (action.kind) {
    case 'addTx': {
      const verb = action.tx.type === 'income' ? 'إضافة دخل' : 'إضافة مصروف';
      return `${verb} · ${action.tx.category} · ${action.tx.amount.toLocaleString('en-US')}`;
    }
    case 'deleteTx': {
      const t = state.tx.find((x) => x.id === action.id);
      if (!t) return 'حذف معاملة';
      const verb = t.type === 'income' ? 'حذف دخل' : 'حذف مصروف';
      return `${verb} · ${t.category} · ${t.amount.toLocaleString('en-US')}`;
    }
    case 'addCategory':
      return `إضافة فئة ${action.type === 'income' ? 'دخل' : 'مصروف'} · ${action.name.trim()}`;
    case 'removeCategory':
      return `حذف فئة ${action.type === 'income' ? 'دخل' : 'مصروف'} · ${action.name}`;
  }
}
