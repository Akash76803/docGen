# Phase 9.0 — Test Stabilization and WAVE Geometry Recovery

Baseline: GitHub `main` commit `d68ebc4` after repository cleanup.

## Scope

- Added the missing editable closed WAVE conversion geometry: six anchors,
  four cubic Bezier segments and two closing side segments.
- Reconciled seven inherited regression files with the current modular
  Split, Fill Bucket, joined-region, Polyline and CAD tracking architecture.
- Preserved valid `prioritySnap.label` intersection feedback and TypeScript's
  inferred string type for caller-provided polyline point identifiers.
- No contract, persistence, export, topology tolerance or schema changes.

## Automated verification

- Targeted affected suite: PASS — 7 files, 19 tests.
- `npm run typecheck`: PASS.
- `npm test -- --run`: PASS — 190 files, 957 tests.
- `npm run build`: PASS — 17 workspaces, desktop Vite bundle 1698 modules.

The Vite large-chunk advisory remains non-blocking. Verification ran in the
delivery environment; repeat the release gate on the supported Node 20 Windows
environment.

## Manual Windows acceptance

1. Insert WAVE, convert it to Freeform/Edit Path and confirm six editable nodes.
2. Resize the WAVE and verify smooth upper/lower curves and closed side edges.
3. Save/reload and export the WAVE to PDF, PNG and JPEG.
4. Split a closed shape boundary-to-boundary and recolor both resulting parts.
5. Use Fill Bucket inside a closed region made from separate LINE/PATH elements.
6. Draw and finish a Polyline; verify Enter finishes and Escape returns Select.
7. Enable Polar tracking, change its angle increment, and verify OSNAP still
   takes priority when an endpoint/intersection is acquired.

Manual Windows UI verification: PENDING.
