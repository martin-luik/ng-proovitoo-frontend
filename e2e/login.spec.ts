import {expect, test} from '@playwright/test';
import {USERS} from './support/Person';


test('should allow admin to log in and see the dashboard', async ({page}) => {
  await page.goto('/');
  await page.getByRole('link', {name: 'Admin'}).click();

  await page.fill('#email', USERS.ADMIN.email);
  await page.fill('#password', USERS.ADMIN.password);
  await page.getByRole('button', {name: 'Login'}).click();

  await expect(page).toHaveURL(/.*dashboard/);
});
