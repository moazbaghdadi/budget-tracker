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

export type Snapshot = {
  id: string;
  parentId: string | null;
  childIds: string[];
  createdAt: number;
  label: string;
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
