import type { Bucket, Transaction } from '../types';

export function bucketBalance(tx: Transaction[], bucket: Bucket): number {
  let n = 0;
  for (const t of tx) {
    if (t.type === 'income' && t.bucket === bucket) n += t.amount;
    else if (t.type === 'expense' && t.bucket === bucket) n -= t.amount;
    else if (t.type === 'transfer') {
      if (t.bucket === bucket) n -= t.amount;
      if (t.toBucket === bucket) n += t.amount;
    }
  }
  return n;
}

export function totalBalance(tx: Transaction[]): number {
  return bucketBalance(tx, 'bank') + bucketBalance(tx, 'cash');
}

export function sumByType(tx: Transaction[], type: 'income' | 'expense'): number {
  return tx.filter((t) => t.type === type).reduce((s, t) => s + t.amount, 0);
}
