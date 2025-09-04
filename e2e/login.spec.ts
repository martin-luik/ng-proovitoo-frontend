import { test, expect } from '@playwright/test';


test('Admin can log in and see the dashboard', async ({ page }) => {
  await page.goto('http://localhost:4200/');
  await page.getByRole('link', { name: 'Admin' }).click();

  await page.fill('#email', 'admin@example.com');
  await page.fill('#password', 'admin123');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL(/.*dashboard/);
});
