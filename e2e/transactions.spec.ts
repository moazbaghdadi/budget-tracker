import { test, expect } from '@playwright/test';
import { addCategory, addTransaction, applyTestGlobals, clearAppData } from './_helpers';

test.beforeEach(async ({ page }) => {
  await applyTestGlobals(page);
  await page.goto('/');
  await clearAppData(page);
  await page.reload();
});

test('add an income transaction → it appears on Transactions screen', async ({ page }) => {
  await addCategory(page, 'income', 'التبرعات');
  await page.getByRole('button', { name: 'المعاملات' }).click();
  await addTransaction(page, {
    type: 'income',
    category: 'التبرعات',
    amount: '500',
    description: 'تبرع تجريبي',
  });
  await expect(page.getByRole('cell', { name: 'تبرع تجريبي' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'التبرعات' }).first()).toBeVisible();
});

test('delete a transaction (with confirm) removes it from the table', async ({ page }) => {
  await addCategory(page, 'expense', 'الرواتب');
  await page.getByRole('button', { name: 'المعاملات' }).click();
  await addTransaction(page, {
    type: 'expense',
    category: 'الرواتب',
    amount: '100',
    description: 'مرتب اختبار',
  });
  await expect(page.getByRole('cell', { name: 'مرتب اختبار' })).toBeVisible();
  await page
    .getByRole('row', { name: /مرتب اختبار/ })
    .getByRole('button', { name: /حذف/ })
    .click();
  await expect(page.getByRole('cell', { name: 'مرتب اختبار' })).toHaveCount(0);
});

test('newly added category shows up in the Add Transaction modal', async ({ page }) => {
  await page.getByRole('button', { name: 'الفئات' }).click();
  await page.getByLabel('اسم الفئة الجديدة').first().fill('فئة جديدة');
  await page
    .getByRole('button', { name: /^إضافة فئة$/ })
    .first()
    .click();
  await page.getByRole('button', { name: 'المعاملات' }).click();
  await page.getByRole('button', { name: /إضافة معاملة/ }).first().click();
  await expect(page.getByRole('dialog').getByRole('button', { name: 'فئة جديدة' })).toBeVisible();
});
