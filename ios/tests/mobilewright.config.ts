import { defineConfig, type MobilewrightConfig } from 'mobilewright';

// Cloud (mobile-use) needs a device .ipa; local simulators need a Debug-iphonesimulator .app
// (`make ipa` vs `make build` from the `ios/` directory — see `ios/Makefile`).
const useMobileUse = Boolean(process.env['MOBILE_USE_API_KEY']);

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

  // install this app before starting
  installApps: useMobileUse
    ? '../build/Milliways-unsigned.ipa'
    : '../build/Build/Products/Debug-iphonesimulator/Milliways.app',

  // we want both list on screen, and an html directory
  reporter: [
    ['list'],
    ['html', { outputFolder: 'mobilewright-report' }],
    [
      '@testchimp/playwright/reporter',
      {
        verbose: false,
      },
    ],
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

