import { useState } from 'react';
import { useT } from '../i18n/LangProvider';
import type { AvailableUpdate } from '../lib/updater';

type Phase =
  | { kind: 'idle' }
  | { kind: 'downloading'; pct: number }
  | { kind: 'installing' }
  | { kind: 'error'; msg: string };

type Props = {
  update: AvailableUpdate;
  onDismiss: () => void;
};

export function UpdateModal({ update, onDismiss }: Props) {
  const { t, tp } = useT();
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' });
  const busy = phase.kind === 'downloading' || phase.kind === 'installing';

  async function install() {
    try {
      setPhase({ kind: 'downloading', pct: 0 });
      await update.downloadAndInstall((downloaded, total) => {
        const pct = total ? Math.min(100, Math.round((downloaded / total) * 100)) : 0;
        setPhase({ kind: 'downloading', pct });
      });
      setPhase({ kind: 'installing' });
      await update.relaunch();
    } catch (e) {
      setPhase({ kind: 'error', msg: e instanceof Error ? e.message : String(e) });
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="update-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        background: 'oklch(0% 0 0 / 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 18,
          padding: 24,
          width: '100%',
          maxWidth: 480,
          maxHeight: '85vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px oklch(0% 0 0 / 0.2)',
        }}
      >
        <h2 id="update-title" style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>
          {t('update.available')}
        </h2>
        <p style={{ fontSize: 15, color: 'var(--text)', marginTop: 8, marginBottom: 0 }}>
          {tp('update.newVersion', { version: update.version })}
        </p>

        {update.notes && (
          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>
              {t('update.releaseNotes')}
            </div>
            <pre
              style={{
                fontFamily: 'inherit',
                fontSize: 13,
                color: 'var(--text)',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: 12,
                margin: 0,
                whiteSpace: 'pre-wrap',
                maxHeight: 180,
                overflowY: 'auto',
              }}
            >
              {update.notes}
            </pre>
          </div>
        )}

        {phase.kind === 'downloading' && (
          <p style={{ marginTop: 18, fontSize: 14, color: 'var(--text-muted)' }}>
            {tp('update.downloading', { pct: String(phase.pct) })}
          </p>
        )}
        {phase.kind === 'installing' && (
          <p style={{ marginTop: 18, fontSize: 14, color: 'var(--text-muted)' }}>
            {t('update.installing')}
          </p>
        )}
        {phase.kind === 'error' && (
          <p style={{ marginTop: 18, fontSize: 14, color: 'var(--red)' }}>
            {tp('update.error', { msg: phase.msg })}
          </p>
        )}

        <div
          style={{
            marginTop: 22,
            display: 'flex',
            gap: 10,
            justifyContent: 'flex-end',
          }}
        >
          <button
            type="button"
            onClick={onDismiss}
            disabled={busy}
            style={{
              padding: '12px 20px',
              borderRadius: 10,
              border: '2px solid var(--border)',
              background: 'transparent',
              fontFamily: 'inherit',
              fontSize: 15,
              color: 'var(--text)',
              cursor: busy ? 'not-allowed' : 'pointer',
              opacity: busy ? 0.6 : 1,
            }}
          >
            {t('update.later')}
          </button>
          <button
            type="button"
            onClick={install}
            disabled={busy}
            style={{
              padding: '12px 20px',
              borderRadius: 10,
              border: 'none',
              background: 'var(--teal)',
              fontFamily: 'inherit',
              fontSize: 15,
              color: '#fff',
              cursor: busy ? 'not-allowed' : 'pointer',
              opacity: busy ? 0.6 : 1,
            }}
          >
            {t('update.install')}
          </button>
        </div>
      </div>
    </div>
  );
}
