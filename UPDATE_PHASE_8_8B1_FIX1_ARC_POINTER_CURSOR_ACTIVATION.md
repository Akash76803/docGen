# Phase 8.8B1 Fix1 — CAD Arc Pointer/Cursor Activation

## Reported regression

CAD Arc appeared inactive: the crosshair did not enable and clicks over existing drawn shapes did not create Arc points.

## Root cause

The new `ARC` mode was missing from two established drawing-tool interaction gates. Existing element shells could consume pointer events before Arc construction, and the canvas cursor expression did not classify Arc as a drawing command.

## Fix

- Arc now owns pointer-down during the canvas capture phase, including clicks over existing shapes.
- Arc activation now visibly applies the crosshair cursor.
- Existing shapes are not moved or selected by Arc construction clicks.
- Three-point geometry, OSNAP, preview and history behavior remain unchanged.

## Verification

- `npm run typecheck`: PASS
- Targeted CAD Arc tests: PASS — 2 files / 6 tests
- `npm test -- --run`: PASS — 175 files / 916 tests
- `npm run build`: PASS — 1695 modules transformed
- Windows UI: PENDING
