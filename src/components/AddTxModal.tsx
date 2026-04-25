import { useState, type ReactNode } from 'react';
import type { Attachment, Bucket, Categories, TxType } from '../types';
import { todayIso } from '../lib/format';
import { IClose, IDown, IPlus, ITrans, IUp } from './icons';
import { inputStyle as inputSt } from './styles';
import { useT } from '../i18n/LangProvider';
import { AttachmentsList } from './AttachmentsList';
import type { MessageKey } from '../i18n/messages';

function FLabel({ children }: { children: ReactNode }) {
  return (
    <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text-muted)' }}>
      {children}
    </p>
  );
}

export type NewTx = {
  type: TxType;
  category: string;
  description: string;
  amount: number;
  date: string;
  attachments: Attachment[];
  bucket: Bucket;
  toBucket?: Bucket;
};

type Props = {
  categories: Categories;
  onAdd: (tx: NewTx) => void;
  onClose: () => void;
};

const BUCKETS: ReadonlyArray<readonly [Bucket, MessageKey]> = [
  ['bank', 'bucket.bank'],
  ['cash', 'bucket.cash'],
];

function flip(b: Bucket): Bucket {
  return b === 'bank' ? 'cash' : 'bank';
}

export function AddTxModal({ categories, onAdd, onClose }: Props) {
  const { t } = useT();
  const [type, setType] = useState<TxType>('income');
  const [bucket, setBucket] = useState<Bucket>('bank');
  const [toBucket, setToBucket] = useState<Bucket>('cash');
  const [cat, setCat] = useState('');
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayIso());
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [error, setError] = useState('');

  const isTransfer = type === 'transfer';
  const cats = type === 'income' ? categories.income : type === 'expense' ? categories.expense : [];

  function pickFromBucket(next: Bucket) {
    setBucket(next);
    if (next === toBucket) setToBucket(flip(next));
  }
  function pickToBucket(next: Bucket) {
    setToBucket(next);
    if (next === bucket) setBucket(flip(next));
  }

  function handleAdd() {
    if (!isTransfer && !cat) return setError(t('modal.error.pickCategory'));
    const num = Number(amount);
    if (!amount || Number.isNaN(num) || num <= 0) return setError(t('modal.error.amount'));
    const tx: NewTx = {
      type,
      category: isTransfer ? '' : cat,
      description: desc,
      amount: num,
      date,
      attachments,
      bucket,
      ...(isTransfer ? { toBucket } : {}),
    };
    onAdd(tx);
    onClose();
  }

  const accent =
    type === 'income' ? 'var(--green)' : type === 'expense' ? 'var(--red)' : 'var(--teal)';
  const accentLight =
    type === 'income'
      ? 'var(--green-light)'
      : type === 'expense'
        ? 'var(--red-light)'
        : 'var(--teal-light)';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="addtx-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'oklch(0% 0 0 / 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 20,
          width: '100%',
          maxWidth: 520,
          padding: '28px 24px 32px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 24px 80px oklch(0% 0 0 / 0.2)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
          }}
        >
          <h2 id="addtx-title" style={{ fontSize: 22, fontWeight: 700 }}>
            {t('modal.tx.title')}
          </h2>
          <button
            aria-label={t('modal.close')}
            onClick={onClose}
            style={{
              background: 'var(--border)',
              border: 'none',
              borderRadius: 10,
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <IClose />
          </button>
        </div>

        <FLabel>{t('modal.field.type')}</FLabel>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 10,
            marginBottom: 20,
          }}
        >
          {(
            [
              ['income', t('tx.typeIncome'), <IUp key="up" s={18} />, 'var(--green)', 'var(--green-light)'],
              ['expense', t('tx.typeExpense'), <IDown key="down" s={18} />, 'var(--red)', 'var(--red-light)'],
              ['transfer', t('tx.typeTransfer'), <ITrans key="trans" s={18} />, 'var(--teal)', 'var(--teal-light)'],
            ] as const
          ).map(([v, l, ico, c, lc]) => (
            <button
              key={v}
              onClick={() => {
                setType(v);
                setCat('');
                setError('');
              }}
              style={{
                padding: '14px 8px',
                borderRadius: 12,
                border: '2px solid',
                borderColor: type === v ? c : 'var(--border)',
                background: type === v ? lc : '#fff',
                color: type === v ? c : 'var(--text-muted)',
                fontSize: 16,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              {ico} {l}
            </button>
          ))}
        </div>

        {isTransfer ? (
          <>
            <FLabel>{t('modal.field.fromBucket')}</FLabel>
            <BucketSelect
              value={bucket}
              onChange={pickFromBucket}
              accent={accent}
              accentLight={accentLight}
              t={t}
            />
            <FLabel>{t('modal.field.toBucket')}</FLabel>
            <BucketSelect
              value={toBucket}
              onChange={pickToBucket}
              accent={accent}
              accentLight={accentLight}
              t={t}
            />
          </>
        ) : (
          <>
            <FLabel>{t('modal.field.bucket')}</FLabel>
            <BucketSelect
              value={bucket}
              onChange={setBucket}
              accent={accent}
              accentLight={accentLight}
              t={t}
            />

            <FLabel>{t('modal.field.category')}</FLabel>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {cats.length === 0 && (
                <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
                  {t('modal.noCategories')}
                </p>
              )}
              {cats.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 10,
                    border: '2px solid',
                    borderColor: cat === c ? 'var(--teal)' : 'var(--border)',
                    background: cat === c ? 'var(--teal-light)' : '#fff',
                    color: cat === c ? 'var(--teal)' : 'var(--text)',
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </>
        )}

        <FLabel>{t('modal.field.description')}</FLabel>
        <input
          aria-label={t('modal.field.descriptionShort')}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder={t('modal.field.descPlaceholder')}
          style={inputSt}
        />

        <FLabel>{t('modal.field.amount')}</FLabel>
        <input
          aria-label={t('modal.field.amountShort')}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          type="number"
          min={0}
          placeholder="0.00"
          style={{
            ...inputSt,
            fontSize: 26,
            fontWeight: 700,
            textAlign: 'center',
            direction: 'ltr',
          }}
        />

        <FLabel>{t('modal.field.date')}</FLabel>
        <input
          aria-label={t('modal.field.date')}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          type="date"
          style={{ ...inputSt, direction: 'ltr', textAlign: 'start' }}
        />

        <FLabel>{t('modal.field.attachments')}</FLabel>
        <AttachmentsList
          attachments={attachments}
          onAdd={(a) => setAttachments((prev) => [...prev, a])}
          onRemove={(id) => setAttachments((prev) => prev.filter((a) => a.id !== id))}
        />

        {error && (
          <p
            role="alert"
            style={{
              color: 'var(--red)',
              fontSize: 14,
              marginBottom: 12,
              textAlign: 'center',
            }}
          >
            {error}
          </p>
        )}

        <button
          onClick={handleAdd}
          style={{
            width: '100%',
            padding: '18px',
            borderRadius: 14,
            border: 'none',
            background: accent,
            color: '#fff',
            fontSize: 18,
            fontWeight: 700,
            cursor: 'pointer',
            marginTop: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <IPlus s={20} /> {t('modal.save')}
        </button>
      </div>
    </div>
  );
}

function BucketSelect({
  value,
  onChange,
  accent,
  accentLight,
  t,
}: {
  value: Bucket;
  onChange: (b: Bucket) => void;
  accent: string;
  accentLight: string;
  t: (k: MessageKey) => string;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 10,
        marginBottom: 20,
      }}
    >
      {BUCKETS.map(([v, key]) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          style={{
            padding: '12px',
            borderRadius: 12,
            border: '2px solid',
            borderColor: value === v ? accent : 'var(--border)',
            background: value === v ? accentLight : '#fff',
            color: value === v ? accent : 'var(--text-muted)',
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {t(key)}
        </button>
      ))}
    </div>
  );
}
