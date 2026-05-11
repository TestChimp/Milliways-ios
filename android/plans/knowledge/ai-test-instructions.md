# Milliways Android — TestChimp agent instructions

## Repo layout vs TestChimp mappings

- **This folder** (`android/plans/`) is the mapped **plans** root for the **Android** TestChimp project. Use **`android/.cursor/mcp.json`** for CLI/MCP `TESTCHIMP_API_KEY` (not the iOS key).
- **iOS** plans and SmartTests live under `ios/plans/` and `ios/tc-tests/` respectively.
- **Repo root `plans/`** is legacy from an earlier layout; prefer platform-specific plan trees above.

## Environment Provision Strategy

### Local - Test Authoring

- Start backend: from repo root, `docker compose up --build -d`.
- Wait for health: `curl -fsS http://localhost:3001/health` (or `MILLIWAYS_API_BASE_URL` if overridden).
- Build a debug APK (example): `cd android && ./gradlew :app:assembleDebug` — use `app/build/outputs/apk/debug/app-debug.apk` unless your flavor differs.
- SmartTests root: `android/tests`. Set `ANDROID_APK_PATH` to the APK path for Mobilewright `installApps`.
- `MILLIWAYS_API_BASE_URL` defaults in fixtures to `http://localhost:3001`.
- Export `TESTCHIMP_API_KEY` and optional `TESTCHIMP_BACKEND_URL` from `android/.cursor/mcp.json` for CLI/reporter (never commit keys).

### CI - Test Execution

- Add a workflow when Linux emulator or device farm is ready; mirror `smarttests-ios-simulator.yml` patterns with `TESTCHIMP_PROJECT_TYPE=android`.

## TrueCoverage Plan

- Native app includes TestChimp RUM wiring (`MilliwaysRum.kt`). Treat TrueCoverage as in scope unless product explicitly opts out here.

## Mocking Plan

- N/A for primary Mobilewright UI flows against local Docker backend.

## ExploreChimp

- Use `markScreenState` in SmartTests; set `EXPLORECHIMP_ENABLED` per team policy. Set `TESTCHIMP_BRANCH_NAME` from git branch for local runs.

## Past learnings — authoring & validation (FAQ)

### Q: Reporter or API returns 401

**A:** Export `TESTCHIMP_API_KEY` in the shell running Mobilewright; use `android/.cursor/mcp.json` as the source for local dev.

### Q: installApps path invalid

**A:** Set `ANDROID_APK_PATH` to a built debug APK before `npx mobilewright test`.
