import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  action?: ReactNode;
};

export function SectionTitle({ children, action }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
      }}
    >
      <h2 style={{ fontSize: 16, fontWeight: 700 }}>{children}</h2>
      {action}
    </div>
  );
}
