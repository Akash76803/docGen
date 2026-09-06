# VECTOR-UX2 Fix8 — Drawing Capture Priority

## Problem
LINE and POLYLINE could still fail to receive clicks even after Pan and Packaging Panels fixes because their pointer handling depended on the artboard bubble-phase `onPointerDown`. Any canvas child/overlay that consumed the event first could prevent CAD drawing from starting or continuing.

## Fix
- Drawing tools are now routed from artboard `onPointerDownCapture` before child overlays can consume the event.
- Capture-priority tools: LINE / all DRAW_SHAPE kinds, POLYLINE, PEN, SPLIT, XLINE, RAY, ANGLE LINE, MIRROR LINE and ARC.
- Real UI controls (`button`, `input`, `select`, `textarea`, contenteditable) are excluded so CAD HUD entry remains usable.
- Existing Fill Bucket and Eraser capture behavior remains intact.
- Bubble-phase `downCanvas` remains as fallback for non-captured interactions.

## Regression intent
- LINE: first click starts, second click commits, chained next point remains available.
- POLYLINE: first click creates path, later clicks append vertices, Enter/double-click finishes.
- Pen/Arc/Circle/Rectangle and CAD sibling tools continue working.
- HUD number inputs remain clickable/typeable.
- Space/middle/touchpad/double-drag pan behavior remains unchanged.
