# Phase 8.7 Add-on Fix3 — CAD Intersection Capture + Draw Tool Exit

## Goal
Make line-like drawing feel more CAD-accurate when the pointer is slightly before/after an intended intersection, and make draw cursor lifecycle predictable.

## Implemented
- Added a dedicated **18 screen-pixel intersection capture tolerance** for line-like CAD drawing.
- Projected intersections are evaluated after explicit endpoint/vertex/intersection OSNAP + cardinal points, but **before generic boundary/guide/grid snaps**.
- When the pointer is slightly before/after a projected crossing, the committed endpoint is the exact geometric crossing.
- Exact capture is surfaced as `PROJECTED_INTERSECTION_CAPTURE` and renders through the existing green intersection feedback.
- First `Escape` exits PEN, FLEXIBLE_LINE, DRAW_SHAPE/LINE, SPLIT and MIRROR_LINE directly to SELECT.
- Leaving draw mode restores the normal Select pointer/cursor through the existing canvas cursor contract.
- Element-library drawing tools now explicitly accept double-click activation/re-activation. CAD Mirror Line toolbar buttons do the same.

## Priority contract
1. Endpoint / vertex / explicit intersection OSNAP
2. Cardinal snap point
3. Forgiving projected-intersection capture
4. Generic boundary / guide / center / grid snap
5. Direction-only Polar / Ortho / Parallel / Perpendicular tracking

## Regression constraints
- No changes to `faceSplit.ts`, `pointSnapping.ts`, or `trimmerUtils.ts`.
- Existing Cardinal Hover, Polar Tracking, Projection markers and Mirror Line remain intact.

## Verification status
- Source syntax/transpile: pending execution in clean artifact environment.
- Full typecheck/Vitest may remain blocked when project dependencies are not installed.
- Manual UI verification: PENDING.
