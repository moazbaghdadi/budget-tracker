import { useState } from 'react';
import type { Categories, Transaction } from '../types';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { TxRow } from '../components/TxRow';
import { AddTxModal, type NewTx } from '../components/AddTxModal';
import { IPlus, ISearch } from '../components/icons';
import { inputStyle } from '../components/styles';

type Filter = 'all' | 'income' | 'expense';

type Props = {
  transactions: Transaction[];
  categories: Categories;
  onAdd: (tx: NewTx) => void;
  onDelete: (id: string) => void;
};

export function Transactions({ transactions, categories, onAdd, onDelete }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');

  const filtered = transactions
    .filter((t) => filter === 'all' || t.type === filter)
    .filter(
      (t) => !search || t.description?.includes(search) || t.category.includes(search),
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      <PageHeader
        title="المعاملات"
        subtitle="كل الدخل والمصروفات"
        action={
          <button
            onClick={() => setShowModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 20px',
              borderRadius: 12,
              border: 'none',
              background: 'var(--teal)',
              color: '#fff',
              fontFamily: 'IBM Plex Sans Arabic, sans-serif',
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 16px oklch(42% 0.11 195 / 0.3)',
            }}
          >
            <IPlus s={20} /> إضافة معاملة
          </button>
        }
      />

      <div
        style={{
          display: 'flex',
          gap: 10,
          marginBottom: 20,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', gap: 6 }}>
          {(
            [
              ['all', 'الكل'],
              ['income', 'دخل'],
              ['expense', 'مصروف'],
            ] as const
          ).map(([v, l]) => (
            <button
              key={v}
              onClick={() => setFilter(v)}
              style={{
                padding: '9px 18px',
                borderRadius: 20,
                border: '2px solid',
                borderColor: filter === v ? 'var(--teal)' : 'var(--border)',
                background: filter === v ? 'var(--teal-light)' : '#fff',
                color: filter === v ? 'var(--teal)' : 'var(--text-muted)',
                fontFamily: 'IBM Plex Sans Arabic, sans-serif',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {l}
            </button>
          ))}
        </div>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <span
            style={{
              position: 'absolute',
              top: '50%',
              right: 14,
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              pointerEvents: 'none',
            }}
          >
            <ISearch s={18} />
          </span>
          <input
            aria-label="ابحث"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث..."
            style={{
              ...inputStyle,
              marginBottom: 0,
              paddingRight: 42,
              paddingTop: 10,
              paddingBottom: 10,
            }}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState msg="لا توجد معاملات" />
      ) : (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg)', borderBottom: '2px solid var(--border)' }}>
                {['التاريخ', 'النوع', 'الفئة', 'الوصف', 'المبلغ', ''].map((h, i) => (
                  <th
                    key={i}
                    style={{
                      padding: '14px 16px',
                      fontSize: 13,
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                      textAlign: 'right',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <TxRow key={t.id} t={t} onDelete={onDelete} tableMode />
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {showModal && (
        <AddTxModal
          categories={categories}
          onAdd={onAdd}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
