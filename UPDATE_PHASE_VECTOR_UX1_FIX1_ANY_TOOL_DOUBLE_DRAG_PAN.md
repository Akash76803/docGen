# VECTOR-UX1 Fix1 — Any-tool Double-Click + Drag Temporary Pan

## Purpose
Allow canvas panning without switching away from the current design/CAD tool.

## Implemented behavior
- Left-button double-click + hold + drag can start temporary pan from any canvas target, including over design elements and paths.
- HTML controls are excluded.
- A 4 px drag threshold distinguishes pan from a normal double-click.
- If the user double-clicks without dragging, a synthetic double-click is forwarded to the original target so existing PATH/text double-click edit behavior remains available.
- The active tool is preserved before, during and after temporary pan.
- Existing Space+drag, middle-button pan and explicit Pan tool are preserved.
- Status/footer copy updated to document the gesture.

## Verification
- `CardDesigner.tsx` targeted TypeScript transpile: PASS.
- Manual smoke plan covers Select/Pen/Line/Arc/Shape/Edit Path/Trimmer/Scissors, over-element starts, normal double-click editing, 200%+ zoom, and legacy pan modes.

## Deliverable
`Document-Generator-Phase-VECTOR-UX1-Fix1-Any-Tool-Double-Drag-Pan.zip`
