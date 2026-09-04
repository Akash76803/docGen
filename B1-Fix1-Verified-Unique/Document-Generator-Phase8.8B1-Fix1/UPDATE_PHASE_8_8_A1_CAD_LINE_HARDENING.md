# Phase 8.8A1 — CAD LINE Hardening

## Baseline
Phase 8.7 Add-on Fix4 — CAD Exact Intersection + Deep Zoom.

## Implemented
- LINE now follows a strict CAD click-click workflow. Pointer-up never commits geometry.
- First click establishes the exact start point; second click commits the exact snapped endpoint.
- Continuous LINE chaining starts the next segment from the exact previous endpoint.
- Enter finishes the current LINE chain and leaves LINE ready for a new first point.
- Escape continues to exit drawing mode and return to Select.
- Existing OSNAP, exact intersection lock, cardinal points, polar/ortho/parallel/perpendicular tracking and deep zoom remain in the LINE pipeline.
- Added centralized `createCadLineGeometry()` so committed world endpoints are preserved without rounding/reprojection.
- Added `createCadLineMetadata()` with `cadGeometryKind: LINE`, `cadSectionCandidate: true`, start/end target references and CAD intent metadata for future multi-section work.
- Existing automatic face-split behavior for a valid boundary-to-boundary LINE remains preserved.

## Verification
- TypeScript transpile/syntax: PASS for changed source and targeted tests.
- Direct CAD line geometry runtime smoke: PASS.
- Full `npm run typecheck`: ATTEMPTED / BLOCKED by clean-artifact dependency and workspace build-output gaps (zod, xlsx, generated dist declarations, etc.).
- Manual UI verification: PENDING.

## Manual focus
1. LINE: click first point, move, click second point; release alone must not commit.
2. Continue clicking additional points; each new segment must begin exactly at the previous endpoint.
3. Snap to an exact intersection/cardinal point and inspect at 1600–3200% zoom.
4. Press Enter: current chain ends, LINE remains ready for a new first point.
5. Press Escape: drawing cursor exits and Select becomes active.
6. Draw boundary-to-boundary through a closed shape: existing section split behavior must still work.
