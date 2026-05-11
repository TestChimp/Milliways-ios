/**
 * Master Playwright test entry for SmartTests (TestChimp runtime: TrueCoverage CI metadata,
 * markScreenState fixture, ExploreChimp when enabled).
 *
 * Requires @testchimp/playwright >= 0.1.8 (installTestChimp).
 * Add domain fixtures with mergeTests, then wrap the merged test:
 *   import { mergeTests } from '@playwright/test';
 *   import { test as auth } from './auth.fixture.js';
 *   export const test = installTestChimp(mergeTests(auth));
 */
import { test as playwrightTest } from '@playwright/test';
import { installTestChimp } from '@testchimp/playwright/runtime';

export const test = installTestChimp(playwrightTest);
export { expect } from '@playwright/test';
