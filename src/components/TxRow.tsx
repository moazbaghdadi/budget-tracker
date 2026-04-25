import type { CSSProperties } from 'react';
import type { Transaction } from '../types';
import { IDown, IPaperclip, ITrash, IUp } from './icons';
import { useT } from '../i18n/LangProvider';
import { attachmentsSupported } from '../lib/attachments';

const tdS: CSSProperties = {
  padding: '14px 16px',
  fontSize: 14,
  verticalAlign: 'middle',
  color: 'var(--text)',
};

type Props = {
  t: Transaction;
  onDelete?: (id: string) => void;
  onOpenAttachments?: (id: string) => void;
  tableMode?: boolean;
};

export function TxRow({ t, onDelete, onOpenAttachments, tableMode }: Props) {
  const { t: tr, fmtMoneyAbs, fmtDate } = useT();
  const inc = t.type === 'income';
  const dayStr = fmtDate(t.date);
  const sign = inc ? '+' : '-';
  const typeLabel = tr(inc ? 'tx.typeIncome' : 'tx.typeExpense');
  const deleteAria = tr('tx.deleteAria');
  const attCount = t.attachments.length;
  const showPaperclip = onOpenAttachments && (attCount > 0 || attachmentsSupported());
  const paperclipAria =
    attCount > 0 ? `${tr('tx.attachments.aria')} (${attCount})` : tr('tx.attachments.aria');
  const paperclip = showPaperclip ? (
    <button
      aria-label={paperclipAria}
      onClick={() => onOpenAttachments(t.id)}
      style={{
        background: attCount > 0 ? 'var(--teal-light)' : 'transparent',
        border: attCount > 0 ? 'none' : '1px solid var(--border)',
        borderRadius: 8,
        minWidth: 34,
        height: 34,
        padding: '0 8px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        cursor: 'pointer',
        color: attCount > 0 ? 'var(--teal)' : 'var(--text-muted)',
        fontWeight: 700,
        fontSize: 13,
        fontFamily: 'inherit',
      }}
    >
      <IPaperclip s={16} />
      {attCount > 0 && <span>{attCount}</span>}
    </button>
  ) : null;

  if (tableMode) {
    return (
      <tr style={{ borderBottom: '1px solid var(--border)' }}>
        <td style={tdS}>{dayStr}</td>
        <td style={tdS}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 10px',
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 700,
              background: inc ? 'var(--green-light)' : 'var(--red-light)',
              color: inc ? 'var(--green)' : 'var(--red)',
            }}
          >
            {inc ? <IUp s={14} /> : <IDown s={14} />} {typeLabel}
          </span>
        </td>
        <td style={tdS}>{t.category}</td>
        <td style={tdS}>{t.description || '—'}</td>
        <td
          style={{
            ...tdS,
            fontWeight: 700,
            color: inc ? 'var(--green)' : 'var(--red)',
            direction: 'ltr',
            textAlign: 'right',
          }}
        >
          {sign}
          {fmtMoneyAbs(t.amount)}
        </td>
        <td style={{ ...tdS, textAlign: 'center', whiteSpace: 'nowrap' }}>
          {paperclip}
          {onDelete && (
            <button
              aria-label={deleteAria}
              onClick={() => onDelete(t.id)}
              style={{
                background: 'var(--red-light)',
                border: 'none',
                borderRadius: 8,
                width: 34,
                height: 34,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--red)',
                marginInlineStart: paperclip ? 6 : 0,
              }}
            >
              <ITrash s={16} />
            </button>
          )}
        </td>
      </tr>
    );
  }

  return (
    <div
      style={{
        background: '#fff',
        border: '1.5px solid var(--border)',
        borderRadius: 14,
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: 12,
          flexShrink: 0,
          background: inc ? 'var(--green-light)' : 'var(--red-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: inc ? 'var(--green)' : 'var(--red)',
        }}
      >
        {inc ? <IUp s={20} /> : <IDown s={20} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: 15,
            fontWeight: 700,
            marginBottom: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {t.description || t.category}
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {t.category} · {dayStr}
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span
          style={{
            fontSize: 17,
            fontWeight: 700,
            color: inc ? 'var(--green)' : 'var(--red)',
            direction: 'ltr',
          }}
        >
          {sign}
          {fmtMoneyAbs(t.amount)}
        </span>
        {paperclip}
        {onDelete && (
          <button
            aria-label={deleteAria}
            onClick={() => onDelete(t.id)}
            style={{
              background: 'var(--red-light)',
              border: 'none',
              borderRadius: 8,
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--red)',
            }}
          >
            <ITrash />
          </button>
        )}
      </div>
    </div>
  );
}
