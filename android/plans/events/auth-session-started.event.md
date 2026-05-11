---
title: auth-session-started
description: Fires after a successful sign-in or sign-up when a demo auth session is established (not on sign-out or failed auth).
added-on: 2026-05-11
significance: 4
---

## Rationale

**Runtime emit title (exact, for TrueCoverage):** `auth_session_started` — passed to `MilliwaysRum.emit` in `AppViewModel.kt` inside `performSignIn` / `performSignUp` on `ApiResult.Ok`.

Same semantic event as on iOS: authenticated session start with a bounded `entry.auth_kind` dimension. Keeps cross-platform TrueCoverage comparisons aligned when filtering by environment and title.

**Questions we want TrueCoverage to answer:** Split between `sign_in` and `sign_up` in production vs QA automation; downstream rates to `menu_loaded` and `order_submitted_success`.

**Business criticality:** Gates all token-backed flows including order creation.

**Requirement links:** See `plans/stories/account/my-account.md`, `plans/stories/orders/order-food.md`, and `plans/scenarios/account/` / `plans/scenarios/orders/` for auth-dependent scenarios. Add TestChimp `#US-…` / `#TS-…` references when available.

## Metadata keys

| Key | Meaning | Allowed values |
|-----|---------|----------------|
| `entry.auth_kind` | Session entry path | `sign_in`, `sign_up` |
| `platform` | Client platform (merged by `MilliwaysRum.emit`) | `android` |

No PII or high-cardinality identifiers.
