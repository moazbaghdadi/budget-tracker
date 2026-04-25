import type { AppData, Attachment, SnapshotDescriptor, Transaction } from '../types';
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

export function actionToDescriptor(state: AppData, action: Action): SnapshotDescriptor {
  switch (action.kind) {
    case 'addTx': {
      if (action.tx.type === 'transfer' && action.tx.toBucket) {
        return {
          kind: 'addTransfer',
          from: action.tx.bucket,
          to: action.tx.toBucket,
          amount: action.tx.amount,
        };
      }
      if (action.tx.type === 'income') {
        return { kind: 'addIncome', category: action.tx.category, amount: action.tx.amount };
      }
      return { kind: 'addExpense', category: action.tx.category, amount: action.tx.amount };
    }
    case 'deleteTx': {
      const tx = state.tx.find((x) => x.id === action.id);
      if (!tx) return { kind: 'deleteUnknown' };
      if (tx.type === 'transfer' && tx.toBucket) {
        return { kind: 'deleteTransfer', from: tx.bucket, to: tx.toBucket, amount: tx.amount };
      }
      if (tx.type === 'income') {
        return { kind: 'deleteIncome', category: tx.category, amount: tx.amount };
      }
      return { kind: 'deleteExpense', category: tx.category, amount: tx.amount };
    }
    case 'addCategory':
      return { kind: 'addCategory', type: action.type, name: action.name.trim() };
    case 'removeCategory':
      return { kind: 'removeCategory', type: action.type, name: action.name };
    case 'addAttachment':
      return { kind: 'addAttachment', filename: action.attachment.filename };
    case 'removeAttachment': {
      const tx = state.tx.find((x) => x.id === action.txId);
      const att = tx?.attachments.find((a) => a.id === action.attachmentId);
      return { kind: 'removeAttachment', filename: att?.filename ?? null };
    }
  }
}

function bucketLabel(b: 'bank' | 'cash', t: TFn): string {
  return t(b === 'bank' ? 'bucket.bank' : 'bucket.cash');
}

export function formatDescriptor(d: SnapshotDescriptor, t: TFn): string {
  switch (d.kind) {
    case 'root':
      return t('history.rootLabel');
    case 'legacy':
      return d.text;
    case 'addIncome':
      return `${t('undo.addIncome')} · ${d.category} · ${d.amount.toLocaleString('en-US')}`;
    case 'addExpense':
      return `${t('undo.addExpense')} · ${d.category} · ${d.amount.toLocaleString('en-US')}`;
    case 'addTransfer':
      return `${t('undo.addTransfer')} · ${bucketLabel(d.from, t)} → ${bucketLabel(d.to, t)} · ${d.amount.toLocaleString('en-US')}`;
    case 'deleteIncome':
      return `${t('undo.deleteIncome')} · ${d.category} · ${d.amount.toLocaleString('en-US')}`;
    case 'deleteExpense':
      return `${t('undo.deleteExpense')} · ${d.category} · ${d.amount.toLocaleString('en-US')}`;
    case 'deleteTransfer':
      return `${t('undo.deleteTransfer')} · ${bucketLabel(d.from, t)} → ${bucketLabel(d.to, t)} · ${d.amount.toLocaleString('en-US')}`;
    case 'deleteUnknown':
      return t('undo.deleteTx');
    case 'addCategory':
      return `${t(d.type === 'income' ? 'undo.addCatIncome' : 'undo.addCatExpense')} · ${d.name}`;
    case 'removeCategory':
      return `${t(d.type === 'income' ? 'undo.removeCatIncome' : 'undo.removeCatExpense')} · ${d.name}`;
    case 'addAttachment':
      return `${t('undo.addAttachment')} · ${d.filename}`;
    case 'removeAttachment':
      return d.filename === null
        ? t('undo.removeAttachment')
        : `${t('undo.removeAttachment')} · ${d.filename}`;
    case 'restore':
      return `${t('history.restorePrefix')}: ${formatDescriptor(d.target, t)}`;
  }
}

export function describeAction(state: AppData, action: Action, t: TFn): string {
  return formatDescriptor(actionToDescriptor(state, action), t);
}
