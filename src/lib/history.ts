import type { AppData, History, Snapshot, SnapshotDescriptor } from '../types';

export const HISTORY_CAP = 200;

type IdGen = () => string;
type Now = () => number;

const defaultIdGen: IdGen = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

const defaultNow: Now = () => Date.now();

export type HistoryLabels = {
  root: string;
  restorePrefix: string;
};

const DEFAULT_LABELS: HistoryLabels = {
  root: 'بداية',
  restorePrefix: 'استرجاع',
};

export type HistoryDeps = {
  idGen?: IdGen;
  now?: Now;
  labels?: Partial<HistoryLabels>;
  deviceId?: string;
};

type ResolvedDeps = { idGen: IdGen; now: Now; labels: HistoryLabels; deviceId?: string };

function makeNode(
  data: AppData,
  parentId: string | null,
  label: string,
  deps: ResolvedDeps,
  descriptor?: SnapshotDescriptor,
): Snapshot {
  return {
    id: deps.idGen(),
    parentId,
    childIds: [],
    createdAt: deps.now(),
    label,
    ...(descriptor ? { descriptor } : {}),
    ...(deps.deviceId ? { deviceId: deps.deviceId } : {}),
    data,
  };
}

function withDeps(deps?: HistoryDeps): ResolvedDeps {
  return {
    idGen: deps?.idGen ?? defaultIdGen,
    now: deps?.now ?? defaultNow,
    labels: { ...DEFAULT_LABELS, ...deps?.labels },
    deviceId: deps?.deviceId,
  };
}

export function createHistory(initial: AppData, deps?: HistoryDeps): History {
  const d = withDeps(deps);
  const root = makeNode(initial, null, d.labels.root, d, { kind: 'root' });
  return { rootId: root.id, currentId: root.id, nodes: { [root.id]: root } };
}

/** Append a new snapshot as a child of `currentId`, then make it current. */
export function commit(
  history: History,
  data: AppData,
  label: string,
  deps?: HistoryDeps,
  descriptor?: SnapshotDescriptor,
): History {
  const d = withDeps(deps);
  const parent = history.nodes[history.currentId];
  const node = makeNode(data, parent.id, label, d, descriptor);
  const nextNodes: Record<string, Snapshot> = {
    ...history.nodes,
    [parent.id]: { ...parent, childIds: [...parent.childIds, node.id] },
    [node.id]: node,
  };
  const next: History = { ...history, currentId: node.id, nodes: nextNodes };
  return prune(next);
}

export function canUndo(history: History): boolean {
  return history.nodes[history.currentId].parentId !== null;
}

export function canRedo(history: History): boolean {
  return history.nodes[history.currentId].childIds.length > 0;
}

export function undo(history: History): History {
  const cur = history.nodes[history.currentId];
  if (cur.parentId === null) return history;
  return { ...history, currentId: cur.parentId };
}

/** Redo follows the most-recently-added child of the current node. */
export function redo(history: History): History {
  const cur = history.nodes[history.currentId];
  const last = cur.childIds[cur.childIds.length - 1];
  if (!last) return history;
  return { ...history, currentId: last };
}

export function current(history: History): Snapshot {
  return history.nodes[history.currentId];
}

export function currentData(history: History): AppData {
  return current(history).data;
}

export function undoLabel(history: History): string | null {
  const cur = history.nodes[history.currentId];
  if (cur.parentId === null) return null;
  return cur.label;
}

export function redoLabel(history: History): string | null {
  const cur = history.nodes[history.currentId];
  const last = cur.childIds[cur.childIds.length - 1];
  if (!last) return null;
  return history.nodes[last].label;
}

/** Snapshot that an undo would land on (returns the *current* node, since
 *  undoing reverts the action that produced it). Null at the root. */
export function undoSnapshot(history: History): Snapshot | null {
  const cur = history.nodes[history.currentId];
  if (cur.parentId === null) return null;
  return cur;
}

/** Snapshot that a redo would advance to. Null at a leaf. */
export function redoSnapshot(history: History): Snapshot | null {
  const cur = history.nodes[history.currentId];
  const last = cur.childIds[cur.childIds.length - 1];
  if (!last) return null;
  return history.nodes[last] ?? null;
}

/**
 * Restore a past snapshot. Implemented as a forward commit so older snapshots are
 * preserved exactly and the restore itself becomes part of the tree.
 */
export function restore(history: History, snapshotId: string, deps?: HistoryDeps): History {
  const target = history.nodes[snapshotId];
  if (!target) return history;
  if (snapshotId === history.currentId) return history;
  const d = withDeps(deps);
  const targetDescriptor: SnapshotDescriptor =
    target.descriptor ?? { kind: 'legacy', text: target.label };
  return commit(
    history,
    target.data,
    `${d.labels.restorePrefix}: ${target.label}`,
    deps,
    { kind: 'restore', target: targetDescriptor },
  );
}

/**
 * If the tree exceeds HISTORY_CAP nodes, drop the oldest snapshots first.
 * Never drops the root or the current snapshot. Children of a dropped node are
 * re-parented to its parent (in the original child-slot position) so the tree
 * stays connected even when a long linear chain is trimmed.
 */
export function prune(history: History): History {
  if (Object.keys(history.nodes).length <= HISTORY_CAP) return history;

  const nodes: Record<string, Snapshot> = {};
  for (const id of Object.keys(history.nodes)) {
    nodes[id] = { ...history.nodes[id], childIds: [...history.nodes[id].childIds] };
  }

  const sorted = Object.values(nodes).sort((a, b) => a.createdAt - b.createdAt);
  for (const node of sorted) {
    if (Object.keys(nodes).length <= HISTORY_CAP) break;
    if (node.id === history.rootId || node.id === history.currentId) continue;
    if (node.parentId === null) continue;
    const parent = nodes[node.parentId];
    if (!parent) continue;
    const idx = parent.childIds.indexOf(node.id);
    if (idx >= 0) parent.childIds.splice(idx, 1, ...node.childIds);
    for (const childId of node.childIds) {
      const child = nodes[childId];
      if (child) nodes[childId] = { ...child, parentId: node.parentId };
    }
    delete nodes[node.id];
  }
  return { ...history, nodes };
}

/** Total number of stored snapshots. */
export function size(history: History): number {
  return Object.keys(history.nodes).length;
}

/** Snapshots flattened oldest-first by createdAt — useful for the History screen. */
export function listChronological(history: History): Snapshot[] {
  return Object.values(history.nodes).sort((a, b) => a.createdAt - b.createdAt);
}
