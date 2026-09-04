# Phase 6.0.4 — Core Elements: Text, Shapes & Images

## Scope
Adds real visual elements on top of the frozen Phase 6.0.3 Selection & Transform Engine. No duplicate move/resize/rotate implementation was introduced.

### Text
- Insert text at artboard center
- Direct content editing in Properties and double-click quick edit
- Font family, size, weight, bold, italic, underline
- Left/center/right alignment
- Line height, letter spacing, color, opacity
- Existing position/size/rotation controls

### Shapes
- Rectangle, rounded rectangle, circle, ellipse, line, triangle, arrow, star, polygon, ribbon, badge
- Solid fill
- Stroke color, width, solid/dashed/dotted/none
- Rounded rectangle radius
- SVG-backed canvas visual so shape geometry stays clean while editing

### Images / Logos
- PNG/JPEG/WebP/GIF upload
- Stored as shared `AssetReference` and referenced by `ImageDesignElement`
- Natural pixel dimensions captured when available
- Fit / Fill / Stretch
- Flip X / Flip Y
- Aspect-ratio lock
- Corner radius and common opacity/transform controls

## Shared Design Engine additions
- `createTextElement`
- `createShapeElement`
- `createImageElement`
- `addDesignElement`
- `updateDesignElement`
- `deleteDesignElements`
- `addAssetReference`
- `nextElementZIndex`

## Boundary
Bindings, calculations, Data Views and formulas remain upstream. This phase only creates and edits design elements. Renderer business-logic boundary remains unchanged.

## Verification commands
```powershell
npm run typecheck
npm run build
npm run test:card-elements
npm run test:card-transform
npm run test:card-canvas
npm test
npm run smoke:card-elements
```

## Manual UI smoke
1. Open Card Designer.
2. Add Text; edit content and typography; move/resize/rotate.
3. Add at least 5 shape types; change fill/stroke; move/resize/rotate.
4. Upload a PNG/JPEG logo; test Fit/Fill/Stretch, flips, aspect lock, corner radius.
5. Multi-select mixed Text + Shape + Image and move them together.
6. Delete an element using Delete and Properties action.
7. Save, leave Card Designer, reopen and verify element content/styles/assets/positions persist.
8. Add Front + Back artboards and verify elements remain scoped to their own artboard.
9. Quick-smoke existing Document Designer and Generate screens.

## Explicitly not part of 6.0.4
- Layers panel / arrange / grouping (6.0.5)
- Undo/redo/clipboard command history (6.0.6)
- SVG asset import / Asset Library (6.2)
- Print bleed/DPI/crop marks (6.3)
- Dynamic bindings (6.6)
- Final Card PDF/PNG/JPEG renderer/export integration (6.5)
