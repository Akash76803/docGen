# Phase 8.5 Fix1 — Geometry Editing Runtime Wiring

Baseline: Phase 8.5 Geometry Editing Completion.

## Why Fix1 was required
Manual UI verification showed the Phase 8.5 behavior was not visible/usable as documented. Source audit found that node-mode helpers could create Bezier handles while connected segments remained LINE segments, so Smooth/Symmetric often produced no visible canvas curve. PATH editing also relied primarily on double-click discovery, and Bezier handle drags did not close their history transaction.

## Fixes
- Smooth/Symmetric now promote connected LINE segments to CUBIC_BEZIER while preserving segment IDs/topology.
- Added explicit `Edit Path` button for a selected PATH.
- Added explicit `Exit Edit` button while path editing.
- Bezier in/out handle drag now closes the active history transaction on pointer-up.
- Existing multi-node drag, safe delete, To Line, To Curve, To Arc, Flip Arc and protected Split/OSNAP/Trimmer/Boolean geometry are preserved.

## Verification status
- Changed TS/TSX syntax transpile: PASS.
- Targeted regression tests added.
- Full project typecheck remains blocked in the clean artifact by pre-existing unbuilt project references/dependencies (including `paper`).
- Manual UI verification is required before Phase 8.5 can be marked complete.
