---
title: account-viewed
description: Fires after the account screen finishes loading order history (success or error).
added-on: 2026-05-19
significance: 3
---

## Rationale

**Runtime emit title (exact, for TrueCoverage):** `account_viewed` — emitted from `AccountView.loadOrders()` in `AccountView.swift` after the orders API call completes.

Marks engagement with profile and order history. Metadata buckets order count and load outcome without exposing emails or order IDs.

**Questions we want TrueCoverage to answer:** Do returning users with many past orders behave differently in the funnel? Are account load failures visible in production but missing from test coverage?

**Business criticality:** Account retention and support; order history drives repeat purchase confidence.

**Requirement links:** `plans/stories/account/my-account.md`, `plans/scenarios/account/profile-loyalty.md`, `plans/scenarios/account/order-history-total-spent.md`.

## Metadata keys

| Key | Meaning | Allowed values |
|-----|---------|----------------|
| `account.orders_count_bucket` | Number of past orders returned | `0`, `1`, `2_5`, `6_plus` |
| `account.load_outcome` | Whether the orders API succeeded | `success`, `error` |
| `platform` | Client platform | `ios` |

No user identifiers or order IDs are emitted.
