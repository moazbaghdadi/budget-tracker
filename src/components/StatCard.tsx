import type { ReactNode } from 'react';

type Props = {
  label: string;
  value: string;
  color: string;
  bg: string;
  icon: ReactNode;
};

export function StatCard({ label, value, color, bg, icon }: Props) {
  return (
    <div
      style={{
        background: bg,
        borderRadius: 16,
        padding: '18px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span
          style={{
            color,
            display: 'flex',
            background: 'oklch(100% 0 0 / 0.6)',
            borderRadius: 8,
            padding: 6,
          }}
        >
          {icon}
        </span>
        <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 600 }}>{label}</span>
      </div>
      <span style={{ fontSize: 22, fontWeight: 700, color }}>{value}</span>
    </div>
  );
}
