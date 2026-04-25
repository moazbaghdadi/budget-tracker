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
  | { kind: 'addCategory'; type: 'income' | 'expense'; name: string }
  | { kind: 'removeCategory'; type: 'income' | 'expense'; name: string }
  | { kind: 'addAttachment'; filename: string }
  | { kind: 'removeAttachment'; filename: string | null }
  | { kind: 'restore'; target: SnapshotDescriptor };

export type Snapshot = {
  id: string;
  parentId: string | null;
  childIds: string[];
  createdAt: number;
  label: string;
  descriptor?: SnapshotDescriptor;
  data: AppData;
};

export type History = {
  rootId: string;
  currentId: string;
  nodes: Record<string, Snapshot>;
};

export type DiskFormat = {
  schemaVersion: 3;
  history: History;
};

export type Screen = 'dashboard' | 'transactions' | 'categories' | 'history';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';
