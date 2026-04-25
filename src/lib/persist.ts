import type { DiskFormat, Snapshot, Transaction } from '../types';
import { loadTauri, saveTauri } from './persist-tauri';
import { loadWeb, saveWeb } from './persist-web';

const SCHEMA_VERSION = 2 as const;

export const FILE = 'data.json';
export const TMP_FILE = 'data.json.tmp';
export const APP_DIR = 'budget-tracker';
export const WEB_KEY = 'budget-tracker:data';

declare global {
  interface Window {
    __TAURI_INTERNALS__?: unknown;
  }
}

export function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

export async function load(): Promise<DiskFormat | null> {
  return isTauri() ? loadTauri() : loadWeb();
}

export async function save(d: DiskFormat): Promise<void> {
  return isTauri() ? saveTauri(d) : saveWeb(d);
}

export function emptyDisk(history: DiskFormat['history']): DiskFormat {
  return { schemaVersion: SCHEMA_VERSION, history };
}

export function parseAndMigrate(parsed: unknown): DiskFormat | null {
  if (!parsed || typeof parsed !== 'object') return null;
  const obj = parsed as { schemaVersion?: unknown; history?: unknown };
  if (!obj.history || typeof obj.history !== 'object') return null;
  if (obj.schemaVersion === SCHEMA_VERSION) {
    return parsed as DiskFormat;
  }
  if (obj.schemaVersion === 1) {
    return migrateV1ToV2(obj as { schemaVersion: 1; history: DiskFormat['history'] });
  }
  return null;
}

function migrateV1ToV2(v1: { schemaVersion: 1; history: DiskFormat['history'] }): DiskFormat {
  const nodes: Record<string, Snapshot> = {};
  for (const [id, snap] of Object.entries(v1.history.nodes)) {
    nodes[id] = {
      ...snap,
      data: {
        ...snap.data,
        tx: snap.data.tx.map(
          (t): Transaction => ({ ...t, attachments: t.attachments ?? [] }),
        ),
      },
    };
  }
  return {
    schemaVersion: SCHEMA_VERSION,
    history: { ...v1.history, nodes },
  };
}
