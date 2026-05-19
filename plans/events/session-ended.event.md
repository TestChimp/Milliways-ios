---
title: session-ended
description: Fires when the user signs out and the local session is cleared.
added-on: 2026-05-19
significance: 3
---

## Rationale

**Runtime emit title (exact, for TrueCoverage):** `session_ended` — emitted from `SessionManager.signOut()` in `SessionManager.swift` before the session is cleared.

Closes the loop on `auth_session_started`. Low volume, fixed exit reason keeps cardinality minimal while showing whether sign-out is covered by automation (typically it is not in current SmartTests).

**Questions we want TrueCoverage to answer:** What fraction of sessions end with explicit sign-out vs app background? (Future: additional `exit.reason` values if needed.)

**Business criticality:** Session lifecycle completeness for funnel analysis.

**Requirement links:** `plans/stories/account/my-account.md`.

## Metadata keys

| Key | Meaning | Allowed values |
|-----|---------|----------------|
| `exit.reason` | Why the session ended | `sign_out` |
| `platform` | Client platform | `ios` |

No user identifiers are emitted.
