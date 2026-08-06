import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test('Empty checkout redirects to shop', async ({ page }) => {
    await page.goto('/checkout');
    
    await expect(page.locator('text=Nothing to check out')).toBeVisible();
    await expect(page.locator('text=Browse the Shelves')).toBeVisible();
  });
});
