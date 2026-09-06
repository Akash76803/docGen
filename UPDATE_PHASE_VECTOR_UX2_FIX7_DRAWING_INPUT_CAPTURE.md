# VECTOR-UX2 Fix7 — Drawing Input Capture Hardening

## Root cause
A previously enabled Packaging Panels overlay could remain active while a drawing tool was selected. Its full-panel buttons use pointer events and a very high z-index, so clicks/drags were consumed by the panel-selection overlay before the artboard drawing handlers received them. This made Rectangle/Circle/Line/Polyline/Pen/Arc appear completely non-functional even though the drawing state itself was valid.

## Fix
- Any transition away from SELECT automatically disables Packaging Panel selection mode.
- Packaging panel hit targets accept pointer input only while interactionMode is SELECT.
- Drawing modes therefore always receive artboard pointer events.
- Existing panel focus visuals remain editor-only and non-blocking.
- Pan-mode guard from Fix6 remains preserved.

## Manual smoke
1. Enable Packaging Panels.
2. Select Rectangle and drag on a panel: rectangle must draw, panel must not consume the click.
3. Repeat Circle, Line, Polyline, Pen, Arc.
4. Re-enable Panels and verify panel selection still works in SELECT.
5. Repeat after touchpad pan and at 200% zoom.
