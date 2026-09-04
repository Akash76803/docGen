# Phase 8.2 — Styling Contract & Rendering Parity

## Baseline
Built directly on `Document-Generator-Phase8.1-Fix1-Multi-Selection-Resize-Modifiers.zip`.

## Goal
Reconcile styling contracts, editor rendering and export rendering before later multi-selection/geometry/Boolean work. Phase 8.2 extends only the core vector styling model; advanced 3D/reflection/blend effects and inside/outside stroke alignment remain deferred.

## Implemented

### Radial Gradient
- Added `RADIAL_GRADIENT` to `DesignFill`.
- Persistent center X/Y, radius, optional focal point and multi-stop gradient contract.
- Inspector controls for center/radius and shared gradient-stop editor.
- Canvas SVG and export SVG use the same radial data.

### Pattern Fill
- Added `PATTERN` with Hatch, Dot and Checker kinds.
- Persistent foreground/background, scale, rotation and opacity.
- Canvas SVG and export SVG use matching pattern definitions.

### Image Fill Crop Transform
- Extended shape/PATH image fill with optional persistent `transform`:
  - scale/zoom
  - offset X/Y
  - rotation
- Inspector exposes Zoom, Offset X/Y, Rotation and Reset Crop.
- Existing FIT/FILL/STRETCH and dynamic/Base64 image-fill source binding remain intact.
- Canvas and export apply the same transform around the mask center.

### Advanced Vector Stroke
- Extended `DesignStroke` with:
  - CUSTOM dash style
  - lineCap: BUTT / ROUND / SQUARE
  - lineJoin: MITER / ROUND / BEVEL
  - miterLimit
  - dashArray
  - dashOffset
- Existing SOLID/DASHED/DOTTED/NONE remain backward compatible.
- Stroke alignment is explicitly CENTER only in this phase.
- Shape/PATH SVG editor and export renderer use matching dash/cap/join/miter data.
- Raster/SVG CSS borders keep safe CSS fallbacks; cap/join semantics apply to vector SHAPE/PATH geometry.

### Normalization / Compatibility
- Added radial, pattern, image-transform and advanced-stroke normalization.
- Existing schema version remains `1`; no destructive schema bump was introduced.
- Legacy fills/strokes without new optional properties continue receiving safe runtime defaults.
- Mixed-value semantic equality now understands radial/pattern/image crop and advanced strokes.

## Explicitly deferred
- Inside/outside stroke alignment
- Glow / soft-edge / reflection / blend modes / 3D effects
- On-canvas interactive crop handles (Phase 8.2 provides persistent inspector crop controls)
- Pattern asset library / arbitrary user pattern tiles
- Full mixed multi-selection styling inspector (Phase 8.3)

## Tests added
- `packages/design-engine/test/phase82-styling-parity.test.ts`
- `apps/desktop/test/phase82-styling-ui-wiring.test.ts`
- `npm run test:shape-styling`
- Phase 8.2 tests added to the permanent `test:shape-ops-regression` gate.

## Verification
- TypeScript syntax/transpile check of all changed TS/TSX and Phase 8.2 tests: **PASS**.
- `packages/contracts` TypeScript project compilation: **PASS**.
- Lightweight runtime smoke of actual transpiled Phase 8.2 styling/normalization/mixed-value code: **PASS** (`PHASE82_STYLE_RUNTIME_SMOKE=PASS`).
- Full Vitest: **BLOCKED** because the clean source archive has no local `vitest` binary / `node_modules`.
- Full monorepo build: **BLOCKED BY MISSING DEPENDENCIES** (`paper`, `xlsx`, `papaparse`, `html2canvas`, `zod`, React/Tauri dependencies, etc.). The failure is dependency-resolution, not a demonstrated Phase 8.2 source failure.

## Protected functionality
The following regression-sensitive geometry/transform engines are byte-for-byte unchanged from the Phase 8.1 Fix1 input baseline:
- `packages/design-engine/src/faceSplit.ts`
- `packages/design-engine/src/pointSnapping.ts`
- `packages/design-engine/src/trimmerUtils.ts`
- `packages/design-engine/src/booleanUtils.ts`
- `packages/design-engine/src/transform.ts`
- `packages/design-engine/src/mirror.ts`

## Manual acceptance
1. Rectangle → Fill → Radial Gradient. Change center/radius/stops; canvas must update live.
2. Export PDF/PNG/JPEG and compare radial appearance with canvas.
3. Rectangle/PATH → Fill → Pattern. Test Hatch, Dots, Checker; change colors, scale and rotation.
4. Shape image fill → choose image → Fill/Crop → Zoom 150%, Offset X/Y, Rotation; verify image stays clipped to shape.
5. Save template, reload and confirm image crop values remain.
6. Bind image fill to Excel/Base64 source and verify the same crop transform applies to the resolved image.
7. PATH/Shape → Border → Custom Dash. Enter `2, 1, .5, 1`, change dash offset, Round cap and Bevel/Round join.
8. Export and compare vector stroke appearance with canvas.
9. Load an older template created before Phase 8.2 and verify its Solid/Linear/Image fills and old strokes render unchanged.
10. Re-run LINE, FLEXIBLE_LINE, SPLIT, OSNAP, Face Split, Fill Bucket, Scissors, Erase Segment, resize modifiers, Flip/Mirror and Undo/Redo smoke checks.

## Files changed
- `packages/contracts/src/design.ts`
- `packages/design-engine/src/styling.ts`
- `packages/design-engine/src/normalization.ts`
- `packages/design-engine/src/mixedValues.ts`
- `apps/desktop/src/pages/CardDesigner.tsx`
- `apps/desktop/src/pages/CardExportCanvas.tsx`
- `packages/design-engine/test/phase82-styling-parity.test.ts`
- `apps/desktop/test/phase82-styling-ui-wiring.test.ts`
- `package.json`
- phase/baseline documentation files
