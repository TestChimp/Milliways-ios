import { test, expect } from './fixtures/index.js';
import {
  navigateToMenu,
  signInForDemo,
  addItemToCart,
  openCart,
} from './helpers/order.js';

test.beforeEach(async ({ device, bundleId, screen, seededUser }) => {
  await device.terminateApp(bundleId).catch(() => {});
  await device.launchApp(bundleId);
  await signInForDemo(screen, expect, seededUser);
});

test.describe('US-104 navigate app after ordering', () => {
  test('closing delivery returns to welcome', async ({ screen, markScreenState }) => {
    // @Scenario: #TS-111 Closing delivery screen returns to welcome
    await navigateToMenu(screen, expect);
    await addItemToCart(screen, expect, 'Soup of the Day', 0);
    await screen.getByText('View Order').tap();
    await markScreenState('Cart', 'ReadyToPlace');
    await screen.getByLabel('Place Order').tap();
    await markScreenState('Delivery', 'Confirmed');

    await expect(screen.getByText(/is on its way/)).toBeVisible();
    await screen.getByLabel('Close').tap();

    await expect(screen.getByText('Welcome to Milliways')).toBeVisible({ timeout: 20_000 });
    await screen.getByLabel('New Order').scrollIntoViewIfNeeded();
    await expect(screen.getByLabel('New Order')).toBeVisible({ timeout: 20_000 });
  });

  test('cart is cleared after completing an order', async ({ screen, markScreenState }) => {
    // @Scenario: #TS-112 Cart is empty after completing an order
    await navigateToMenu(screen, expect);
    await addItemToCart(screen, expect, 'Krikkit Fried Logic', 0);
    await screen.getByText('View Order').tap();
    await screen.getByLabel('Place Order').tap();
    await markScreenState('Delivery', 'Confirmed');

    await screen.getByLabel('Close').tap();
    await expect(screen.getByText('Welcome to Milliways')).toBeVisible({ timeout: 20_000 });

    await screen.getByLabel('New Order').scrollIntoViewIfNeeded();
    await screen.getByLabel('New Order').tap();
    await markScreenState('Menu', 'Browsing');
    await openCart(screen);
    await expect(screen.getByText('Your order is empty')).toBeVisible();
  });
});
