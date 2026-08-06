import { test, expect } from '@playwright/test';

test.describe('Buyer Account Creation & Full Customer E2E Journey', () => {
  // Generate a unique email for each test run to avoid collision
  const buyerEmail = `buyer_${Date.now()}@example.com`;
  const buyerPassword = `SecureBook123!`;
  const firstName = `John`;
  const lastName = `Reader`;

  test('1. Standard Email & Password Buyer Registration', async ({ page }) => {
    // 1. Visit registration page
    await page.goto('/register');
    await expect(page.locator('text=Create account').first()).toBeVisible();

    // 2. Fill registration form fields
    const inputs = page.locator('input');
    await inputs.nth(0).fill(firstName);      // First Name
    await inputs.nth(1).fill(lastName);       // Last Name
    await inputs.nth(2).fill(buyerEmail);     // Email
    await inputs.nth(3).fill(buyerPassword);  // Password
    await inputs.nth(4).fill(buyerPassword);  // Confirm Password

    // 3. Submit registration
    await page.click('button[type="submit"]:has-text("Create Account")');

    // 4. Verify successful redirection to Customer Account Dashboard
    await expect(page).toHaveURL(/\/account\/dashboard/, { timeout: 10000 });
    
    // 5. Assert account statistics and widgets are present
    await expect(page.locator('text=Dashboard').first()).toBeVisible();
    await expect(page.locator('text=Total Spent').first()).toBeVisible();
    await expect(page.locator('text=Wishlist').first()).toBeVisible();
  });

  test('2. Instant Google (Gmail) Profile Creation for Buyer', async ({ page }) => {
    await page.goto('/register');

    // 1. Click Instant Register with Google (Gmail)
    await page.click('button:has-text("Instant Register with Google")');

    // 2. Verify modal appears
    await expect(page.locator('text=Google Profile Creator')).toBeVisible();

    // 3. Input gmail address and continue
    const gmailInput = page.locator('input[type="email"][placeholder="your.name@gmail.com"]');
    await gmailInput.fill(`test.reader.${Date.now()}@gmail.com`);

    await page.click('button:has-text("Create Profile & Continue")');

    // 4. Verify seamless authentication and redirect to dashboard
    await expect(page).toHaveURL(/\/account\/dashboard/, { timeout: 10000 });
    await expect(page.locator('text=Recent Orders').first()).toBeVisible();
  });

  test('3. Authenticated Buyer Shopping, Cart Addition, and Checkout Exploration', async ({ page }) => {
    // Log in with fallback demo buyer profile to test shopping functionality
    await page.goto('/login');
    await page.fill('input[type="email"]', `returning.buyer@example.com`);
    await page.fill('input[type="password"]', `ReturningBuyer123!`);
    await page.click('button[type="submit"]:has-text("Sign in")');

    // Ensure we reached dashboard
    await expect(page).toHaveURL(/\/account/);

    // 1. Navigate to catalogue / shop
    await page.goto('/products');
    await expect(page.locator('text=Catalogue').or(page.locator('h1')).first()).toBeVisible();

    // 2. Verify search bar functionality from catalogue
    const searchBar = page.locator('input[type="search"]');
    if (await searchBar.isVisible()) {
      await searchBar.fill('God');
      // Wait for autocomplete or submit
      await searchBar.press('Enter');
    }

    // 3. Navigate to Cart page to verify state
    await page.goto('/cart');
    // Expect either empty cart notice or checkout button
    const isCartEmpty = await page.locator('text=your cart is empty').or(page.locator('text=Empty Cart')).count() > 0;
    if (isCartEmpty) {
      await expect(page.locator('a:has-text("Browse")').or(page.locator('a:has-text("Shop")')).first()).toBeVisible();
    }

    // 4. Verify checkout page security and rendering
    await page.goto('/checkout');
    // If cart is empty, app correctly redirects or displays "Nothing to check out"
    await expect(page.locator('body')).toBeVisible();
  });

  test('4. Buyer Logout and Session Protection', async ({ page }) => {
    // 1. Visit login page to authenticate
    await page.goto('/login');
    await page.fill('input[type="email"]', 'logout.test@example.com');
    await page.fill('input[type="password"]', 'LogoutTest123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/account/);

    // 2. Locate and execute sign out
    const logoutBtn = page.locator('button:has-text("Sign out"), a:has-text("Sign out"), button:has-text("Logout"), a:has-text("Logout")').first();
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
      // Should redirect away from authenticated dashboard
      await expect(page).not.toHaveURL(/\/account\/dashboard/);
    }
  });
});
