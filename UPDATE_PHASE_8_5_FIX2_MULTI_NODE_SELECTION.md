# Phase 8.5 Fix2 — Multi-Node Selection

## Reported defect
In Edit Path mode, Shift+Click on a second node left only one node visibly selected, so multi-node drag could not be used reliably.

## Root cause
The node pointer handler computed selection from the render-time array and then replaced selection directly. This made modifier selection fragile across pointer-driven rerenders. Dragging also depended on that same mutable selection value.

## Fix
- `setPathSelectedNodeIds` now accepts React functional state updates through the canvas/editor boundary.
- Normal click keeps a single node selected.
- Shift+Click toggles a node in/out while preserving the previous selection.
- A stable `dragIds` snapshot is captured at pointer-down so dragging a newly Shift-selected node moves the complete intended selection.
- Existing handle dragging, segment editing, OSNAP, Split, Trimmer and Face Split code paths were not changed.

## Manual acceptance
1. Enter Edit Path on a PATH with 4+ nodes.
2. Click node A: exactly A selected.
3. Hold Shift and click node B: A and B both selected.
4. Hold Shift and click node C: A, B and C selected.
5. Shift+Click B again: B deselects; A and C remain selected.
6. Drag A or C: all currently selected nodes move by the same delta, including their handles.
