# Phase 8.8A5 Fix4 — Zoom Pan & Vector Selection Inspection

## Scope

This stabilization addendum fixes high-zoom canvas navigation and restores immediate editing/inspection after ordinary shape drawing. No Arc, Spline or later roadmap feature was started.

## Fixed root causes

1. The artboard was visually scaled around its center while the scroll layout retained only its unscaled dimensions. Above 200%, transformed content extended into non-scrollable negative space and appeared frozen/clipped at the top.
2. Ordinary shape completion cleared the draw draft but kept `DRAW_SHAPE` active. Existing element shells intentionally disable pointer events in drawing modes, so clicking the new/existing shape could not select or edit it.
3. Selection had transform handles but no explicit on-canvas size/angle or vector endpoint/midpoint/center inspection layer.

## Implementation

- Added a zoom frame whose layout dimensions equal the scaled artboard dimensions.
- Anchored artboard scaling at `top left`, keeping transformed content inside positive scroll space.
- Ordinary SHAPE completion now returns to `SELECT`; CAD Angle Line behavior remains unchanged.
- Selected SHAPE/PATH elements render live width × height, rotation angle, endpoint, midpoint and center markers.
- Markers inverse-scale against zoom so they remain usable at deep zoom.
- Added targeted regression coverage without weakening inherited tests.

## Risk containment

- Preserved the `selectedEls` / `selectedPaths` / capability declaration order before the keyboard effect; the prior TDZ fix is unchanged.
- Did not modify Face Split, point snapping, trimmer, Boolean, path topology or export algorithms.
- Existing LINE, Polyline, XLINE, Ray, Angle Line, OSNAP, Polar/Ortho and Align Edge flows remain covered by the full regression suite.

## Executed verification

- `npm run typecheck`: PASS
- `npm test -- --run`: PASS — 173 test files, 910 tests
- `npm run build`: PASS (Vite reports only its non-fatal large-chunk advisory)
- Manual Windows UI smoke: PENDING

See `MANUAL_SMOKE_TESTS.md` for the exact Fix4 Windows UI gate.
