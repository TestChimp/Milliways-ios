import { test, expect } from './fixtures/index.js';

/**
 * Quick smoke (no .app / .ipa): avoids `screen`, `device`, and `markScreenState` so Mobilewright
 * does not run installApps. After you set `IOS_APP_PATH` in `.env-QA` (or the shell), add specs that
 * use `screen` / `markScreenState` for real UI flows.
 */
test.describe('quick smoke', () => {
  test('TestChimp mobile project type is ios', async () => {
    expect(process.env.TESTCHIMP_PROJECT_TYPE?.toLowerCase()).toBe('ios');
  });

  test('bundle id matches Milliways iOS app', async ({ bundleId }) => {
    expect(bundleId).toBe('com.mobilenext.Milliways');
  });

  test('mobile project is active', async ({}, testInfo) => {
    expect(testInfo.project.name).toBe('mobile');
  });
});
