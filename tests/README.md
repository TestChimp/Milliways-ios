# TestChimp SmartTests (mobile scaffold)

SmartTests for **Android and iOS** use [Mobilewright](https://www.npmjs.com/package/mobilewright): Playwright-compatible tests against real devices or simulators/emulators, with TestChimp runtime and reporting layered on top.

This project uses the **mobile** scaffold (`project_type=mobile`). Connect your repo and map a `tests` folder (Project Settings → Integrations). Map `plans/` as well so stories and scenarios stay in sync with your codebase.

------------------------------------------------------------------------

## What TestChimp adds

1. **Plain-English AI steps** inside your scripts (where supported for your stack)
2. **Direct linking of tests to scenarios** for traceability (`// @Scenario:`)
3. **TrueCoverage and QA insights** when you wire production instrumentation and CI reporting

------------------------------------------------------------------------

# `tests` folder structure (mobile scaffold)

All SmartTests live under `tests/`. Layout matches the folders created for `project_type=mobile`:

    tests/
      setup/
      shared/
      api/
        fixtures/
      mobile/
        fixtures/
        pages/
        e2e/
          common/
          ios/
          android/
      assets/
      .env-QA
      mobilewright.config.ts

**setup/**  
Runs first via the `setup` project in `mobilewright.config.ts` (`testDir: setup`, `global.setup.spec.*`). Use `global.setup.spec.js` for one-time harness work (seed data, shared auth). Not discovered as regular tests.

**shared/**  
Helpers and factories shared across API and mobile suites (for example `seed-users.js`, `create-auth-fixture.js`). **Not** test files — excluded via `testIgnore` (`**/shared/**`). API or mobile specs import from here when they need shared seed logic.

**api/**  
HTTP / contract SmartTests that do not drive a device. The `api` project in `mobilewright.config.ts` uses `testDir: api` and `testMatch: **/*.spec.{js,ts}`.

**api/fixtures/**  
`index.js` uses `@playwright/test` + `installTestChimp` for request-only specs. Import from `./fixtures/index.js` in files directly under `api/`.

**mobile/**  
Native UI tests. iOS and Android projects in `mobilewright.config.ts` both use `testDir: mobile` with platform-specific `testMatch` under `mobile/e2e/`.

**mobile/fixtures/**  
`index.js` uses `@mobilewright/test` + `installTestChimp` with the mobile UI fixture (`uiFixture: 'screen'`). From `mobile/e2e/common/foo.spec.js` or `mobile/e2e/ios/bar.spec.js`, import: `import { test, expect } from '../../fixtures/index.js'`.

**mobile/pages/**  
Mobile page objects shared across iOS and Android. Excluded from test discovery.

**mobile/e2e/common/**  
Cross-platform UI specs run on both iOS and Android projects.

**mobile/e2e/ios/**  
iOS-only UI specs (matched only by the `ios` project).

**mobile/e2e/android/**  
Android-only UI specs (matched only by the `android` project).

**assets/**  
Static files used during tests (uploads, sample payloads).

**.env-***  
Per-environment variables; default **QA** (`.env-QA`) is created for you. Access via `process.env.VAR_NAME`.

**mobilewright.config.ts**  
Defines `setup`, `api`, `ios`, and `android` projects. Set `bundleId`, `installApps`, and platform `use` blocks for each native project. TestChimp configures `@testchimp/playwright` reporter; adjust for your org (API keys, env files). Keep **`@mobilewright/test`** and **`mobilewright`** on the same version in `package.json`.

------------------------------------------------------------------------

# Linking tests to scenarios

    // @Scenario: <scenario-id> [optional title]

Example:

    // @Scenario: #TS-102 Checkout with saved card

------------------------------------------------------------------------

# Running tests in CI

1. Connect your Git repository and map the `tests` folder.  
2. Install `mobilewright`, `@mobilewright/test`, `@testchimp/playwright`.  
3. Set **`TESTCHIMP_API_KEY`** (and device / mobile-use variables your config requires).  
4. Run from the **tests** directory so `mobilewright.config.ts` resolves correctly.

See [SmartTests CI (Playwright)](https://docs.testchimp.io/smart-tests/run-in-ci-playwright) for general CI patterns; adapt commands to Mobilewright.

------------------------------------------------------------------------

# GitHub App sync

Repository access uses the TestChimp GitHub App so QA can work on `tests/` and `plans/` without full repo credentials. Map only the folders you want synced.
