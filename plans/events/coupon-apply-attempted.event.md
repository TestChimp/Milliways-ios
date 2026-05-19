---
title: coupon-apply-attempted
description: Fires when the user taps Apply on the coupon field in the cart (valid or invalid code).
added-on: 2026-05-19
significance: 4
---

## Rationale

**Runtime emit title (exact, for TrueCoverage):** `coupon_apply_attempted` — emitted from `OrderView.swift` when the Apply button is tapped, after `applyCoupon` returns.

Captures promotion engagement without emitting coupon codes. Pairs **outcome** (`valid` / `invalid`) with cart and menu section context so TrueCoverage can show which promo slices are exercised in production vs automation.

**Questions we want TrueCoverage to answer:** What share of coupon attempts are invalid? Do users with larger carts apply coupons more often? Is `menu.section_key` for promo attempts covered in SmartTests?

**Business criticality:** Coupons affect revenue and support load; untested invalid-code handling is a common regression.

**Requirement links:** `plans/stories/promotions/`, `plans/scenarios/promotions/valid-marvin-coupon.md`, `plans/scenarios/promotions/invalid-coupon-error.md`.

## Metadata keys

| Key | Meaning | Allowed values |
|-----|---------|----------------|
| `promo.result` | Whether the code was accepted | `valid`, `invalid` |
| `cart.line_item_count_bucket` | Distinct line items when Apply was tapped | `0`, `1`, `2_5`, `6_plus` |
| `menu.section_key` | Dominant section in cart at attempt time | Slug from section title (e.g. `main_dishes`) or `unknown` |
| `platform` | Client platform | `ios` |

Coupon **codes** are not emitted.
