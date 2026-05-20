---
type: story
id: US-105
title: Cart and checkout edge cases
created_date: 2026-05-19
priority: medium
---

## Summary

Covers defensive behaviour for unusual cart states: empty checkout, copy for singular quantities, minimum quantity on item detail, and cart math when coupons interact with removed lines.

## Acceptance criteria

- Empty cart does not crash the app when checkout is attempted (or is blocked gracefully).
- Singular quantity uses correct singular/plural copy in the sticky summary where applicable.
- Quantity controls on an item cannot drive quantity below one.
- Totals remain safe to interpret when discounts and removals combine.
