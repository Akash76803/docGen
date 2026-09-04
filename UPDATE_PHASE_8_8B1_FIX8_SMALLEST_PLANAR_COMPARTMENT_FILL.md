# Phase 8.8B1 Fix8 — Smallest Planar Compartment Fill

## Problem

When LINE/polyline compartments were drawn inside a circle or another closed shape, Fill Bucket applied the color to the complete containing parent. The existing joined-line detector considered only open straight PATH elements and the UI attempted ordinary closed-element filling before region extraction.

## Implementation

- Fill priority is now: existing generated section, smallest planar compartment, ordinary containing shape.
- Region extraction includes ordinary closed SHAPE/PATH boundaries and open LINE/polyline segments.
- Cubic circle/ellipse and other curved boundaries are flattened only for face discovery.
- Segment intersections and near endpoint-to-segment contacts are split in the temporary planar graph.
- Directed half-edge traversal extracts bounded faces and selects the smallest face containing the click.
- Created sections remain independent persistent `AUTO_SECTION` PATH elements.
- Generated sections are excluded from future topology discovery so recoloring does not duplicate them.

## Protected behavior

No changes were made to `faceSplit.ts`, `pointSnapping.ts`, `trimmerUtils.ts`, Boolean algorithms, export logic or persistent intersection materialization. Ordinary whole-shape Fill Bucket behavior remains the fallback when no internal compartment exists.

## Verification

- `npm run typecheck`: PASS — 0 errors.
- Targeted region/UI tests: PASS — 2 files, 7 tests.
- `npm test -- --run`: PASS — 183/183 files, 938/938 tests.
- `npm run build`: PASS — desktop Vite build completed, 1698 modules transformed.
- Manual Windows UI verification: PENDING.
