import type { CSSProperties, ReactNode } from 'react';

type Props = {
  children: ReactNode;
  style?: CSSProperties;
};

export function Card({ children, style }: Props) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        borderRadius: 16,
        border: '1.5px solid var(--border)',
        padding: 20,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
