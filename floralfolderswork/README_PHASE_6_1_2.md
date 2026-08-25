# Phase 6.1.2 — Smart Snapping

Implemented on the Phase 6.1.1 alignment/distribution baseline.

Highlights:
- artboard edge/center snapping
- other-element edge/center snapping
- custom-guide snapping
- optional 5 mm grid snapping
- move and resize snapping
- temporary smart-guide indicators
- 1.5 mm default tolerance
- Alt-drag temporary bypass
- group/multi-selection safe because selection IDs are expanded before snapping
- existing Undo/Redo transaction model preserved

Run on Windows:

```powershell
npm run typecheck
npm run build
npm run test:card-snapping
npm run test:card-alignment
npm run test:card-productivity
npm run test:card-layers
npm run test:card-elements
npm run test:card-transform
npm run test:card-canvas
npm test
npm run smoke:card-snapping
```
