# Baseline Verification — Phase 8.5 Fix6

Baseline used: Phase 8.5 Fix5 — Path Toolbar UX + Home Navigation.

## Implemented verification
- `packages/design-engine/src/pathUtils.ts` TypeScript transpile syntax: PASS
- `apps/desktop/src/pages/CardDesigner.tsx` TSX transpile syntax: PASS
- Direct runtime smoke for symmetric path-node insertion:
  - H left/right auto-pair: PASS
  - V top/bottom auto-pair: PASS
  - Off single-node insertion: PASS
- Protected geometry hash comparison vs Fix5:
  - `faceSplit.ts`: UNCHANGED
  - `pointSnapping.ts`: UNCHANGED
  - `trimmerUtils.ts`: UNCHANGED
  - `booleanUtils.ts`: UNCHANGED
- Targeted Vitest files added for engine behavior and UI wiring.

## Environment limitation
The clean source bundle does not contain installed local dependencies, so a full Vitest/typecheck/build run is not claimed here. Run `npm install` in the normal development environment before the full regression suite.

## Manual UI verification
PENDING.
