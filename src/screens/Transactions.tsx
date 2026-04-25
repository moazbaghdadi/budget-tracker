import { useState } from 'react';
import type { Attachment, Categories, Transaction } from '../types';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { TxRow } from '../components/TxRow';
import { AddTxModal, type NewTx } from '../components/AddTxModal';
import { AttachmentsModal } from '../components/AttachmentsModal';
import { IPlus, ISearch } from '../components/icons';
import { inputStyle } from '../components/styles';
import { useT } from '../i18n/LangProvider';
import type { MessageKey } from '../i18n/messages';

type Filter = 'all' | 'income' | 'expense';

type Props = {
  transactions: Transaction[];
  categories: Categories;
  onAdd: (tx: NewTx) => void;
  onDelete: (id: string) => void;
  onAddAttachment: (txId: string, attachment: Attachment) => void;
  onRemoveAttachment: (txId: string, attachmentId: string) => void;
};

export function Transactions({
  transactions,
  categories,
  onAdd,
  onDelete,
  onAddAttachment,
  onRemoveAttachment,
}: Props) {
  const { t } = useT();
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [attachmentsTxId, setAttachmentsTxId] = useState<string | null>(null);
  const attachmentsTx = attachmentsTxId
    ? transactions.find((tx) => tx.id === attachmentsTxId) ?? null
    : null;

  const filtered = transactions
    .filter((t) => filter === 'all' || t.type === filter)
    .filter(
      (t) => !search || t.description?.includes(search) || t.category.includes(search),
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      <PageHeader
        title={t('tx.title')}
        subtitle={t('tx.subtitle')}
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
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 16px oklch(42% 0.11 195 / 0.3)',
            }}
          >
            <IPlus s={20} /> {t('tx.add')}
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
              ['all', 'tx.filterAll'],
              ['income', 'tx.filterIncome'],
              ['expense', 'tx.filterExpense'],
            ] as const satisfies ReadonlyArray<readonly [Filter, MessageKey]>
          ).map(([v, key]) => (
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
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {t(key)}
            </button>
          ))}
        </div>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <span
            style={{
              position: 'absolute',
              top: '50%',
              insetInlineStart: 14,
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              pointerEvents: 'none',
            }}
          >
            <ISearch s={18} />
          </span>
          <input
            aria-label={t('tx.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('tx.searchPlaceholder')}
            style={{
              ...inputStyle,
              marginBottom: 0,
              paddingInlineStart: 42,
              paddingTop: 10,
              paddingBottom: 10,
            }}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState msg={t('tx.empty')} />
      ) : (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg)', borderBottom: '2px solid var(--border)' }}>
                {(
                  [
                    'tx.col.date',
                    'tx.col.type',
                    'tx.col.category',
                    'tx.col.description',
                    'tx.col.amount',
                    null,
                  ] as const satisfies ReadonlyArray<MessageKey | null>
                ).map((key, i) => (
                  <th
                    key={i}
                    style={{
                      padding: '14px 16px',
                      fontSize: 13,
                      fontWeight: 700,
                      color: 'var(--text-muted)',
                      textAlign: 'start',
                    }}
                  >
                    {key ? t(key) : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <TxRow
                  key={t.id}
                  t={t}
                  onDelete={onDelete}
                  onOpenAttachments={setAttachmentsTxId}
                  tableMode
                />
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

      {attachmentsTx && (
        <AttachmentsModal
          tx={attachmentsTx}
          onAdd={(a) => onAddAttachment(attachmentsTx.id, a)}
          onRemove={(id) => onRemoveAttachment(attachmentsTx.id, id)}
          onClose={() => setAttachmentsTxId(null)}
        />
      )}
    </div>
  );
}
