# Phase 7.9 Fix3 — Shape Image Fill Dynamic Binding

## Scope
Adds imported-field binding to `Fill = Image` for SHAPE and PATH elements while preserving the existing manual asset/upload workflow.

## Architecture
- Reuses `DesignElement.bindings`.
- New target property: `fillImageSource`.
- Binding stores only the field path; imported Base64 is resolved only on runtime clones.
- Shared `normalizeDynamicImageSource` handles Data URLs/raw Base64 and existing payload safeguards.
- Shared `resolveRasterImageFillSource` is used by both Card Designer and isolated export canvas.

## Fallback
1. Valid runtime image from the active record.
2. Existing `fill.assetId` selected/uploaded image.
3. Existing empty/placeholder behavior.

## Runtime behavior
Record navigation and bulk generation resolve each artboard independently via the existing `resolveArtboardBindings` pipeline. Authored templates and imported rows remain unchanged.

## Compatibility
Existing SHAPE/PATH image fills without bindings are unchanged. QR/barcode and normal Image element behavior are untouched.
