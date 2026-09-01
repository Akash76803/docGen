# Phase 8.4 Fix2 — Hierarchical Layers + Atomic Group Z-Order

## Scope
This fix closes the two UI/runtime issues reported after Phase 8.4 Fix1:
1. Group name editing was not visible in the Layers workspace.
2. Group layer ordering could appear to move in the panel without producing the expected atomic canvas stacking, especially for legacy/interleaved group members.

## Implemented
- Replaced flat grouped element rows with a hierarchical Layers representation:
  - one editable Group container row,
  - expand/collapse control,
  - child elements indented under the group,
  - group item count,
  - group visibility/lock controls,
  - group-specific Front / Up / Down / Back controls.
- Group name is edited directly on the Group row. Enter/blur commits; Escape reverts the draft.
- New groups are compacted into one contiguous z-order block immediately when grouped.
- `moveLayers()` now treats arbitrary multi-selection/group members as one atomic layer block even when an older template contains interleaved member z-indexes.
- Forward/Backward first derives the block position from the front-most selected member, compacts the selection, then moves exactly one neighboring layer step.
- Existing group integrity repair from Fix1 is preserved.

## Intentionally unchanged
- Face Split / Split
- OSNAP
- Trimmer / Erase Segment
- Boolean geometry
- Styling/rendering
- Shape transforms
- Export contracts

## Verification
- TypeScript `transpileModule` syntax check: PASS for changed engine and CardDesigner sources.
- Added targeted Vitest tests for group compaction, legacy interleaving, hierarchical UI contract, and group z-order wiring.
- Vitest execution in the clean artifact environment is BLOCKED because `vitest` is not installed in the extracted baseline.
