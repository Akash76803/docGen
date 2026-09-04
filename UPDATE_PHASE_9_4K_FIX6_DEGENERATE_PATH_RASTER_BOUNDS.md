# Phase 9.4K Fix6 — Degenerate PATH Raster Export Bounds

## Problem
Straight carton CREASE paths are valid vector geometry but are stored with a minimum bounding dimension of `0.001 mm` for horizontal/vertical paths. `IsolatedCardExportCanvas` used that stored size as the DOM wrapper size. At 96 CSS px/in this is about `0.0038 px`, so browser/DOM rasterization can drop the painted SVG even though the path itself has a visible stroke.

## Root cause
The inner SVG previously used a minimum `0.1 mm` viewBox dimension, but its outer DOM wrapper still used the element's `0.001 mm` size. CUT contours have substantial width and height so they survived; straight CREASE paths did not.

## Fix
- Added pure `resolvePathRasterBounds()` helper.
- PATH export shells are expanded symmetrically around the stored geometry by at least half the visible stroke width.
- SVG viewBox uses the same expanded physical bounds.
- Stored element position, size and geometry are not mutated.
- Symmetric expansion preserves the original element center, so rotation semantics stay unchanged.
- PATH labels remain positioned against the original stored content bounds rather than the padded raster shell.

## Regression coverage
Added `apps/desktop/test/phase94k-fix6-degenerate-path-raster-bounds.test.ts` covering:
- generated carton vertical CREASE paths;
- generated carton horizontal CREASE paths;
- non-degenerate browser paint boxes;
- center preservation;
- no mutation of persisted PATH geometry.

## Verification performed in this environment
A direct harness loaded the actual generated Phase 9.3 carton dieline from the built design-engine and passed every generated CREASE through the actual Fix6 helper:

- FRONT Start: `0.001 × 110.45 mm` -> `0.251 × 110.70 mm`
- RIGHT Start: `0.001 × 110.45 mm` -> `0.251 × 110.70 mm`
- BACK Start: `0.001 × 110.45 mm` -> `0.251 × 110.70 mm`
- LEFT Start: `0.001 × 110.45 mm` -> `0.251 × 110.70 mm`
- Top Fold: `203.60 × 0.001 mm` -> `203.85 × 0.251 mm`
- Bottom Fold: `203.60 × 0.001 mm` -> `203.85 × 0.251 mm`

Minimum paint-box dimension is about `0.949 CSS px`, compared with about `0.0038 px` before the fix. All centers matched the original geometry.

TypeScript transpile/syntax verification passed for the new helper, `CardExportCanvas.tsx`, and the authored regression test.

Full repository `tsc -b` could not complete because dependency installation timed out and the partial install is missing project type packages (`react`, `node`, `paper`, etc.). This is an environment/dependency failure, not a source diagnostic from Fix6.
