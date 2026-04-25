import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  AppData,
  Attachment,
  Categories,
  History,
  Screen,
  Transaction,
} from '../types';
import {
  canRedo,
  canUndo,
  commit,
  createHistory,
  current,
  currentData,
  redo,
  redoSnapshot,
  restore,
  undo,
  undoSnapshot,
} from './history';
import {
  actionToDescriptor,
  formatDescriptor,
  INIT_DATA,
  reduce,
  type Action,
  type CategoryType,
} from './reducer';
import { emptyDisk, load, save } from './persist';
import { useT } from '../i18n/LangProvider';

const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

export type Store = {
  ready: boolean;
  data: AppData;
  history: History;
  screen: Screen;
  setScreen: (s: Screen) => void;

  addTx: (tx: Omit<Transaction, 'id'>) => void;
  deleteTx: (id: string) => void;
  addCategory: (type: CategoryType, name: string) => void;
  removeCategory: (type: CategoryType, name: string) => void;
  addAttachment: (txId: string, attachment: Attachment) => void;
  removeAttachment: (txId: string, attachmentId: string) => void;

  undo: () => void;
  redo: () => void;
  restoreSnapshot: (id: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  undoLabel: string | null;
  redoLabel: string | null;
};

export function useStore(): Store {
  const { t } = useT();
  const [history, setHistory] = useState<History>(() =>
    createHistory(INIT_DATA, { labels: { root: t('history.rootLabel') } }),
  );
  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState<Screen>('dashboard');
  const lastSavedRef = useRef<string | null>(null);
  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  }, [t]);

  // Load from disk once on mount.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const loaded = await load();
      if (cancelled) return;
      if (loaded) {
        setHistory(loaded.history);
        lastSavedRef.current = JSON.stringify(loaded);
      }
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Debounced auto-save whenever the history changes.
  useEffect(() => {
    if (!ready) return;
    const handle = window.setTimeout(() => {
      const disk = emptyDisk(history);
      const serialized = JSON.stringify(disk);
      if (serialized === lastSavedRef.current) return;
      lastSavedRef.current = serialized;
      void save(disk);
    }, 300);
    return () => window.clearTimeout(handle);
  }, [history, ready]);

  const apply = useCallback((action: Action) => {
    setHistory((h) => {
      const data = currentData(h);
      const next = reduce(data, action);
      if (next === data) return h;
      const descriptor = actionToDescriptor(data, action);
      const label = formatDescriptor(descriptor, tRef.current);
      return commit(h, next, label, undefined, descriptor);
    });
  }, []);

  const data = current(history).data;
  const undoSnap = undoSnapshot(history);
  const redoSnap = redoSnapshot(history);
  const undoLabel = undoSnap
    ? undoSnap.descriptor
      ? formatDescriptor(undoSnap.descriptor, t)
      : undoSnap.label
    : null;
  const redoLabel = redoSnap
    ? redoSnap.descriptor
      ? formatDescriptor(redoSnap.descriptor, t)
      : redoSnap.label
    : null;

  return {
    ready,
    data,
    history,
    screen,
    setScreen,
    addTx: (tx) => apply({ kind: 'addTx', tx, id: newId() }),
    deleteTx: (id) => apply({ kind: 'deleteTx', id }),
    addCategory: (type, name) => apply({ kind: 'addCategory', type, name }),
    removeCategory: (type, name) => apply({ kind: 'removeCategory', type, name }),
    addAttachment: (txId, attachment) => apply({ kind: 'addAttachment', txId, attachment }),
    removeAttachment: (txId, attachmentId) =>
      apply({ kind: 'removeAttachment', txId, attachmentId }),
    undo: () => setHistory((h) => undo(h)),
    redo: () => setHistory((h) => redo(h)),
    restoreSnapshot: (id) =>
      setHistory((h) =>
        restore(h, id, { labels: { restorePrefix: tRef.current('history.restorePrefix') } }),
      ),
    canUndo: canUndo(history),
    canRedo: canRedo(history),
    undoLabel,
    redoLabel,
  };
}

export type Cats = Categories;
