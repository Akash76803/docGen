# Phase 8.8B1 Fix2 — CAD Grip Stretch & Angular OSNAP Feedback

## Outcome

- Open PATH/LINE endpoints can be stretched in Edit Path and acquired onto exact endpoints, vertices, boundaries, guides, grid positions, centers and other-element intersections.
- Intersection acquisition uses the dragged endpoint's single fixed adjacent node as the live construction-line origin. Interior multi-connected nodes do not invent an ambiguous stretch direction.
- Acquired grip targets show a green crosshair plus the snap classification (`Endpoint`, `Vertex`, `Intersection`, etc.). The committed local coordinate is calculated from the exact world snap result.
- LINE and Angle Line show labelled construction rays at every 45 degrees. The active exact guide is amber.
- Existing configurable Polar increment, F8 Ortho, F10 Polar, parallel/perpendicular tracking, drawing OSNAP and projected-intersection capture are preserved.

## Scope safety

No changes were made to `faceSplit.ts`, `pointSnapping.ts`, `trimmerUtils.ts`, `booleanUtils.ts`, export logic, path topology helpers or multi-section algorithms.

## Automated verification (Linux sandbox, 2026-09-03)

- `npm run typecheck`: PASS (0 errors)
- Targeted CAD tests: PASS (4 files, 15 tests)
- `npm test -- --run`: PASS (176 files, 919 tests)
- `npm run build`: PASS (desktop Vite build, 1695 modules transformed)
- Manual Windows UI: PENDING

The Vite build emitted only the inherited bundle-size advisory; it did not fail the build.
