# Phase 8.8A3 Fix4 — Dynamic Input Interaction + Circle Radius + Projected Perpendicular Intersection

## Baseline
Phase 8.8A3 Fix3 — Build + Shape Draw Recovery.

## Changes
- LINE dynamic Length/Angle panel is anchored beside the committed first point instead of following the cursor.
- Dynamic-input panel consumes pointer down/move/up/click events so editing a numeric field cannot move or commit the drawing beneath it.
- CIRCLE is now a center-first CAD workflow: first click chooses center, cursor previews radius, second click commits, or exact radius may be typed and committed with Enter.
- Added projected orthogonal/virtual-intersection snapping from existing PATH vertices and closed-shape cardinal/center references.
- When the cursor approaches the common X/Y projection, the endpoint locks to the exact common coordinate, renders a green intersection marker, and shows green horizontal/vertical construction guides.
- Existing exact OSNAP/intersection/cardinal priority remains ahead of generic boundary/grid snapping.

## Manual status
PENDING user verification.
