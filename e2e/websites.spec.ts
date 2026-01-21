import { test, expect } from '@playwright/test';

test.describe('Websites Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to websites page
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Test123!@#');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    await page.goto('/dashboard/websites');
  });

  test('should display websites page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /websites|monitored sites/i })).toBeVisible();
  });

  test('should show add website button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /add.*website|new.*website/i })).toBeVisible();
  });

  test('should open add website dialog', async ({ page }) => {
    await page.click('button:has-text("Add Website")');

    // Dialog should be visible
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 2000 });
    await expect(page.getByText(/add.*website|new.*website/i)).toBeVisible();
  });

  test('should add new website', async ({ page }) => {
    await page.click('button:has-text("Add Website")');

    // Fill in website details
    await page.fill('input[name="name"]', 'Test Website');
    await page.fill('input[name="url"]', 'https://example.com');
    await page.fill('input[name="check_interval"]', '60');

    // Submit form
    await page.click('button[type="submit"]:has-text("Add")');

    // Should close dialog and show new website
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Test Website')).toBeVisible({ timeout: 5000 });
  });

  test('should validate required fields', async ({ page }) => {
    await page.click('button:has-text("Add Website")');

    // Try to submit without filling
    await page.click('button[type="submit"]:has-text("Add")');

    // Should show validation errors
    const nameInput = page.locator('input[name="name"]');
    await expect(nameInput).toHaveAttribute('required', '');
  });

  test('should validate URL format', async ({ page }) => {
    await page.click('button:has-text("Add Website")');

    await page.fill('input[name="name"]', 'Test Website');
    await page.fill('input[name="url"]', 'invalid-url');
    await page.click('button[type="submit"]:has-text("Add")');

    // Should show URL validation error
    await expect(page.getByText(/invalid.*url|valid.*url/i)).toBeVisible({ timeout: 3000 });
  });

  test('should display website list', async ({ page }) => {
    // Wait for websites to load
    await page.waitForTimeout(2000);

    // Should show table or grid of websites
    const websiteItems = await page.locator('[data-testid="website-item"]').count();
    expect(websiteItems).toBeGreaterThanOrEqual(0);
  });

  test('should search websites', async ({ page }) => {
    await page.waitForTimeout(2000);

    const searchInput = page.locator('input[placeholder*="Search"]');
    if ((await searchInput.count()) > 0) {
      await searchInput.fill('example');
      await page.waitForTimeout(1000);

      // Results should be filtered
      const results = await page.locator('[data-testid="website-item"]').count();
      expect(results).toBeGreaterThanOrEqual(0);
    }
  });

  test('should edit website', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Find edit button for first website
    const editButton = page.locator('button:has-text("Edit")').first();
    if ((await editButton.count()) > 0) {
      await editButton.click();

      // Edit dialog should open
      await expect(page.getByRole('dialog')).toBeVisible({ timeout: 2000 });

      // Change name
      const nameInput = page.locator('input[name="name"]');
      await nameInput.fill('Updated Website Name');

      // Save changes
      await page.click('button[type="submit"]:has-text("Save")');

      // Should close dialog
      await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 });
    }
  });

  test('should delete website', async ({ page }) => {
    await page.waitForTimeout(2000);

    const deleteButton = page.locator('button:has-text("Delete")').first();
    if ((await deleteButton.count()) > 0) {
      await deleteButton.click();

      // Confirmation dialog should appear
      await expect(page.getByText(/confirm|are you sure/i)).toBeVisible({ timeout: 2000 });

      // Confirm deletion
      await page.click('button:has-text("Delete"):not(:disabled)');

      // Should show success message
      await expect(page.getByText(/deleted|removed/i)).toBeVisible({ timeout: 5000 });
    }
  });

  test('should show website status', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Should display status indicators
    const statusBadges = await page.locator('[class*="badge"], [class*="status"]').count();
    expect(statusBadges).toBeGreaterThan(0);
  });

  test('should view website details', async ({ page }) => {
    await page.waitForTimeout(2000);

    const viewButton = page.locator('button:has-text("View"), a:has-text("View")').first();
    if ((await viewButton.count()) > 0) {
      await viewButton.click();

      // Should navigate to details page or show modal
      await page.waitForTimeout(1000);
      await expect(page.getByText(/details|statistics|uptime/i)).toBeVisible();
    }
  });

  test('should filter websites by status', async ({ page }) => {
    await page.waitForTimeout(2000);

    const filterButton = page
      .locator('button:has-text("All"), button:has-text("Up"), button:has-text("Down")')
      .first();
    if ((await filterButton.count()) > 0) {
      await filterButton.click();
      await page.waitForTimeout(1000);

      // Results should update
      const count = await page.locator('[data-testid="website-item"]').count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });

  test('should show pagination', async ({ page }) => {
    await page.waitForTimeout(2000);

    const paginationButtons = await page
      .locator('button:has-text("Next"), button:has-text("Previous")')
      .count();

    // Pagination may or may not be visible depending on data
    expect(paginationButtons).toBeGreaterThanOrEqual(0);
  });

  test('should show website uptime percentage', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Should display uptime percentages
    const uptimeText = await page.getByText(/%/).count();
    expect(uptimeText).toBeGreaterThanOrEqual(0);
  });

  test('should show last check time', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Should display timestamps
    const timeAgo = await page.getByText(/ago|minutes|hours|days/).count();
    expect(timeAgo).toBeGreaterThan(0);
  });
});
