import { describe, it, expect } from 'vitest';
import { reduce, describeAction, INIT_DATA, type Action } from './reducer';
import type { AppData } from '../types';

const blank: AppData = { tx: [], cats: { income: [], expense: [] } };

describe('reduce: addTx', () => {
  it('appends a transaction with the provided id', () => {
    const a: Action = {
      kind: 'addTx',
      id: 'abc',
      tx: { date: '2026-04-10', type: 'income', category: 'X', description: '', amount: 10 },
    };
    const next = reduce(blank, a);
    expect(next.tx).toHaveLength(1);
    expect(next.tx[0].id).toBe('abc');
    expect(next.tx[0].amount).toBe(10);
  });

  it('does not mutate the input state', () => {
    const before = JSON.stringify(blank);
    reduce(blank, {
      kind: 'addTx',
      id: 'abc',
      tx: { date: '2026-04-10', type: 'income', category: 'X', description: '', amount: 10 },
    });
    expect(JSON.stringify(blank)).toBe(before);
  });
});

describe('reduce: deleteTx', () => {
  const seeded: AppData = {
    cats: { income: [], expense: [] },
    tx: [
      { id: '1', date: '2026-04-01', type: 'income', category: 'X', description: '', amount: 10 },
      { id: '2', date: '2026-04-02', type: 'expense', category: 'Y', description: '', amount: 20 },
    ],
  };

  it('removes the matching id', () => {
    const next = reduce(seeded, { kind: 'deleteTx', id: '1' });
    expect(next.tx).toHaveLength(1);
    expect(next.tx[0].id).toBe('2');
  });

  it('is a no-op if id is missing', () => {
    const next = reduce(seeded, { kind: 'deleteTx', id: 'nope' });
    expect(next.tx).toHaveLength(2);
  });
});

describe('reduce: addCategory', () => {
  it('appends a trimmed name', () => {
    const next = reduce(blank, { kind: 'addCategory', type: 'income', name: '  مرتبات  ' });
    expect(next.cats.income).toEqual(['مرتبات']);
  });
  it('rejects empty / whitespace-only names', () => {
    expect(reduce(blank, { kind: 'addCategory', type: 'income', name: '' })).toBe(blank);
    expect(reduce(blank, { kind: 'addCategory', type: 'income', name: '   ' })).toBe(blank);
  });
  it('rejects duplicates within the same type', () => {
    const seeded = reduce(blank, { kind: 'addCategory', type: 'income', name: 'A' });
    const again = reduce(seeded, { kind: 'addCategory', type: 'income', name: 'A' });
    expect(again).toBe(seeded);
  });
  it('allows the same name across different types', () => {
    const a = reduce(blank, { kind: 'addCategory', type: 'income', name: 'A' });
    const b = reduce(a, { kind: 'addCategory', type: 'expense', name: 'A' });
    expect(b.cats.income).toEqual(['A']);
    expect(b.cats.expense).toEqual(['A']);
  });
});

describe('reduce: removeCategory', () => {
  it('removes only the matching name from the right type', () => {
    const seeded: AppData = {
      tx: [],
      cats: { income: ['A', 'B'], expense: ['A'] },
    };
    const next = reduce(seeded, { kind: 'removeCategory', type: 'income', name: 'A' });
    expect(next.cats.income).toEqual(['B']);
    expect(next.cats.expense).toEqual(['A']);
  });
  it('is a no-op if missing', () => {
    const seeded: AppData = { tx: [], cats: { income: ['A'], expense: [] } };
    const next = reduce(seeded, { kind: 'removeCategory', type: 'income', name: 'Z' });
    expect(next).toBe(seeded);
  });
});

describe('describeAction', () => {
  it('describes addTx with type, category, and amount', () => {
    const s = describeAction(blank, {
      kind: 'addTx',
      id: 'x',
      tx: { date: '2026-04-10', type: 'income', category: 'التبرعات', description: '', amount: 500 },
    });
    expect(s).toContain('إضافة دخل');
    expect(s).toContain('التبرعات');
    expect(s).toContain('500');
  });

  it('describes deleteTx using the existing transaction', () => {
    const seeded: AppData = {
      cats: { income: [], expense: [] },
      tx: [
        {
          id: '1',
          date: '2026-04-01',
          type: 'expense',
          category: 'الإيجار',
          description: '',
          amount: 350,
        },
      ],
    };
    const s = describeAction(seeded, { kind: 'deleteTx', id: '1' });
    expect(s).toContain('حذف مصروف');
    expect(s).toContain('الإيجار');
  });

  it('falls back gracefully when deleteTx target is missing', () => {
    const s = describeAction(blank, { kind: 'deleteTx', id: 'missing' });
    expect(s).toBe('حذف معاملة');
  });
});

describe('INIT_DATA', () => {
  it('matches the design seed data shape', () => {
    expect(INIT_DATA.tx.length).toBeGreaterThan(0);
    expect(INIT_DATA.cats.income).toContain('التبرعات');
    expect(INIT_DATA.cats.expense).toContain('الإيجار والمرافق');
    INIT_DATA.tx.forEach((t) => {
      expect(t.id).toMatch(/^seed-/);
      expect(['income', 'expense']).toContain(t.type);
    });
  });
});
