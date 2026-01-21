import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.click('button[type="submit"]');

    // Check for HTML5 validation or custom error messages
    const emailInput = page.getByPlaceholder(/email/i);
    await expect(emailInput).toHaveAttribute('required', '');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Wait for error message
    await expect(page.getByText(/invalid|incorrect|failed/i)).toBeVisible({ timeout: 5000 });
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Test123!@#');
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await page.waitForURL('/dashboard', { timeout: 10000 });
    await expect(page.getByText(/dashboard/i)).toBeVisible();
  });

  test('should navigate to signup page', async ({ page }) => {
    await page.click('a[href="/signup"]');
    await page.waitForURL('/signup');
    await expect(page.getByRole('heading', { name: /sign up|create account/i })).toBeVisible();
  });

  test('should show password visibility toggle', async ({ page }) => {
    const passwordInput = page.getByPlaceholder(/password/i);

    // Initially should be password type
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click eye icon to toggle visibility (if implemented)
    const toggleButton = page
      .locator('button')
      .filter({ has: page.locator('svg') })
      .first();
    if ((await toggleButton.count()) > 0) {
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'text');
    }
  });

  test('should persist email on failed login', async ({ page }) => {
    const testEmail = 'test@example.com';
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Email should still be filled after error
    await expect(page.getByPlaceholder(/email/i)).toHaveValue(testEmail);
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate offline
    await page.context().setOffline(true);

    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Test123!@#');
    await page.click('button[type="submit"]');

    // Should show network error
    await expect(page.getByText(/network|connection|offline/i)).toBeVisible({ timeout: 5000 });

    await page.context().setOffline(false);
  });
});
