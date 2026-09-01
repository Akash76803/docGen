# Phase 8.7 Add-on — CAD Drawing Guides & Polar Tracking

## Baseline
Phase 8.7 Add-on — CAD Reference-Line Mirror.

## Implemented
- Live drawing HUD for line-like CAD workflows: angle in degrees + length in mm.
- Editor-only dashed tracking ray from the current segment start to the tracked cursor point.
- Polar tracking with configurable 1–90 degree increment; default 15 degrees.
- Ortho mode that strictly constrains line-like drawing to horizontal/vertical directions.
- Parallel/perpendicular tracking against existing element rotations and PATH segment directions.
- Tracking is integrated before point OSNAP resolution so exact vertex/boundary/intersection/guide/grid snaps remain authoritative.
- Applies to LINE, FLEXIBLE_LINE, PEN continuation, SPLIT divider and CAD Mirror reference-line picking.
- F8 toggles Ortho. F10 toggles Polar.
- Existing OSNAP, Smart Guides, Split, Face Split, Trimmer and mirror engines are not replaced.

## Manual Verification Status
PENDING user verification.

## Expected UX
When specifying the second/current point, the cursor HUD displays e.g. `45.0° · 32.50 mm`. Near tracked angles the preview snaps to the tracked ray. Ortho forces 0/90 degrees. Parallel/Perpendicular can reference rotated objects and PATH segments.
