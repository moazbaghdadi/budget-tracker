import { test, expect } from '@playwright/test';
import { addCategory, addTransaction, applyTestGlobals, clearAppData, STORAGE_KEY } from './_helpers';

test.beforeEach(async ({ page }) => {
  await applyTestGlobals(page);
  await page.goto('/');
  await clearAppData(page);
  await page.reload();
});

test('data survives a full page reload', async ({ page }) => {
  await addCategory(page, 'income', 'التبرعات');
  await page.getByRole('button', { name: 'المعاملات' }).click();
  await addTransaction(page, {
    type: 'income',
    category: 'التبرعات',
    amount: '777',
    description: 'تبرع دائم',
  });
  await expect(page.getByRole('cell', { name: 'تبرع دائم' })).toBeVisible();

  // Wait for the 300ms debounced auto-save to flush, then verify the disk format.
  await expect
    .poll(
      async () => page.evaluate((key: string) => window.localStorage.getItem(key), STORAGE_KEY),
      { timeout: 3000 },
    )
    .not.toBeNull();
  const raw = await page.evaluate((key: string) => window.localStorage.getItem(key), STORAGE_KEY);
  const parsed = JSON.parse(raw as string) as { schemaVersion: number };
  expect(parsed.schemaVersion).toBe(3);

  // Reload — the test globals re-apply via init script, but storage is NOT re-cleared.
  await page.reload();
  await page.getByRole('button', { name: 'المعاملات' }).click();
  await expect(page.getByRole('cell', { name: 'تبرع دائم' })).toBeVisible();
});
