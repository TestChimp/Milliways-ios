# TrueCoverage instrumentation progress

Unified mobile project: `3d36a0e2-dfb8-447a-9674-3c1a4650b925` (credentials in `.cursor/mcp.json`, baked into Xcode / Gradle).

## Done (instrumented + `plans/events/*.event.md`)

| Event | Platforms |
|-------|-----------|
| auth-session-started | iOS, Android |
| menu-loaded | iOS, Android |
| order-submitted-success | iOS, Android |
| coupon-apply-attempted | iOS |
| account-viewed | iOS |
| session-ended | iOS |

## Planned

_Android parity for coupon-apply-attempted, account-viewed, session-ended — optional._

## Demo

Production manual script: [`truecoverage-demo-production-walkthrough.md`](truecoverage-demo-production-walkthrough.md).
