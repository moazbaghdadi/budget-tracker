import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { useT } from '../i18n/LangProvider';
import { useBreakpoint } from '../lib/useBreakpoint';

type ConfirmOptions = {
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};

type ConfirmFn = (opts: string | ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

export function useConfirm(): ConfirmFn {
  const fn = useContext(ConfirmContext);
  if (fn) return fn;
  // Fallback for tests or any caller rendered without a ConfirmProvider.
  return (arg) => {
    const message = typeof arg === 'string' ? arg : arg.message;
    return Promise.resolve(
      typeof window !== 'undefined' ? window.confirm(message) : false,
    );
  };
}

type PendingState = {
  opts: ConfirmOptions;
  resolve: (v: boolean) => void;
};

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingState | null>(null);

  const confirm = useCallback<ConfirmFn>((arg) => {
    const opts: ConfirmOptions = typeof arg === 'string' ? { message: arg } : arg;
    return new Promise<boolean>((resolve) => setPending({ opts, resolve }));
  }, []);

  function settle(v: boolean) {
    if (!pending) return;
    pending.resolve(v);
    setPending(null);
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {pending && (
        <ConfirmDialog
          opts={pending.opts}
          onConfirm={() => settle(true)}
          onCancel={() => settle(false)}
        />
      )}
    </ConfirmContext.Provider>
  );
}

type DialogProps = {
  opts: ConfirmOptions;
  onConfirm: () => void;
  onCancel: () => void;
};

function ConfirmDialog({ opts, onConfirm, onCancel }: DialogProps) {
  const { t } = useT();
  const bp = useBreakpoint();
  const isMobile = bp === 'mobile';
  const destructive = opts.destructive ?? true;
  const confirmLabel = opts.confirmLabel ?? t('confirm.confirm');
  const cancelLabel = opts.cancelLabel ?? t('confirm.cancel');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 250,
        background: 'oklch(0% 0 0 / 0.45)',
        display: 'flex',
        alignItems: isMobile ? 'flex-end' : 'center',
        justifyContent: 'center',
        padding: isMobile ? 0 : 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: isMobile ? '20px 20px 0 0' : 18,
          width: '100%',
          maxWidth: isMobile ? '100%' : 420,
          padding: isMobile
            ? '24px 20px calc(20px + env(safe-area-inset-bottom)) 20px'
            : '24px',
          boxShadow: '0 20px 60px oklch(0% 0 0 / 0.2)',
        }}
      >
        <p
          id="confirm-title"
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: 'var(--text)',
            marginBottom: 22,
            lineHeight: 1.5,
          }}
        >
          {opts.message}
        </p>
        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column-reverse' : 'row',
            gap: 10,
            justifyContent: 'flex-end',
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '14px 20px',
              minHeight: 48,
              borderRadius: 10,
              border: '2px solid var(--border)',
              background: 'transparent',
              fontFamily: 'inherit',
              fontSize: 15,
              fontWeight: 600,
              color: 'var(--text)',
              cursor: 'pointer',
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            autoFocus
            style={{
              padding: '14px 20px',
              minHeight: 48,
              borderRadius: 10,
              border: 'none',
              background: destructive ? 'var(--red)' : 'var(--teal)',
              fontFamily: 'inherit',
              fontSize: 15,
              fontWeight: 700,
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
