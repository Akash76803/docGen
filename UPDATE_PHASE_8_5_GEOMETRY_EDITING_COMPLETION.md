# Phase 8.5 — Geometry Editing Completion

Baseline: Phase 8.4 Fix2 Hierarchical Layers.

## Implemented
- Multi-selected Edit Path nodes drag together by one shared delta.
- Arrow-key node nudging now moves Bezier handles with their node.
- `Select All Nodes`, `Clear Nodes`, and `Delete Nodes` actions in the path toolbar.
- Safe node deletion guard: closed paths keep at least 3 points; open paths keep at least 2 points; invalid topology is rejected.
- Centralized `setPathPointMode()` for Corner / Smooth / Symmetric.
- Smooth/Symmetric handle creation is based on neighboring geometry rather than a fixed 5 mm handle.
- Symmetric mode preserves equal opposite handles; Smooth preserves tangent continuity while allowing unequal lengths.
- `To Line` now removes the converted segment's outgoing/incoming Bezier handles so stale curvature does not leak into later edits.
- Existing `To Curve`, `To Arc`, `Flip Arc`, `Close Path`, Scissors, Split, Trimmer and OSNAP pipelines are preserved.

## Verification
- Changed TS/TSX transpile: PASS.
- Direct path utility runtime smoke: PASS.
- Targeted Vitest files added; execution blocked in clean artifact because dependencies are not installed (`vitest: not found`).
- Protected geometry subsystems were not intentionally modified: faceSplit.ts, pointSnapping.ts, trimmerUtils.ts, booleanUtils.ts.
