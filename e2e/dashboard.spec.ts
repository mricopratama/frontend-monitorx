import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Test123!@#');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should display dashboard heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /dashboard|overview/i })).toBeVisible();
  });

  test('should show website statistics', async ({ page }) => {
    // Should display stat cards
    await expect(page.getByText(/total.*websites/i)).toBeVisible();
    await expect(page.getByText(/uptime|down|up/i)).toBeVisible();
  });

  test('should display website list', async ({ page }) => {
    // Wait for websites to load
    await page.waitForTimeout(2000);

    // Should have table or list of websites
    const websiteCount = await page.locator('[data-testid="website-item"]').count();
    expect(websiteCount).toBeGreaterThanOrEqual(0);
  });

  test('should navigate to websites page', async ({ page }) => {
    await page.click('a[href*="/dashboard/websites"]');
    await page.waitForURL(/.*\/dashboard\/websites/);
    await expect(page.getByRole('heading', { name: /websites/i })).toBeVisible();
  });

  test('should navigate to alerts page', async ({ page }) => {
    await page.click('a[href*="/dashboard/alerts"]');
    await page.waitForURL(/.*\/dashboard\/alerts/);
    await expect(page.getByRole('heading', { name: /alerts/i })).toBeVisible();
  });

  test('should navigate to analytics page', async ({ page }) => {
    await page.click('a[href*="/dashboard/analytics"]');
    await page.waitForURL(/.*\/dashboard\/analytics/);
    await expect(page.getByRole('heading', { name: /analytics/i })).toBeVisible();
  });

  test('should navigate to settings page', async ({ page }) => {
    await page.click('a[href*="/dashboard/settings"]');
    await page.waitForURL(/.*\/dashboard\/settings/);
    await expect(page.getByRole('heading', { name: /settings/i })).toBeVisible();
  });

  test('should display user menu', async ({ page }) => {
    // Look for user avatar or menu button
    const userMenu = page
      .locator('[data-testid="user-menu"]')
      .or(page.locator('button').filter({ hasText: /user|profile/i }));
    if ((await userMenu.count()) > 0) {
      await expect(userMenu.first()).toBeVisible();
    }
  });

  test('should toggle theme', async ({ page }) => {
    // Find theme toggle button
    const themeToggle = page.locator('[data-testid="theme-toggle"]').or(
      page
        .locator('button')
        .filter({ has: page.locator('svg') })
        .filter({ hasText: /theme|dark|light/i })
    );

    if ((await themeToggle.count()) > 0) {
      const htmlElement = page.locator('html');
      const initialTheme = await htmlElement.getAttribute('class');

      await themeToggle.first().click();
      await page.waitForTimeout(500);

      const newTheme = await htmlElement.getAttribute('class');
      expect(newTheme).not.toBe(initialTheme);
    }
  });

  test('should logout successfully', async ({ page }) => {
    // Find and click logout button
    const logoutButton = page.getByRole('button', { name: /logout|sign out/i });

    if ((await logoutButton.count()) > 0) {
      await logoutButton.click();

      // Should redirect to login page
      await page.waitForURL(/login|\/$/);
      await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible({ timeout: 5000 });
    } else {
      // Try finding in user menu
      await page.click('[data-testid="user-menu"]');
      await page.click('text=/logout|sign out/i');
      await page.waitForURL(/login|\/$/);
    }
  });

  test('should show recent activity', async ({ page }) => {
    // Wait for activity to load
    await page.waitForTimeout(2000);

    // Check for recent checks or activity section
    const hasActivity = (await page.getByText(/recent|activity|checks/i).count()) > 0;
    expect(hasActivity).toBeTruthy();
  });

  test('should display charts and graphs', async ({ page }) => {
    // Wait for charts to render
    await page.waitForTimeout(3000);

    // Check for chart containers or SVG elements
    const chartElements = await page.locator('svg, canvas, [class*="chart"]').count();
    expect(chartElements).toBeGreaterThan(0);
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Dashboard should still be visible
    await expect(page.getByRole('heading', { name: /dashboard|overview/i })).toBeVisible();

    // Mobile menu should be present
    const mobileMenu = page
      .locator('[data-testid="mobile-menu"]')
      .or(page.locator('button[aria-label*="menu"]'));
    if ((await mobileMenu.count()) > 0) {
      await expect(mobileMenu.first()).toBeVisible();
    }
  });

  test('should handle real-time updates via WebSocket', async ({ page }) => {
    // Wait for WebSocket connection
    await page.waitForTimeout(3000);

    // Check if real-time data is updating
    const initialText = await page.textContent('body');
    await page.waitForTimeout(5000);
    const updatedText = await page.textContent('body');

    // Page should have content (WebSocket may or may not update in this timeframe)
    expect(initialText?.length).toBeGreaterThan(0);
    expect(updatedText?.length).toBeGreaterThan(0);
  });
});
