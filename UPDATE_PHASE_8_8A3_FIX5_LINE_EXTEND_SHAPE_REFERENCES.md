# Phase 8.8A3 Fix5 — CAD Line Extend-to-Boundary + Shape Reference Parity

## Status
Source implementation complete. Manual UI verification pending.

## Changes
- CAD LINE open endpoints can be double-clicked in Edit Path to extend along the existing segment angle to the nearest forward visible SHAPE/PATH boundary.
- Extension uses exact Paper.js CAD ray intersections through the existing `findCadRayIntersections` engine.
- Endpoint world coordinate is converted back to local geometry and the PATH is normalized so the extended segment is not clipped by stale element bounds.
- Normal DRAW_SHAPE tools now participate in reference snapping/hover feedback without entering the line-only polar/direction pipeline.
- Shape drawing can acquire exact vertex/intersection/center/cardinal/boundary/guide/grid points as applicable.
- Cardinal hover markers are available for all active shape drawing tools.
- Existing LINE/Polyline/XLINE/SPLIT/Mirror CAD behavior remains separate.

## Manual checks
1. Draw a CAD LINE at a non-cardinal angle and stop before a circle/shape boundary.
2. Select the line, enter Edit Path, double-click the outward endpoint.
3. Expected: endpoint extends at exactly the same angle to the nearest forward boundary.
4. Repeat against circle, rectangle and custom closed PATH.
5. Draw Rectangle/Circle/Star while hovering an existing shape.
6. Expected: center/cardinal/intersection/reference markers appear and start/current draw point can snap exactly.
7. Confirm Rectangle/Star still use normal drag-release and Circle still uses center/radius workflow.
