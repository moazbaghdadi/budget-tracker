import { IRedo, IUndo } from './icons';

type Props = {
  canUndo: boolean;
  canRedo: boolean;
  undoLabel: string | null;
  redoLabel: string | null;
  onUndo: () => void;
  onRedo: () => void;
};

const btn = (enabled: boolean) => ({
  display: 'flex' as const,
  alignItems: 'center' as const,
  gap: 6,
  padding: '10px 14px',
  borderRadius: 10,
  border: '2px solid var(--border)',
  background: enabled ? '#fff' : 'var(--bg)',
  color: enabled ? 'var(--text)' : 'var(--text-muted)',
  fontFamily: 'IBM Plex Sans Arabic, sans-serif',
  fontSize: 14,
  fontWeight: 600,
  cursor: enabled ? 'pointer' : 'not-allowed',
  opacity: enabled ? 1 : 0.55,
});

export function UndoRedoBar({ canUndo, canRedo, undoLabel, redoLabel, onUndo, onRedo }: Props) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <button
        type="button"
        aria-label="تراجع"
        title={undoLabel ? `تراجع: ${undoLabel}` : 'لا يوجد ما يمكن التراجع عنه'}
        disabled={!canUndo}
        onClick={onUndo}
        style={btn(canUndo)}
      >
        <IUndo s={16} />
        تراجع
      </button>
      <button
        type="button"
        aria-label="إعادة"
        title={redoLabel ? `إعادة: ${redoLabel}` : 'لا يوجد ما يمكن إعادته'}
        disabled={!canRedo}
        onClick={onRedo}
        style={btn(canRedo)}
      >
        <IRedo s={16} />
        إعادة
      </button>
    </div>
  );
}
