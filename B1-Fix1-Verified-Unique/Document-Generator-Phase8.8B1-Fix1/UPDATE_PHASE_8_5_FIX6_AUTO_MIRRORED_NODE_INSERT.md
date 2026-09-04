# Phase 8.5 Fix6 — Auto Mirrored Node Insert

Baseline: Phase 8.5 Fix5 — Path Toolbar UX + Home Navigation.

## User-reported gap
Smart center/equal-distance guides were visible, but adding matching nodes on opposite sides still depended on two manual Shift+Clicks. Manual placement could miss the exact shared horizontal/vertical line and equal distance from the shape center.

## Implemented
- Added `insertPathNodeWithSymmetry()` to the design engine.
- `Symmetry = H` + Shift+Click on a path segment now creates the clicked node and automatically creates/selects the exact left/right counterpart across the path vertical centerline.
- `Symmetry = V` does the same across the horizontal centerline for top/bottom pairs.
- The mirrored node is placed on the nearest valid opposite boundary segment only when that boundary is within the symmetry hit tolerance.
- If a valid counterpart node already exists at the mirrored location it is reused instead of creating a duplicate.
- `Symmetry = Off` preserves the existing single-node Shift+Click insertion behavior.
- Both nodes are selected after auto-pair creation, so the red selected-node treatment and equal-distance guides apply immediately.
- Existing mirrored drag behavior then keeps the created pair moving symmetrically.

## Safety
- Does not change Face Split, OSNAP, Trimmer, Boolean, Scissors or group/layer logic.
- Does not guess a mirrored node when no opposite boundary exists near the exact mirrored point; in that case only the clicked node is created.

## Verification
- TypeScript transpile syntax check: PASS for `pathUtils.ts` and `CardDesigner.tsx`.
- Direct runtime smoke on a closed rectangle: PASS for H mirrored insert.
- Added targeted Vitest coverage for H, V and Off modes plus UI wiring.
- Full Vitest remains environment-dependent when dependencies are not installed.

## Manual verification status
PENDING user UI verification.
