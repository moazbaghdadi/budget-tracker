import { describe, it, expect, vi, beforeEach } from 'vitest';

const fsState = {
  files: new Map<string, string>(),
};

vi.mock('@tauri-apps/plugin-fs', () => {
  const exists = vi.fn(async (p: string) => fsState.files.has(p));
  const mkdir = vi.fn(async () => {});
  const readTextFile = vi.fn(async (p: string) => {
    const v = fsState.files.get(p);
    if (v === undefined) throw new Error('ENOENT');
    return v;
  });
  const writeTextFile = vi.fn(async (p: string, contents: string) => {
    fsState.files.set(p, contents);
  });
  const remove = vi.fn(async (p: string) => {
    fsState.files.delete(p);
  });
  const rename = vi.fn(async (oldP: string, newP: string) => {
    const v = fsState.files.get(oldP);
    if (v === undefined) throw new Error('ENOENT');
    fsState.files.set(newP, v);
    fsState.files.delete(oldP);
  });
  return {
    BaseDirectory: { AppConfig: 'AppConfig' },
    exists,
    mkdir,
    readTextFile,
    writeTextFile,
    remove,
    rename,
  };
});

import { load, save, FILE, TMP_FILE, APP_DIR, emptyDisk } from './persist';
import { createHistory } from './history';
import type { DiskFormat } from '../types';

const FULL_PATH = `${APP_DIR}/${FILE}`;
const TMP_PATH = `${APP_DIR}/${TMP_FILE}`;

beforeEach(() => {
  fsState.files.clear();
  vi.clearAllMocks();
});

describe('load', () => {
  it('returns null when the file is missing', async () => {
    expect(await load()).toBeNull();
  });

  it('returns null on invalid JSON', async () => {
    fsState.files.set(FULL_PATH, '{not json');
    expect(await load()).toBeNull();
  });

  it('returns null when the schema version is not 1', async () => {
    fsState.files.set(FULL_PATH, JSON.stringify({ schemaVersion: 99, history: {} }));
    expect(await load()).toBeNull();
  });

  it('returns null when history is missing', async () => {
    fsState.files.set(FULL_PATH, JSON.stringify({ schemaVersion: 1 }));
    expect(await load()).toBeNull();
  });

  it('returns the parsed payload on success', async () => {
    const d: DiskFormat = emptyDisk(
      createHistory(
        { tx: [], cats: { income: [], expense: [] } },
        { idGen: () => 'fixed-id', now: () => 0 },
      ),
    );
    fsState.files.set(FULL_PATH, JSON.stringify(d));
    const loaded = await load();
    expect(loaded).toEqual(d);
  });
});

describe('save', () => {
  it('writes to tmp first, then renames to the final path (atomic)', async () => {
    const d: DiskFormat = emptyDisk(
      createHistory(
        { tx: [], cats: { income: [], expense: [] } },
        { idGen: () => 'fixed-id', now: () => 0 },
      ),
    );
    await save(d);
    // Final file exists, tmp is gone (rename consumed it).
    expect(fsState.files.has(FULL_PATH)).toBe(true);
    expect(fsState.files.has(TMP_PATH)).toBe(false);
    expect(JSON.parse(fsState.files.get(FULL_PATH) as string)).toEqual(d);
  });

  it('overwrites an existing file safely', async () => {
    const a: DiskFormat = emptyDisk(
      createHistory(
        { tx: [], cats: { income: [], expense: [] } },
        { idGen: () => 'a', now: () => 0 },
      ),
    );
    const b: DiskFormat = emptyDisk(
      createHistory(
        { tx: [], cats: { income: ['x'], expense: [] } },
        { idGen: () => 'b', now: () => 0 },
      ),
    );
    await save(a);
    await save(b);
    expect(fsState.files.has(FULL_PATH)).toBe(true);
    expect(fsState.files.has(TMP_PATH)).toBe(false);
    expect(JSON.parse(fsState.files.get(FULL_PATH) as string)).toEqual(b);
  });
});

describe('round-trip', () => {
  it('save then load returns the same payload', async () => {
    const d: DiskFormat = emptyDisk(
      createHistory(
        { tx: [], cats: { income: ['A'], expense: ['B'] } },
        { idGen: () => 'rt', now: () => 0 },
      ),
    );
    await save(d);
    const loaded = await load();
    expect(loaded).toEqual(d);
  });
});

describe('emptyDisk', () => {
  it('wraps a History with the current schemaVersion', () => {
    const h = createHistory(
      { tx: [], cats: { income: [], expense: [] } },
      { idGen: () => 'r', now: () => 0 },
    );
    expect(emptyDisk(h).schemaVersion).toBe(1);
    expect(emptyDisk(h).history).toBe(h);
  });
});
