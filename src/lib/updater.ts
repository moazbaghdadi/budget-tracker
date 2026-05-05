import { isTauri } from './persist';

export type AvailableUpdate = {
  version: string;
  notes: string | null;
  downloadAndInstall: (
    onProgress?: (downloaded: number, total: number | null) => void
  ) => Promise<void>;
  relaunch: () => Promise<void>;
};

export async function checkForUpdate(): Promise<AvailableUpdate | null> {
  if (!isTauri()) return null;
  const { check } = await import('@tauri-apps/plugin-updater');
  const update = await check();
  if (!update) return null;
  return {
    version: update.version,
    notes: update.body ?? null,
    downloadAndInstall: async (onProgress) => {
      let downloaded = 0;
      let total: number | null = null;
      await update.downloadAndInstall((event) => {
        if (event.event === 'Started') {
          total = event.data.contentLength ?? null;
          onProgress?.(0, total);
        } else if (event.event === 'Progress') {
          downloaded += event.data.chunkLength;
          onProgress?.(downloaded, total);
        }
      });
    },
    relaunch: async () => {
      const { relaunch } = await import('@tauri-apps/plugin-process');
      await relaunch();
    },
  };
}
