# Phase 8.8A5 Fix3 — Build & Test Cleanup

## Trigger
Windows verification after A5 Fix2 reported 11 TypeScript build errors and a broad test-suite failure count.

## Source fixes
- Removed unused `getElementCapabilities` import from DesignerContextToolbar.
- Replaced unsupported `ids.at(-1)` with target-compatible array indexing.
- Added `MIRROR_LINE` to ElementLibraryPanel interaction-mode contracts.
- Added explicit `index:number` to Edge Align straight-segment helper return typing.
- Removed access to non-contract `PointSnapResult.label`.
- Removed invalid `type` property from RAY/XLINE `DesignStroke` literals.
- Made `appendCadPolylinePoint(..., pointId)` explicitly accept `string`, avoiding crypto.randomUUID template-literal inference leakage.

## Test maintenance
- Updated Phase 8.8A3 Fix2 CAD-HUD regression assertion to include later RAY and ANGLE_LINE modes while continuing to reject ordinary shapes.
- Updated Phase 8.8A3 Fix7 shape-shortcut assertions to validate the current shortcut factory representation rather than obsolete source formatting.
- Added Phase 8.8A5 Fix3 focused build-cleanup regression guards.

## Verification
- Changed TS/TSX transpile: PASS.
- 9 focused source assertions covering the user-reported compiler blockers: PASS.
- Full `npm install` in sandbox did not complete within execution limits, so full workspace typecheck/test/build is NOT claimed here.
- Windows rerun required using `npm run typecheck`, `npm test -- --run`, `npm run build`.
