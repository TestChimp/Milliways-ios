---
type: story
id: US-105
title: Cart and checkout edge cases
created_date: 2026-05-17
priority: medium
---

## Summary

Signed-in guests can open the account area to see profile information, loyalty tier, and past order amounts; totals shown should be internally consistent.

## Acceptance criteria

* Profile shows identifiable user context (e.g. email domain) and loyalty messaging.
* Aggregate spend aligns with the list of past order prices when both are shown.
