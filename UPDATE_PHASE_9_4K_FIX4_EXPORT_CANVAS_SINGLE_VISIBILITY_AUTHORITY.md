# Phase 9.4K Fix4 — Export Canvas Single Visibility Authority

## Root cause
`prepareArtboardForCardExport()` already resolves export-mode visibility and returns a prepared artboard. CUT/CREASE elements can be intentionally cloned with `visible: true` for Dieline Proof. The isolated raster canvas then applied `e.visible` again, reintroducing editor visibility semantics at the rendering boundary.

## Permanent fix
`IsolatedCardExportCanvas` no longer makes an editor-level `visible` decision. It renders the elements supplied by the prepared export artboard and retains only runtime/CAD-only guards:

- `runtimeHidden`
- `metadata.cadExport === false`
- `metadata.cadConstruction === true`

Export visibility has one authority: `prepareArtboardForCardExport()`.

## Verified production call paths
Both normal export and bulk export prepare the artboard before assigning `exportRasterTargets`, which are the artboards consumed by `IsolatedCardExportCanvas`.

## Expected Dieline Proof
- Artwork: included when source artwork is visible
- CUT: included and visible regardless of editor technical-layer visibility
- CREASE: included and visible regardless of editor technical-layer visibility
- ANNOTATION: excluded
- SAFE/BLEED guides: excluded

## Regression protection
A desktop regression test locks the renderer contract and the normal/bulk prepared-artboard wiring.
