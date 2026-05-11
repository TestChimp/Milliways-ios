---
title: order-submitted-success
description: Fires after `AppViewModel.submitOrder` receives a successful create-order response from the API.
added-on: 2026-05-11
significance: 5
---

## Rationale

**Runtime emit title (exact, for TrueCoverage):** `order_submitted_success` — emitted in `AppViewModel.kt` on `ApiResult.Ok` from `api.createOrder`, after `submittedOrder` / `latestOrderStatus` are set.

Same conversion milestone as iOS `OrderView.placeOrder`. Metadata matches iOS so TrueCoverage funnels and `automationEmitsOnly` comparisons stay consistent across `TESTCHIMP_PROJECT_TYPE=android` and `ios` runs.

**Questions we want TrueCoverage to answer:** Coupon slice (`order.has_coupon`) vs completion; large-cart buckets vs test coverage.

**Business criticality:** Primary success metric for the order flow.

**Requirement links:** `plans/stories/orders/order-food.md`, `plans/scenarios/orders/submit-order-delivery.md`, `plans/scenarios/promotions/`, `plans/scenarios/navigation/cart-cleared-after-order.md`.

## Metadata keys

| Key | Meaning | Allowed values |
|-----|---------|----------------|
| `cart.line_item_count_bucket` | Line items at submit | `0`, `1`, `2_5`, `6_plus` |
| `order.has_coupon` | Coupon applied | `true`, `false` (strings as emitted) |
| `platform` | Client platform | `android` |

No order IDs, tokens, or coupon strings in RUM metadata.
