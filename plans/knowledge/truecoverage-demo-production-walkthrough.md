# TrueCoverage demo — production manual walkthrough (iOS)

Use this script after SmartTests have run under **`staging`** (default Debug build). Manual steps below tag RUM as **`production`** so TrueCoverage can contrast **test-covered** vs **production-only** events and metadata slices.

## Before you start

### 1. Backend

From the repo root:

```bash
docker compose up --build -d
curl -fsS http://localhost:3001/health
```

### 2. Xcode — force `production` RUM environment

The app reads **`TESTCHIMP_ENV` from the simulator process**, not from Mobilewright.

1. Open `ios/Milliways.xcodeproj` in Xcode.
2. **Product → Scheme → Edit Scheme…** → **Run** → **Arguments** → **Environment Variables**.
3. Add (or set):

   | Name | Value |
   |------|--------|
   | `TESTCHIMP_ENV` | `production` |

4. Do **not** set `TESTCHIMP_BACKEND_URL` unless you intentionally override RUM ingest — build settings leave it empty so the SDK uses the default production ingress (same as `.cursor/mcp.json` without a backend override).

5. Build and run on the **iOS Simulator** (Debug is fine; the env var overrides the Debug `staging` plist value). **Clean build** after changing `TESTCHIMP_*` in `project.pbxproj`.

### 3. Confirm RUM initialized

In Xcode console after launch, look for a log line like:

`TestChimp RUM initialized … environment=production …`

### 4. Use a fresh account for sign-up

SmartTests only exercise **sign-in**. For this walkthrough, use an email that has **never** been registered, e.g. `demo+tc-prod-<date>@example.com` and password `TestPass123!` (or any password meeting app rules).

---

## Walkthrough steps

Complete steps **in order** in a single session. After the last step, **background the app** (⌘⇧H) or stop the run so RUM flushes (~10s batching otherwise).

| Step | What to do in the app | Events / slices captured |
|------|------------------------|---------------------------|
| **1** | On sign-in screen, tap **Create an account** (or equivalent). Enter new email + password → complete sign-up. | `auth_session_started` → `entry.auth_kind=sign_up` |
| **2** | On Welcome, tap **New Order**. Wait for menu to load. | `menu_loaded` → `cart.line_item_count_bucket=0` |
| **3** | Tap **two different dishes** (e.g. one from Main Dishes, one from another section if shown). On each detail sheet, tap **Add to Order** (quantity 1). | (cart state only) |
| **4** | Tap **View Order** or cart icon to open the cart. | — |
| **5** | In coupon field, enter **`MARVIN`** → tap **Apply**. | `coupon_apply_attempted` → `promo.result=valid`, `menu.section_key` ≈ first section added |
| **6** | Enter **`NOTACODE`** (or any wrong code) → tap **Apply**. | `coupon_apply_attempted` → `promo.result=invalid` |
| **7** | Tap **Place Order**. Wait for delivery screen. | `order_submitted_success` → `order.has_coupon=true`, `cart.line_item_count_bucket=2_5` |
| **8** | Tap **Close** on delivery to return to Welcome. | — |
| **9** | Open **Account** (profile sheet from Welcome). Wait until orders list or “No orders yet” appears. | `account_viewed` → `account.orders_count_bucket=1` (or `0` if API empty), `account.load_outcome=success` |
| **10** | Tap **Sign Out**. | `session_ended` → `exit.reason=sign_out` |
| **11** | Background the app or stop Xcode run. | RUM flush |

### Optional — extra `menu_loaded` slice

To populate `menu_loaded` with a **non-empty cart** bucket under production:

1. Sign in again (sign-in is OK for this optional step).
2. **New Order** → add one item → tap **back** (chevron) to Welcome.
3. Tap **New Order** again (menu already loaded).

You should get another `menu_loaded` with `cart.line_item_count_bucket=1` (or `2_5` if items remained in cart).

---

## What should *not* appear from production-only work

Current SmartTests (`menu.spec.js`, `navigation.spec.js`) under **`staging`** should cover:

| Event / slice | Covered by tests |
|---------------|------------------|
| `auth_session_started` / `sign_in` | Yes |
| `auth_session_started` / `sign_up` | **No** — production manual only |
| `menu_loaded` / `cart=0` | Yes |
| `coupon_apply_attempted` | **No** — entire event manual only |
| `order_submitted_success` / `has_coupon=false` | Yes |
| `order_submitted_success` / `has_coupon=true` | **No** — manual only |
| `account_viewed` | **No** |
| `session_ended` | **No** |

Do **not** add coupon/account SmartTests before the demo if you want this contrast.

---

## Run staging tests (baseline)

From repo root (after `cd ios && make build` per `ai-test-instructions.md`):

```bash
./scripts/run-smarttests.sh ios
```

Default Debug build uses **`TESTCHIMP_ENV=staging`** from Xcode build settings; do **not** set `TESTCHIMP_ENV=production` on the test runner.

---

## Verify in TestChimp

1. Filter by environment: **`staging`** vs **`production`**.
2. Open TrueCoverage for each event title:
   - `auth_session_started`, `menu_loaded`, `order_submitted_success`
   - `coupon_apply_attempted`, `account_viewed`, `session_ended`
3. For each metadata key, confirm production-only cells (e.g. `sign_up`, `promo.result=invalid`, `order.has_coupon=true`) show as **uncovered** or **production-only** relative to automation on staging.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| All emits show `staging` | Add `TESTCHIMP_ENV=production` to the **Run** scheme env vars; clean build and rerun. |
| No events in TestChimp | Background app to flush; confirm `TESTCHIMP_PROJECT_ID` / `TESTCHIMP_API_KEY` in `project.pbxproj` match `.cursor/mcp.json`; clean build; check console for RUM init (`projectId=3d36a0e2-…`). |
| Sign-up fails (email taken) | Use a new unique email. |
| `MARVIN` invalid | Ensure cart is non-empty before Apply. |
| Coupon already applied | Invalid-code step still works; valid step may need a fresh session without MARVIN. |
