export type TxType = 'income' | 'expense' | 'transfer';

export type Bucket = 'bank' | 'cash';

export type Attachment = {
  id: string;
  filename: string;
  ext: string;
};

export type Transaction = {
  id: string;
  date: string;
  type: TxType;
  category: string;
  description: string;
  amount: number;
  attachments: Attachment[];
  bucket: Bucket;
  toBucket?: Bucket;
};

export type Categories = {
  income: string[];
  expense: string[];
};

export type AppData = {
  tx: Transaction[];
  cats: Categories;
};

export type SnapshotDescriptor =
  | { kind: 'root' }
  | { kind: 'legacy'; text: string }
  | { kind: 'addIncome'; category: string; amount: number }
  | { kind: 'addExpense'; category: string; amount: number }
  | { kind: 'addTransfer'; from: Bucket; to: Bucket; amount: number }
  | { kind: 'deleteIncome'; category: string; amount: number }
  | { kind: 'deleteExpense'; category: string; amount: number }
  | { kind: 'deleteTransfer'; from: Bucket; to: Bucket; amount: number }
  | { kind: 'deleteUnknown' }
  | { kind: 'editIncome'; category: string; amount: number }
  | { kind: 'editExpense'; category: string; amount: number }
  | { kind: 'editTransfer'; from: Bucket; to: Bucket; amount: number }
  | { kind: 'addCategory'; type: 'income' | 'expense'; name: string }
  | { kind: 'removeCategory'; type: 'income' | 'expense'; name: string }
  | { kind: 'addAttachment'; filename: string }
  | { kind: 'removeAttachment'; filename: string | null }
  | { kind: 'importAppend'; txCount: number; catCount: number }
  | { kind: 'importReplace'; txCount: number; catCount: number }
  | { kind: 'firstRunSeed'; bank: number; cash: number }
  | { kind: 'restore'; target: SnapshotDescriptor };

export type Snapshot = {
  id: string;
  parentId: string | null;
  childIds: string[];
  createdAt: number;
  label: string;
  descriptor?: SnapshotDescriptor;
  data: AppData;
  // v4 addition. Absent on snapshots authored before the v3→v4 migration; the
  // sync layer treats absent deviceId as "this device" when reconciling.
  deviceId?: string;
};

export type History = {
  rootId: string;
  currentId: string;
  nodes: Record<string, Snapshot>;
};

// Server-state envelope. Absent on disk = local-only mode. Populated when the
// user enables sync from Settings (see docs/sync-architecture.md).
export type ServerState = {
  url: string;
  lastSyncedRev: number;
  pendingPushIds: string[];
};

import type { CurrencyCode } from './lib/currency';

export type DiskFormat = {
  schemaVersion: 5;
  history: History;
  deviceId: string;
  currency: CurrencyCode;
  serverState?: ServerState;
};

export type Screen =
  | 'dashboard'
  | 'transactions'
  | 'categories'
  | 'history'
  | 'import-export'
  | 'settings';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';
