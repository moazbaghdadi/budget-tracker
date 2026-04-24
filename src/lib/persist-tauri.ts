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
import { APP_DIR, FILE, TMP_FILE, isValid } from './persist';

const DIR_OPT = { baseDir: BaseDirectory.AppConfig } as const;

async function ensureDir(): Promise<void> {
  if (!(await exists(APP_DIR, DIR_OPT))) {
    await mkdir(APP_DIR, { ...DIR_OPT, recursive: true });
  }
}

export async function loadTauri(): Promise<DiskFormat | null> {
  try {
    if (!(await exists(`${APP_DIR}/${FILE}`, DIR_OPT))) return null;
    const raw = await readTextFile(`${APP_DIR}/${FILE}`, DIR_OPT);
    const parsed: unknown = JSON.parse(raw);
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function saveTauri(d: DiskFormat): Promise<void> {
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
