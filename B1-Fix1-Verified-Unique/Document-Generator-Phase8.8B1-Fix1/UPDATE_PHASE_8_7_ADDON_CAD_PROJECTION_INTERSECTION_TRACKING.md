# Phase 8.7 Add-on Fix1 — CAD Projection & Intersection Tracking

## Status
Source implementation complete. Manual UI verification pending.

## Baseline
Phase 8.7 Add-on — CAD Drawing Guides & Polar Tracking.

## Changes
- Extended the active CAD polar/perpendicular tracking ray from the selected start point all the way to the artboard boundary.
- Added projected ray/boundary intersection discovery against visible design geometry.
- Supports SHAPE and PATH boundaries, including sampled CUBIC_BEZIER segments, plus rotated element bounds for non-vector elements.
- Displays up to eight nearest projected intersection points as orange crosshair markers.
- Displays distance-from-start labels for the first three intersections.
- When the pointer approaches a projected intersection within the normal screen-based point-snap tolerance, the endpoint snaps exactly to that intersection.
- Existing point OSNAP remains higher priority, preserving vertex/boundary/native intersection behavior.
- Works for LINE, FLEXIBLE_LINE, PEN continuation, SPLIT divider, and CAD Mirror reference-line drawing through the existing common drawingSnap pipeline.

## Expected CAD workflow
1. Start a line at a precise point.
2. Move toward a tracked Polar/Parallel/Perpendicular direction.
3. Full construction ray appears.
4. Intersections of that ray with nearby visible geometry appear as markers.
5. Move near a marker to snap the line endpoint exactly to the projected intersection.

## Safety
- Does not modify Face Split, OSNAP resolver, Trimmer, or Boolean geometry source.
- Projection intersections are editor-only guidance and are not persisted/exported.
- Near-parallel ray/segment pairs are ignored to avoid unstable far-away intersections.
