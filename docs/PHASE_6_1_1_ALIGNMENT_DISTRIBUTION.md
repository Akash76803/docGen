# Phase 6.1.1 — Alignment & Distribution Tools

## Scope
Adds reusable alignment/distribution primitives to the shared Design Engine and exposes them in Card Designer without duplicating transform logic.

## Shared Design Engine
- `alignElements()` — Left / Horizontal Center / Right / Top / Vertical Center / Bottom.
- `distributeElements()` — Horizontal / Vertical distribution.
- `centerElementsOnArtboard()` — horizontal, vertical, or both-axis artboard centering.
- `getAlignmentUnitCount()` — UI-safe count of atomic alignment units.
- Alignment reference: `SELECTION` or `ARTBOARD`.
- Groups are treated as atomic units and preserve member-relative geometry.
- Locked elements/groups are never moved.
- Distribution requires at least three movable atomic units.

## Card Designer UI
- Multi-selection property panel now contains an **Align & Distribute** section.
- User can switch reference between **Selection bounds** and **Artboard**.
- Actions: Left, H Center, Right, Top, V Center, Bottom, Distribute H, Distribute V, Center Artboard.
- Single element properties expose **Align to Artboard** actions.
- Every action goes through the existing `mutate()` history path, therefore Undo/Redo works without a second history implementation.

## Non-goals
Smart snapping, rulers, grids, and guides are intentionally deferred to Phase 6.1.2 / 6.1.3.

## Gate
Run on the Windows project root:

```powershell
npm run typecheck
npm run build
npm run test:card-alignment
npm run test:card-productivity
npm run test:card-layers
npm run test:card-elements
npm run test:card-transform
npm run test:card-canvas
npm test
npm run smoke:card-alignment
```
