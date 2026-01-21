import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../.auth/user.json');

/**
 * Authentication Setup
 * Creates an authenticated session that can be reused across tests
 */
setup('authenticate', async ({ page }) => {
  // Navigate to login page
  await page.goto('/login');

  // Perform authentication
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'Test123!@#');
  await page.click('button[type="submit"]');

  // Wait until the page receives the cookies
  await page.waitForURL('/dashboard');

  // Verify we're authenticated
  await expect(page.getByText(/dashboard/i)).toBeVisible();

  // Save authentication state
  await page.context().storageState({ path: authFile });
});
