import type { DiskFormat } from '../types';
import { WEB_KEY, isValid } from './persist';

/** Browser fallback so `pnpm dev` and Playwright tests work without Tauri. */
export function loadWeb(): DiskFormat | null {
  try {
    const raw = localStorage.getItem(WEB_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveWeb(d: DiskFormat): void {
  localStorage.setItem(WEB_KEY, JSON.stringify(d));
}
