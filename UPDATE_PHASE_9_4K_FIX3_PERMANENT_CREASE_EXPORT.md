# Phase 9.4K Fix3 — Permanent CUT/CREASE Export Visibility

## Root cause
Packaging export filtering admitted hidden CUT/CREASE elements into Dieline Proof, and technical groups were force-visible, but the exported element objects themselves could still retain `visible: false`. `CardExportCanvas` and downstream renderers perform their own element-level visibility checks, so CREASE geometry was silently dropped again.

## Permanent fix
- `prepareArtboardForCardExport()` now creates export-only clones of technical elements and forces `visible: true` for:
  - DIELINE_PROOF: CUT + CREASE
  - TECHNICAL: CUT + CREASE + ANNOTATION
- Editor/template visibility is not mutated.
- `buildCardRenderModel()` now consumes the prepared export artboard element list, so vector/PDF and raster paths use the same visibility-normalized export model.
- Existing strict layer policy remains:
  - CLIENT_PROOF: artwork only
  - DIELINE_PROOF: artwork + CUT + CREASE
  - TECHNICAL: CUT + CREASE + ANNOTATION
  - SAFE/BLEED excluded from print modes
- Legacy technical layer classification remains supported through metadata, technical group name, and narrow generated-name fallbacks.

## Regression coverage
The hidden technical-layer regression now asserts not only that CUT/CREASE are present, but that every exported CUT/CREASE element has `visible === true` in both the prepared artboard and render model.

## Runtime parity
The built `dist/card-export.js` copy is synchronized with the source fix so package consumers do not accidentally execute stale export behavior before a workspace rebuild.

## Manual acceptance
1. Generate/open a carton dieline.
2. Hide CREASE in the editor.
3. Export Dieline Proof PDF and PNG.
4. Verify artwork + outer CUT + all vertical/horizontal CREASE lines are present.
5. Verify panel labels, SAFE and BLEED guides are absent.
6. Return to editor and confirm CREASE remains hidden there (export must not mutate editor state).
