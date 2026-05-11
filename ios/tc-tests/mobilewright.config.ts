import { defineConfig, type MobilewrightConfig } from 'mobilewright';
import dotenv from 'dotenv';

/**
 * SmartTests root: **ios/tc-tests/** (see `.testchimp-tests`). Run Mobilewright from this directory.
 *
 * CI: `.github/workflows/smarttests-ios-simulator.yml` (macOS + local Docker backend + Simulator).
 * Local: `scripts/smarttests-ios-simulator.sh` from repo root, or `cd ios && make build && make boot` then `IOS_APP_PATH=... npm test` here.
 *
 * Keep `mobilewright` and `@mobilewright/test` on the **same** version. If Playwright complains about
 * duplicate `@playwright/test`, keep `package.json` **overrides** for `@playwright/test` / `playwright`.
 *
 * Docs: https://docs.testchimp.io/smart-tests/run-in-ci-playwright
 */

dotenv.config({
  path: `.env-${process.env.TESTCHIMP_ENV || 'QA'}`
});

// Cloud (mobile-use) needs a device .ipa; local simulators need a Debug-iphonesimulator .app.
// Keep mobile-use opt-in so merely defining MOBILE_USE_API_KEY as a secret does not switch CI
// away from the local iOS Simulator path.
const useMobileUse = process.env.MOBILEWRIGHT_DRIVER === 'mobile-use' && Boolean(process.env['MOBILE_USE_API_KEY']);

const config: MobilewrightConfig = {
  // tests are in the current directory
  testDir: '.',

  // if a test fails, don't try it again
  retries: 0,

  // extra headroom for fixture teardown
  timeout: 120_000,

  // platform is required
  platform: 'ios',

  // bundle identifier of our app under test
  bundleId: 'com.mobilenext.Milliways',

  // enable paralllelism on all tests, not just their files
  fullyParallel: true,

  // how many workers (devices) at the same time?
  workers: process.env.CI ? 2 : 1,

  // Local Simulator: set IOS_APP_PATH to your Debug-iphonesimulator .app (see `ios/Makefile`).
  // Cloud (mobile-use): set MOBILE_USE_API_KEY and use a device .ipa path here instead.
  installApps: process.env.IOS_APP_PATH ?? '[PATH_TO_IPA]',

  reporter: [
    ['list'],
    ['html', { outputFolder: 'mobilewright-report' }],
    [
      '@testchimp/playwright/reporter',
      {
        // Config + specs live in `ios/tc-tests/` (SmartTests root). Default env is `tests/` which breaks
        // folderPath relative to the mapped repo folder — set `.` so reports match platform paths.
        testsFolder: '.',
        verbose: Boolean(process.env.TESTCHIMP_REPORTER_VERBOSE),
        reportOnlyFinalAttempt: true,
        captureScreenshots: true,
      },
    ],
  ],

    projects: [
      {
        name: 'setup',
        testDir: 'setup',
        testMatch: /global\.setup\.spec\.(js|ts)$/,
      },
      {
        name: 'mobile',
        dependencies: ['setup'],
        testDir: '.',
        testIgnore: ['**/setup/**'],
        testMatch: '**/*.{spec,test}.{js,ts}',
      },
    ],
};

// if environmet exists, we'll use mobile-use driver and allocate a device on the cloud
// otherwise we run it on a device locally with mobilecli
if (useMobileUse) {
  config.driver = {
    type: 'mobile-use',
    apiKey: process.env['MOBILE_USE_API_KEY'],
  };
}

export default defineConfig(config);

