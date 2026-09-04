# Phase 8.5 Fix4 — Smart Guides & Symmetric Node Editing

Status: SOURCE COMPLETE — MANUAL UI VERIFICATION PENDING
Baseline: Phase 8.5 Fix3 — Shift+Click Add Node

## Implemented
- Selected PATH nodes are larger and red for clear multi-selection visibility.
- PATH Edit toolbar adds Symmetry modes: Off / H / V.
- H mode mirrors node movement across the shape vertical centerline.
- V mode mirrors node movement across the shape horizontal centerline.
- Existing independent node editing remains unchanged when Symmetry = Off.
- Shape horizontal/vertical center guides render in Edit Path mode.
- Opposite selected node pairs show equal-distance-to-center measurement guides.
- Artboard horizontal/vertical center guides added as editor-only Smart Centers.
- Existing global equal-spacing guides remain active.
- Element movement adds artboard-center symmetry snapping: a moved element can snap to the mirrored position of another element across the artboard center.
- Centers can be shown/hidden from the canvas toolbar using the Centers toggle.
- OSNAP remains a separate geometric point-snapping system and was not replaced.

## Intentional behavior
- Symmetry Off: node movement is independent (existing behavior).
- Symmetry H/V only mirrors when a geometrically corresponding opposite node is found within tolerance.
- Smart center/equal-distance guides are editor-only and are not exported.

## Verification
- CardDesigner.tsx transpile: PASS.
- DesignerContextToolbar.tsx transpile: PASS.
- Targeted Vitest contract added; actual Vitest execution depends on installed project dependencies.
- Manual UI verification: PENDING.
