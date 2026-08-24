# Phase 6.1.2 — Smart Snapping

## Scope
Adds deterministic drag/resize snapping to the shared Design Engine and Card Designer UI.

## Shared engine
- `snapMoveDelta()` snaps selection bounds while preserving relative positions.
- `snapResizeSize()` snaps active resize edges.
- Targets: artboard edges/centers, visible element edges/centers, existing custom guides, optional grid.
- Default tolerance: 1.5 mm; grid step default: 5 mm.
- Moving elements are excluded as their own snap targets.
- Locked elements remain valid alignment targets but are never transformed.
- Returns renderer/editor-neutral `SnapGuideIndicator[]` for temporary guide visualization.

## Card Designer UX
- Snap On/Off toggle in canvas toolbar.
- Optional 5 mm Grid snap toggle (grid visualization/management remains Phase 6.1.3).
- Hold `Alt` while dragging/resizing to temporarily bypass snapping.
- Smart guides appear only during an active snapped interaction and clear on pointer-up/cancel.
- Source colors distinguish artboard, element, custom guide and grid targets.
- Existing history transaction behavior remains unchanged: a snapped drag/resize is one undo step.

## Architectural boundary
Snapping is pure editor geometry. It does not mutate data bindings, calculations, RenderModel resolution, or renderer business logic.

## Tests / gates
- Dedicated test: `packages/design-engine/test/phase612-smart-snapping.test.ts`
- Smoke: `npm run smoke:card-snapping`
- Windows release gate: typecheck, build, dedicated snapping tests, earlier card regressions, full test suite.
