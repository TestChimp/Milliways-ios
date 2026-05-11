import { defineConfig, type MobilewrightConfig } from 'mobilewright';
import dotenv from 'dotenv';
import { join } from 'path';

/**
 * SmartTests root: **android/tests/** (see `.testchimp-tests`). Run Mobilewright from this directory.
 * Local APK: `./gradlew :app:assembleDebug` then set `ANDROID_APK_PATH` or rely on default debug path below.
 */

dotenv.config({
  path: `.env-${process.env.TESTCHIMP_ENV || 'QA'}`,
});

const useMobileUse =
  process.env.MOBILEWRIGHT_DRIVER === 'mobile-use' && Boolean(process.env['MOBILE_USE_API_KEY']);

const defaultApk = join(process.cwd(), '..', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');

const config: MobilewrightConfig = {
  testDir: '.',
  retries: 0,
  timeout: 120_000,
  platform: 'android',
  bundleId: 'com.mobilenext.milliways',
  fullyParallel: true,
  workers: process.env.CI ? 2 : 1,
  installApps: process.env.ANDROID_APK_PATH ?? defaultApk,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'mobilewright-report' }],
    [
      '@testchimp/playwright/reporter',
      {
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
      use: { actionTimeout: 15 * 1000 },
    },
  ],
};

if (useMobileUse) {
  config.driver = {
    type: 'mobile-use',
    apiKey: process.env['MOBILE_USE_API_KEY'],
  };
}

export default defineConfig(config);
