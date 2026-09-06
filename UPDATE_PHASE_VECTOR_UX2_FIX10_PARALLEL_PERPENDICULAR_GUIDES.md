# VECTOR-UX2 Fix10 — Parallel / Perpendicular Reference Guides

## Goal
Add explicit CAD reference-line workflows for drawing exact parallel and perpendicular lines from existing straight LINE/POLYLINE/shape segments, while preserving the existing automatic Par/Perp inference tracking.

## Implemented
- New **Parallel Line** tool in Elements > Utility and canvas toolbar.
- New **Perpendicular Line** tool in Elements > Utility and canvas toolbar.
- Hover nearest eligible straight segment to preselect the reference.
- Click reference to lock its exact segment angle.
- Orange reference highlight remains visible after lock.
- Blue infinite construction guide shows the exact target direction.
- Parallel guide shows live offset from the locked reference.
- Perpendicular guide shows a 90° marker.
- Pick start point, then endpoint; endpoint is constrained to exact reference angle or reference + 90°.
- PATH/Polyline handling is segment-specific: only the hovered straight segment becomes the reference.
- Existing OSNAP/intersection snapping remains active when start/end points are committed.
- Length/Angle CAD HUD remains available; relation tools keep their locked angle authoritative.
- Tool stays active after a committed relation line so multiple related lines can be drawn from one locked reference.
- Escape returns to Select and clears the relation reference.
- Existing automatic Par/Perp tracking for normal LINE/POLYLINE remains available through the Par/Perp toolbar toggle.

## Notes
Curved-path tangent/normal references are intentionally not part of Fix10; this phase targets straight vector segments only.
