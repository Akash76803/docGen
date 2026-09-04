# Phase 9.4 IMG1–IMG2 — Image Background Removal Foundation + UI Preview

## Scope implemented

### IMG1 — processing foundation
- Pure RGBA border-connected background-removal engine.
- Auto dominant-border color detection.
- Selected-color removal mode.
- Configurable 0–100 tolerance.
- Matching pixels are removed only when connected to an outer image edge, preserving disconnected internal light/white details.
- Existing transparent pixels are preserved.
- AUTO safety guard prevents nearly-uniform/no-background images from being almost completely erased.
- Non-destructive derived PNG asset contract preserves the original asset.
- Apply/reset helpers preserve derived/original relationships through normal template JSON persistence and Undo/Redo history.

### IMG2 — Inspector + live preview
Image Inspector > Appearance now contains **Background Removal**:
- Auto Background / Selected Color mode.
- Tolerance slider.
- Eyedropper sampling from the source image.
- Checkerboard transparency preview.
- Before / After comparison.
- Preview Removal with live refresh after settings change.
- Apply as Copy.
- Reset Original.
- Processing/status feedback.

## Deliberate scope limits
- Dynamic bound images are not processed per record yet; background removal is disabled while a dynamic source binding is active. This is IMG4 scope.
- Shape/PATH image-fill integration is IMG4 scope.
- Edge feathering, fringe cleanup, manual erase/restore brushes are IMG3 scope.
- AI subject segmentation is later scope.

## Verification performed in this environment
PASS:
- compiled `imageBackgroundRemoval` module executed directly in Node.
- white border removal.
- disconnected internal white foreground preservation.
- off-white background removal.
- selected-color connected background removal.
- existing transparency validity.
- nearly-uniform AUTO safety guard.
- derived asset creation without mutating original.
- JSON save/reload relationship persistence.
- reset to original asset.
- `CardDesigner.tsx` TypeScript/JSX transpile syntax check.
- browser helper TypeScript transpile syntax check.

Full monorepo install/typecheck/test/build was not claimed because this extracted source has no complete dependency installation and the container is Node 22 while the project targets Node 20.

## Manual acceptance
1. Add a JPG/PNG product or flower image with a white/off-white outer background.
2. Select image > Inspector > Appearance > Background Removal.
3. Click Preview Removal.
4. Verify checkerboard appears around the subject and internal white details remain.
5. Move Tolerance and verify preview refreshes.
6. Test Selected Color + Eyedropper.
7. Compare Before / After.
8. Apply as Copy; verify canvas uses the transparent derived image.
9. Undo/Redo.
10. Save, reopen, and verify transparency remains.
11. Reset Original and verify original asset returns.
