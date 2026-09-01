# Phase 8.1 Fix1 — Multi-Selection Resize Modifiers

## Goal
Close the manual QA gap found after Phase 8.1: Alt/Option + Resize and Shift + Resize worked for a single element, but did not transform a multi-selection as one set.

## Implemented
- Added a shared multi-selection bounding box with 8 resize handles in SELECT mode.
- Multi-select no longer shows individual resize handles on every selected element; the shared frame is the unambiguous transform target.
- Normal multi-selection resize scales selected elements as one layout while preserving relative positions and rotations.
- Alt/Option is read live during drag and keeps the selection center fixed.
- Shift is read live during drag and preserves the selection bounding-box aspect ratio.
- Alt/Option + Shift combines centered resize with aspect locking.
- PATH elements scale their internal point/Bezier geometry from immutable drag-start snapshots.
- Locked elements remain protected and are excluded from the transformable selection frame.
- One pointer resize remains one history transaction through the existing begin/end transaction flow.

## Engine additions
`packages/design-engine/src/transform.ts`
- `resizeSelectionBoundsFromDelta()`
- `resizeElementsFromSnapshots()`

The snapshot-based API deliberately avoids cumulative pointer-move scaling error.

## UI changes
`apps/desktop/src/pages/CardDesigner.tsx`
- Added `MULTI_RESIZE` interaction mode.
- Added shared selection-bounds resize overlay.
- Live `e.altKey` and `e.shiftKey` drive center/aspect modifiers.

`apps/desktop/src/index.css`
- Added shared multi-selection frame styling.

## Tests extended
- `packages/design-engine/test/phase81-transform-hardening.test.ts`
  - multi-selection layout scaling
  - Alt center resize
  - Shift aspect resize
  - Alt+Shift combined behavior
  - PATH geometry scaling
- `apps/desktop/test/phase81-transform-ui-wiring.test.ts`
  - shared frame and live modifier wiring

## Verification
- Changed TS/TSX transpile: PASS.
- Direct runtime smoke of actual transpiled transform engine: PASS (`PHASE81_FIX1_RUNTIME_SMOKE_PASS`).
- `npm run test:shape-transform`: BLOCKED because `vitest` is not installed in the clean source bundle.
- `npm run typecheck`: BLOCKED by missing project dependencies/types (Zod, XLSX, PapaParse, Paper.js, React, Tauri, etc.).
- `npm run build`: BLOCKED for the same dependency-resolution reason.

These are environment/dependency failures, not a demonstrated Fix1 source failure.

## Manual acceptance
1. Select 2–3 elements.
2. Confirm one shared bounding box with eight handles appears.
3. Drag a corner normally: all selected elements resize as one set.
4. Hold Alt while dragging: center remains fixed.
5. Hold Shift while dragging: overall selection aspect ratio remains fixed.
6. Hold Alt+Shift: both behaviors apply together.
7. Release either modifier while still dragging and confirm behavior changes live.
8. Undo once and confirm the entire resize reverts in one step.
9. Re-test Flip, Mirror, Move, Rotation, LINE, OSNAP, SPLIT and Face Split.
