import { test, expect } from './fixtures/index.js';
import {
  navigateToMenu,
  signInForDemo,
  addItemToCart,
} from './helpers/order.js';

test.beforeEach(async ({ device, bundleId, screen, seededUser }) => {
  await device.terminateApp(bundleId).catch(() => {});
  await device.launchApp(bundleId);
  await signInForDemo(screen, expect, seededUser);
});

test.describe('US-100 order food', () => {
  test('add menu item and change quantity in detail before checkout', async ({ screen, markScreenState }) => {
    // @Scenario: #TS-100 Add menu item and change quantity before checkout
    await navigateToMenu(screen, expect);
    await markScreenState('Menu', 'Browsing');

    await screen.getByText('Quantum Shrimp Cascade').scrollIntoViewIfNeeded();
    await screen.getByText('Quantum Shrimp Cascade').tap();
    await expect(screen.getByText('1')).toBeVisible();

    await screen.getByLabel('+').tap();
    await screen.getByLabel('+').tap();
    await expect(screen.getByText('3')).toBeVisible();
    await screen.getByLabel('−').tap();
    await expect(screen.getByText('2')).toBeVisible();
    await markScreenState('MenuItem', 'QuantityAdjusted');

    await screen.getByLabel('Add to Order').tap();
    await expect(screen.getByText('View Order')).toBeVisible();
    await expect(screen.getByText('2 items')).toBeVisible();
    await expect(screen.getByText('₭76.00').last()).toBeVisible({ timeout: 20_000 });

    await screen.getByText('View Order').tap();
    await markScreenState('Cart', 'Review');
    await expect(screen.getByText('2 × ₭38.00')).toBeVisible();
    await expect(screen.getByText('₭76.00').last()).toBeVisible({ timeout: 20_000 });
  });

  test('submit order and reach delivery confirmation', async ({ screen, markScreenState }) => {
    // @Scenario: #TS-101 Submit order with valid delivery details
    await navigateToMenu(screen, expect);
    await markScreenState('Menu', 'Browsing');

    await addItemToCart(screen, expect, 'Coffee', 0);
    await expect(screen.getByText('View Order')).toBeVisible();

    await screen.getByText('View Order').tap();
    await markScreenState('Cart', 'ReadyToPlace');

    await screen.getByLabel('Place Order').tap();
    await markScreenState('Delivery', 'Confirmed');

    await expect(screen.getByText(/is on its way/)).toBeVisible();
    await expect(screen.getByText(/minutes for delivery/)).toBeVisible();
  });

  test('complete order with two items and see delivery tracking', async ({ screen, markScreenState }) => {
    // @Scenario: #TS-101 Submit order with valid delivery details
    // @Scenario: #TS-104 View active order delivery tracking after placing order
    await navigateToMenu(screen, expect);
    await markScreenState('Menu', 'Browsing');

    await addItemToCart(screen, expect, 'Ameglian Major Cow', 0);
    await expect(screen.getByText('MAIN DISHES')).toBeVisible();
    await screen.getByText('Coffee').scrollIntoViewIfNeeded();
    await addItemToCart(screen, expect, 'Coffee', 0);

    await expect(screen.getByText('View Order')).toBeVisible();
    await expect(screen.getByText('2 items')).toBeVisible();
    await expect(screen.getByText('₭39.50').last()).toBeVisible({ timeout: 20_000 });

    await screen.getByText('View Order').tap();
    await markScreenState('Cart', 'Review');
    await expect(screen.getByText('Ameglian Major Cow')).toBeVisible();
    await expect(screen.getByText('Coffee')).toBeVisible();
    await expect(screen.getByText('₭39.50').last()).toBeVisible({ timeout: 20_000 });

    await screen.getByLabel('Place Order').tap();
    await markScreenState('Delivery', 'Confirmed');
    await expect(screen.getByText(/is on its way/)).toBeVisible();
    await expect(screen.getByText(/minutes for delivery/)).toBeVisible();
  });
});
