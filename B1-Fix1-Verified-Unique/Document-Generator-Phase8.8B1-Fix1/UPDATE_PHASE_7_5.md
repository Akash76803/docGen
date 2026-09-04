# Phase 7.5 — Automatic Multi-Section Component Face Generation

Implemented on top of the Phase 7.4.1 Fix1 strict two-click baseline.

## What changed
- Added `splitComponentFaceByDivider()` to the existing design-engine FaceSplit module.
- Subsequent dividers now search the current generated closed faces instead of requiring start/end OSNAP to report the same element id.
- This enables incremental Boundary→Boundary, Boundary→existing-divider, existing-divider→Boundary, and divider→divider section creation when both endpoints bound one current face.
- Existing unaffected faces are preserved; only the affected face and temporary divider are replaced.
- Generated faces remain canonical closed `PathDesignElement`s inside the same `DesignGroup` component.
- Added topology lineage metadata (`faceGeneration`, `faceTopologyVersion`, `faceDividerIds`) for future merge/delete-divider work.
- Auto-generated faces can now be selected individually on canvas and from Layers, so each section can receive an independent fill/style while retaining logical component membership.
- Strict CAD two-click line behavior, minimal OSNAP, connection feedback, Trimmer, and current z-order replacement behavior are preserved.

## Known limits
- The implementation remains incremental/current-face based rather than a full arbitrary multi-face planar-graph rebuild.
- A single divider that crosses several existing faces in one stroke is not atomically partitioned across all of them; draw the divider per target face/section.
- Existing FaceSplit curve routing still samples curved boundary routes at the current design-engine tolerance, so this phase does not introduce a new curve-preserving topology representation.
- Divider deletion/automatic adjacent-face merge is prepared via metadata but not implemented in this phase.

## Verification
Per request, npm tests/build/typecheck/dev commands were not run in this environment. Focused Phase 7.5 tests were added for re-verification by the user.
