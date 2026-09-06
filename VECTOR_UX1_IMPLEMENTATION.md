# VECTOR-UX1 — Professional Path Selection & Editing UX

## Purpose
Make PATH editing predictable for thin curves, closed paths, individual segments, nodes and straight-path intersections.

## Implemented
- 14 CSS-pixel-equivalent zoom-aware segment hit corridor in Edit Path.
- Orange preselection hover for a segment before click.
- Strong blue selected-segment highlight.
- Plain click selects one segment.
- Ctrl/Cmd+click toggles multiple segments.
- Shift+click keeps the existing precise add-node workflow.
- Selected PATH exposes an `Edit Path · E` affordance.
- Double-clicking a PATH enters Edit Path and refreshes straight-path intersection topology.
- Persistent intersection nodes are larger, green, titled `Intersection node`, and have a larger click target.
- Existing node snap, trim, scissors, symmetry and topology behavior is preserved.

## Deliberate boundary
This phase improves selection/editing on existing PATH topology. It does not introduce a brand-new face-selection mode or arbitrary curved-curve intersection materialization. Straight PATH intersection nodes use the existing persistent topology engine; curve intersections continue to rely on existing snapping/trim systems until a later topology extension.
