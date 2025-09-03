import { test, expect } from '@playwright/test';
import crypto from 'crypto';
import {USERS} from './support/Person';


test('should allow admin to create a new event', async ({ page }) => {
  await page.goto('/');
  const eventName = `Test Event ${crypto.randomBytes(4).toString('hex')}`;

  await page.getByRole('link', { name: 'Admin' }).click();
  await page.getByRole('textbox', { name: 'E-mail' }).fill(USERS.ADMIN.email);
  await page.getByRole('textbox', { name: 'Password' }).fill(USERS.ADMIN.password);
  await page.getByRole('button', { name: 'Login' }).click();

  await page.waitForURL('/admin/dashboard');

  await page.getByRole('button', { name: 'Add Event' }).click();

  await page.waitForURL('/admin/add-event');

  await page.getByRole('textbox', { name: 'Event name' }).fill(eventName);
  await page.getByRole('textbox', { name: 'Starts At' }).fill('2025-01-01T12:00');
  await page.getByRole('spinbutton', { name: 'Capacity' }).fill('10');
  page.once('dialog', dialog => dialog.dismiss().catch(() => {}));
  await page.getByRole('button', { name: 'Create event' }).click();

  await expect(page).toHaveURL('/admin/dashboard');
  await expect(page.getByText(eventName, { exact: true })).toBeVisible();
});
