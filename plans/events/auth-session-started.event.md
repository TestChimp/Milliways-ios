---
title: auth-session-started
description: Fires after a successful demo sign-in or sign-up when the app establishes an authenticated session.
added-on: 2026-05-10
significance: 4
---

## Rationale

Instrumenting the auth boundary shows how often new sessions start via **sign in** versus **sign up**, which matters for onboarding vs return-user flows and for aligning SmartTests (seed users vs registration paths) with real behaviour. The emit sits in `SessionManager` so both entry points share one event and stay consistent with backend success.

**Hypotheses:** Compare `entry.auth_kind` slices to see whether tests over-index on one path; use counts to prioritize fixture coverage for the rarer path.

**Business criticality:** Auth gates all ordering; gaps here block revenue and trust signals downstream.

**Requirement links:** Align with SmartTests that exercise `SignInView` / `SignUpView` and order flows under `ios/tc-tests/` (scenario IDs in platform as `#TS-*` when linked in specs).

## Metadata keys

| Key | Values |
|-----|--------|
| `entry.auth_kind` | `sign_in`, `sign_up` — bounded enum describing how the session was created. |
