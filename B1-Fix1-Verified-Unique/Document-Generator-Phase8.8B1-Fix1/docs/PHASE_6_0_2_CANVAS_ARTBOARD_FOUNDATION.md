# Phase 6.0.2 — Canvas & Artboard Foundation

## Scope
Introduces the first Card / Visual Design Studio editor surface without adding design elements. The phase intentionally stops at artboard geometry/navigation/persistence so Phase 6.0.3 can add selection/transform behavior on a stable canvas.

## Implemented
- Separate Card Designer entry in the shared desktop shell and dashboard.
- First-class 1..N artboard editor using the Phase 6.0.1 DesignTemplate contract.
- Add, duplicate, rename, delete and reorder artboards.
- Standard presets plus custom physical sizes.
- Canonical geometry remains millimetres; UI may display mm or inches.
- Landscape/portrait switching and solid artboard background.
- Zoom 25–200%, Actual Size, Fit, and Space/middle-button pan.
- Zoom/pan are editor-view state only and do not mutate physical/export dimensions.
- Card template persistence uses the existing VersionedWorkspaceStore rather than a parallel storage mechanism.
- Active draft is restored on Card Designer reopen.

## Boundary
No text, shapes, images, selection handles, grouping, binding or export logic is introduced here.

## Verification
Run:

```powershell
npm run typecheck
npm run build
npm run test:card-canvas
npm test
```

Manual smoke:
1. Open Card Designer.
2. Add Back and a third artboard.
3. Rename, duplicate and reorder.
4. Switch one artboard to inches and custom dimensions.
5. Test Landscape/Portrait, background, zoom, Fit and Space+drag pan.
6. Save, leave Card Designer, reopen and confirm all artboards/order/settings return.
7. Confirm Document Templates and Generate remain unchanged.
