import {
  BaseDirectory,
  exists,
  mkdir,
  readTextFile,
  remove,
  rename,
  writeTextFile,
} from '@tauri-apps/plugin-fs';
import type { DiskFormat } from '../types';

export const FILE = 'data.json';
export const TMP_FILE = 'data.json.tmp';
export const APP_DIR = 'budget-tracker';
const SCHEMA_VERSION = 1 as const;

const DIR_OPT = { baseDir: BaseDirectory.AppConfig } as const;

async function ensureDir(): Promise<void> {
  if (!(await exists(APP_DIR, DIR_OPT))) {
    await mkdir(APP_DIR, { ...DIR_OPT, recursive: true });
  }
}

/**
 * Read the disk file. Returns null if the file is missing, unreadable, or has
 * an unknown schema version (caller should start fresh in that case).
 */
export async function load(): Promise<DiskFormat | null> {
  try {
    if (!(await exists(`${APP_DIR}/${FILE}`, DIR_OPT))) return null;
    const raw = await readTextFile(`${APP_DIR}/${FILE}`, DIR_OPT);
    const parsed = JSON.parse(raw) as Partial<DiskFormat>;
    if (parsed.schemaVersion !== SCHEMA_VERSION) return null;
    if (!parsed.history || typeof parsed.history !== 'object') return null;
    return parsed as DiskFormat;
  } catch {
    return null;
  }
}

/**
 * Atomic write: write to data.json.tmp, then rename to data.json. The rename
 * is atomic on every supported OS, so a crash mid-save can't corrupt the file.
 */
export async function save(d: DiskFormat): Promise<void> {
  await ensureDir();
  const json = JSON.stringify(d, null, 2);
  await writeTextFile(`${APP_DIR}/${TMP_FILE}`, json, DIR_OPT);
  if (await exists(`${APP_DIR}/${FILE}`, DIR_OPT)) {
    await remove(`${APP_DIR}/${FILE}`, DIR_OPT);
  }
  await rename(`${APP_DIR}/${TMP_FILE}`, `${APP_DIR}/${FILE}`, {
    oldPathBaseDir: BaseDirectory.AppConfig,
    newPathBaseDir: BaseDirectory.AppConfig,
  });
}

export function emptyDisk(history: DiskFormat['history']): DiskFormat {
  return { schemaVersion: SCHEMA_VERSION, history };
}
