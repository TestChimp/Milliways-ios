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
