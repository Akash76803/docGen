# Phase 9.4 IMG4A — Workflow Integration Start

This batch starts IMG4 on top of IMG3 Fix1 Adaptive Color Fade.

## Implemented in this batch
- Static SHAPE image-fill background removal using the same IMG3 processing pipeline.
- Static PATH image-fill background removal using the same IMG3 processing pipeline.
- Non-destructive derived PNG asset creation for shape/path fills.
- Apply-as-copy updates only the fill asset reference; element geometry, transforms, crop settings, bindings, labels, and packaging metadata are preserved.
- Reset Original restores the original fill asset.
- Shape/PATH fill inspector controls added:
  - Tolerance
  - Edge Softness
  - Feather
  - Fringe Cleanup
  - Preview Fill Removal
  - Apply as Copy
  - Reset Original
- Existing normal IMAGE background removal remains intact.
- Packaging-owned IMAGE artwork preserves `metadata.packagingPanelId` when its derived background-removed asset is applied.
- Transparent derived fill assets continue through the existing fill source resolver used by canvas/export renderers, so static transparent image fills reuse the existing PNG/PDF/JPEG rendering path.

## Added engine APIs
- `applyBackgroundRemovedAssetToImageFill(...)`
- `resetImageFillBackgroundRemoval(...)`

## Verification performed
PASS targeted runtime checks:
- SHAPE fill -> derived asset -> reset original
- PATH fill -> derived asset -> reset original
- packaging ownership metadata preserved
- derived asset metadata retained through JSON-compatible object flow
- CardDesigner TSX transpile syntax
- background-removal browser helper syntax
- design-engine image background removal module syntax
- IMG4 workflow integration test syntax

## Not yet complete in IMG4
The following remain for the next IMG4 integration step:
- true per-record dynamic/Base64 background-removal processing
- batch processing safeguards for dynamic rows
- explicit copy/paste/duplicate regression coverage for derived settings/assets
- full export parity regression suite across PNG/PDF/JPEG/SVG with dynamic processed rows

Dynamic fill processing is deliberately not faked: while a dynamic fill binding is active, static fallback background removal remains disabled until the per-record pipeline is wired correctly.
