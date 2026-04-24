import { test, expect } from '@playwright/test';
import { addTransaction, applyTestGlobals, clearAppData } from './_helpers';

test.beforeEach(async ({ page }) => {
  await applyTestGlobals(page);
  await page.goto('/');
  await clearAppData(page);
  await page.reload();
  await page.getByRole('button', { name: 'المعاملات' }).click();
});

test('add A, B, C → undo×2 → add D → all four are preserved as branches in History', async ({
  page,
}) => {
  await addTransaction(page, { type: 'income', category: 'التبرعات', amount: '100', description: 'A' });
  await addTransaction(page, { type: 'income', category: 'التبرعات', amount: '200', description: 'B' });
  await addTransaction(page, { type: 'income', category: 'التبرعات', amount: '300', description: 'C' });
  await expect(page.getByRole('cell', { name: 'A' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'B' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'C' })).toBeVisible();

  await page.getByRole('button', { name: /^تراجع$/ }).click();
  await page.getByRole('button', { name: /^تراجع$/ }).click();
  await expect(page.getByRole('cell', { name: 'A' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'B' })).toHaveCount(0);
  await expect(page.getByRole('cell', { name: 'C' })).toHaveCount(0);

  // Editing here forks: D becomes a sibling branch of "B then C"
  await addTransaction(page, { type: 'income', category: 'التبرعات', amount: '400', description: 'D' });
  await expect(page.getByRole('cell', { name: 'D' })).toBeVisible();

  // History should hold root + 4 commits
  await page.getByRole('button', { name: 'السجل' }).click();
  const rows = page.getByTestId('history-row');
  await expect(rows).toHaveCount(5);
  // Each amount appears in some snapshot label (describeAction puts it there)
  for (const amount of ['100', '200', '300', '400']) {
    await expect(rows.filter({ hasText: amount }).first()).toBeVisible();
  }
});

test('redo button restores the most recent branch', async ({ page }) => {
  await addTransaction(page, { type: 'income', category: 'التبرعات', amount: '100', description: 'A' });
  await page.getByRole('button', { name: /^تراجع$/ }).click();
  await expect(page.getByRole('cell', { name: 'A' })).toHaveCount(0);
  await page.getByRole('button', { name: /^إعادة$/ }).click();
  await expect(page.getByRole('cell', { name: 'A' })).toBeVisible();
});

test('restoring a snapshot from History becomes the new current state', async ({ page }) => {
  await addTransaction(page, { type: 'income', category: 'التبرعات', amount: '100', description: 'A' });
  await addTransaction(page, { type: 'income', category: 'التبرعات', amount: '200', description: 'B' });

  await page.getByRole('button', { name: 'السجل' }).click();
  // Restore the snapshot whose label contains the amount 100
  await page
    .getByTestId('history-row')
    .filter({ hasText: '100' })
    .first()
    .getByRole('button', { name: /^استرجاع/ })
    .click();

  await page.getByRole('button', { name: 'المعاملات' }).click();
  await expect(page.getByRole('cell', { name: 'A' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'B' })).toHaveCount(0);

  // Older snapshot (B) is still preserved
  await page.getByRole('button', { name: 'السجل' }).click();
  await expect(page.getByTestId('history-row').filter({ hasText: '200' }).first()).toBeVisible();
});

test('undo and redo are disabled at the start (no history yet)', async ({ page }) => {
  await expect(page.getByRole('button', { name: /^تراجع$/ })).toBeDisabled();
  await expect(page.getByRole('button', { name: /^إعادة$/ })).toBeDisabled();
});
