import { test, expect } from '@playwright/test';
import { applyTestGlobals, clearAppData } from './_helpers';

const LANG_KEY = 'muhaseb-tech:lang';

test.beforeEach(async ({ page }) => {
  await applyTestGlobals(page);
  await page.goto('/');
  await clearAppData(page);
  await page.evaluate((k: string) => localStorage.removeItem(k), LANG_KEY);
  await page.reload();
});

test('switching to Deutsch flips html dir/lang and updates UI', async ({ page }) => {
  // Default is Arabic, dir=rtl.
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');

  // Nav button reads "لوحة التحكم" in Arabic.
  await expect(page.getByRole('button', { name: 'لوحة التحكم' })).toBeVisible();

  // Click the German language button in the sidebar.
  await page.getByRole('button', { name: 'Deutsch' }).click();

  // html attributes flipped.
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  await expect(page.locator('html')).toHaveAttribute('data-lang', 'de');

  // Nav is now German.
  await expect(page.getByRole('button', { name: 'Übersicht' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Buchungen' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Kategorien' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Verlauf' })).toBeVisible();

  // The dashboard balance card shows currency in German convention (number then €).
  // Empty-state balance card renders "0,00 €" in German — assert digit-then-€ ordering.
  const balanceCard = page.locator('text=/\\d.*€/').first();
  await expect(balanceCard).toBeVisible();
});

test('language preference persists across reload', async ({ page }) => {
  await page.getByRole('button', { name: 'Deutsch' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  await expect(page.getByRole('button', { name: 'Übersicht' })).toBeVisible();
});
