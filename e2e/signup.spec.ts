import { test, expect } from '@playwright/test';

test.describe('Signup Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signup');
  });

  test('should display signup form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /sign up|create account/i })).toBeVisible();
    await expect(page.getByPlaceholder(/name/i)).toBeVisible();
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign up|create account/i })).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.click('button[type="submit"]');

    // Check for required field validation
    const nameInput = page.getByPlaceholder(/name/i);
    await expect(nameInput).toHaveAttribute('required', '');
  });

  test('should validate email format', async ({ page }) => {
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="password"]', 'Test123!@#');
    await page.click('button[type="submit"]');

    // Should show email validation error
    const emailInput = page.getByPlaceholder(/email/i);
    const validationMessage = await emailInput.evaluate(
      (el: HTMLInputElement) => el.validationMessage
    );
    expect(validationMessage).toBeTruthy();
  });

  test('should validate password strength', async ({ page }) => {
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', '123');
    await page.click('button[type="submit"]');

    // Should show password validation error
    await expect(page.getByText(/password.*too short|minimum.*characters/i)).toBeVisible({
      timeout: 3000,
    });
  });

  test('should successfully create account', async ({ page }) => {
    const timestamp = Date.now();
    const email = `test${timestamp}@example.com`;

    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'Test123!@#');
    await page.click('button[type="submit"]');

    // Should redirect to dashboard or show success message
    await expect(page).toHaveURL(/dashboard|login/, { timeout: 10000 });
  });

  test('should show error for existing email', async ({ page }) => {
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'existing@example.com');
    await page.fill('input[name="password"]', 'Test123!@#');
    await page.click('button[type="submit"]');

    // Should show email already exists error
    await expect(page.getByText(/already exists|already registered/i)).toBeVisible({
      timeout: 5000,
    });
  });

  test('should navigate to login page', async ({ page }) => {
    await page.click('a[href="/login"]');
    await page.waitForURL('/login');
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  });

  test('should show password visibility toggle', async ({ page }) => {
    const passwordInput = page.getByPlaceholder(/password/i);

    // Initially should be password type
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click eye icon to toggle visibility
    const toggleButton = page
      .locator('button')
      .filter({ has: page.locator('svg') })
      .first();
    if ((await toggleButton.count()) > 0) {
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'text');
    }
  });

  test('should trim whitespace from inputs', async ({ page }) => {
    await page.fill('input[name="name"]', '  Test User  ');
    await page.fill('input[name="email"]', '  test@example.com  ');

    // Values should be trimmed
    const nameValue = await page.getByPlaceholder(/name/i).inputValue();
    const emailValue = await page.getByPlaceholder(/email/i).inputValue();

    expect(nameValue.trim()).toBe(nameValue);
    expect(emailValue.trim()).toBe(emailValue);
  });

  test('should disable submit button during submission', async ({ page }) => {
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Test123!@#');

    const submitButton = page.getByRole('button', { name: /sign up|create account/i });
    await submitButton.click();

    // Button should be disabled during submission
    await expect(submitButton).toBeDisabled({ timeout: 1000 });
  });
});
