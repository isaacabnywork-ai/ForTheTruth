import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('User can log in as admin', async ({ page }) => {
    await page.goto('/login');
    
    // Fill the login form
    await page.fill('input[type="email"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    
    // Click the login button
    await page.click('button[type="submit"]');
    
    // Should be redirected or show dashboard
    await expect(page).toHaveURL(/\/account/);
    
    // Verify admin dashboard or name is visible
    await expect(page.locator('text=Master Admin').first()).toBeVisible();
  });

  test('Demo user fallback works for unknown email', async ({ page }) => {
    await page.goto('/login');
    
    // Fill the login form with random email
    const randomEmail = `testuser${Date.now()}@example.com`;
    await page.fill('input[type="email"]', randomEmail);
    await page.fill('input[type="password"]', 'anypassword');
    
    // Click login
    await page.click('button[type="submit"]');
    
    // Fallback logic creates a seamless profile
    await expect(page).toHaveURL(/\/account/);
    await expect(page.locator('text=Profile').first()).toBeVisible();
  });
});
