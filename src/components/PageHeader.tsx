import type { ReactNode } from 'react';

type Props = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

export function PageHeader({ title, subtitle, action }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
        gap: 16,
        flexWrap: 'wrap',
      }}
    >
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.2 }}>{title}</h1>
        {subtitle && (
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}
