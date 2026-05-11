import { test, expect } from './fixtures/index.js';
import { navigateToMenu, signInForDemo, addItemToCart } from './helpers/order.js';

test.beforeEach(async ({ device, bundleId, screen, seededUser }) => {
  await device.terminateApp(bundleId).catch(() => {});
  await device.launchApp(bundleId);
  await signInForDemo(screen, expect, seededUser);
});

test.describe('US-100 order food — cart and pricing', () => {
  test('multi-item cart totals are accurate', async ({ screen, markScreenState }) => {
    // @Scenario: #TS-102 Multi-item cart totals are accurate
    await navigateToMenu(screen, expect);
    await markScreenState('Menu', 'Browsing');

    await addItemToCart(screen, expect, 'Ameglian Major Cow', 0);
    await expect(screen.getByText('MAIN DISHES')).toBeVisible();
    await addItemToCart(screen, expect, 'Green Salad', 0);
    await expect(screen.getByText('MAIN DISHES')).toBeVisible();
    await screen.getByText('Coffee').scrollIntoViewIfNeeded();
    await addItemToCart(screen, expect, 'Coffee', 0);

    await expect(screen.getByText('3 items')).toBeVisible({ timeout: 20_000 });
    await expect(screen.getByText('₭61.50').last()).toBeVisible({ timeout: 20_000 });

    await screen.getByText('View Order').tap();
    await markScreenState('Cart', 'Review');
    await expect(screen.getByText('₭61.50').last()).toBeVisible({ timeout: 20_000 });
  });

  test('add multiple quantities from menu list updates price', async ({ screen, markScreenState }) => {
    // @Scenario: #TS-103 Add multiple quantities from menu list updates price
    await navigateToMenu(screen, expect);
    await markScreenState('Menu', 'Browsing');

    await addItemToCart(screen, expect, 'Quantum Shrimp Cascade', 2);

    await expect(screen.getByText('3 items')).toBeVisible();
    await expect(screen.getByText('₭114.00')).toBeVisible();

    await screen.getByText('View Order').tap();
    await markScreenState('Cart', 'Review');
    await expect(screen.getByText('3 × ₭38.00')).toBeVisible();
    await expect(screen.getByText('₭114.00')).toBeVisible();
  });

  test('quantity cannot go below 1 on item detail', async ({ screen, markScreenState }) => {
    // @Scenario: #TS-115 Menu item quantity cannot go below one
    await navigateToMenu(screen, expect);
    await markScreenState('Menu', 'Browsing');
    await screen.getByText('Soup of the Day').tap();

    await expect(screen.getByText('1')).toBeVisible();
    await screen.getByLabel('−').tap();
    await screen.getByLabel('−').tap();
    await expect(screen.getByText('1')).toBeVisible();
    await expect(screen.getByText('0')).not.toBeVisible();
  });
});
