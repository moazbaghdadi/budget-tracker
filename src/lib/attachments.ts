import type { Attachment } from '../types';
import { isTauri } from './persist';

/**
 * Tauri-only attachment helpers.
 *
 * Files live at `$AppConfig/budget-tracker/attachments/<id>.<ext>`. We never
 * read the bytes into JS — `pickAttachment` invokes a Rust command that
 * streams the copy, and `openAttachment` hands the absolute path to the
 * system default app via the opener plugin.
 *
 * Old attachment files are not garbage-collected: the undo-tree may still
 * reference them in past snapshots. A future GC pass (when snapshots fall
 * out of the 200-cap) is out of scope for now.
 */

const ATTACH_SUBDIR = 'budget-tracker/attachments';

export function attachmentsSupported(): boolean {
  return isTauri();
}

export function extractExt(filename: string): string {
  const dot = filename.lastIndexOf('.');
  if (dot <= 0 || dot === filename.length - 1) return '';
  return filename.slice(dot + 1);
}

export function destNameFor(att: Attachment): string {
  return att.ext ? `${att.id}.${att.ext}` : att.id;
}

export async function pickAttachment(): Promise<Attachment | null> {
  if (!isTauri()) return null;
  const { open } = await import('@tauri-apps/plugin-dialog');
  const { invoke } = await import('@tauri-apps/api/core');

  const picked = await open({ multiple: false, directory: false });
  if (picked === null || Array.isArray(picked)) return null;
  const sourcePath = picked;
  const filename = basename(sourcePath);
  const ext = extractExt(filename);
  const id = crypto.randomUUID();
  const att: Attachment = { id, filename, ext };
  await invoke('copy_attachment', { source: sourcePath, destName: destNameFor(att) });
  return att;
}

export async function openAttachment(att: Attachment): Promise<void> {
  if (!isTauri()) return;
  const { appConfigDir, join } = await import('@tauri-apps/api/path');
  const { openPath } = await import('@tauri-apps/plugin-opener');
  const root = await appConfigDir();
  const abs = await join(root, ATTACH_SUBDIR, destNameFor(att));
  await openPath(abs);
}

function basename(p: string): string {
  const n = p.replace(/[/\\]+$/, '');
  const i = Math.max(n.lastIndexOf('/'), n.lastIndexOf('\\'));
  return i === -1 ? n : n.slice(i + 1);
}
