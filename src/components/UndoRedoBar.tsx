import { IRedo, IUndo } from './icons';
import { useT } from '../i18n/LangProvider';

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
  fontSize: 14,
  fontWeight: 600,
  cursor: enabled ? 'pointer' : 'not-allowed',
  opacity: enabled ? 1 : 0.55,
});

export function UndoRedoBar({ canUndo, canRedo, undoLabel, redoLabel, onUndo, onRedo }: Props) {
  const { t, tp } = useT();
  const undoText = t('action.undo');
  const redoText = t('action.redo');
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <button
        type="button"
        aria-label={undoText}
        title={undoLabel ? tp('action.undoTooltip', { label: undoLabel }) : t('action.undoNone')}
        disabled={!canUndo}
        onClick={onUndo}
        style={btn(canUndo)}
      >
        <IUndo s={16} />
        {undoText}
      </button>
      <button
        type="button"
        aria-label={redoText}
        title={redoLabel ? tp('action.redoTooltip', { label: redoLabel }) : t('action.redoNone')}
        disabled={!canRedo}
        onClick={onRedo}
        style={btn(canRedo)}
      >
        <IRedo s={16} />
        {redoText}
      </button>
    </div>
  );
}
