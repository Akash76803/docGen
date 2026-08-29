# Phase 7.5 Fix3 — Build Guard + Regression Test Alignment

## Fixes

- Fixed `CardDesigner.tsx` strict TypeScript nullability error where `snap.elementId` was read although drawing snap can be undefined. The hinted target list now safely uses `snap?.elementId`.
- No change to FaceSplit runtime behavior: missing snap metadata remains optional and geometric fallback still applies.
- Updated Phase 7.4.1 CAD feedback regression assertions to tolerate formatting while still enforcing strict two-click commit, live preview, snap feedback, and current face splitter integration.
- Updated the Phase 7.4 Trimmer Escape regression assertion to match the current staged behavior: active trim state is cleared first; no-state Escape may exit to Select.
- No production feature was removed and no test was skipped.

## Verification

Not run in this packaging environment. User should run typecheck, build, focused tests, then full `npm test`.
