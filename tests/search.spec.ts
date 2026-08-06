import { test, expect } from '@playwright/test';

test.describe('Search and Filter Flow', () => {
  test('User can search for a book from the homepage', async ({ page }) => {
    // We mock the API so it doesn't fail if WC is down during E2E
    await page.route('/api/search*', async route => {
      const json = {
        results: [
          {
            id: 101,
            name: "The Holiness of God",
            slug: "holiness-of-god",
            price: "499",
            image: null,
            author: "R.C. Sproul",
            rating: "5.0",
            ratingCount: 10
          }
        ]
      };
      await route.fulfill({ json });
    });

    await page.goto('/');
    
    // Type in the search bar
    const searchInput = page.locator('input[type="search"]');
    await searchInput.fill('holiness');
    
    // Check if the dropdown shows the result
    await expect(page.locator('text=The Holiness of God').first()).toBeVisible();
    
    // Click see all results
    await page.click('text=See all results');
    
    // Should be on the search page
    await expect(page).toHaveURL(/search\?q=holiness/);
  });
});
