import {expect, test} from '@playwright/test';
import {USERS} from './support/Person';

test('should allow admin to log out', async ({page}) => {
  await page.goto('/');
  await page.getByRole('link', {name: 'Admin'}).click();

  await page.fill('#email', USERS.ADMIN.email);
  await page.fill('#password', USERS.ADMIN.password);
  await page.getByRole('button', {name: 'Login'}).click();
  await page.getByRole('button', {name: 'Log Out'}).click();

  await expect(page).toHaveURL('/');
});
