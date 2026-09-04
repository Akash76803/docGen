# Phase 9.4 UX1 — Professional Canvas Workspace

## Purpose
Increase the usable design surface for large packaging dielines and make the Card Designer behave more like a professional desktop graphics workspace without removing existing tools.

## Implemented
- Left asset/element panel starts collapsed; its tool rail remains available and reopens the requested panel.
- Right inspector starts collapsed; its inspector rail remains available and reopens the selected section.
- `Canvas` toolbar action toggles both side panels.
- `Tab` toggles both side panels when focus is not inside a form control.
- Canvas-local toolbar is a compact one-row horizontal command strip instead of wrapping into multiple rows.
- Canvas stage outer padding reduced from 80 px to 48 px.
- Record navigator and canvas status bars are more compact.
- Existing middle-mouse, Space+drag, and explicit Pan tool behavior is preserved.
- In any active tool/mode, double-click-and-hold on an empty canvas surface then drag starts temporary pan automatically. Releasing restores the same tool/mode.
- Automatic double-click pan is excluded when the pointer is over a design element, packaging-panel button, or form/control, preserving element/path and packaging double-click behavior. A normal single-click drag is never converted to pan, so drawing and transforms remain intact.

## Manual acceptance
1. Open Card Designer: side content panels should be collapsed, leaving their narrow rails visible.
2. Click Assets/Elements/Layers rail icon: requested left panel opens.
3. Click a right inspector icon: inspector opens.
4. Click `Canvas` or press `Tab`: both content panels collapse; repeat to restore them.
5. Verify the local canvas toolbar stays one row and horizontally scrolls if all commands do not fit.
6. Activate Select, Shape, Pen, Line, Arc, or another tool; double-click and keep the second click held on an empty canvas/workspace area, then drag: viewport pans and cursor becomes grabbing.
7. Release pointer: temporary pan ends and the previously active tool remains active.
8. Double-click an existing PATH: Edit Path behavior must remain unchanged.
9. Enable Packaging Panels and double-click a panel: panel focus behavior must remain unchanged.
10. Verify Pan tool, middle mouse, Space+drag, zoom wheel, drawing, snapping, and selection still work.
