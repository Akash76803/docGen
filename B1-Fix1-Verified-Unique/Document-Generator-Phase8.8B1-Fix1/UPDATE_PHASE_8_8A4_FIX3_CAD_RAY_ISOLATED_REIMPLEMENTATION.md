# Phase 8.8A4 Fix3 — CAD Ray Isolated Reimplementation

## Baseline
Phase 8.8A4 Fix2 CardDesigner TDZ Recovery, manually verified by the user for dashboard navigation and prior CAD/shape features.

## Goal
Re-add CAD RAY without regressing CardDesigner mount/navigation initialization order.

## Implementation
- Added isolated `cadRay.ts` helper in design-engine.
- RAY is a two-point CAD construction tool: first point = origin, second point = direction.
- Stored PATH is clipped from origin to the first forward artboard boundary only.
- Metadata: `cadGeometryKind=RAY`, `cadConstruction=true`, `cadExport=false`, `cadSectionCandidate=false`, `cadIntent=GUIDE`.
- Added RAY tool entry and `R` shortcut.
- Added RAY to CAD draw lifecycle, cursor/hints, OSNAP/polar/ortho/reference tracking, and XLINE/RAY parallel-perpendicular reference acquisition.
- Existing export filters exclude construction geometry.

## Critical regression guard
The Fix2 declaration order for `selectedEls`, `selectedPaths`, `canEditPath`, `canScissors`, `canTrim`, `canJoin`, and `canClose` remains before the global keyboard effect. This prevents the prior render-time TDZ crash.

## Verification performed
- TypeScript transpile: CardDesigner, DesignerContextToolbar, ElementLibraryPanel, shortcut registry, cadRay — PASS.
- Runtime helper: horizontal forward-only clipping — PASS.
- Runtime helper: 45-degree first-forward-boundary clipping — PASS.
- Metadata/export exclusion assertions — PASS.
- Full Windows UI runtime verification — PENDING.
