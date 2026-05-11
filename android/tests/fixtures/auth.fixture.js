import { test as base } from '@mobilewright/test';

const apiBaseUrl = process.env.MILLIWAYS_API_BASE_URL ?? 'http://localhost:3001';

async function seedUser(testInfo) {
  const suffix = `${testInfo.workerIndex}-${testInfo.parallelIndex}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
  const email = `tc-${suffix}@milliways.local`;
  const password = 'password';

  const response = await fetch(`${apiBaseUrl}/qa/users`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-testchimp-seed-request': '1',
    },
    body: JSON.stringify({ email, password }),
  });
  const body = await response.json();

  if (!response.ok) {
    throw new Error(`Failed to seed Milliways user: ${response.status} ${JSON.stringify(body)}`);
  }

  return {
    id: body.user.id,
    email: body.user.email,
    password,
  };
}

export const test = base.extend({
  seededUser: async ({}, use, testInfo) => {
    const user = await seedUser(testInfo);
    await use(user);
  },
});
