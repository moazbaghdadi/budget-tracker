export type TxType = 'income' | 'expense';

export type Transaction = {
  id: string;
  date: string;
  type: TxType;
  category: string;
  description: string;
  amount: number;
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
  schemaVersion: 1;
  history: History;
};

export type Screen = 'dashboard' | 'transactions' | 'categories' | 'history';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';
