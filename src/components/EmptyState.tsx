type Props = {
  msg: string;
};

export function EmptyState({ msg }: Props) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
      <div style={{ fontSize: 44, marginBottom: 10 }} aria-hidden>
        📋
      </div>
      <p style={{ fontSize: 16 }}>{msg}</p>
    </div>
  );
}
