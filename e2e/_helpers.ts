import type { Page } from '@playwright/test';

export const STORAGE_KEY = 'budget-tracker:data';

/**
 * Apply test-only globals (e.g. auto-confirm dialogs) BEFORE the page loads.
 * Re-applies on reload because it runs as an init script.
 */
export async function applyTestGlobals(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.confirm = () => true;
  });
}

/** Clear app data once. Use after `page.goto('/')` to start from an empty store. */
export async function clearAppData(page: Page): Promise<void> {
  await page.evaluate((key: string) => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }, STORAGE_KEY);
}

/** Open the AddTxModal and fill it via the same UI a user would. */
export async function addTransaction(
  page: Page,
  opts: {
    type: 'income' | 'expense';
    category: string;
    amount: string;
    description?: string;
    date?: string;
  },
): Promise<void> {
  await page.getByRole('button', { name: /إضافة معاملة/ }).first().click();
  const dialog = page.getByRole('dialog');
  if (opts.type === 'expense') {
    await dialog.getByRole('button', { name: /^مصروف$/ }).click();
  }
  await dialog.getByRole('button', { name: opts.category }).click();
  if (opts.description) {
    await dialog.getByLabel('الوصف').fill(opts.description);
  }
  await dialog.getByLabel('المبلغ').fill(opts.amount);
  if (opts.date) {
    await dialog.getByLabel('التاريخ').fill(opts.date);
  }
  await dialog.getByRole('button', { name: /حفظ المعاملة/ }).click();
}
