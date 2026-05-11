import { test, expect } from './fixtures/index.js';

async function navigateToMenu(screen) {
  await screen.getByLabel('New Order').tap();
  await expect(screen.getByText('MAIN DISHES')).toBeVisible();
}

async function signInForDemo(screen, user) {
  await expect(screen.getByText('Sign in to order from the restaurant at the end of the universe.')).toBeVisible();
  await screen.getByLabel('Email').fill(user.email);
  await screen.getByLabel('Password').fill(user.password);
  await screen.getByText('Sign In').tap();
  await screen.getByText('Not Now').tap({ timeout: 3000 }).catch(() => {});
  await expect(screen.getByLabel('New Order')).toBeVisible();
}

/** Tap item row, optional extra `+` taps before Add (default quantity 1). */
async function addItemToCart(screen, itemName, extraPlusTaps = 0) {
  await screen.getByText(itemName).scrollIntoViewIfNeeded();
  await screen.getByText(itemName).tap();
  for (let i = 0; i < extraPlusTaps; i++) {
    await screen.getByLabel('+').tap();
  }
  await screen.getByLabel('Add to Order').tap();
}

test.beforeEach(async ({ device, bundleId, screen, seededUser }) => {
  await device.terminateApp(bundleId).catch(() => {});
  await device.launchApp(bundleId);
  await signInForDemo(screen, seededUser);
});

test.describe('US-100 order food', () => {
  test('add menu item and change quantity in detail before checkout', async ({ screen, markScreenState }) => {
    // @Scenario: #TS-100 Add menu item and change quantity
    await navigateToMenu(screen);
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
    await expect(screen.getByText('₭76.00')).toBeVisible();

    await screen.getByText('View Order').tap();
    await markScreenState('Cart', 'Review');
    await expect(screen.getByText('2 × ₭38.00')).toBeVisible();
    await expect(screen.getByText('₭76.00')).toBeVisible();
  });

  test('submit order and reach delivery confirmation', async ({ screen, markScreenState }) => {
    // @Scenario: #TS-101 Submit order with valid delivery details
    await navigateToMenu(screen);
    await markScreenState('Menu', 'Browsing');

    await addItemToCart(screen, 'Coffee', 0);
    await expect(screen.getByText('View Order')).toBeVisible();

    await screen.getByText('View Order').tap();
    await markScreenState('Cart', 'ReadyToPlace');

    await screen.getByLabel('Place Order').tap();
    await markScreenState('Delivery', 'Confirmed');

    await expect(screen.getByText(/is on its way/)).toBeVisible();
    await expect(screen.getByText(/minutes for delivery/)).toBeVisible();
  });
});
