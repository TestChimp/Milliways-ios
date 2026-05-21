# TestChimp demo reinstall — clean slate

This repo was reset for recording **`/testchimp` skill install + `/testchimp init`** from scratch.

## Before you record

1. **Re-install the skill** (Cursor user skills), then run init in a **fresh** agent chat.
2. **Do not** describe prior work as “restored”, “already wired”, “we had this before”, or “picking up where we left off”. Treat every artifact as **newly created by this init run** — even if git history or old branches still show earlier TestChimp commits.
3. **Do not** rely on deleted local state:
   - `~/.cursor/skills/testchimp/` was removed (full skill uninstall).
   - `.cursor/mcp.json` was removed (init should recreate it).
   - iOS/Android **TrueCoverage / RUM** (`TestChimpRum`, `MilliwaysRum`, URL schemes, Gradle RUM deps) was stripped from app code.

## What may still exist (not TrueCoverage instrumentation)

These are **platform sync / SmartTests scaffold** leftovers, not production RUM:

- `.testchimp-tests` / `.testchimp-plans` marker files under `tests/` and `plans/`
- `tests/` Mobilewright scaffold (`@testchimp/playwright` in test runner only)
- `plans/` stories and scenarios from earlier planning

If the demo is “greenfield init”, say so explicitly and either map empty folders in TestChimp or accept that sync may **update** existing `tests/` / `plans/` rather than invent them from zero.

## After init (TrueCoverage segment)

When init adds RUM again, narrate it as **first-time instrumentation** — not recovery of the May 2026 RUM commit (`f373f6b`).
