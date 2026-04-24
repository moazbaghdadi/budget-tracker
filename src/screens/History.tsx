import type { History, Snapshot } from '../types';
import { Card } from '../components/Card';
import { PageHeader } from '../components/PageHeader';
import { listChronological } from '../lib/history';
import { useT } from '../i18n/LangProvider';

type Props = {
  history: History;
  onRestore: (id: string) => void;
};

function fmtTime(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(
    d.getMinutes(),
  )}`;
}

export function HistoryScreen({ history, onRestore }: Props) {
  const { t } = useT();
  // Newest first; current is highlighted.
  const all = listChronological(history).slice().reverse();
  const isCurrent = (s: Snapshot) => s.id === history.currentId;
  const isRoot = (s: Snapshot) => s.id === history.rootId;

  return (
    <div>
      <PageHeader title={t('history.title')} subtitle={t('history.subtitle')} />
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {all.length === 0 ? (
          <p style={{ padding: 24, color: 'var(--text-muted)' }}>{t('history.empty')}</p>
        ) : (
          <div>
            {all.map((s, idx) => (
              <div
                key={s.id}
                data-testid="history-row"
                data-current={isCurrent(s) ? 'true' : 'false'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 18px',
                  borderTop: idx === 0 ? 'none' : '1px solid var(--border)',
                  background: isCurrent(s) ? 'var(--teal-light)' : '#fff',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      marginBottom: 4,
                      color: isCurrent(s) ? 'var(--teal)' : 'var(--text)',
                    }}
                  >
                    {s.label}
                    {isCurrent(s) && (
                      <span
                        style={{
                          marginInlineStart: 8,
                          fontSize: 12,
                          background: 'var(--teal)',
                          color: '#fff',
                          padding: '2px 8px',
                          borderRadius: 99,
                        }}
                      >
                        {t('history.current')}
                      </span>
                    )}
                  </p>
                  <p
                    style={{ fontSize: 12, color: 'var(--text-muted)', direction: 'ltr' }}
                    dir="ltr"
                  >
                    {fmtTime(s.createdAt)}
                  </p>
                </div>
                {!isCurrent(s) && (
                  <button
                    onClick={() => onRestore(s.id)}
                    style={{
                      background: isRoot(s) ? 'var(--bg)' : 'var(--teal-light)',
                      color: isRoot(s) ? 'var(--text-muted)' : 'var(--teal)',
                      border: isRoot(s) ? '1px solid var(--border)' : 'none',
                      borderRadius: 8,
                      padding: '8px 14px',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {isRoot(s) ? t('history.restoreStart') : t('history.restore')}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
