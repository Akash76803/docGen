# Phase 6.0.5 — Layers, Z-Order & Grouping

## Scope
Adds deterministic layer ordering, element rename/show-hide/lock, forward/back/front/back commands, duplication, flat grouping/ungrouping, group lock/visibility, and shared group scale/rotation utilities to the Card Designer shared Design Engine.

## Architecture rules
- Layer order is the canonical `zIndex` order used by rendering; the UI does not keep a parallel layer model.
- Groups use the existing `Artboard.groups[]` + `DesignElement.groupId` contract.
- V1 grouping is deliberately flat. Existing grouped elements are not silently nested into another group.
- Group operations remain upstream design-model operations; no renderer business logic is introduced.
- Group move reuses the existing multi-element transform engine. Group scale and rotation are pure Design Engine transforms.

## UI behavior
- Layers are shown front-to-back.
- Layer rows support rename, show/hide, lock/unlock, one-step forward/backward, and front/back.
- Clicking a grouped member selects the full group for movement.
- Multi-selection can Group/Ungroup and invoke shared scale/rotate actions.
- Duplicate preserves group membership in an independent copied group.

## Test gate
Run on the authoritative Windows workspace:

```powershell
npm run typecheck
npm run build
npm run test:card-layers
npm run test:card-elements
npm run test:card-transform
npm run test:card-canvas
npm test
npm run smoke:card-layers
```
