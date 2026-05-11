import { test, expect } from './fixtures/index.js';
import { signInForDemo, openAccount, parsePrice } from './helpers/order.js';

test.beforeEach(async ({ device, bundleId, screen, seededUser }) => {
  await device.terminateApp(bundleId).catch(() => {});
  await device.launchApp(bundleId);
  await signInForDemo(screen, expect, seededUser);
});

test.describe('US-103 view account and order history', () => {
  test('profile shows user info and loyalty', async ({ screen, markScreenState, seededUser }) => {
    // @Scenario: #TS-109 Account profile shows user email and loyalty tier
    await openAccount(screen);
    await markScreenState('Account', 'Profile');

    await expect(screen.getByLabel(seededUser.email)).toBeVisible({ timeout: 20_000 });
    await expect(screen.getByText('Pro Cosmic Foodie')).toBeVisible();
    await expect(screen.getByText('My Account')).toBeVisible();
  });

  test.fixme('past orders total matches displayed total spent', async ({ screen, markScreenState }) => {
    // @Scenario: #TS-110 Past orders sum matches displayed total spent
    await openAccount(screen);
    await markScreenState('Account', 'Orders');

    const priceElements = screen.getByText(/₭\d+\.\d+/);
    const count = await priceElements.count();
    const displayedTotal = parsePrice(await priceElements.nth(0).getText());
    let sum = 0;
    for (let i = 1; i < count; i++) {
      sum += parsePrice(await priceElements.nth(i).getText());
    }
    expect(sum).toBe(displayedTotal);
  });
});
