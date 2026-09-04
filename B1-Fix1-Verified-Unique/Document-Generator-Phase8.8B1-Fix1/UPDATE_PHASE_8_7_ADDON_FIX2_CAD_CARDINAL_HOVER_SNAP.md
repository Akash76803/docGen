# Phase 8.7 Add-on Fix2 — CAD Cardinal Hover Snap Points

## Goal
Provide CAD-style connection references while drawing. When the pointer hovers a closed vector, expose the exact global 0°, 90°, 180° and 270° boundary intersections and allow the drawing endpoint to lock to those points.

## Implemented
- Draw-mode-only cardinal marker state.
- Supports closed SHAPE and PATH elements.
- Uses sampled real vector boundary geometry, including Bezier PATH/shape curves.
- Cardinal convention:
  - 0° = right
  - 90° = top
  - 180° = left
  - 270° = bottom
- Hover detection works from vector interior or near its boundary.
- Exact cardinal snap added to drawing pipeline.
- Existing Endpoint > Vertex > Intersection point-snap remains ahead of cardinal snap.
- Generic boundary/guide/center/grid snaps remain after cardinal snap.
- Active cardinal lock renders green; available points are neutral.
- Applies to LINE, FLEXIBLE_LINE, PEN, SPLIT and CAD Mirror Line.

## Verification
- CardDesigner.tsx TypeScript transpile: PASS.
- Targeted phase87-cad-cardinal-hover-snap.test.ts transpile: PASS.
- Full Vitest execution: BLOCKED because node_modules/vitest is not present in the clean source artifact.
- Manual UI verification: PENDING.
