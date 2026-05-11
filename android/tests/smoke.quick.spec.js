import { test, expect } from './fixtures/index.js';

/**
 * Quick smoke (no APK install required for env checks): avoids heavy UI when bundle path missing.
 */
test.describe('quick smoke', () => {
  test('TestChimp mobile project type is android', async () => {
    expect(process.env.TESTCHIMP_PROJECT_TYPE?.toLowerCase()).toBe('android');
  });

  test('bundle id matches Milliways Android app', async ({ bundleId }) => {
    expect(bundleId).toBe('com.mobilenext.milliways');
  });

  test('mobile project is active', async ({}, testInfo) => {
    expect(testInfo.project.name).toBe('mobile');
  });
});
