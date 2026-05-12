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

The app includes **[testchimp-rum-android](https://github.com/testchimphq/testchimp-rum-android)** (Maven id **`io.testchimp:rum-android:0.1.5`** via **`mavenLocal()`** after publishing that tag from the rum repo, or **`com.github.testchimphq:testchimp-rum-android:0.1.5`** on [JitPack](https://jitpack.io/#testchimphq/testchimp-rum-android) once the tag build is green), aligned with iOS:

- **Init:** `MilliwaysApplication` → `MilliwaysRum.configureIfNeeded` (same journey events: `auth_session_started`, `menu_loaded`, `order_submitted_success`). Every emit includes metadata **`platform`** = **`android`** (iOS uses **`ios`**; web should use **`web`**).
- **Automation URLs:** `MainActivity` uses **`launchMode="singleTop"`**, a **`testchimp-rum`** / **`truecoverage`** / **`/v1`** intent filter, and **`TestChimpRum.handleAutomationIntent`** in **`onCreate`** / **`onNewIntent`** so Mobilewright + `installTestChimp` can set CI context (`TESTCHIMP_PROJECT_TYPE=android` on the runner).

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
