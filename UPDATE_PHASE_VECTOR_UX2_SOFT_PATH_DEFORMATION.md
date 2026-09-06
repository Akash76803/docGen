# VECTOR-UX2 — Soft Path Deformation / Proportional Node Editing

## Purpose
Make dense curved PATH editing feel like a professional vector/CAD editor. Dragging one node can now deform a surrounding run of path nodes smoothly instead of creating a sharp local kink.

## Implemented
- Soft Edit enabled by default while editing PATH nodes.
- Influence distance is measured **along path topology**, not only by straight-line screen distance.
- Radius control in millimetres.
- Falloff modes: Smooth, Gaussian, Linear.
- Strength control for influenced neighbors.
- Preserve Ends option for open paths.
- Directly selected/dragged nodes remain at 100% movement.
- Neighboring nodes receive progressively smaller deltas according to path distance.
- Node in/out handles translate with their node so local tangent structure is preserved.
- Multi-node anchors are supported; influence uses the nearest selected anchor.
- Existing snapping resolves the primary dragged node first, then proportional deformation uses that resolved delta.
- Existing history transaction wraps the whole drag.
- Soft Edit can be disabled to recover legacy direct node dragging.

## Architecture
A dedicated `pathSoftDeformation.ts` helper builds a weighted graph from PATH segments, approximates curve-segment length, and runs bounded shortest-path propagation from selected anchors. This avoids accidentally influencing a spatially nearby but topologically distant part of a loop.

## Testing
- `pathSoftDeformation.ts` targeted TypeScript transpile: PASS.
- `CardDesigner.tsx` targeted TypeScript transpile: PASS.
- `pathSoftDeformation.test.ts` targeted TypeScript transpile: PASS.
- Runtime harness: PASS for symmetric smooth falloff, endpoint preservation, and disconnected-node exclusion.
- Vitest runner is not available in the extracted environment, so a Vitest PASS is not claimed.
- Manual smoke coverage added for radius, falloff, strength, endpoints, handles, snapping, undo/redo, multi-node selection, and VECTOR-UX1 regressions.

## Deliverable
`Document-Generator-Phase-VECTOR-UX2-Soft-Path-Deformation.zip`
