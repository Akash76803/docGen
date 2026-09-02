# Phase 8.8A3 Fix3 — Build + Shape Draw Recovery

## Scope
Recovery fix based on the real Windows TypeScript build output and manual report that normal shapes no longer committed.

## Root causes fixed
1. CAD dynamic-input state/refs and XLINE reference state were declared in `CardDesigner` but consumed inside `CardArtboardCanvas`, producing out-of-scope TS2304/TS7006 cascades.
2. A1 CAD click-click pointer-up behavior was accidentally applied to every `DRAW_SHAPE_DRAG`; normal parametric shapes therefore never committed on drag-release.
3. `DesignerContextToolbar` interaction-mode contract was missing `XLINE`.
4. Strict `noUnusedLocals` blockers remained in `CardDesigner.tsx` and `CardExportCanvas.tsx`.

## Correct behavior
- LINE / SPLIT / XLINE: click-click CAD lifecycle.
- Rectangle / Circle / Ellipse / Polygon / Star / other parametric shapes: drag-release commit lifecycle.
- Dynamic Length/Angle input is local to the artboard canvas where it is rendered and used.
- XLINE reference latch is local to the artboard canvas and cleared on Select.
- Existing Polyline, OSNAP, polar tracking, deep zoom and pan are preserved.

## Verification
- TypeScript syntax/transpile of all three files from the user's 42-error report: PASS.
- Static scope regression checks: PASS.
- Normal-shape pointer-up commit branch present: PASS.
- LINE/SPLIT/XLINE remain two-click: PASS.
- Full workspace build in the sandbox is BLOCKED by incomplete container dependency installation/type packages; no false full-build PASS is claimed.
- Windows `npm run build` manual verification: PENDING.
