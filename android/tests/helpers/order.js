/** Android Compose: prefer text where no explicit accessibility label exists. */
export async function navigateToMenu(screen, expect) {
  await screen.getByText('New Order').tap();
  await expect(screen.getByText('MAIN DISHES')).toBeVisible();
}

export async function signInForDemo(screen, expect, user) {
  await expect(screen.getByText('Sign in to order from the restaurant at the end of the universe.')).toBeVisible({
    timeout: 30_000,
  });
  await screen.getByLabel('Email').fill(user.email);
  await screen.getByLabel('Password').fill(user.password);
  await screen.getByText('Sign In').tap();
  await expect(screen.getByText('New Order')).toBeVisible();
}

export async function addItemToCart(screen, expect, itemName, extraPlusTaps = 0) {
  await screen.getByText(itemName).scrollIntoViewIfNeeded();
  await screen.getByText(itemName).tap();
  for (let i = 0; i < extraPlusTaps; i++) {
    await screen.getByLabel('+').tap();
  }
  await screen.getByLabel('Add to Order').tap();
  await expect(screen.getByLabel('Close')).not.toBeVisible({ timeout: 20_000 });
}

export async function openCart(screen) {
  await screen.getByLabel('Shopping Cart').tap();
}

export function parsePrice(text) {
  return parseFloat(String(text).replace('₭', ''));
}

export async function openAccount(screen) {
  await screen.getByLabel('Account').tap();
}
