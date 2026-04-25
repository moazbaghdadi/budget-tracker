import { useState } from 'react';
import type { Attachment } from '../types';
import { useT } from '../i18n/LangProvider';
import { attachmentsSupported, openAttachment, pickAttachment } from '../lib/attachments';
import { IPaperclip, IPlus, ITrash } from './icons';

type Props = {
  attachments: Attachment[];
  onAdd: (a: Attachment) => void;
  onRemove: (id: string) => void;
};

export function AttachmentsList({ attachments, onAdd, onRemove }: Props) {
  const { t } = useT();
  const supported = attachmentsSupported();
  const [busy, setBusy] = useState(false);

  async function handlePick() {
    if (!supported || busy) return;
    setBusy(true);
    try {
      const att = await pickAttachment();
      if (att) onAdd(att);
    } catch (err) {
      console.error('copy attachment failed', err);
      alert(t('modal.attachments.copyError'));
    } finally {
      setBusy(false);
    }
  }

  async function handleOpen(a: Attachment) {
    try {
      await openAttachment(a);
    } catch (err) {
      console.error('open attachment failed', err);
      alert(t('modal.attachments.openError'));
    }
  }

  function handleRemove(a: Attachment) {
    if (!window.confirm(t('modal.attachments.confirmRemove'))) return;
    onRemove(a.id);
  }

  return (
    <div style={{ marginBottom: 18 }}>
      {attachments.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '6px 0 12px' }}>
          {t('modal.attachments.empty')}
        </p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 12px' }}>
          {attachments.map((a) => (
            <li
              key={a.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                border: '1px solid var(--border)',
                borderRadius: 10,
                marginBottom: 8,
                background: 'var(--bg)',
              }}
            >
              <span style={{ color: 'var(--text-muted)', display: 'flex' }}>
                <IPaperclip s={18} />
              </span>
              <button
                type="button"
                onClick={() => handleOpen(a)}
                title={t('modal.attachments.open')}
                style={{
                  flex: 1,
                  textAlign: 'inherit',
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  fontSize: 15,
                  fontFamily: 'inherit',
                  color: 'var(--text)',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {a.filename}
              </button>
              <button
                type="button"
                onClick={() => handleRemove(a)}
                aria-label={t('modal.attachments.remove')}
                title={t('modal.attachments.remove')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: 6,
                  borderRadius: 8,
                  color: 'var(--expense)',
                  cursor: 'pointer',
                  display: 'flex',
                  minWidth: 36,
                  minHeight: 36,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ITrash s={18} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={handlePick}
        disabled={!supported || busy}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 14px',
          borderRadius: 10,
          border: '2px dashed var(--border)',
          background: 'transparent',
          color: supported ? 'var(--teal)' : 'var(--text-muted)',
          fontFamily: 'inherit',
          fontSize: 14,
          fontWeight: 600,
          cursor: supported && !busy ? 'pointer' : 'not-allowed',
          minHeight: 44,
        }}
      >
        <IPlus s={16} />
        {t('modal.attachments.add')}
      </button>
      {!supported && (
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
          {t('modal.attachments.webDisabled')}
        </p>
      )}
    </div>
  );
}
