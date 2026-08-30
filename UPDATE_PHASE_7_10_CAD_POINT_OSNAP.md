# Phase 7.10 — CAD Point / Object Snap

## Goal
Make divider/line placement and path endpoint reconnection reliable without sub-pixel manual precision. Face splitting keeps its strict `0.05mm` boundary validation; drawing/editing now commits exact coincident coordinates through OSNAP.

## Implemented
- Added a drawing/node-edit-specific point snap resolver in `packages/design-engine/src/pointSnapping.ts`.
- Snap activation uses a **9 screen-pixel radius converted to mm from the rendered artboard width**, so the feel stays consistent across designer zoom and browser/CSS scaling.
- Added exact candidate types:
  1. Existing line/divider endpoints
  2. Shape/path vertices
  3. Intersections between the in-progress line and existing vector geometry
  4. Nearest point on shape/path boundary
  5. Guides
  6. Object centers
  7. Artboard center axes
  8. Grid
- Deterministic priority is documented and enforced:
  `LINE_ENDPOINT > VERTEX > INTERSECTION > BOUNDARY > GUIDE > OBJECT_CENTER > ARTBOARD_CENTER > GRID`.
- LINE / DRAW_SHAPE and PEN / FLEXIBLE_LINE drawing now resolve their effective pointer through the new point snap engine.
- Both first and subsequent line/polyline points can snap.
- In-progress line intersection snapping uses the previous committed endpoint as the probe start.
- EDIT_PATH node dragging now snaps to other elements' endpoints, vertices, boundaries, guides, centers, and grid.
- The edited path itself is excluded from OSNAP candidate search, preventing a node from magnetizing back to its own geometry.
- Endpoint/node release commits the exact snapped world coordinate transformed back into the edited path's local coordinate space.
- Added a visible green snap marker/cross during EDIT_PATH node dragging.
- Existing canvas-level boundary/snap marker remains active for initial line/polyline drawing.
- Existing move/resize snapping in `snapping.ts` remains untouched.
- `faceSplit.ts` validation tolerance remains unchanged at `0.05mm`.

## Tests Added
`packages/design-engine/test/phase710-point-osnap.test.ts`

Coverage includes:
- line endpoint priority over a nearby shape corner/boundary
- exact nearest-boundary projection
- in-progress line intersection snap
- guide-vs-grid priority
- excluding the currently edited path during endpoint reconnection

Run:

```bash
npm run test:card-point-osnap
```

## Verification Status in This Build Environment
- TypeScript syntax/transpile validation passed for the modified TS/TSX files using the available global TypeScript compiler.
- Full Vitest/typecheck execution could not be completed because the extracted ZIP did not include `node_modules`, internet package installation is unavailable/incomplete in this environment, and the project expects Node 20 while the sandbox exposes Node 22.
- Manual interactive Electron/browser verification therefore still needs to be run in the normal project environment.

## Manual Smoke Test
1. Draw a rectangle.
2. Select Line and move near a rectangle corner: endpoint marker should lock to the exact corner.
3. Start on one boundary and move near the opposite edge: endpoint should lock to the exact nearest boundary/intersection.
4. Commit the divider: existing `splitComponentFaceByDivider()` should receive exact coincident endpoints and split without pixel hunting.
5. Select an existing open path, enter Edit Path, drag an endpoint near another shape edge/corner, and confirm the green OSNAP marker appears and release reconnects exactly.
6. Repeat at 50%, 100%, and 200% designer zoom.
7. Enable Grid/Guides and confirm higher-priority endpoint/vertex/boundary snaps win when candidates overlap.
