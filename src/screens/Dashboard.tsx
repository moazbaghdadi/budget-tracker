import type { Transaction, Screen } from '../types';
import { AR_MONTHS, fmt, fmtA, parseDate } from '../lib/format';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { SectionTitle } from '../components/SectionTitle';
import { StatCard } from '../components/StatCard';
import { TxRow } from '../components/TxRow';
import { IDown, IUp } from '../components/icons';

type Props = {
  transactions: Transaction[];
  setScreen: (s: Screen) => void;
};

function sumByType(arr: Transaction[], type: 'income' | 'expense'): number {
  return arr.filter((t) => t.type === type).reduce((s, t) => s + t.amount, 0);
}

export function Dashboard({ transactions, setScreen }: Props) {
  const now = new Date();
  const cm = now.getMonth();
  const cy = now.getFullYear();

  const monthly = transactions.filter((t) => {
    const d = parseDate(t.date);
    return d.getMonth() === cm && d.getFullYear() === cy;
  });
  const yearly = transactions.filter((t) => parseDate(t.date).getFullYear() === cy);

  const mI = sumByType(monthly, 'income');
  const mE = sumByType(monthly, 'expense');
  const mN = mI - mE;
  const yI = sumByType(yearly, 'income');
  const yE = sumByType(yearly, 'expense');
  const total = sumByType(transactions, 'income') - sumByType(transactions, 'expense');

  const recent = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);

  const catTotals: Record<string, number> = {};
  yearly
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      catTotals[t.category] = (catTotals[t.category] ?? 0) + t.amount;
    });
  const catEntries = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
  const maxCat = catEntries[0]?.[1] ?? 1;

  return (
    <div>
      <div
        style={{
          background: 'var(--teal)',
          color: '#fff',
          borderRadius: 20,
          padding: '32px 32px',
          marginBottom: 28,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: -40,
            left: -40,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'oklch(100% 0 0 / 0.05)',
          }}
        />
        <div
          aria-hidden
          style={{
            position: 'absolute',
            bottom: -60,
            right: -20,
            width: 240,
            height: 240,
            borderRadius: '50%',
            background: 'oklch(100% 0 0 / 0.04)',
          }}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <p style={{ fontSize: 14, opacity: 0.8, marginBottom: 8 }}>الرصيد الإجمالي</p>
            <p style={{ fontSize: 52, fontWeight: 700, letterSpacing: -1 }}>{fmt(total)}</p>
            <p style={{ fontSize: 13, opacity: 0.7, marginTop: 8 }}>
              {AR_MONTHS[cm]} {cy}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 12, opacity: 0.75, marginBottom: 4 }}>دخل الشهر</p>
              <p style={{ fontSize: 22, fontWeight: 700 }}>{fmtA(mI)}</p>
            </div>
            <div style={{ width: 1, height: 44, background: 'oklch(100% 0 0 / 0.2)' }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 12, opacity: 0.75, marginBottom: 4 }}>مصروف الشهر</p>
              <p style={{ fontSize: 22, fontWeight: 700 }}>{fmtA(mE)}</p>
            </div>
            <div style={{ width: 1, height: 44, background: 'oklch(100% 0 0 / 0.2)' }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 12, opacity: 0.75, marginBottom: 4 }}>صافي الشهر</p>
              <p
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: mN >= 0 ? '#a8ffce' : '#ffb3a8',
                }}
              >
                {fmt(mN)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 14,
          marginBottom: 24,
        }}
      >
        <StatCard
          label="دخل الشهر"
          value={fmtA(mI)}
          color="var(--green)"
          bg="var(--green-light)"
          icon={<IUp s={18} />}
        />
        <StatCard
          label="مصروف الشهر"
          value={fmtA(mE)}
          color="var(--red)"
          bg="var(--red-light)"
          icon={<IDown s={18} />}
        />
        <StatCard
          label="دخل السنة"
          value={fmtA(yI)}
          color="var(--green)"
          bg="var(--green-light)"
          icon={<IUp s={18} />}
        />
        <StatCard
          label="مصروف السنة"
          value={fmtA(yE)}
          color="var(--red)"
          bg="var(--red-light)"
          icon={<IDown s={18} />}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        <Card>
          <SectionTitle
            action={
              <button
                onClick={() => setScreen('transactions')}
                style={{
                  background: 'var(--teal-light)',
                  border: 'none',
                  borderRadius: 8,
                  padding: '6px 14px',
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--teal)',
                  cursor: 'pointer',
                  fontFamily: 'IBM Plex Sans Arabic, sans-serif',
                }}
              >
                عرض الكل
              </button>
            }
          >
            آخر المعاملات
          </SectionTitle>
          {recent.length === 0 ? (
            <EmptyState msg="لا توجد معاملات بعد" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recent.map((t) => (
                <TxRow key={t.id} t={t} />
              ))}
            </div>
          )}
        </Card>

        <Card style={{ alignSelf: 'start' }}>
          <SectionTitle>المصروفات حسب الفئة</SectionTitle>
          {catEntries.length === 0 ? (
            <EmptyState msg="لا توجد بيانات" />
          ) : (
            catEntries.map(([cat, val]) => (
              <div key={cat} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{cat}</span>
                  <span style={{ fontSize: 14, color: 'var(--red)', fontWeight: 700 }}>
                    {fmtA(val)}
                  </span>
                </div>
                <div style={{ height: 8, background: 'var(--red-light)', borderRadius: 99 }}>
                  <div
                    style={{
                      height: '100%',
                      borderRadius: 99,
                      background: 'var(--red)',
                      width: (val / maxCat) * 100 + '%',
                      transition: 'width 0.6s ease',
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </Card>
      </div>
    </div>
  );
}
