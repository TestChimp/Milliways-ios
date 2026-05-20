import { defineConfig, type MobilewrightConfig } from 'mobilewright';
import dotenv from 'dotenv';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const testsRoot = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(testsRoot, '..');
function resolveUnderRepo(envPath: string | undefined, relativeDefault: string): string {
  if (envPath?.trim()) {
    const trimmed = envPath.trim();
    return trimmed.startsWith('/') ? trimmed : resolve(repoRoot, trimmed);
  }
  return resolve(repoRoot, relativeDefault);
}

// mobilewright >= 0.0.37: iOS simulator installApps expects a .zip of the .app bundle.
const defaultIosApp = resolveUnderRepo(
  process.env.IOS_APP_PATH,
  'ios/build/Build/Products/Debug-iphonesimulator/Milliways.zip',
);
const defaultApk = resolveUnderRepo(
  process.env.ANDROID_APK_PATH,
  'android/app/build/outputs/apk/debug/app-debug.apk',
);

dotenv.config({
  path: `.env-${process.env.TESTCHIMP_ENV || 'QA'}`,
});

const useMobileUse = Boolean(process.env['MOBILE_USE_API_KEY']);

const config: MobilewrightConfig = {
  testDir: '.',
  retries: 0,
  timeout: 120_000,
  bundleId: 'com.mobilenext.Milliways',
  fullyParallel: false,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'mobilewright-report' }],
    [
      '@testchimp/playwright/reporter',
      {
        testsFolder: process.env.TESTCHIMP_TESTS_FOLDER || '.',
        verbose: process.env.TESTCHIMP_REPORTER_VERBOSE === 'true',
        reportOnlyFinalAttempt: true,
        captureScreenshots: true,
      },
    ],
  ],
  projects: [
    {
      name: 'api',
      testDir: 'api',
      testMatch: '**/*.spec.{js,ts}',
      testIgnore: ['**/fixtures/**'],
    },
    {
      name: 'ios',
      testDir: 'mobile',
      testMatch: ['e2e/common/**/*.spec.{js,ts}', 'e2e/ios/**/*.spec.{js,ts}'],
      testIgnore: ['**/fixtures/**', '**/pages/**', '**/shared/**', 'web/**'],
      use: {
        platform: 'ios',
        bundleId: 'com.mobilenext.Milliways',
        installApps: defaultIosApp,
        actionTimeout: 30 * 1000,
      },
    },
    {
      name: 'android',
      testDir: 'mobile',
      testMatch: ['e2e/common/**/*.spec.{js,ts}', 'e2e/android/**/*.spec.{js,ts}'],
      testIgnore: ['**/fixtures/**', '**/pages/**', '**/shared/**', 'web/**'],
      use: {
        platform: 'android',
        bundleId: 'com.mobilenext.milliways',
        installApps: defaultApk,
        actionTimeout: 15 * 1000,
      },
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
