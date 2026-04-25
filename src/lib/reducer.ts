import type { AppData, Attachment, Transaction } from '../types';
import type { MessageKey } from '../i18n/messages';

type TFn = (key: MessageKey) => string;

export type CategoryType = 'income' | 'expense';

export type Action =
  | { kind: 'addTx'; tx: Omit<Transaction, 'id'>; id: string }
  | { kind: 'deleteTx'; id: string }
  | { kind: 'addCategory'; type: CategoryType; name: string }
  | { kind: 'removeCategory'; type: CategoryType; name: string }
  | { kind: 'addAttachment'; txId: string; attachment: Attachment }
  | { kind: 'removeAttachment'; txId: string; attachmentId: string };

export const INIT_DATA: AppData = {
  cats: { income: [], expense: [] },
  tx: [],
};

function trimmedNonEmpty(s: string): string | null {
  const t = s.trim();
  return t.length === 0 ? null : t;
}

export function reduce(state: AppData, action: Action): AppData {
  switch (action.kind) {
    case 'addTx': {
      if (action.tx.type === 'transfer') {
        if (!action.tx.toBucket || action.tx.toBucket === action.tx.bucket) return state;
      }
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
      const amt = action.tx.amount.toLocaleString('en-US');
      if (action.tx.type === 'transfer') {
        const from = t(action.tx.bucket === 'bank' ? 'bucket.bank' : 'bucket.cash');
        const to = t(action.tx.toBucket === 'bank' ? 'bucket.bank' : 'bucket.cash');
        return `${t('undo.addTransfer')} · ${from} → ${to} · ${amt}`;
      }
      const verb = t(action.tx.type === 'income' ? 'undo.addIncome' : 'undo.addExpense');
      return `${verb} · ${action.tx.category} · ${amt}`;
    }
    case 'deleteTx': {
      const tx = state.tx.find((x) => x.id === action.id);
      if (!tx) return t('undo.deleteTx');
      const amt = tx.amount.toLocaleString('en-US');
      if (tx.type === 'transfer') {
        const from = t(tx.bucket === 'bank' ? 'bucket.bank' : 'bucket.cash');
        const to = t(tx.toBucket === 'bank' ? 'bucket.bank' : 'bucket.cash');
        return `${t('undo.deleteTransfer')} · ${from} → ${to} · ${amt}`;
      }
      const verb = t(tx.type === 'income' ? 'undo.deleteIncome' : 'undo.deleteExpense');
      return `${verb} · ${tx.category} · ${amt}`;
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
