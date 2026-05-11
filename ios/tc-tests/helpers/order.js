/** Shared Mobilewright helpers for Milliways ordering flows. */
export async function navigateToMenu(screen, expect) {
  await screen.getByLabel('New Order').tap();
  await expect(screen.getByText('MAIN DISHES')).toBeVisible();
}

export async function signInForDemo(screen, expect, user) {
  await expect(screen.getByText('Sign in to order from the restaurant at the end of the universe.')).toBeVisible();
  await screen.getByLabel('Email').fill(user.email);
  await screen.getByLabel('Password').fill(user.password);
  await screen.getByText('Sign In').tap();
  await screen.getByText('Not Now').tap({ timeout: 3000 }).catch(() => {});
  await expect(screen.getByLabel('New Order')).toBeVisible();
}

/** @param {number} extraPlusTaps taps on + after opening detail (0 = qty 1) */
export async function addItemToCart(screen, expect, itemName, extraPlusTaps = 0) {
  await screen.getByText(itemName).scrollIntoViewIfNeeded();
  await screen.getByText(itemName).tap();
  for (let i = 0; i < extraPlusTaps; i++) {
    await screen.getByLabel('+').tap();
  }
  await screen.getByLabel('Add to Order').tap();
}

export async function openCart(screen) {
  await screen.getByLabel('Shopping Cart').tap();
}

export function parsePrice(text) {
  return parseFloat(String(text).replace('₭', ''));
}

export async function openAccount(screen) {
  await screen.getByLabel('person.circle').tap();
}
