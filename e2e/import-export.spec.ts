import { test, expect } from '@playwright/test';
import { applyTestGlobals, clearAppData } from './_helpers';

test.beforeEach(async ({ page }) => {
  await applyTestGlobals(page);
  await page.goto('/');
  await clearAppData(page);
  await page.reload();
});

test('Import/Export sidebar entry navigates to the screen', async ({ page }) => {
  const navBtn = page.getByRole('button', { name: 'استيراد/تصدير' });
  await expect(navBtn).toBeVisible();
  await navBtn.click();

  // Page header text.
  await expect(page.getByRole('heading', { name: 'استيراد وتصدير' })).toBeVisible();

  // Both action buttons render.
  await expect(page.getByRole('button', { name: 'تصدير الآن' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'اختيار ملف…' })).toBeVisible();
});

test('in browser, Tauri-only buttons are disabled and a hint is shown', async ({ page }) => {
  await page.getByRole('button', { name: 'استيراد/تصدير' }).click();

  // Web-disabled hint is visible.
  await expect(
    page.getByText('الاستيراد والتصدير متاحان في تطبيق سطح المكتب فقط'),
  ).toBeVisible();

  // Buttons are disabled (the screen treats !isTauri as disabled).
  await expect(page.getByRole('button', { name: 'تصدير الآن' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'اختيار ملف…' })).toBeDisabled();
});

test('Import/Export entry shows the German label after switching language', async ({ page }) => {
  await page.getByRole('button', { name: 'Deutsch' }).click();
  await expect(page.getByRole('button', { name: 'Import/Export' })).toBeVisible();

  await page.getByRole('button', { name: 'Import/Export' }).click();
  await expect(page.getByRole('heading', { name: 'Import & Export' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Jetzt exportieren' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Datei wählen …' })).toBeVisible();
});
