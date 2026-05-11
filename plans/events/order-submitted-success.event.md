---
title: order-submitted-success
description: Fires after the server accepts the order submission and before the delivery handoff UI is shown.
added-on: 2026-05-10
significance: 5
---

## Rationale

Order submission is the primary conversion event for this demo app. Emitting here (after `submitOrder` succeeds) ties TrueCoverage to the **business outcome** rather than button taps. Metadata uses buckets and a boolean coupon flag only—no payment IDs, user ids, or line-item SKUs.

**Hypotheses:** Compare `order.has_coupon` slices to see if discounted paths are under-tested relative to production traffic; use `cart.line_item_count_bucket` to spot large-basket gaps.

**Business criticality:** Directly maps to completed orders and downstream fulfilment.

**Requirement links:** Order-flow SmartTests in `ios/tc-tests/` (e.g. scenarios covering checkout and coupons).

## Metadata keys

| Key | Values |
|-----|--------|
| `cart.line_item_count_bucket` | `0`, `1`, `2_5`, `6_plus` — distinct line items in the order at submission. |
| `order.has_coupon` | `true`, `false` — whether a coupon was applied before submit. |
