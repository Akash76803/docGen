# Phase 6.3 — Print Readiness

## Physical semantics

Artboard width and height remain the canonical final trim size. Bleed expands outward from trim; safe area contracts inward and never moves artwork. Crop marks are derived print metadata and editor overlays, not editable elements.

Default resolved settings use 3 mm bleed, 3 mm safe area, 150 minimum raster DPI and 300 preferred raster DPI. Older templates remain valid and receive these defaults when consumed without destructive migration.

## DPI and pixel guidance

Raster effective DPI is calculated independently per axis from source pixels divided by placed physical inches. The lower axis is classified as print-ready at preferred DPI, warning at minimum DPI, and low resolution below minimum. SVG assets are vector and resolution independent. Required output pixels use the same shared millimetre-to-inch math.

## Preflight architecture

Shared Design Engine preflight validates trim dimensions, bleed and safe-area geometry, missing or unsupported assets, raster resolution, vector readiness and elements outside the bleed region. Design-level validation aggregates selected or all artboards for future export workflows.

## Editor and export settings

Bleed, safe-area and crop-mark visibility are editor-only preferences. `cropMarksEnabledForExport` is separate export metadata. The resolved Card Render Model carries trim, bleed, safe-area, crop-mark and DPI policy for Phase 6.5 without moving business rules into renderers.

## Verification

- Dedicated tests: `npm run test:card-print`
- Build-backed smoke: `npm run smoke:card-print`

The verification suite covers defaults, legacy non-destructive resolution, physical print math, DPI and stretched/rotated placement, vector handling, bleed/trim/safe-area semantics, structured preflight, multi-artboard independence, print presets, persistence, editor/export policy separation, and resolved RenderModel metadata. These commands are documented for verification and are not claimed as executed by this implementation task.
