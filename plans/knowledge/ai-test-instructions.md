# TestChimp Init Progress

**Init status:** Phase 1–3 executed for **native iOS SmartTests** in **`tc-tests/`**, **iOS Simulator only**, **no backend** (no `BASE_URL` / EaaS). User approved this plan in chat (2026-05-10).

---

## Phase 0 — Quick smoke (tc-tests only)

**Completed:** Smoke harness validated under **`tc-tests/`** (see git history / `smoke.quick.spec.js`).

**Phase 0 gate — continue to full init?** **Yes** (2026-05-10).

---

## Phase 1 completion (requirement gather)

| Gate | Status |
|------|--------|
| Workstation gate | **done** — MCP + `TESTCHIMP_API_KEY`; `@testchimp/cli@latest` ≥ skill minimum. |
| Key Area 1 — markers / SmartTests root | **done** — `plans/.testchimp-plans`, `tc-tests/.testchimp-tests` (`project_type=ios`). |
| Key Area 2 — import / migration | **done** — **Greenfield** under `tc-tests/` for authored SmartTests (`smoke.quick.spec.js` + `setup/`). Legacy **`tests/`** tree and **`.github/workflows/run-tests.yml`** (Ubuntu + `MOBILE_USE_*`, `working-directory: tests`) are **out of TestChimp SmartTests mapping** until the team explicitly migrates or changes Git mappings. |
| Key Area 3 — Mocking / AIMock | **done** — **HTTP `page.route`:** N/A (native Mobilewright, no browser `page` in this harness). **AIMock:** **not applicable** (no LLM-in-test scope for this repo’s SmartTests init). |
| Key Area 4 — TrueCoverage | **done** — **N/A (native iOS)** per skill; see `plans/knowledge/truecoverage-instrument-progress.md`. |
| Key Area 5 — environment | **done** — **Local iOS Simulator + Makefile** only; no backend compose or EaaS (user-confirmed). |
| Key Area 6 — CI | **done** — New **`smarttests-ios-simulator.yml`** for `tc-tests`; legacy **`run-tests.yml`** unchanged. |

---

## Init action items (Phase 2 checklist → Phase 3)

| # | Area | Status | Notes |
|---|------|--------|-------|
| 1 | Basic TestChimp integration | **done** | Markers, `tc-tests` harness, `@testchimp/playwright` reporter + `installTestChimp` in `fixtures/index.js`, dev **`@testchimp/cli`**. |
| 2 | Existing suite / import | **skipped** | Greenfield in `tc-tests`; parallel **`tests/`** legacy documented only. |
| 3 | Mocking | **done** | Mocking Plan below; no AIMock install. |
| 4 | TrueCoverage | **skipped** | Native mobile N/A; progress file stubbed. |
| 5 | Environment provision | **done** | Simulator + `make build` / `make boot`; `IOS_APP_PATH` contract below. |
| 6 | CI setup | **done** | `smarttests-ios-simulator.yml` — macOS, `make build`, `TESTCHIMP_*`, `npm run test:smoke` in `tc-tests`. |

**PR packaging:** Prefer **separate PRs** for large slices (TrueCoverage, CI, migrations). This init bundles doc + workflow + script; split before merge if you want a smaller review.

---

## Completed Items

- [x] Phase 0 quick smoke (`tc-tests`)
- [x] Full init Phase 1–3 (Simulator, no backend, CI workflow, `ai-test-instructions`)

## Pending Items

- [ ] Add GitHub secret **`TESTCHIMP_API_KEY`** if not already present (required for **`smarttests-ios-simulator.yml`**).
- [ ] Expand **`npm run test`** beyond smoke when real **`screen`** / **`markScreenState`** specs exist and CI should run them.
- [ ] Optional: migrate or retire **`.github/workflows/run-tests.yml`** if **`tests/`** is deprecated.

## Deferred Items

- [ ] AIMock / LLM mocking — revisit if the app or SmartTests introduce LLM calls in scope.

---

## Environment Provision Strategy

There is **no backend** to bring up for SmartTests today. **All** authoring and CI for this flow target the **iOS Simulator** and a **local Debug `.app`** built from the Xcode project.

### Local - Test Authoring

**Single entrypoint (recommended):**

```bash
./scripts/smarttests-ios-simulator.sh
```

Optional: override Simulator device (matches Makefile variable):

```bash
DEVICE_NAME="iPhone 16" ./scripts/smarttests-ios-simulator.sh
```

**Manual steps (equivalent):**

1. From repo root: **`make build`** — produces **`build/Build/Products/Debug-iphonesimulator/Milliways.app`** (see `Makefile`: `SCHEME`, `DEVICE_NAME`).
2. **`make boot`** — boots the named Simulator and opens the Simulator app.
3. **`export IOS_APP_PATH="$PWD/build/Build/Products/Debug-iphonesimulator/Milliways.app"`** (absolute path recommended).
4. From **`tc-tests/`**: use **`npm test`** / **`npm run test:smoke`** (they set **`TESTCHIMP_PROJECT_TYPE=ios`** and inject API key + backend URL from **`.cursor/mcp.json`**). For ad-hoc **`npx mobilewright`**, export **`TESTCHIMP_PROJECT_TYPE=ios`** and TestChimp credentials yourself.
5. **`npm ci`** / **`npm install`** then **`npm run test:smoke`** or **`npm test`**. Scripts use **`scripts/run-mobilewright-with-mcp-env.mjs`** to inject **`TESTCHIMP_API_KEY`** and **`TESTCHIMP_BACKEND_URL`** from **`.cursor/mcp.json`** (staging) into the Mobilewright process.

**Wait-for-healthy (agent contract):**

- **App artifact:** directory **`$IOS_APP_PATH`** exists and is non-empty after **`make build`**.
- **Simulator:** `make boot` succeeds; optional check: `xcrun simctl list devices | grep -i Booted`.

**No `BASE_URL`:** not used for this native-only SmartTests path unless a future web fixture appears.

### CI - Test Execution

- **Primary:** `.github/workflows/smarttests-ios-simulator.yml` — **macOS**, **`make build`** / **`make boot`**, **`IOS_APP_PATH`** aligned with Makefile output, **`tc-tests`** + **`npm run test:smoke`**.
- **Secrets:** **`TESTCHIMP_API_KEY`** (repository secret). Optional: tune **`DEVICE_NAME`** env in the workflow if the hosted image drops a given Simulator name.
- **Legacy:** `.github/workflows/run-tests.yml` still targets **`tests/`** on Ubuntu with **`MOBILE_USE_API_KEY`** — separate from TestChimp-mapped **`tc-tests/`**.

---

## TrueCoverage Plan

**Explicit N/A (native iOS):** No RUM / TrueCoverage for the native app under current TestChimp guidance. Tracked in **`plans/knowledge/truecoverage-instrument-progress.md`**.

---

## Mocking Plan

- **`http_mocking` (Playwright `page.route`):** **N/A** for the current **Mobilewright / native** SmartTests harness (no `page` in specs).
- **`aimock`:** **Not applicable** for this init. Defer if LLM-backed flows enter test scope.

---

## ExploreChimp

- **`TESTCHIMP_PROJECT_TYPE`:** `ios` (from **`tc-tests/.testchimp-tests`**; **`npm test`** / launcher sets this.)
- **Targets:** UI SmartTests with **`markScreenState`** — primarily **`tc-tests/order-flow.spec.js`** (**#TS-100**, **#TS-101**). **`smoke.quick.spec.js`** is not an ExploreChimp target (no UI journey / markers).
- **`TESTCHIMP_BATCH_INVOCATION_ID`:** Set a **new** value per exploration batch (correlates analysis in TestChimp). Example pattern: `explore-ios-<git-short>-<unix_ts>`.
- **`TESTCHIMP_BRANCH_NAME`:** Launcher fills from **`git branch --show-current`** when unset — keeps **`branch_id`** resolution on the server for local runs.
- **Credentials / backend:** Same as normal runs — **`scripts/run-mobilewright-with-mcp-env.mjs`** merges **`TESTCHIMP_API_KEY`** and **`TESTCHIMP_BACKEND_URL`** from **`.cursor/mcp.json`**.
- **`NETWORK` regex:** Not configured yet (no documented app API host in this repo). Until **`EXPLORECHIMP_REQUEST_REGEX_TO_ANALYZE`** is set for the Milliways backend(s), use **`EXPLORECHIMP_SOURCES_TO_ANALYZE=DOM,SCREENSHOT,CONSOLE,METRICS`** so **`NETWORK`** is omitted intentionally (avoids the “regex missing — network disabled” warning while default is all five sources).
- **Default sources (current):** `DOM,SCREENSHOT,CONSOLE,METRICS` (see above).

**Example — ExploreChimp on written order flows (after `make build`):**

```bash
cd /path/to/Milliways-ios
export IOS_APP_PATH="$PWD/build/Build/Products/Debug-iphonesimulator/Milliways.app"
export EXPLORECHIMP_ENABLED=true
export EXPLORECHIMP_SOURCES_TO_ANALYZE=DOM,SCREENSHOT,CONSOLE,METRICS
export TESTCHIMP_BATCH_INVOCATION_ID="explore-ios-$(git rev-parse --short HEAD)-$(date +%s)"
node scripts/run-mobilewright-with-mcp-env.mjs order-flow.spec.js
```

Review the exploration / journeys in the TestChimp UI using the batch id and branch. When app API hosts are known, add **`EXPLORECHIMP_REQUEST_REGEX_TO_ANALYZE`** and include **`NETWORK`** in sources if useful.

---

## Past learnings — authoring & validation (FAQ)

### Q: `@testchimp/playwright/runtime` throws `Cannot read properties of undefined (reading 'extend')` on Mobilewright.

**A:** `@testchimp/playwright` resolves the mobile test entry from **`TESTCHIMP_MOBILE_TEST_MODULE`** (see its **`project-type.js`**); the default module name does not export Playwright’s **`test`**. Use **`scripts/run-mobilewright-with-mcp-env.mjs`** (or **`npm test`** in **`tc-tests/`**), which sets the correct module internally—do not rely on remembering env vars by hand.

### Q: “Playwright Test did not expect test() to be called here” after adding TestChimp.

**A:** Duplicate **`@playwright/test`** versions — use **`overrides`** in **`tc-tests/package.json`** to force a single **`@playwright/test` / `playwright`** line (e.g. **1.59.1**) across **`@mobilewright/test`** and **`@testchimp/playwright`**.

### Q: Smoke tests fail on `stat [PATH_TO_IPA]` even with `test.skip` for missing `IOS_APP_PATH`.

**A:** Any test that uses **`screen`**, **`device`**, or **`markScreenState`** triggers app install before the test body runs. For smoke without a built app, only use fixtures that do not require device boot (e.g. **`bundleId`**, **`testInfo`**).

### Q: Plan scenario TS-100 mentions changing quantity in the cart, but the app has no cart line steppers.

**A:** Quantity is edited on **`MenuItemDetailView`** (`+` / `−`) before **`Add to Order`**. SmartTests under **`tc-tests/order-flow.spec.js`** follow that UI and still satisfy **#TS-100** acceptance (item added, quantity changed, totals correct in cart).

### Q: Tests run locally but I do not see execution results in the TestChimp UI.

**A:** (1) **`TESTCHIMP_API_KEY`** must be in the **process environment** for the Mobilewright process (MCP/IDE config does **not** apply to `npm test` / CI). If logs say `Reporter is not enabled` or `Missing TESTCHIMP_API_KEY`, reporting is off. (2) **`TESTCHIMP_BACKEND_URL`** must match the stack where the project lives (e.g. if Cursor MCP uses **`https://featureservice-staging.testchimp.io`**, export the **same** URL for runs; the reporter default is **`https://featureservice.testchimp.io`**, and reports will not show under a staging project.) (3) **`testsFolder`** for `@testchimp/playwright/reporter` is set to **`.`** in **`tc-tests/mobilewright.config.ts`** so **`folderPath`** lines up with the Git-mapped SmartTests root **`tc-tests/`** (platform path **`tests/`**). (4) Optional: **`TESTCHIMP_BRANCH_NAME`** (current git branch) helps the server attach runs to branch context — see ExploreChimp / branch docs.

### Q: GitHub Actions `make build` fails — Simulator not found.

**A:** Hosted images change available Simulator names. Set **`DEVICE_NAME`** in the workflow (or Makefile) to a device that exists on the runner (`xcrun simctl list devices available`).
