# Phase 9.4 IMG4 + IMG5 — Image Background Removal Workflow Completion

This batch completes the current non-AI image-background-removal workflow on top of IMG3 Fix1 and IMG4A.

## IMG4 — Workflow integration completed

### Normal IMAGE elements
- Static image background removal remains non-destructive.
- Full IMG3 refinement controls remain available.
- Dynamic field/Base64/data-URL images can now opt into **Per-Record Removal**.
- Current settings are persisted on element metadata and used after normal binding resolution.
- Dynamic processed source is used for live record preview.

### SHAPE / PATH image fills
- Static image-fill background removal from IMG4A retained.
- Dynamic fill binding can now opt into **Per-Record Removal**.
- Current tolerance / edge softness / feather / fringe cleanup settings are persisted on element metadata.
- Each resolved runtime image fill is processed without mutating the template or crop/transform configuration.

### Export / bulk integration
- Single export now resolves bindings, processes dynamic background removal, then runs normal packaging/export preparation.
- Bulk generation now resolves each record, processes dynamic background removal per record, then exports the processed artboard.
- The same processed runtime artboard is therefore passed into the existing supported PDF / PNG / JPEG render paths.
- JPEG continues to use the existing opaque/matte compositing behavior; PNG/PDF can preserve transparent raster pixels according to the existing renderer behavior.

### Packaging ownership
- Background-removal processing changes runtime raster source only and does not alter packaging panel metadata, geometry, fit/crop, rotation, group assignment, or element ids.

### Copy / paste / duplicate / persistence
- Dynamic background-removal settings live under normal element `metadata`, which is already copied/persisted by the design model.
- Added regression test coverage for clipboard paste and duplicate metadata preservation.
- Static derived-asset original/derived relationship continues to be persisted in shared asset metadata.

## IMG5 — Performance / reliability hardening

- Added bounded in-memory result cache (24 processed variants) keyed by source + settings.
- Repeated records/assets with identical source/settings reuse cached transparent output.
- Added processing cancellation via `AbortSignal` for live preview transitions.
- Added cooperative event-loop yield before CPU-heavy processing so the UI can update/cancel between decode and processing.
- Added safe 32,000,000-pixel processing limit with a clear error instead of uncontrolled memory use.
- Dynamic artboard processing is immutable: source template/artboard is not mutated.
- Per-record processing is opt-in, avoiding unexpected batch cost.

## Deliberate product boundary

- AI semantic subject segmentation is not part of the current local background-removal phase.
- The app currently exposes PDF / PNG / JPEG card exports; there is no standalone SVG export option in Card Designer, so no SVG export mode is claimed here.
- The current performance implementation uses cache + cancellation + cooperative yielding rather than maintaining a duplicate background-removal algorithm inside a Web Worker. This avoids renderer/algorithm divergence while keeping the workflow bounded and cancellable.

## Verification performed in this environment

### PASS — targeted runtime checks
- dynamic IMAGE runtime source -> processed transparent source
- dynamic SHAPE/PATH image-fill runtime source -> processed transparent source
- source artboard remains immutable
- result cache prevents repeat pixel-processing work
- AbortSignal cancellation
- IMG1 connected-background behavior
- internal foreground preservation
- IMG3 refined edge behavior

### PASS — wiring / syntax checks
- `CardDesigner.tsx` transpile syntax
- browser background-removal helper transpile syntax
- design-engine background-removal module transpile syntax
- new IMG4/IMG5 test files transpile syntax
- live preview dynamic processing wiring present
- normal export dynamic processing wiring present
- bulk export dynamic processing wiring present
- per-record controls present for IMAGE and SHAPE/PATH fills

### Full monorepo status
A full dependency-backed `npm run typecheck`, complete Vitest suite, build, and visual PDF/PNG/JPEG comparison were not claimed in this container because the extracted dependency installation is incomplete. Run the commands below on the normal Node 20 development machine.

```bash
npm install
npm run typecheck
npx vitest run packages/design-engine/test/phase94-img1-background-removal.test.ts packages/design-engine/test/phase94-img3-background-refinement.test.ts packages/design-engine/test/phase94-img4-workflow-integration.test.ts packages/design-engine/test/phase94-img4-copy-paste-derived-metadata.test.ts apps/desktop/test/phase94-img4-img5-dynamic-background-removal-wiring.test.ts
npm test -- --run
npm run build
```

## Manual acceptance — final image phase

1. Static IMAGE: remove white/off-white background, refine edges, erase/restore, Apply as Copy.
2. Undo/Redo, save/reopen, Reset Original.
3. SHAPE image fill: preview/apply/reset; verify crop/zoom/offset/rotation unchanged.
4. PATH image fill: preview/apply/reset; verify path geometry unchanged.
5. Packaging panel: process image or fill; verify panel ownership/focus/fit remains unchanged.
6. Dynamic IMAGE: bind a Base64/data-URL field, enable **Per-Record Removal**, navigate records, verify each record is processed.
7. Dynamic SHAPE/PATH fill: bind image field, enable **Per-Record Removal**, navigate records.
8. Bulk generate at least 3 records and verify each image uses its own processed source.
9. Export PNG with transparency and compare to canvas.
10. Export PDF and compare raster transparency/composition to canvas.
11. Export JPEG and verify expected matte/composited result rather than alpha.
12. Duplicate and copy/paste a configured dynamic image; verify per-record setting remains enabled.
13. Use a very large image over 32M pixels and verify a safe size-limit message instead of a freeze/crash.
