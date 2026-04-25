import type { DiskFormat } from '../types';
import { loadTauri, saveTauri } from './persist-tauri';
import { loadWeb, saveWeb } from './persist-web';

const SCHEMA_VERSION = 3 as const;

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
  return null;
}
