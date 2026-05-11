# TestChimp Init Progress

**Init status:** Phase 1–3 executed for **native iOS SmartTests** in **`ios/tc-tests/`**, **iOS Simulator + local demo backend**. User approved the original init plan in chat (2026-05-10); backend support was added later for auth/menu/order persistence.

---

## Phase 0 — Quick smoke (ios/tc-tests only)

**Completed:** Smoke harness validated under **`ios/tc-tests/`** (see git history / `smoke.quick.spec.js`).

**Phase 0 gate — continue to full init?** **Yes** (2026-05-10).

---

## Phase 1 completion (requirement gather)

| Gate | Status |
|------|--------|
| Workstation gate | **done** — MCP + `TESTCHIMP_API_KEY`; `@testchimp/cli@latest` ≥ skill minimum. |
| Key Area 1 — markers / SmartTests root | **done** — `plans/.testchimp-plans`, `ios/tc-tests/.testchimp-tests` (`project_type=ios`). |
| Key Area 2 — import / migration | **done** — **Greenfield** under `ios/tc-tests/` for authored SmartTests (`smoke.quick.spec.js` + `setup/`). Legacy **`ios/tests/`** tree and **`.github/workflows/run-tests.yml`** (Ubuntu + `MOBILE_USE_*`, `working-directory: ios/tests`) are **out of TestChimp SmartTests mapping** until the team explicitly migrates or changes Git mappings. |
| Key Area 3 — Mocking / AIMock | **done** — **HTTP `page.route`:** N/A (native Mobilewright, no browser `page` in this harness). **AIMock:** **not applicable** (no LLM-in-test scope for this repo’s SmartTests init). |
| Key Area 4 — TrueCoverage | **done** — **TestChimpRum** (iOS SPM) + `ios/Milliways-Info.plist` URL scheme + journey emits; see `plans/knowledge/truecoverage-instrument-progress.md` and `plans/events/`. |
| Key Area 5 — environment | **done** — **Local iOS Simulator + `ios/Makefile`** plus local Docker Compose backend/Postgres; no EaaS. |
| Key Area 6 — CI | **done** — New **`smarttests-ios-simulator.yml`** for `ios/tc-tests`; legacy **`run-tests.yml`** unchanged. |

---

## Init action items (Phase 2 checklist → Phase 3)

| # | Area | Status | Notes |
|---|------|--------|-------|
| 1 | Basic TestChimp integration | **done** | Markers, `ios/tc-tests` harness, `@testchimp/playwright` reporter + `installTestChimp` in `ios/tc-tests/fixtures/index.js`, dev **`@testchimp/cli`**. |
| 2 | Existing suite / import | **skipped** | Greenfield in `ios/tc-tests`; parallel **`ios/tests/`** legacy documented only. |
| 3 | Mocking | **done** | Mocking Plan below; no AIMock install. |
| 4 | TrueCoverage | **done** | `TestChimpRum` package, `testchimp-rum` URL scheme, `MilliwaysRum` helper, three journey events documented under `plans/events/`. |
| 5 | Environment provision | **done** | Simulator + **`make -C ios build`** / **`make -C ios boot`**; local backend via `docker compose up --build -d`; `IOS_APP_PATH` and `MILLIWAYS_API_BASE_URL` contracts below. |
| 6 | CI setup | **done** | `smarttests-ios-simulator.yml` — macOS, `cd ios && make build`, `TESTCHIMP_*`, `npm run test:smoke` in `ios/tc-tests`. |

**PR packaging:** Prefer **separate PRs** for large slices (TrueCoverage, CI, migrations). This init bundles doc + workflow + script; split before merge if you want a smaller review.

---

## Completed Items

- [x] Phase 0 quick smoke (`ios/tc-tests`)
- [x] Full init Phase 1–3 (Simulator, no backend, CI workflow, `ai-test-instructions`)

## Pending Items

- [ ] Add GitHub secret **`TESTCHIMP_API_KEY`** if not already present (required for **`smarttests-ios-simulator.yml`**).
- [ ] Expand **`npm run test`** beyond smoke when real **`screen`** / **`markScreenState`** specs exist and CI should run them.
- [ ] Optional: migrate or retire **`.github/workflows/run-tests.yml`** if **`ios/tests/`** is deprecated.

## Deferred Items

- [ ] AIMock / LLM mocking — revisit if the app or SmartTests introduce LLM calls in scope.

---

## Environment Provision Strategy

SmartTests target the **iOS Simulator**, a local Debug `.app`, and the local Milliways demo backend/Postgres stack.

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

1. From repo root: **`docker compose up --build -d`** — starts Postgres and the demo API. The API is exposed on **`http://localhost:3001`** by default.
2. Wait until **`curl -fsS http://localhost:3001/health`** succeeds.
3. From repo root: **`make -C ios build`** — produces **`ios/build/Build/Products/Debug-iphonesimulator/Milliways.app`** (see `ios/Makefile`: `SCHEME`, `DEVICE_NAME`).
4. **`make -C ios boot`** — boots the named Simulator and opens the Simulator app.
5. **`export IOS_APP_PATH="$PWD/ios/build/Build/Products/Debug-iphonesimulator/Milliways.app"`** (absolute path recommended).
6. Optional if overriding the default API: **`export MILLIWAYS_API_BASE_URL="http://localhost:3001"`**. The app and test fixtures default to this local URL.
7. From **`ios/tc-tests/`**: use **`npm test`** (or the repo wrapper script) to run the real order-flow SmartTests; **`npm run test:smoke`** is only a no-device harness check. The wrapper sets **`TESTCHIMP_PROJECT_TYPE=ios`** and injects TestChimp credentials from **`.cursor/mcp.json`**. For ad-hoc **`npx mobilewright`**, export **`TESTCHIMP_PROJECT_TYPE=ios`** and TestChimp credentials yourself.
8. **`npm ci`** / **`npm install`** then **`npm run test:smoke`** or **`npm test`**. Scripts use **`scripts/run-mobilewright-with-mcp-env.mjs`** to inject **`TESTCHIMP_API_KEY`** and **`TESTCHIMP_BACKEND_URL`** from **`.cursor/mcp.json`** into the Mobilewright process.

**Wait-for-healthy (agent contract):**

- **App artifact:** directory **`$IOS_APP_PATH`** exists and is non-empty after **`make -C ios build`**.
- **Backend:** **`curl -fsS http://localhost:3001/health`** returns success; fixture seed route **`POST /qa/users`** is available.
- **Simulator:** `make -C ios boot` succeeds; optional check: `xcrun simctl list devices | grep -i Booted`.

**No web `BASE_URL`:** not used for this native-only SmartTests path. Use **`MILLIWAYS_API_BASE_URL`** for the app backend when overriding the default local API.

### CI - Test Execution

- **Primary:** `.github/workflows/smarttests-ios-simulator.yml` — **macOS**, Colima/Docker Compose backend (`docker compose up --build -d`), backend health wait on **`http://localhost:3001/health`**, **`make build`** / **`make boot`** in **`ios/`**, explicit simulator app install, **`ios/tc-tests`** + **`npm test -- order-flow.spec.js`**.
- **Secrets:** **`TESTCHIMP_API_KEY`** (repository secret). **`MOBILE_USE_API_KEY` is not used by this workflow** because CI runs on the local macOS Simulator. Optional: tune **`DEVICE_NAME`** env in the workflow if the hosted image drops a given Simulator name.
- **Legacy:** `.github/workflows/run-tests.yml` targets **`ios/tests/`** on Ubuntu with **`MOBILE_USE_API_KEY`**, but is **manual-only** (`workflow_dispatch`) so default PR/push CI uses the local Simulator workflow.

---

## TrueCoverage Plan

**Opted in (native iOS):** The app includes **TestChimpRum** ([testchimp-rum-ios](https://github.com/testchimphq/testchimp-rum-ios)) with TrueCoverage automation URLs (`testchimp-rum` scheme). SmartTest runs should continue to set **`TESTCHIMP_PROJECT_TYPE=ios`** and use **`installTestChimp`** in `ios/tc-tests/fixtures` so the reporter can deliver CI test identity to the native SDK via `device.openUrl`.

**Build-time credentials (do not commit real values):** On the **Milliways** target in **`ios/Milliways.xcodeproj`**, set user-defined **`TESTCHIMP_PROJECT_ID`** and **`TESTCHIMP_API_KEY`** (same project as TestChimp / SmartTests). These merge into **`ios/Milliways-Info.plist`** via `$(TESTCHIMP_PROJECT_ID)` / `$(TESTCHIMP_API_KEY)`. Empty values skip RUM initialization (see Debug console message from `MilliwaysRum`).

**RUM environment tag:** Set **`TESTCHIMP_ENV`** on the same target (merged into **`TestChimpEnvironment`** in **`ios/Milliways-Info.plist`**). This string is sent as the SDK `environment` on every RUM payload and should match the logical env you use in TrueCoverage scopes (e.g. **`production`**, **`staging`**, **`QA`** — align with `list-rum-environments` / your deploys). Defaults in the project file are **Debug → `QA`**, **Release → `production`**. You can override at runtime without rebuilding via the **`TESTCHIMP_ENV`** environment variable (Xcode scheme **Arguments → Environment Variables**, or `simctl launch --set-env`).

**RUM ingest endpoint:** Set **`TESTCHIMP_BACKEND_URL`** on the target (merged into **`TestChimpBackendURL`** in **`ios/Milliways-Info.plist`**) so the iOS SDK sends to the intended backend stack. Defaults in the project file are **Debug and Release → `https://featureservice-staging.testchimp.io`**. Runtime override is supported via process env **`TESTCHIMP_BACKEND_URL`**.

**Event docs:** `plans/events/*.event.md`. **Progress tracker:** `plans/knowledge/truecoverage-instrument-progress.md`.

---

## Mocking Plan

- **`http_mocking` (Playwright `page.route`):** **N/A** for the current **Mobilewright / native** SmartTests harness (no `page` in specs).
- **`aimock`:** **Not applicable** for this init. Defer if LLM-backed flows enter test scope.

---

## ExploreChimp

- **`TESTCHIMP_PROJECT_TYPE`:** `ios` (from **`ios/tc-tests/.testchimp-tests`**; **`npm test`** / launcher sets this.)
- **Targets:** UI SmartTests with **`markScreenState`** — primarily **`ios/tc-tests/order-flow.spec.js`** (**#TS-100**, **#TS-101**). **`smoke.quick.spec.js`** is not an ExploreChimp target (no UI journey / markers).
- **`TESTCHIMP_BATCH_INVOCATION_ID`:** Set a **new** value per exploration batch (correlates analysis in TestChimp). Example pattern: `explore-ios-<git-short>-<unix_ts>`.
- **`TESTCHIMP_BRANCH_NAME`:** Launcher fills from **`git branch --show-current`** when unset — keeps **`branch_id`** resolution on the server for local runs.
- **Credentials / backend:** Same as normal runs — **`scripts/run-mobilewright-with-mcp-env.mjs`** merges **`TESTCHIMP_API_KEY`** and **`TESTCHIMP_BACKEND_URL`** from **`.cursor/mcp.json`**.
- **`NETWORK` regex:** Not configured yet (no documented app API host in this repo). Until **`EXPLORECHIMP_REQUEST_REGEX_TO_ANALYZE`** is set for the Milliways backend(s), use **`EXPLORECHIMP_SOURCES_TO_ANALYZE=DOM,SCREENSHOT,CONSOLE,METRICS`** so **`NETWORK`** is omitted intentionally (avoids the “regex missing — network disabled” warning while default is all five sources).
- **Default sources (current):** `DOM,SCREENSHOT,CONSOLE,METRICS` (see above).

**Example — ExploreChimp on written order flows (after `make -C ios build`):**

```bash
cd /path/to/Milliways-ios
export IOS_APP_PATH="$PWD/ios/build/Build/Products/Debug-iphonesimulator/Milliways.app"
export EXPLORECHIMP_ENABLED=true
export EXPLORECHIMP_SOURCES_TO_ANALYZE=DOM,SCREENSHOT,CONSOLE,METRICS
export TESTCHIMP_BATCH_INVOCATION_ID="explore-ios-$(git rev-parse --short HEAD)-$(date +%s)"
node scripts/run-mobilewright-with-mcp-env.mjs order-flow.spec.js
```

Review the exploration / journeys in the TestChimp UI using the batch id and branch. When app API hosts are known, add **`EXPLORECHIMP_REQUEST_REGEX_TO_ANALYZE`** and include **`NETWORK`** in sources if useful.

---

## Past learnings — authoring & validation (FAQ)

### Q: `@testchimp/playwright/runtime` throws `Cannot read properties of undefined (reading 'extend')` on Mobilewright.

**A:** `@testchimp/playwright` resolves the mobile test entry from **`TESTCHIMP_MOBILE_TEST_MODULE`** (see its **`project-type.js`**); the default module name does not export Playwright’s **`test`**. Use **`scripts/run-mobilewright-with-mcp-env.mjs`** (or **`npm test`** in **`ios/tc-tests/`**), which sets the correct module internally—do not rely on remembering env vars by hand.

### Q: “Playwright Test did not expect test() to be called here” after adding TestChimp.

**A:** Duplicate **`@playwright/test`** versions — use **`overrides`** in **`ios/tc-tests/package.json`** to force a single **`@playwright/test` / `playwright`** line (e.g. **1.59.1**) across **`@mobilewright/test`** and **`@testchimp/playwright`**.

### Q: Smoke tests fail on `stat [PATH_TO_IPA]` even with `test.skip` for missing `IOS_APP_PATH`.

**A:** Any test that uses **`screen`**, **`device`**, or **`markScreenState`** triggers app install before the test body runs. For smoke without a built app, only use fixtures that do not require device boot (e.g. **`bundleId`**, **`testInfo`**).

### Q: Plan scenario TS-100 mentions changing quantity in the cart, but the app has no cart line steppers.

**A:** Quantity is edited on **`MenuItemDetailView`** (`+` / `−`) before **`Add to Order`**. SmartTests under **`ios/tc-tests/order-flow.spec.js`** follow that UI and still satisfy **#TS-100** acceptance (item added, quantity changed, totals correct in cart).

### Q: Tests run locally but I do not see execution results in the TestChimp UI.

**A:** (1) **`TESTCHIMP_API_KEY`** must be in the **process environment** for the Mobilewright process (MCP/IDE config does **not** apply to `npm test` / CI). If logs say `Reporter is not enabled` or `Missing TESTCHIMP_API_KEY`, reporting is off. (2) **`TESTCHIMP_BACKEND_URL`** must match the stack where the project lives (e.g. if Cursor MCP uses **`https://featureservice-staging.testchimp.io`**, export the **same** URL for runs; the reporter default is **`https://featureservice.testchimp.io`**, and reports will not show under a staging project.) (3) **`testsFolder`** for `@testchimp/playwright/reporter` is set to **`.`** in **`ios/tc-tests/mobilewright.config.ts`** so **`folderPath`** lines up with the Git-mapped SmartTests root **`ios/tc-tests/`** (platform path **`tests/`**). (4) Optional: **`TESTCHIMP_BRANCH_NAME`** (current git branch) helps the server attach runs to branch context — see ExploreChimp / branch docs.

### Q: TrueCoverage RUM does not initialize in the iOS app (Debug log says RUM skipped).

**A:** Set the **Milliways** target’s user-defined build settings **`TESTCHIMP_PROJECT_ID`** and **`TESTCHIMP_API_KEY`** in **`ios/Milliways.xcodeproj`** (values are merged into **`ios/Milliways-Info.plist`** at build time). Use the same TestChimp **project** as SmartTests. Leave them empty only when you intentionally want no RUM traffic (e.g. OSS clones without credentials).

### Q: RUM events show up under the wrong environment in TrueCoverage.

**A:** The native SDK’s `environment` field comes from **`TESTCHIMP_ENV`**: build setting → **`TestChimpEnvironment`** in the merged Info.plist, or runtime override via **`TESTCHIMP_ENV`** in the process environment (scheme / simctl). Use the **same string** you pass as `environment` in TrueCoverage MCP scopes (e.g. if production traffic is tagged `production`, ship Release builds with **`TESTCHIMP_ENV=production`**).

### Q: GitHub Actions `make build` fails — Simulator not found.

**A:** Hosted images change available Simulator names. Set **`DEVICE_NAME`** in the workflow (or Makefile) to a device that exists on the runner (`xcrun simctl list devices available`).

### Q: SmartTests need signed-in users after the demo backend was added.

**A:** Use the `seededUser` fixture from **`ios/tc-tests/fixtures/auth.fixture.js`**. It calls the local backend seed endpoint **`POST /qa/users`** at **`MILLIWAYS_API_BASE_URL`** (default **`http://localhost:3001`**) and returns `{ id, email, password }`; specs should sign in through the native UI with those credentials instead of creating accounts through the signup UI.

### Q: Docker Compose API cannot bind port `3000` locally.

**A:** A local Grafana process commonly owns `3000` on this workstation. The Milliways compose file exposes the API on host port **`3001`** while the container still listens on `3000`. Keep the app, fixture default, and smoke script aligned on **`http://localhost:3001`** unless explicitly overridden.

### Q: `@mobilewright/test` does not export `mergeTests` in this project.

**A:** The installed Mobilewright line (`@mobilewright/test@0.0.33`) exposes the base `test` but not Playwright's `mergeTests`. When there is only one domain fixture, export the extended fixture directly from `ios/tc-tests/fixtures/index.js` via **`installTestChimp(auth)`**. Revisit composition only if additional domain fixtures are added.

### Q: Mobilewright times out launching `com.mobilenext.Milliways` after rebuilding the `.app`.

**A:** Mobilewright may treat the same `IOS_APP_PATH` as already installed even when the app contents changed. After **`make -C ios build`**, run **`make -C ios boot`** and, if launch timeouts persist, reinstall the current artifact explicitly: **`xcrun simctl install booted ios/build/Build/Products/Debug-iphonesimulator/Milliways.app`**, then rerun the spec.

### Q: CI has `MOBILE_USE_API_KEY`, but SmartTests should run on the macOS Simulator.

**A:** Do not pass **`MOBILE_USE_API_KEY`** into `.github/workflows/smarttests-ios-simulator.yml`. The Mobilewright config only selects Mobile Use when **`MOBILEWRIGHT_DRIVER=mobile-use`** is explicitly set, so a repository secret existing by itself is harmless. The simulator workflow should use **`IOS_APP_PATH`**, local Docker backend, and no Mobile Use driver.

### Q: GitHub Actions Docker fails with `unix:///var/run/docker.sock ... no such file or directory`.

**A:** The SmartTests workflow runs on **macOS** because iOS Simulator requires it. GitHub-hosted macOS runners do not have a Docker daemon at Linux's default **`/var/run/docker.sock`**. Start Colima first and persist **`DOCKER_HOST=unix://$HOME/.colima/default/docker.sock`** via **`$GITHUB_ENV`** before any later `docker compose` steps.
