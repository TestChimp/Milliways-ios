---
title: menu-loaded
description: Fires when the menu list has been fetched successfully from the API and sections are ready to display.
added-on: 2026-05-10
significance: 3
---

## Rationale

Menu load is the first heavy API step in the ordering funnel after auth. Tracking it with coarse buckets (section count and existing cart size) helps compare **demand** for the menu surface and whether users often arrive with items already in cart—useful for fixture design (empty cart vs warm cart) without emitting identifiers or SKU-level data.

**Hypotheses:** High `cart.line_item_count_bucket` at menu load may indicate abandoned carts or multi-session behaviour worth covering in tests.

**Business criticality:** Menu failure blocks orders; successful load is a prerequisite for conversion.

**Requirement links:** Menu and catalog scenarios exercised by Mobilewright specs touching `MenuView` / `loadMenu`.

## Metadata keys

| Key | Values |
|-----|--------|
| `menu.section_count_bucket` | `0`, `1`, `2_5`, `6_plus` — coarse bucket of number of menu sections returned. |
| `cart.line_item_count_bucket` | `0`, `1`, `2_5`, `6_plus` — distinct line items in cart when menu finished loading. |
