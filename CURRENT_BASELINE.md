# Current Baseline

Latest implementation: **Phase 8.8A3 — CAD Construction Line / XLINE

Previous manually verified baseline: Phase 8.8A2 — CAD Polyline + Canvas Pan**.

Baseline inherited from **Phase 8.8A1 — CAD LINE Hardening**, manually verified PASS by the user.

Status:
- A1 CAD LINE manual verification: PASS
- A2 source implementation: COMPLETE
- Changed-source transpile: PASS
- CAD Polyline runtime exact-coordinate smoke: PASS
- Full monorepo typecheck: BLOCKED by inherited dependency/workspace build-output gaps
- A2 manual UI verification: PENDING

Next planned tool after A2 verification: **Phase 8.8A3 — Construction Line (XLINE)**.


## Phase 8.8A3 Fix1 — XLINE Reference Tracking + Dynamic Input
- Dedicated XLINE hover/acquire for Parallel/Perpendicular tracking.
- On-canvas editable LINE Length/Angle dynamic input.
- Exact typed endpoint engine helper.
- Manual UI verification: PENDING.

## Phase 8.8A3 Fix2 — Shape Draw Regression Isolation
- Status: SOURCE VERIFIED / MANUAL UI PENDING
- Ordinary SHAPE drawing is isolated from CAD/XLINE tracking.
- CAD tracking remains limited to line-like tools.

## Phase 8.8A3 Fix3 — Build + Shape Draw Recovery
- Real Windows compile error log addressed.
- Dynamic CAD state moved into CardArtboardCanvas scope.
- Parametric shape drag-release commit restored.
- XLINE toolbar mode typing and strict unused-local blockers fixed.
- Manual Windows build/UI verification: PENDING.

## Phase 8.8A3 Fix4 pending manual verification
- LINE dynamic input is mouse-editable via a stable first-point anchored HUD.
- Circle center + exact radius input supported.
- Projected horizontal/vertical virtual intersection snap supported for CAD line-like tools.


## Phase 8.8A3 Fix5
CAD LINE endpoint double-click Extend-to-Boundary and shape-drawing reference parity implemented. Manual verification: PENDING. See `UPDATE_PHASE_8_8A3_FIX5_LINE_EXTEND_SHAPE_REFERENCES.md`.

## Phase 8.8A3 Fix6 — Shortcuts Help Panel
- Top header now exposes a dedicated `Shortcuts` button.
- Searchable modal documents enabled keyboard/mouse shortcuts and their use.
- No geometry or CAD behavior changed.
- Changed-source transpile: PASS.
- Manual UI verification: PENDING.

## Phase 8.8A3 Fix7
Utility, shape, and duplicate keyboard shortcuts added on top of Fix6. Runtime and help modal now share a centralized shortcut registry. Manual UI verification: PENDING.

## Phase 8.8A4 Fix1 — Navigation Recovery
Manual regression after A4 RAY: Dashboard → Card produced a blank page. Recovery baseline restores Phase 8.8A3 Fix7 runtime and temporarily rolls back RAY pending isolated runtime verification.


## Phase 8.8A4 Fix2 — Card Designer TDZ Runtime Recovery
- Fixed CardDesigner blank-page crash caused by `canEditPath` and related capability constants being read in a hook dependency array before initialization.
- Source transpile and declaration-order regression check: PASS.
- Dashboard -> Card manual runtime verification: PENDING.

## Phase 8.8A4 Fix3 — CAD Ray Isolated Reimplementation
RAY re-added on top of the manually verified TDZ-recovery baseline. Dashboard/Card Designer mount-order fix is preserved. Manual Windows UI verification pending.

## Phase 8.8A5 — CAD Angle Line
- Dedicated `A` Angle Line tool added on top of manually verified A4 Ray baseline.
- Exact Length + Angle dynamic input reuses existing CAD endpoint resolver.
- Angle Line commits standard LINE geometry but does not auto-chain.
- Dashboard/Card TDZ recovery ordering preserved.
- Manual UI verification: PENDING.

## Phase 8.8A5 Fix1 — CAD Line Grip Angle Editing
Added anchored Start/End/Center Length + Angle editing for CAD LINE PATHs in Edit Path mode. Manual UI verification pending.

- Phase 8.8A5 Fix2: Edge Align to Reference Geometry implemented; manual UI verification pending.
