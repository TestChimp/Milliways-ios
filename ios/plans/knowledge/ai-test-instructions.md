# Milliways iOS — TestChimp agent instructions

## Repo layout vs TestChimp mappings

- **This folder** (`ios/plans/`) is the TestChimp-mapped **plans** root for the **iOS** TestChimp project (see `.testchimp-plans`). User stories and scenarios under `stories/` and `scenarios/` sync to that project; use **`ios/.cursor/mcp.json`** for `TESTCHIMP_API_KEY` when calling the CLI for iOS.
- **Android** has a parallel mapped tree under `android/plans/` — use **`android/.cursor/mcp.json`** for the Android project API key (different from iOS).
- **Repo root `plans/`** (if present) is from an older single-root integration; do not add new product stories there unless you intentionally maintain a third mapping.

## Environment Provision Strategy

### Local - Test Authoring

- Start backend: from repo root, `docker compose up --build -d`.
- Wait for health: `curl -fsS http://localhost:3001/health` (or `MILLIWAYS_API_BASE_URL` if overridden).
- Build and boot Simulator: `cd ios && make build && make boot` (see `ios/Makefile`).
- SmartTests root: `ios/tc-tests`. Run: `cd ios/tc-tests && npm ci && npm test` (or `npx mobilewright test …`).
- `MILLIWAYS_API_BASE_URL` defaults in fixtures to `http://localhost:3001`; set if the API runs elsewhere.
- Export `TESTCHIMP_API_KEY` and optional `TESTCHIMP_BACKEND_URL` from `ios/.cursor/mcp.json` for CLI/reporter (never commit keys).

### CI - Test Execution

- See `.github/workflows/smarttests-ios-simulator.yml` (macOS + Docker + `ios/tc-tests`). Job may be disabled (`if: false`) until macOS runners are enabled.

## TrueCoverage Plan

- Native app includes TestChimp RUM wiring (`MilliwaysRum.swift`). Treat TrueCoverage as in scope unless product explicitly opts out in this file.

## Mocking Plan

- N/A for primary Mobilewright UI flows; backend is local Docker or staging per env.

## ExploreChimp

- Use `markScreenState` in SmartTests; set `EXPLORECHIMP_ENABLED` when running explorations per team policy. Prefer `TESTCHIMP_BRANCH_NAME` from current git branch for local runs.

## Past learnings — authoring & validation (FAQ)

### Q: Reporter or API returns 401

**A:** Ensure `TESTCHIMP_API_KEY` is exported in the shell that spawns `npx mobilewright` / `testchimp`, not only in IDE MCP. Read from `ios/.cursor/mcp.json` `env` block.

### Q: Tests cannot find the app bundle

**A:** Set `IOS_APP_PATH` to the built `.app` under `ios/build/Build/Products/Debug-iphonesimulator/Milliways.app` after `make build`, or rely on default in `mobilewright.config.ts`.
