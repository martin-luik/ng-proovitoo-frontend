import {expect, test} from '@playwright/test';
import crypto from 'crypto';
import {USERS} from './support/Person';

test('should not allow registration when event is full', async ({page}) => {
  const eventName = `Test Event ${crypto.randomBytes(4).toString('hex')}`;

  await page.goto('/');
  await page.getByRole('link', {name: 'Admin'}).click();
  await page.getByRole('textbox', {name: 'E-mail'}).fill(USERS.ADMIN.email);
  await page.getByRole('textbox', {name: 'Password'}).fill(USERS.ADMIN.password);
  await page.getByRole('button', {name: 'Login'}).click();

  await page.waitForURL('/admin/dashboard');

  await page.getByRole('button', {name: 'Add Event'}).click();

  await page.waitForURL('/admin/add-event');

  await page.getByRole('textbox', {name: 'Event name'}).fill(eventName);
  await page.getByRole('textbox', {name: 'Starts At'}).fill('2025-01-01T12:00');
  await page.getByRole('spinbutton', {name: 'Capacity'}).fill('1');
  await page.getByRole('button', {name: 'Create event'}).click();

  await page.waitForURL('/admin/dashboard');

  await page.getByRole('link', {name: 'Event Manager'}).click();

  await page.waitForURL('/');

  const eventCard = page
    .locator('app-event-card-wrapper')
    .filter({hasText: eventName});

  await eventCard.getByRole('button', {name: /register/i}).click();

  await page.getByRole('textbox', {name: 'First name'}).fill(USERS.MARI_MAASIKAS.firstName);
  await page.getByRole('textbox', {name: 'Last name'}).fill(USERS.MARI_MAASIKAS.lastName);
  await page.getByRole('textbox', {name: 'Personal code'}).fill(USERS.MARI_MAASIKAS.personalCode!);
  await page.getByRole('button', {name: 'Register'}).click();

  await page.waitForURL('/');

  await expect(
    eventCard.locator('.stat', {hasText: 'Registered'}).locator('.stat-value')
  ).toHaveText('1');

  await expect(
    eventCard.locator('.stat', {hasText: 'Available spots'}).locator('.stat-value')
  ).toHaveText('0');

  await expect(eventCard.getByRole('button', {name: /register/i})).toBeDisabled();
});
