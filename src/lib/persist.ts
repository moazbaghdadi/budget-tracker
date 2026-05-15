import type { DiskFormat, History } from '../types';
import { loadTauri, saveTauri } from './persist-tauri';
import { loadWeb, saveWeb } from './persist-web';

const SCHEMA_VERSION = 4 as const;

export const FILE = 'data.json';
export const TMP_FILE = 'data.json.tmp';
export const APP_DIR = 'muhaseb-tech';
export const WEB_KEY = 'muhaseb-tech:data';

declare global {
  interface Window {
    __TAURI_INTERNALS__?: unknown;
  }
}

export function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

export function makeDeviceId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export async function load(): Promise<DiskFormat | null> {
  return isTauri() ? loadTauri() : loadWeb();
}

export async function save(d: DiskFormat): Promise<void> {
  return isTauri() ? saveTauri(d) : saveWeb(d);
}

export function emptyDisk(history: DiskFormat['history'], deviceId: string): DiskFormat {
  return { schemaVersion: SCHEMA_VERSION, history, deviceId };
}

export function parseAndMigrate(parsed: unknown): DiskFormat | null {
  if (!parsed || typeof parsed !== 'object') return null;
  const obj = parsed as {
    schemaVersion?: unknown;
    history?: unknown;
    deviceId?: unknown;
    serverState?: unknown;
  };
  if (!obj.history || typeof obj.history !== 'object') return null;

  // v3 → v4: generate a deviceId. Pre-v4 snapshots stay unauthored; the sync
  // layer treats them as authored by this device on first push.
  if (obj.schemaVersion === 3) {
    return {
      schemaVersion: SCHEMA_VERSION,
      history: obj.history as History,
      deviceId: makeDeviceId(),
    };
  }

  if (obj.schemaVersion === SCHEMA_VERSION) {
    const v4 = parsed as DiskFormat;
    // Defensive: a v4 file with a missing/empty deviceId backfills cleanly.
    if (typeof v4.deviceId !== 'string' || !v4.deviceId) {
      return { ...v4, deviceId: makeDeviceId() };
    }
    return v4;
  }
  return null;
}
