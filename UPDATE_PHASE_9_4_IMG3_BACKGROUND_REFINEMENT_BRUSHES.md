# Phase 9.4 IMG3 — Background Refinement, Feathering, Fringe Cleanup, and Manual Brush Editing

## Scope implemented

IMG3 extends the Phase 9.4 IMG1–IMG2 background-removal workflow with a refinement stage and manual preview editing tools.

### Engine / processing additions
- Added `BackgroundRemovalPipelineSettings` to support a richer pipeline over the existing connected-background remover.
- Added refinement controls:
  - `edgeSoftness`
  - `feather`
  - `fringeCleanup`
  - `noiseCleanup`
- Added manual preview brush edit contract:
  - `ERASE`
  - `RESTORE`
  - normalized position + radius + softness
- Added `runImageBackgroundRemovalPipeline(...)` that:
  1. runs the original connected-background removal,
  2. performs cleanup/refinement,
  3. applies manual brush edits,
  4. returns the final processed RGBA result.
- `createBackgroundRemovedAsset(...)` now stores the full pipeline settings metadata for traceability.

### UI / Inspector additions
Image Inspector > Appearance > Background Removal now includes:
- Edge Softness slider
- Feather slider
- Fringe Cleanup slider
- Noise Cleanup slider
- Erase Brush mode
- Restore Brush mode
- Brush Size slider
- Brush Softness slider
- Draw directly on preview image
- Undo Brush
- Clear Brush
- Existing Preview / Before / After / Apply as Copy / Reset Original retained

### Non-destructive behavior
- Original image asset remains preserved.
- Apply still creates a derived transparent PNG asset copy.
- Undo/Redo and save/reload continue to work through normal template history/persistence because the final applied result is stored as a derived asset.

## Files changed
- `packages/design-engine/src/imageBackgroundRemoval.ts`
- `apps/desktop/src/lib/imageBackgroundRemovalBrowser.ts`
- `apps/desktop/src/pages/CardDesigner.tsx`
- `apps/desktop/src/index.css`
- `packages/design-engine/test/phase94-img3-background-refinement.test.ts`

## Verification performed in this environment
Because this container did not provide a fully installed monorepo dependency graph, a custom targeted verification approach was used.

### Custom automated verification: PASS
Executed targeted runtime + syntax checks covering:
- existing connected border-removal preservation behavior
- non-destructive derived-asset apply/reset relationship
- feather + soft-edge refinement behavior
- fringe cleanup color correction behavior
- manual erase brush behavior
- manual restore brush behavior
- noise cleanup behavior
- syntax transpile verification for:
  - `imageBackgroundRemovalBrowser.ts`
  - `CardDesigner.tsx`

Result: **PASS**

## Manual testing checklist
1. Open Card Designer.
2. Add a static PNG/JPG image with a clear outer background.
3. Select the image.
4. Open **Inspector > Appearance > Background Removal**.
5. Click **Preview Removal**.
6. Adjust:
   - Tolerance
   - Edge Softness
   - Feather
   - Fringe Cleanup
   - Noise Cleanup
7. Use **Eyedropper** when auto selection is not enough.
8. Switch to **Erase Brush** and drag over leftover background.
9. Switch to **Restore Brush** and bring back any accidentally removed foreground details.
10. Test **Undo Brush** and **Clear Brush**.
11. Compare **Before** and **After**.
12. Click **Apply as Copy** and verify the original asset remains intact.
13. Test normal template Undo/Redo.
14. Save and reload the template; verify the processed asset still renders.
15. Use **Reset Original** and verify the source image returns.

## Deliberate remaining limits
- Dynamic per-record bound image processing is still IMG4 scope.
- Shape/PATH image-fill background removal integration is still IMG4 scope.
- AI semantic subject segmentation is not part of IMG3.

## Fix1 — Adaptive background-color fade
After manual testing feedback that colored/off-white background edges did not fade naturally, the IMG3 edge model was upgraded:
- Edge Softness now creates a color-distance-based alpha ramp around the connected transparent region instead of only reducing already-hard edges.
- Feather is applied only around the edge neighborhood rather than globally blurring the subject.
- Fringe Cleanup now performs matte decontamination for semi-transparent pixels using the selected/auto-detected background color.
- Internal disconnected light details remain protected because adaptive fading is limited to pixels neighboring the connected removed background.

Targeted gradient/off-white test result: PASS (hard alpha 255 -> refined partial alpha 59 in test fixture).
