import { test, expect } from './fixtures/index.js';
import { navigateToMenu, signInForDemo, addItemToCart } from './helpers/order.js';

test.beforeEach(async ({ device, bundleId, screen, seededUser }) => {
  await device.terminateApp(bundleId).catch(() => {});
  await device.launchApp(bundleId);
  await signInForDemo(screen, expect, seededUser);
});

test.describe('US-102 apply promotional coupons', () => {
  test('MARVIN coupon applies discount', async ({ screen, markScreenState }) => {
    // @Scenario: #TS-107 MARVIN coupon applies configured discount
    await navigateToMenu(screen, expect);
    await markScreenState('Menu', 'Browsing');
    await addItemToCart(screen, expect, 'Ameglian Major Cow', 0);
    await screen.getByText('View Order').tap();
    await markScreenState('Cart', 'CouponEntry');

    await screen.getByLabel('Coupon code').fill('MARVIN');
    await screen.getByText('Apply').tap();

    await expect(screen.getByText('-₭20.00')).toBeVisible();
    await expect(screen.getByText('₭15.00')).toBeVisible();
  });

  test('invalid coupon shows error', async ({ screen, markScreenState }) => {
    // @Scenario: #TS-108 Invalid coupon code shows error message
    await navigateToMenu(screen, expect);
    await addItemToCart(screen, expect, 'Coffee', 0);
    await screen.getByText('View Order').tap();
    await markScreenState('Cart', 'CouponEntry');

    await screen.getByLabel('Coupon code').fill('ZAPHOD');
    await screen.getByText('Apply').tap();

    await expect(screen.getByText('Invalid coupon code')).toBeVisible();
  });

  test.fixme('coupon removal can lead to negative total at checkout', async ({ screen, markScreenState }) => {
    // @Scenario: #TS-116 Checkout after coupon and line removal handles totals safely
    await navigateToMenu(screen, expect);
    await addItemToCart(screen, expect, 'Ameglian Major Cow', 0);
    await expect(screen.getByText('MAIN DISHES')).toBeVisible();
    await addItemToCart(screen, expect, 'Coffee', 0);

    await screen.getByText('View Order').tap();
    await expect(screen.getByText('₭39.50')).toBeVisible();

    await screen.getByLabel('Coupon code').fill('MARVIN');
    await screen.getByText('Apply').tap();
    await expect(screen.getByText('₭19.50')).toBeVisible();

    await screen.getByText('Ameglian Major Cow').swipe({ direction: 'left' });
    await screen.getByLabel('Delete').tap();

    await expect(screen.getByText('₭-15.50')).toBeVisible();
    await screen.getByLabel('Place Order').tap();
    await expect(screen.getByText(/minutes for delivery/)).toBeVisible();
  });
});
