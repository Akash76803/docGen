# Phase 6.1.4 — Advanced Styling

## Implemented

- Shared linear-gradient shape fills with angle and editable color stops.
- Normalized opacity for text, shapes, images and SVG, including mixed multi-selection.
- Shared shadows and advanced borders across supported elements.
- Image appearance, style-only clipboard, undoable paste/reset, rendering and persistence propagation.
- Removed the obsolete duplicate Text, Shape and Image property editors after preserving their controls in the advanced collapsible editors.
- Added dedicated `test:card-styling` and `smoke:card-styling` coverage for shared styling behavior.

## Out of scope

Radial gradients, patterns, glow, generic blur, curved/vertical text and 3D effects.

## Starter-template inspection

The Corporate Employee ID Card has nine intentional front elements and eight intentional back elements. No accidental removal was found, so it remains unchanged. The stale element-count regression was replaced with semantic validation of the required editable front/back structure and bindings.
