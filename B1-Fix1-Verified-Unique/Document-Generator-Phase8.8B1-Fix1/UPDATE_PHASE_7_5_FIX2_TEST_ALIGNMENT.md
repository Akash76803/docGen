# Phase 7.5 Fix2 — Regression Test Alignment

## Issue
Phase 7.5 replaced the old single-face split integration with `splitComponentFaceByDivider` and deliberately removed the requirement that both `startSnap` and `endSnap` metadata be present before geometry splitting is attempted.

Older Phase 7.3 / 7.4.1 source-inspection tests still asserted the removed implementation strings:

- `splitClosedElementByDivider(source,divider,componentId)`
- `draft.shapeType==='LINE'&&draft.startSnap&&endSnap`

Those tests therefore failed even though Phase 7.5 intentionally changed the integration contract.

## Fix
Updated the stale regression assertions to validate the current canonical behavior:

- committed lines are routed through `splitComponentFaceByDivider`
- the line commit branch is still explicit
- strict two-click CAD behavior remains covered
- exact snapped pointer coordinates remain covered
- both snap metadata objects are no longer required before asking geometry to split

No production source was changed in this Fix2 package.

## Verification
Commands were not executed in this packaging environment. Run the normal focused and full regression suites locally.
