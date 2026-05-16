import type { DiskFormat, History } from '../types';
import { loadTauri, saveTauri } from './persist-tauri';
import { loadWeb, saveWeb } from './persist-web';
import { DEFAULT_CURRENCY, isCurrencyCode, type CurrencyCode } from './currency';

const SCHEMA_VERSION = 5 as const;

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

export function emptyDisk(
  history: DiskFormat['history'],
  deviceId: string,
  currency: CurrencyCode = DEFAULT_CURRENCY,
): DiskFormat {
  return { schemaVersion: SCHEMA_VERSION, history, deviceId, currency };
}

export function parseAndMigrate(parsed: unknown): DiskFormat | null {
  if (!parsed || typeof parsed !== 'object') return null;
  const obj = parsed as {
    schemaVersion?: unknown;
    history?: unknown;
    deviceId?: unknown;
    currency?: unknown;
    serverState?: unknown;
  };
  if (!obj.history || typeof obj.history !== 'object') return null;

  // v3 → v4: generate a deviceId. Pre-v4 snapshots stay unauthored; the sync
  // layer treats them as authored by this device on first push.
  // v4 → v5: default currency to EUR (preserves current behavior).
  if (obj.schemaVersion === 3) {
    return {
      schemaVersion: SCHEMA_VERSION,
      history: obj.history as History,
      deviceId: makeDeviceId(),
      currency: DEFAULT_CURRENCY,
    };
  }

  if (obj.schemaVersion === 4) {
    const deviceId =
      typeof obj.deviceId === 'string' && obj.deviceId ? obj.deviceId : makeDeviceId();
    return {
      schemaVersion: SCHEMA_VERSION,
      history: obj.history as History,
      deviceId,
      currency: DEFAULT_CURRENCY,
      ...(obj.serverState ? { serverState: obj.serverState as DiskFormat['serverState'] } : {}),
    };
  }

  if (obj.schemaVersion === SCHEMA_VERSION) {
    const v5 = parsed as DiskFormat;
    const patch: Partial<DiskFormat> = {};
    if (typeof v5.deviceId !== 'string' || !v5.deviceId) {
      patch.deviceId = makeDeviceId();
    }
    if (!isCurrencyCode(v5.currency)) {
      patch.currency = DEFAULT_CURRENCY;
    }
    return Object.keys(patch).length === 0 ? v5 : { ...v5, ...patch };
  }
  return null;
}
