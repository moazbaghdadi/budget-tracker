import { useState, type ReactNode } from 'react';
import type { Categories, TxType } from '../types';
import { todayIso } from '../lib/format';
import { IClose, IDown, IPlus, IUp } from './icons';
import { inputStyle as inputSt } from './styles';
import { useT } from '../i18n/LangProvider';

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
};

type Props = {
  categories: Categories;
  onAdd: (tx: NewTx) => void;
  onClose: () => void;
};

export function AddTxModal({ categories, onAdd, onClose }: Props) {
  const { t } = useT();
  const [type, setType] = useState<TxType>('income');
  const [cat, setCat] = useState('');
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayIso());
  const [error, setError] = useState('');

  const cats = type === 'income' ? categories.income : categories.expense;

  function handleAdd() {
    if (!cat) return setError(t('modal.error.pickCategory'));
    const num = Number(amount);
    if (!amount || Number.isNaN(num) || num <= 0) return setError(t('modal.error.amount'));
    onAdd({ type, category: cat, description: desc, amount: num, date });
    onClose();
  }

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
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}
        >
          {(
            [
              ['income', t('tx.typeIncome'), <IUp key="up" s={18} />],
              ['expense', t('tx.typeExpense'), <IDown key="down" s={18} />],
            ] as const
          ).map(([v, l, ico]) => (
            <button
              key={v}
              onClick={() => {
                setType(v);
                setCat('');
              }}
              style={{
                padding: '14px',
                borderRadius: 12,
                border: '2px solid',
                borderColor:
                  type === v
                    ? v === 'income'
                      ? 'var(--green)'
                      : 'var(--red)'
                    : 'var(--border)',
                background:
                  type === v
                    ? v === 'income'
                      ? 'var(--green-light)'
                      : 'var(--red-light)'
                    : '#fff',
                color:
                  type === v ? (v === 'income' ? 'var(--green)' : 'var(--red)') : 'var(--text-muted)',
                fontSize: 17,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {ico} {l}
            </button>
          ))}
        </div>

        <FLabel>{t('modal.field.category')}</FLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {cats.length === 0 && (
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>{t('modal.noCategories')}</p>
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
            background: type === 'income' ? 'var(--green)' : 'var(--red)',
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

