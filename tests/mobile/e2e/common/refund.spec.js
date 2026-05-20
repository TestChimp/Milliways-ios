import '@testchimp/playwright/runtime';
import { test, expect } from '../../fixtures/index.js';
import {
  navigateToMenu,
  signInForDemo,
  addItemToCart,
  openCart,
  openAccount,
} from '../../../shared/order-helpers.js';
import { seedOrder } from '../../../shared/refund-helpers.js';

test.describe.configure({ mode: 'serial' });

test.beforeEach(async ({ screen, seededUser }, testInfo) => {
  await signInForDemo(screen, expect, seededUser, testInfo);
});

test.describe('US-107 request refund', () => {
  test('refund button enabled for recent orders', async ({ screen, seededUser }) => {
    // @Scenario: #TS-117 refund button visibility for recent orders
    await navigateToMenu(screen, expect);
    await addItemToCart(screen, expect, 'Coffee', 0);
    await screen.getByText('View Order').tap();
    await screen.getByLabel('Place Order').tap();
    await screen.getByLabel('Close').tap();

    await openAccount(screen, expect);
    await expect(screen.getByText('Past Orders')).toBeVisible({ timeout: 20_000 });
    const refundButton = screen.getByLabel('Request Refund').first();
    await expect(refundButton).toBeVisible({ timeout: 20_000 });
    await expect(refundButton).toBeEnabled({ timeout: 10_000 });
  });

  test('refund request shows confirmation message', async ({ screen, seededUser }) => {
    // @Scenario: #TS-119 successful refund request feedback message
    await navigateToMenu(screen, expect);
    await addItemToCart(screen, expect, 'Water', 0);
    await screen.getByText('View Order').tap();
    await screen.getByLabel('Place Order').tap();
    await screen.getByLabel('Close').tap();

    await openAccount(screen, expect);
    await screen.getByLabel('Request Refund').first().tap();
    await expect(screen.getByText('Your refund request was received.')).toBeVisible({
      timeout: 20_000,
    });
    await screen.getByText('OK').tap();
    await expect(screen.getByText('Refund pending')).toBeVisible({ timeout: 20_000 });
  });

  test('refund button disabled for old orders', async ({ screen, seededUser }) => {
    // @Scenario: #TS-118 refund button disabled for old orders
    await seedOrder(seededUser, { ageDays: 3 });

    await openAccount(screen, expect);
    await expect(screen.getByText('Past Orders')).toBeVisible({ timeout: 20_000 });
    const refundButton = screen.getByLabel('Request Refund').first();
    await expect(refundButton).toBeVisible({ timeout: 20_000 });
    await expect(refundButton).toBeDisabled({ timeout: 10_000 });
  });
});
