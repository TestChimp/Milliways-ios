# Milliways Android (demo)

Kotlin + Jetpack Compose client for the same Milliways demo API as iOS (`backend/`). **Application id:** `com.mobilenext.milliways`.

## Prerequisites

- Android Studio Koala+ (or Android SDK + JDK 17)
- Emulator or device with network access to your API

## API base URL

`BuildConfig.MILLIWAYS_API_BASE_URL` defaults to **`http://10.0.2.2:3001`** (emulator → host `localhost:3001`).

- **Physical device:** run backend reachable from the device (e.g. Mac LAN IP) and change `defaultConfig.buildConfigField` in `app/build.gradle.kts`, or add a product flavor later.

## First-time setup

1. Copy `local.properties.example` to **`local.properties`** and set `sdk.dir` to your Android SDK path (Android Studio can generate this file when you open the project).
2. From this directory:

```bash
./gradlew :app:assembleDebug
```

3. Install/run from Android Studio, or `./gradlew :app:installDebug`.

## Cleartext HTTP

The demo uses **HTTP** against local Docker. `android:usesCleartextTraffic="true"` is enabled on the application element (not for production).

## Parity with iOS

Sign in / sign up, welcome hero, menu with sections, item detail with quantity, cart (trash icon to remove a line), **MARVIN** coupon (−₭20), place order, delivery screen with countdown + status poll, account sheet with orders and sign out.

## TrueCoverage (TestChimp RUM)

The app includes **[testchimp-rum-android](https://github.com/testchimphq/testchimp-rum-android)** on [JitPack](https://jitpack.io/#testchimphq/testchimp-rum-android) as **`com.github.testchimphq:testchimp-rum-android:0.1.6`**, aligned with iOS:

- **Init:** `MilliwaysApplication` → `MilliwaysRum.configureIfNeeded` (same journey events: `auth_session_started`, `menu_loaded`, `order_submitted_success`). Every emit includes metadata **`platform`** = **`android`** (iOS uses **`ios`**; web should use **`web`**). When the app goes to the background, **`TestChimpRum.flush()`** runs so batched events are not stuck in memory if the OS kills the process before the next timer flush.
- **Automation URLs:** `MainActivity` uses **`launchMode="singleTop"`**, a **`testchimp-rum`** / **`truecoverage`** / **`/v1`** intent filter, and **`TestChimpRum.handleAutomationUri`** in **`onCreate`** / **`onNewIntent`** / **`onResume`** so Mobilewright + `installTestChimp` can set CI context (`TESTCHIMP_PROJECT_TYPE=android` on the runner).

### Credentials and endpoints (local dev)

Set in **`android/gradle.properties`** or **`~/.gradle/gradle.properties`** (do not commit real secrets to git):

```properties
TESTCHIMP_PROJECT_ID=your_project_id
TESTCHIMP_API_KEY=your_project_api_key
# Optional overrides:
# TESTCHIMP_BACKEND_URL=https://featureservice-staging.testchimp.io
```

If `TESTCHIMP_PROJECT_ID` / `TESTCHIMP_API_KEY` are empty, RUM is skipped (Logcat tag **`Milliways`**).

- **Environment:** Debug builds use **`staging`** in `BuildConfig` (same as iOS Debug in `project.pbxproj`); Release uses **`production`**. Emulator/device process env **`TESTCHIMP_ENV`** overrides when set.
- **Ingest URL:** Defaults to **`https://featureservice-staging.testchimp.io`** in `BuildConfig` when `TESTCHIMP_BACKEND_URL` is unset; process env **`TESTCHIMP_BACKEND_URL`** overrides at runtime.

For SmartTests: **`android/tests/`** (`npm ci && npm run test:smoke`); TestChimp markdown plans under **`android/plans/`**. Use **`android/.cursor/mcp.json`** for the project API key when running `testchimp` / Mobilewright reporters (do not commit keys).

### TrueCoverage troubleshooting (logcat + low emit counts)

- **Plain `npm test` does not capture device logcat**; use:

  ```bash
  cd android/tests && chmod +x run-with-logcat.sh   # once
  npm run test:with-logcat
  # or: ./run-with-logcat.sh smoke.quick.spec.js
  ```

  Output: **`android/tests/test-results/logcat-ci-debug-*.txt`**. Search for `TrueCoverage`, `RUM emit without`, `CI context`.

- **Very few RUM events** often means: **RUM skipped** (missing `TESTCHIMP_PROJECT_ID` / `TESTCHIMP_API_KEY` in `gradle.properties`), **tests never hit** code paths that call `MilliwaysRum.emit` (smoke may not load menu / submit order), **SDK/network limits**, or **you checked the DB before the batch flushed** (events are buffered; this demo uses a **5s** timer plus **flush on app background**). The Android SDK **does not log HTTP failures** for `/rum/events`—if the URL or key is wrong, emits disappear silently; confirm **`TESTCHIMP_BACKEND_URL`** and filter queries on **`environment`** (Debug defaults to **`staging`**).

- **Missing `ci_test_info` on some emits** (TrueCoverage): root causes are (1) **time between `launchApp` and `set`** where the app already emitted, (2) **next test’s `clear`** before a late coroutine emit, (3) **`/rum/session/start`** often has no CI (session begins before automation `set`). Mitigations ship in **`@testchimp/playwright`** (extra `set` bursts, post-set settle, `afterEach` re-set) and **rum-android ≥ 0.1.6** (`set` URI applied on the **caller thread** so CI is in memory when `openUrl` returns). Tune **`TESTCHIMP_RUM_AUTOMATION_POST_SET_SETTLE_MS`** (default 100 ms, 0–500) if the device is slow.
