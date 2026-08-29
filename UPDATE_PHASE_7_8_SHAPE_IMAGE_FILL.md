# Phase 7.8 — Shape image fill

## Goal
Allow raster images to be used as fills inside SHAPE and closed PATH elements while preserving their geometry, border, shape text, transforms, persistence, and export behavior.

## Implementation
- Added Image to the Shape/PATH Fill selector.
- Images can be selected from shared assets or uploaded directly from the inspector.
- Added FIT, FILL/CROP, and STRETCH modes plus image opacity.
- Canvas and isolated PDF/PNG/JPEG export use SVG image patterns, so pixels are clipped to the real shape/path boundary.
- Missing image-fill asset references now fail template validation.
- Existing `DesignFill.IMAGE` contract is reused; no incompatible schema or element type was introduced.

## Regression
- `apps/desktop/test/phase78-shape-image-fill.test.tsx`
- Validation coverage updated in `packages/design-engine/src/validation.ts`.

## Verification note
Run the full npm verification in a workspace with Node 20 and dependencies installed.
