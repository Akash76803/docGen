# Phase 8.6 — Rich Artboard Backgrounds

## Baseline
Phase 8.5 Fix6 — Auto Mirrored Node Insert.

## Implemented
- Artboard background Inspector now supports `SOLID`, `NONE`, `LINEAR_GRADIENT`, `RADIAL_GRADIENT`, `PATTERN`, and `IMAGE`.
- Solid opacity, multi-stop gradient editing, radial center/radius, Hatch/Dot/Checker pattern controls.
- Artboard image background supports shared assets, upload, Fit/Fill/Stretch, opacity, zoom, rotation, offset X/Y, and Reset Crop.
- Added optional artboard background image field binding (`backgroundBindings`) so record/Base64 image values can resolve at preview/bulk generation time with the selected asset as fallback.
- Interactive canvas renders artboard background through the same SVG `VectorFillDefs` engine used by vector shapes.
- Grid is now an editor overlay above the rich background, so gradients/images do not hide the grid.
- Isolated export canvas renders artboard backgrounds via `ExportVectorFillDefs`, including radial gradients, patterns, transformed image fills, solid opacity, and transparency.
- Element render z-index is offset above the dedicated background layer without changing persisted element z-index values.

## Tests
- Added `apps/desktop/test/phase86-artboard-background-fills.test.ts` covering fill persistence/normalization, image transform, dynamic image resolution, and canvas/export wiring.
- Changed-source TypeScript parse checks: PASS.
- Full `npm run typecheck`: BLOCKED by missing clean-environment dependencies (`zod`, `xlsx`, `papaparse`, `paper`, React, html2canvas, etc.).
- Targeted Vitest: BLOCKED because dependencies are not installed and `npx` cannot complete in the offline clean environment.
- Manual UI/export verification: PENDING.

## Protected geometry
`faceSplit.ts`, `pointSnapping.ts`, `trimmerUtils.ts`, and `booleanUtils.ts` are byte-for-byte unchanged from Phase 8.5 Fix6.
