const apiBaseUrl = process.env.MILLIWAYS_API_BASE_URL ?? 'http://localhost:3001';

export async function fetchMenuItemId(itemName = 'Coffee') {
  const response = await fetch(`${apiBaseUrl}/menu`);
  const body = await response.json();
  if (!response.ok) {
    throw new Error(`Failed to load menu: ${response.status} ${JSON.stringify(body)}`);
  }

  const item = body.sections
    .flatMap((section) => section.items)
    .find((menuItem) => menuItem.name === itemName);

  if (!item) {
    throw new Error(`Menu item "${itemName}" was not found`);
  }

  return item.id;
}

export async function seedOrder(user, { ageDays = 0, itemName = 'Coffee', quantity = 1 } = {}) {
  const menuItemId = await fetchMenuItemId(itemName);
  const response = await fetch(`${apiBaseUrl}/qa/orders`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      email: user.email,
      password: user.password,
      ageDays,
      items: [{ menuItemId, quantity }],
    }),
  });
  const body = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to seed order: ${response.status} ${JSON.stringify(body)}`);
  }

  return body.order;
}
