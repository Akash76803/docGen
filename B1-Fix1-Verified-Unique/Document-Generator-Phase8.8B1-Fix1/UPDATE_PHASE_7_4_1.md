# Phase 7.4 / 7.4.1 Integrated CAD Interaction Update

This source package was updated from the supplied `ezyZip(1).zip` baseline.

## Implemented / stabilized

- State-backed live draw preview: artwork is visible while the pointer moves, before commit.
- CAD-style two-click drawing now requires an explicit second click to commit; first-click pointer release never auto-commits to a nearby OSNAP candidate.
- Line tool uses exact point-to-point geometry and remains chained from the previous endpoint.
- Circle uses center -> radius-point behavior in CAD click mode.
- Sticky Pen/Flexible Line completion behavior: Enter finishes the current path and keeps the active tool available.
- Contextual OSNAP expanded to canonical nodes, intersections, midpoint, circle/ellipse center, and nearest-on-path.
- Snap search returns a single best contextual marker rather than flooding the canvas.
- diagrams.net-style target feedback: nearby boundary highlight + green locked connection state.
- Exact snapped coordinates feed line creation and the existing Phase 7.3 face-split pipeline.
- Lightweight CAD command hints on the canvas.
- Existing Smart/Manual/Fragment-aware Trimmer implementation preserved.
- Existing zoom/scroll, layer ordering, FaceSplit, Pen, Flexible Line and path geometry architecture reused.
- Source-inspection Phase 7 tests were made filesystem-safe under Happy DOM/Vitest by resolving from `process.cwd()` rather than transformed `import.meta.url` URLs.

## Verification in this environment

- `npm run typecheck` — PASS.
- Vitest/build execution was not completed in this Linux sandbox because the uploaded Windows `node_modules` does not contain Rollup's Linux optional native package (`@rollup/rollup-linux-x64-gnu`). The project source itself typechecks cleanly.

## Recommended local verification on the target Windows machine

1. `npm run typecheck`
2. `npm run build`
3. `npx vitest run packages/design-engine/test/phase741-osnap-feedback.test.ts`
4. `npx vitest run apps/desktop/test/phase741-cad-connection-feedback.test.ts`
5. `npx vitest run apps/desktop/test/phase71-trimmer-ui.test.tsx`
6. `npx vitest run apps/desktop/test/phase74-cad-trimmer-addendum.test.ts`
7. `npm test`

## Fix 7.4.1A — Strict two-click commit

- Fixed premature CAD commits where the first click could auto-create a line/shape if pointer movement snapped the preview to a nearby intersection before pointer release.
- Pointer-up after the first click now only arms the draft and keeps Live Draw Preview active.
- Geometry commits only on the second explicit click.
- OSNAP still controls the preview and exact committed second-point coordinate, but it cannot trigger commit by itself.
