import { test, expect } from '@playwright/test';
import crypto from "crypto";

test('As an admin, create a new event', async ({ page }) => {
  const eventName = `Test Event ${crypto.randomBytes(4).toString('hex')}`;

  await page.goto('/admin');
  await page.getByRole('textbox', { name: 'E-mail' }).click();
  await page.getByRole('textbox', { name: 'E-mail' }).fill('admin@example.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('admin123');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('button', { name: 'Add Event' }).click();
  await page.getByRole('textbox', { name: 'Event name' }).click();
  await page.getByRole('textbox', { name: 'Event name' }).fill(eventName);
  await page.getByRole('textbox', { name: 'Start At' }).click();
  await page.getByRole('textbox', { name: 'Start At' }).fill('2025-01-01T12:00');
  await page.getByRole('spinbutton', { name: 'Capacity' }).fill('10');
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'Create event' }).click();

  await expect(page).toHaveURL(/.*dashboard/);

  const eventLocator = page.getByText(eventName, { exact: true });
  await expect(eventLocator).toBeVisible();

});
