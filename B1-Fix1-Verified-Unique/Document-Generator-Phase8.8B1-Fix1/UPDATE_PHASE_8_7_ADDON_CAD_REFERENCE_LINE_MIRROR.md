# Phase 8.7 Add-on — CAD Reference-Line Mirror

## Baseline
Built on **Phase 8.7 Fix1 — Boolean Styling & Opacity Parity**.

## Status
- Source implementation: COMPLETE
- Source transpile checks: PASS
- Direct reflection-math smoke: PASS
- Full `npm run typecheck`: BLOCKED by missing clean-artifact dependencies (`zod`, `xlsx`, `papaparse`, `paper`, React, etc.)
- Manual UI verification: PENDING

## Implemented
- New CAD-style arbitrary-axis mirror tool.
- `Line Copy`: preserves originals and creates mirrored copies.
- `Line Move`: mirrors selected elements in place while preserving element IDs.
- Two-click reference-axis workflow: first point -> live dashed axis preview -> second point -> commit.
- Reference points reuse the existing point-snap resolver (vertices, boundaries, intersections, guides, object/page centers, grid according to active snap settings).
- Any reference-line angle is supported, including horizontal, vertical and diagonal/arbitrary angles.
- SHAPE / IMAGE / SVG visuals reverse handedness correctly.
- PATH nodes and Bezier handles mirror with the geometry.
- Group Copy clones group IDs/membership; Move preserves current group membership.
- TEXT / QR / BARCODE remain readable/scannable, matching existing page-mirror semantics.
- Escape cancels the active reference-line tool without geometry mutation.
- Degenerate/zero-length axes are rejected.

## Protected behavior
Existing Flip H/V, Page Mirror H/V, Boolean, Split, Face Split, OSNAP and Trimmer remain separate features.
