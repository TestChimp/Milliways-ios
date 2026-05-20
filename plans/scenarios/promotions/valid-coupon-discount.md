---
type: scenario
id: TS-107
title: MARVIN coupon applies configured discount
story: US-102
created_date: 2026-05-19
priority: medium
---

## Prerequisites

- Cart has a subtotal above the coupon discount value.

## Test steps

1. Open cart with at least one paid line.
2. Enter coupon MARVIN and apply.

## Expected behaviour

- Discount line and new total reflect the configured amount off subtotal.
