import { test, expect } from './fixtures/index.js';
import { navigateToMenu, signInForDemo, addItemToCart, openCart } from './helpers/order.js';

test.beforeEach(async ({ device, bundleId, screen, seededUser }) => {
  await device.terminateApp(bundleId).catch(() => {});
  await device.launchApp(bundleId);
  await signInForDemo(screen, expect, seededUser);
});

test.describe('US-105 cart and checkout edge cases', () => {
  test.fixme('empty cart checkout should not crash', async ({ screen, markScreenState }) => {
    // @Scenario: #TS-113 Empty cart checkout behavior
    await navigateToMenu(screen, expect);
    await openCart(screen);
    await markScreenState('Cart', 'Empty');

    await expect(screen.getByText('Your order is empty')).toBeVisible();
    await screen.getByLabel('Place Order').tap();
    await expect(screen.getByText(/minutes for delivery/)).toBeVisible();
  });

  test.fixme('footer uses singular item for quantity of one', async ({ screen, markScreenState }) => {
    // @Scenario: #TS-114 Footer uses singular item label for quantity of one
    await navigateToMenu(screen, expect);
    await addItemToCart(screen, expect, 'Green Salad', 0);
    await markScreenState('Menu', 'StickyFooter');

    await expect(screen.getByText(/1 item/)).toBeVisible();
    await expect(screen.getByText('1 items')).not.toBeVisible();
  });
});
