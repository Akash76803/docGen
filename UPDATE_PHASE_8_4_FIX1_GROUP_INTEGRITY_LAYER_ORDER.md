# Phase 8.4 Fix1 — Group Integrity, Rename Visibility & Layer Order

## Scope
This fix closes three manual-QA defects reported after Phase 8.4:
1. Group Rename was not reliably visible in the UI.
2. Group Up/Down/Front/Back did not behave as an atomic visual layer block on canvas.
3. Saving could fail with `Group ... references missing element ...` after destructive operations on grouped elements.

## Changes
### Group name UI
- Added an always-visible `Group name` editor inside the Layers toolbar whenever one complete group is selected.
- Existing Inspector group-name editor remains available.
- Rename updates the same `DesignGroup.name`; child element names are unchanged.

### Atomic layer order
- `moveLayers()` now treats a multi-element/group selection as one stable layer block.
- Front/Back move the whole block.
- Up/Down move the whole block by one neighboring unselected layer unit while preserving internal selected order.
- The canvas continues to render each element using its normalized `zIndex`, so Layers and canvas stacking stay in sync.

### Group integrity repair
- Added `repairArtboardGroupIntegrity()` / `repairTemplateGroupIntegrity()`.
- Destructive element replacement removes stale source IDs from groups and clears inherited stale `groupId` on replacements.
- Deletion now removes only elements that are actually deletable (unlocked) and repairs/dissolves invalid groups.
- Groups with fewer than two surviving members are dissolved and surviving elements are ungrouped.
- Deserialization normalizes stale flat-group references.
- Serialization defensively repairs group references before validation without otherwise normalizing/changing valid template values.

## Regression tests
Added `packages/design-engine/test/phase84-fix1-group-integrity-layer-order.test.ts` covering:
- atomic group layer movement,
- grouped source replacement,
- locked-member deletion safety,
- stale group repair before serialization.

## Verification status
- Changed TS/TSX syntax/transpile: PASS.
- Critical geometry/style/transform files: byte-for-byte unchanged from Phase 8.4 baseline.
- Full Vitest/build cannot run in this clean bundle because `node_modules` is intentionally absent.

## Manual acceptance
See `MANUAL_SMOKE_TESTS.md` and the delivery response for focused manual steps.
