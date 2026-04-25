import type { Attachment, Transaction } from '../types';
import { useT } from '../i18n/LangProvider';
import { IClose } from './icons';
import { AttachmentsList } from './AttachmentsList';

type Props = {
  tx: Transaction;
  onAdd: (attachment: Attachment) => void;
  onRemove: (attachmentId: string) => void;
  onClose: () => void;
};

export function AttachmentsModal({ tx, onAdd, onRemove, onClose }: Props) {
  const { t } = useT();
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="attachments-title"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'oklch(0% 0 0 / 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 18,
          padding: 24,
          width: '100%',
          maxWidth: 520,
          maxHeight: '85vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px oklch(0% 0 0 / 0.2)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 6,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <h2 id="attachments-title" style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>
              {t('tx.attachments.title')}
            </h2>
            <p
              style={{
                fontSize: 13,
                color: 'var(--text-muted)',
                marginTop: 4,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {tx.description || tx.category}
            </p>
          </div>
          <button
            type="button"
            aria-label={t('modal.close')}
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 6,
              color: 'var(--text-muted)',
              display: 'flex',
            }}
          >
            <IClose />
          </button>
        </div>

        <div style={{ marginTop: 18 }}>
          <AttachmentsList attachments={tx.attachments} onAdd={onAdd} onRemove={onRemove} />
        </div>
      </div>
    </div>
  );
}
