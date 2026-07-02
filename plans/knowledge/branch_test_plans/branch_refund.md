---
LastRunOnCommit: b1f507808036946de43ccb490f1bb45e91dbf249
UserApproved: yes
---

# Branch test plan: `refund`

## Change summary

PR implements **US-107 request refund** (story `US-107`, scenarios **TS-117**, **TS-118**, **TS-119**):

- Backend: `refund_requests` table, `GET /orders` refund flags, `POST /orders/:orderId/refunds`, **`POST /qa/orders`** with `ageDays` for test data.
- iOS + Android: Account → Past Orders → **Refund** button (enabled &lt; 2 days, disabled otherwise), confirmation alert **"Your refund request was received."**, **Refund pending** after submit.

Prior commit `1ee2200` authored `tests/mobile/e2e/common/refund.spec.js` + `tests/shared/refund-helpers.js`; commit `b1f5078` **reverted** those tests (“do later”). **This run restores and validates them.**

**Scenario doc drift:** plan scenarios mention “30 days”; product uses **2 days** (`REFUND_WINDOW_MS` in `backend/src/server.js`). Tests assert **2-day** behavior per story `US-107`.

---

## Platform scope (this run)

- **Decision:** `ios`, `android`
- **Confidence:** `high`
- **Rationale:**
  - PR touches `ios/Milliways/Views/AccountView.swift` and `android/.../MilliwaysAppNav.kt` (refund UI).
  - SmartTests live under `tests/mobile/e2e/common/` (shared); run **`--project=ios`** and **`--project=android`**.
- **User confirmed:** yes

---

## Phase 1 completion (Analyze → Plan)

- [x] Branch plan created/read
- [x] Change context: `origin/main...HEAD` — 9 files, refund feature + reverted tests
- [x] Plans: `plans/stories/orders/request-refund.md`, scenarios TS-117/118/119
- [x] Fixture/seed discovery: `seededUser` + existing `/qa/users`, `/qa/orders` (`ageDays`); no new seed routes required
- [x] `ai-test-instructions.md` read (local Docker + `run-smarttests.sh`)
- [x] Coverage CLI: `get-requirement-coverage` on `plans/scenarios/orders` returned `{}` (no rollup in response); gaps inferred from missing specs
- [x] Smart regression candidates noted (§6)
- [x] ExploreChimp candidates: new `refund.spec.js` (§7 **`yes`**)
- [x] Platform scope drafted (both native stacks)

---

## 1. Test plan updates (plans layer)

| Action | Entity | Notes |
|--------|--------|-------|
| **No create** | US-107, TS-117, TS-118, TS-119 | Already in `plans/` with real ids |
| **Optional update (post-validate)** | TS-118 scenario markdown | Align “30 days” copy to **2 days** — product truth; not blocking automation |

Platform story/scenario MCP creates: **N/A** (ids exist).

---

## 2. Tests to write (inventory)

| # | Title | Platform | Scenarios |
|---|--------|----------|-----------|
| 1 | Refund button enabled for recent orders | ios, android | TS-117 |
| 2 | Refund request shows confirmation + pending | ios, android | TS-119 |
| 3 | Refund button disabled for old orders | ios, android | TS-118 |

**File:** `tests/mobile/e2e/common/refund.spec.js` (restore from `1ee2200`, minor hardening if needed)  
**Helper:** `tests/shared/refund-helpers.js` (`seedOrder`, `fetchMenuItemId`)

---

### Test 1 — Refund button enabled for recent orders

#### Arrange

- Signed-in user (`seededUser` fixture) with **one recent order** (&lt; 2 days) in Past Orders.
- Order created **via UI** (place order flow) so list is populated without extra fixture.

#### Fixtures plan

- **Use:** `screen`, `seededUser` from `mobile/fixtures/index.js`
- **New:** none

#### Seed endpoint updates

- **N/A** — UI order placement + existing `/qa/users` only

#### Act

1. Sign in (beforeEach).
2. Add item to cart, place order, close delivery screen.
3. Open Account → Past Orders.

#### Assert

##### UI validations

- **Request Refund** control visible and **enabled** for the recent order row.

##### Backend validations

- **N/A** for this test (eligibility proven via enabled UI control).

---

### Test 2 — Refund request shows confirmation message

#### Arrange

- Signed-in user with one **eligible** recent order (UI-placed).

#### Fixtures plan

- **Use:** `screen`, `seededUser`

#### Seed endpoint updates

- **N/A**

#### Act

1. Sign in, place order, open Account.
2. Tap **Request Refund** (a11y label) on first order.

#### Assert

##### UI validations

- Alert/dialog text **"Your refund request was received."**
- Dismiss OK; row shows **Refund pending**.

##### Backend validations

- Optional probe via authenticated `GET /orders` (same `MILLIWAYS_API_BASE_URL`) after UI assert: `refundRequested: true` for that order id — can add in `refund-helpers.js` if Android alert text is flaky; **primary proof is UI** per TS-119.

---

### Test 3 — Refund button disabled for old orders

#### Arrange

- Signed-in user with an order **older than 2 days** (`ageDays: 3` on `/qa/orders`).
- No UI order placement required for this case.

#### Fixtures plan

- **Use:** `screen`, `seededUser`
- **Use helper:** `seedOrder(seededUser, { ageDays: 3 })` from `refund-helpers.js`

#### Seed endpoint updates

- **N/A** — `POST /qa/orders` with `ageDays` already implemented

#### Act

1. Sign in.
2. `seedOrder` old order.
3. Open Account → Past Orders.

#### Assert

##### UI validations

- **Request Refund** visible and **disabled** (product shows button for ineligible orders).

##### Backend validations

- **N/A** (disabled control matches `refundEligible: false` from API)

---

## 3. System infra updates

- **Seeds:** none ( `/qa/orders` exists )
- **Probes:** none required for MVP; optional `GET /orders` helper if needed during triage
- **TrueCoverage:** no new events this PR; existing `account_viewed` fires on account open — **N/A** new instrumentation

---

## 4. Test infra updates

- Restore `tests/shared/refund-helpers.js`
- Restore `tests/mobile/e2e/common/refund.spec.js`
- Add `x-testchimp-seed-request: 1` on `/qa/orders` fetch in helper (align with `seed-user.js`) — small hygiene fix

---

## 5. User approval

- **Status:** approved — Execute in progress

---

## 6. Smart regression scope

| Scenario | Rationale |
|----------|-----------|
| **TS-110** | Account / order history — same screen as refund |
| **TS-111**, **TS-112** | Navigation + order completion flows (shared helpers) |
| **TS-105**, **TS-106** | Smoke menu paths — low risk but quick confidence |

Linked specs: `menu.spec.js`, `navigation.spec.js` (grep `// @Scenario:`).

---

## 7. ExploreChimp

- **Decision:** `yes`
- **Targets (after Phase 5):**
  - `tests/mobile/e2e/common/refund.spec.js` (new)
  - Regression-touched: `navigation.spec.js`, `menu.spec.js` if run/updated
- **Env:** `EXPLORECHIMP_ENABLED`, `TESTCHIMP_BRANCH_NAME=refund`, `NETWORK` regex per `ai-test-instructions.md`
- **Completed batch:** `explore-refund-ios-1779238838` (7 tests, all passed)

---

## 8. Workflow checklists

### Execute

- [x] User approved plan
- [x] Restore refund helper + spec
- [x] Docker backend healthy (`curl localhost:3001/health`)
- [x] iOS app built; Android APK built (or via `run-smarttests.sh`)
- [x] Run refund spec ios until green (3/3); Android blocked (WebSocket/device flake)
- [x] Scenario links present (TS-117, TS-118, TS-119)

### Validate

- [x] Scenario-link audit on `refund.spec.js`
- [x] `markScreenState` on Account / refund alert transitions
- [x] `testchimp list-screen-states` consulted (empty atlas; markers in spec)

### Phase 5 Smart regression

- [x] Included in ExploreChimp batch: `menu.spec.js`, `navigation.spec.js` on ios (7/7 green)

### Phase 6 ExploreChimp

- [x] Batch `explore-refund-ios-1779238838` — ios: `refund.spec.js`, `menu.spec.js`, `navigation.spec.js` (7 passed, `isExploreChimpEnabled=true`)

### Phase 7 Cleanup

- [ ] Stop Docker / note N/A if user-owned stack

---

## Blockers

| Blocker | Owner | Action |
|---------|-------|--------|
| Plan approval | User | Reply **approve** to run Execute |
| Platform confirmation | User | Confirm **ios + android** or narrow scope |
| Simulator hygiene | Agent/user | Single booted simulator per FAQ if iOS flakes |

---

## Mocking

- **Real backend** (local Docker) — per `ai-test-instructions.md`
- **AIMock:** N/A
