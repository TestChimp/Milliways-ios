/**
 * Master Playwright test entry for SmartTests (TestChimp runtime: TrueCoverage CI metadata,
 * markScreenState fixture, ExploreChimp when enabled).
 *
 * Requires @testchimp/playwright >= 0.1.8 (installTestChimp).
 * Add domain fixtures, then wrap the extended test (use `@mobilewright/test` for this iOS project):
 *   import { test as auth } from './auth.fixture.js';
 *   export const test = installTestChimp(auth);
 */
import { installTestChimp } from '@testchimp/playwright/runtime';
import { test as auth } from './auth.fixture.js';

export const test = installTestChimp(auth);
export { expect } from '@mobilewright/test';
