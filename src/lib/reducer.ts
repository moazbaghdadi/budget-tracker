import type { AppData, Attachment, Transaction, TxType } from '../types';
import type { MessageKey } from '../i18n/messages';

type TFn = (key: MessageKey) => string;

export type Action =
  | { kind: 'addTx'; tx: Omit<Transaction, 'id'>; id: string }
  | { kind: 'deleteTx'; id: string }
  | { kind: 'addCategory'; type: TxType; name: string }
  | { kind: 'removeCategory'; type: TxType; name: string }
  | { kind: 'addAttachment'; txId: string; attachment: Attachment }
  | { kind: 'removeAttachment'; txId: string; attachmentId: string };

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
      attachments: [],
    },
    {
      id: 'seed-2',
      date: '2026-04-03',
      type: 'expense',
      category: 'الإيجار والمرافق',
      description: 'إيجار المكتب — أبريل',
      amount: 350,
      attachments: [],
    },
    {
      id: 'seed-3',
      date: '2026-04-05',
      type: 'income',
      category: 'رسوم العضوية',
      description: 'رسوم عضوية أبريل',
      amount: 200,
      attachments: [],
    },
    {
      id: 'seed-4',
      date: '2026-04-10',
      type: 'expense',
      category: 'اللوازم المكتبية',
      description: 'ورق وطابعة',
      amount: 45,
      attachments: [],
    },
    {
      id: 'seed-5',
      date: '2026-03-15',
      type: 'income',
      category: 'الفعاليات',
      description: 'حفل جمع التبرعات',
      amount: 800,
      attachments: [],
    },
    {
      id: 'seed-6',
      date: '2026-03-20',
      type: 'expense',
      category: 'الرواتب',
      description: 'رواتب شهر مارس',
      amount: 600,
      attachments: [],
    },
    {
      id: 'seed-7',
      date: '2026-02-10',
      type: 'income',
      category: 'التبرعات',
      description: 'تبرع من شركة محلية',
      amount: 1200,
      attachments: [],
    },
    {
      id: 'seed-8',
      date: '2026-02-18',
      type: 'expense',
      category: 'الإيجار والمرافق',
      description: 'فاتورة الكهرباء',
      amount: 95,
      attachments: [],
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
    case 'addAttachment': {
      const tx = state.tx.find((t) => t.id === action.txId);
      if (!tx) return state;
      if (tx.attachments.some((a) => a.id === action.attachment.id)) return state;
      return {
        ...state,
        tx: state.tx.map((t) =>
          t.id === action.txId
            ? { ...t, attachments: [...t.attachments, action.attachment] }
            : t,
        ),
      };
    }
    case 'removeAttachment': {
      const tx = state.tx.find((t) => t.id === action.txId);
      if (!tx) return state;
      if (!tx.attachments.some((a) => a.id === action.attachmentId)) return state;
      return {
        ...state,
        tx: state.tx.map((t) =>
          t.id === action.txId
            ? { ...t, attachments: t.attachments.filter((a) => a.id !== action.attachmentId) }
            : t,
        ),
      };
    }
  }
}

export function describeAction(state: AppData, action: Action, t: TFn): string {
  switch (action.kind) {
    case 'addTx': {
      const verb = t(action.tx.type === 'income' ? 'undo.addIncome' : 'undo.addExpense');
      return `${verb} · ${action.tx.category} · ${action.tx.amount.toLocaleString('en-US')}`;
    }
    case 'deleteTx': {
      const tx = state.tx.find((x) => x.id === action.id);
      if (!tx) return t('undo.deleteTx');
      const verb = t(tx.type === 'income' ? 'undo.deleteIncome' : 'undo.deleteExpense');
      return `${verb} · ${tx.category} · ${tx.amount.toLocaleString('en-US')}`;
    }
    case 'addCategory': {
      const verb = t(action.type === 'income' ? 'undo.addCatIncome' : 'undo.addCatExpense');
      return `${verb} · ${action.name.trim()}`;
    }
    case 'removeCategory': {
      const verb = t(action.type === 'income' ? 'undo.removeCatIncome' : 'undo.removeCatExpense');
      return `${verb} · ${action.name}`;
    }
    case 'addAttachment': {
      return `${t('undo.addAttachment')} · ${action.attachment.filename}`;
    }
    case 'removeAttachment': {
      const tx = state.tx.find((x) => x.id === action.txId);
      const att = tx?.attachments.find((a) => a.id === action.attachmentId);
      if (!att) return t('undo.removeAttachment');
      return `${t('undo.removeAttachment')} · ${att.filename}`;
    }
  }
}
