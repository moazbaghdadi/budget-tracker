import { useState, type ReactNode } from 'react';
import type { Categories as Cats, TxType } from '../types';
import { Card } from '../components/Card';
import { PageHeader } from '../components/PageHeader';
import { IDown, IPlus, ITrash, IUp } from '../components/icons';
import { inputStyle } from '../components/styles';

type Props = {
  categories: Cats;
  onAdd: (type: TxType, name: string) => void;
  onRemove: (type: TxType, name: string) => void;
};

export function CategoriesScreen({ categories, onAdd, onRemove }: Props) {
  const [newI, setNewI] = useState('');
  const [newE, setNewE] = useState('');

  return (
    <div>
      <PageHeader
        title="إدارة الفئات"
        subtitle="الفئات تظهر تلقائيًا عند إضافة معاملة جديدة"
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <CatSection
          title="فئات الدخل"
          color="var(--green)"
          bg="var(--green-light)"
          items={categories.income}
          newVal={newI}
          setNewVal={setNewI}
          onAdd={() => {
            onAdd('income', newI);
            setNewI('');
          }}
          onRemove={(name) => onRemove('income', name)}
          icon={<IUp s={18} />}
        />
        <CatSection
          title="فئات المصروفات"
          color="var(--red)"
          bg="var(--red-light)"
          items={categories.expense}
          newVal={newE}
          setNewVal={setNewE}
          onAdd={() => {
            onAdd('expense', newE);
            setNewE('');
          }}
          onRemove={(name) => onRemove('expense', name)}
          icon={<IDown s={18} />}
        />
      </div>
    </div>
  );
}

type SectionProps = {
  title: string;
  color: string;
  bg: string;
  items: string[];
  newVal: string;
  setNewVal: (v: string) => void;
  onAdd: () => void;
  onRemove: (name: string) => void;
  icon: ReactNode;
};

function CatSection({
  title,
  color,
  bg,
  items,
  newVal,
  setNewVal,
  onAdd,
  onRemove,
  icon,
}: SectionProps) {
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <span
          style={{
            color,
            display: 'flex',
            background: bg,
            borderRadius: 10,
            padding: 8,
          }}
        >
          {icon}
        </span>
        <h2 style={{ fontSize: 17, fontWeight: 700, color }}>{title}</h2>
        <span
          style={{
            marginRight: 'auto',
            background: bg,
            color,
            borderRadius: 20,
            padding: '2px 10px',
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {items.length}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {items.map((item) => (
          <div
            key={item}
            style={{
              background: 'var(--bg)',
              borderRadius: 12,
              padding: '13px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: 15, fontWeight: 600 }}>{item}</span>
            <button
              aria-label={`حذف الفئة ${item}`}
              onClick={() => onRemove(item)}
              style={{
                background: 'var(--red-light)',
                border: 'none',
                borderRadius: 8,
                width: 34,
                height: 34,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--red)',
              }}
            >
              <ITrash s={16} />
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: 14,
              textAlign: 'center',
              padding: '16px 0',
            }}
          >
            لا توجد فئات بعد
          </p>
        )}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <input
          aria-label="اسم الفئة الجديدة"
          value={newVal}
          onChange={(e) => setNewVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onAdd()}
          placeholder="اسم الفئة الجديدة..."
          style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
        />
        <button
          aria-label="إضافة فئة"
          onClick={onAdd}
          style={{
            padding: '0 18px',
            borderRadius: 12,
            border: 'none',
            background: color,
            color: '#fff',
            fontFamily: 'IBM Plex Sans Arabic, sans-serif',
            fontSize: 22,
            fontWeight: 700,
            cursor: 'pointer',
            flexShrink: 0,
            height: 52,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IPlus s={20} />
        </button>
      </div>
    </Card>
  );
}
