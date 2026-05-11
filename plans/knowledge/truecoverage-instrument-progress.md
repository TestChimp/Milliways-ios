# TrueCoverage instrumentation progress

**Platform:** Native iOS (`project_type=ios`). **SDK:** [TestChimpRum](https://github.com/testchimphq/testchimp-rum-ios) (SPM, ≥ 0.1.0). **Automation URLs:** `testchimp-rum` scheme + `TestChimpRum.handleAutomationURL` in `ios/Milliways/MilliwaysApp.swift` (Mobilewright / `installTestChimp` + `TESTCHIMP_PROJECT_TYPE=ios`).

## Screens / flows

### Auth

| Event | Status | Notes |
|-------|--------|--------|
| `auth_session_started` | **done** | `SessionManager` after successful sign-in or sign-up; `plans/events/auth-session-started.event.md` |

### Menu

| Event | Status | Notes |
|-------|--------|--------|
| `menu_loaded` | **done** | After successful `fetchMenu` in `MenuView`; `plans/events/menu-loaded.event.md` |

### Checkout

| Event | Status | Notes |
|-------|--------|--------|
| `order_submitted_success` | **done** | After successful `submitOrder` in `OrderView`; `plans/events/order-submitted-success.event.md` |

## Planned (not yet instrumented)

| Event | Status | Notes |
|-------|--------|--------|
| Menu item added to cart | **planned** | Optional: `cart_item_added` from `MenuItemDetailView` with category bucket only |
| Delivery completion | **planned** | Optional: `delivery_flow_completed` from `DeliveryView` |

## App configuration

- **Credentials:** User-defined build settings `TESTCHIMP_PROJECT_ID` and `TESTCHIMP_API_KEY` on the **Milliways** target under **`ios/`** (merged into `ios/Milliways-Info.plist`). Empty defaults skip RUM init (Debug log). Same project API key as SmartTests / MCP is typical.
- **Environment tag:** `TESTCHIMP_ENV` → `TestChimpEnvironment` in the plist (SDK `environment` field). Match the strings you use in TrueCoverage / `list-rum-environments` (e.g. `QA` vs `production`). Runtime override: process env `TESTCHIMP_ENV`.
- **RUM ingest:** `TESTCHIMP_BACKEND_URL` → `TestChimpBackendURL` → SDK `testchimpEndpoint`. Debug and Release both default to **`https://featureservice-staging.testchimp.io`** in the Xcode target; override via process env `TESTCHIMP_BACKEND_URL` if needed.
- **TrueCoverage test linking:** No extra app hooks beyond URL scheme; reporter sets automation context via `testchimp-rum://truecoverage/v1/...` when Mobilewright runs with `installTestChimp`.
