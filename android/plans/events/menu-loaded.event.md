---
title: menu-loaded
description: Fires after the menu API returns successfully in `AppViewModel.loadMenu` (happy path only; not emitted on errors).
added-on: 2026-05-11
significance: 4
---

## Rationale

**Runtime emit title (exact, for TrueCoverage):** `menu_loaded` — emitted in `AppViewModel.kt` when `api.fetchMenu()` returns `ApiResult.Ok` and `menuSections` is updated.

Mirrors the iOS `MenuView` instrumentation: measures successful catalog availability with the same metadata keys for cross-platform analytics and fixture planning (section count vs cart size at load time).

**Questions we want TrueCoverage to answer:** Distribution of `menu.section_count_bucket` and `cart.line_item_count_bucket` at menu load; transition probabilities toward `order_submitted_success`.

**Business criticality:** Core browse step before add-to-cart and checkout.

**Requirement links:** `plans/stories/menu/menu-discovery.md`, `plans/scenarios/menu/main-dishes-listed.md`, `plans/scenarios/menu/shipping-disclaimer.md`, and order stories under `plans/stories/orders/`.

## Metadata keys

| Key | Meaning | Allowed values |
|-----|---------|----------------|
| `menu.section_count_bucket` | Menu section count | `0`, `1`, `2_5`, `6_plus` (`MilliwaysRum.menuSectionCountBucket`) |
| `cart.line_item_count_bucket` | Cart line count when menu loads | `0`, `1`, `2_5`, `6_plus` (`MilliwaysRum.lineItemCountBucket`) |
| `platform` | Client platform | `android` |

No item or section titles in metadata.
