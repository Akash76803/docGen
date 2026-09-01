# Shape Operations — Revised Master Implementation Plan

This plan is audit-driven. Every phase begins with a code trace and ends with regression verification.

## Phase 8.0 — Foundation
**Goal:** establish policy/state/persistence safety before feature expansion.

**REUSE:** existing `DesignSelectionState.primaryElementId`, selection helpers, styling defaults, history framework.

**HARDEN:** propagate real primary selection through Context Toolbar/Inspector; structured selection tests.

**NEW:** centralized `getElementCapabilities()`, semantic mixed-value infrastructure, backward-compatible normalization/migration foundation, permanent Shape Operations regression suite.

**DEFER:** transforms/styling/Boolean feature additions.

**Risks:** accidental selection behavior change; noisy legacy-template rewriting.

**Done when:** targeted foundation tests + permanent critical regression gates + typecheck/build/manual smoke pass.


### Phase 8.0 implementation status
Implemented in `UPDATE_PHASE_8_0_SHAPE_FOUNDATION.md`. Source-level syntax/transpile verification passed. Full Vitest/typecheck/build remains environment-blocked because this clean source bundle contains no `node_modules`; see `BASELINE_VERIFICATION.md`.

## Phase 8.1 — Transform Hardening
Reuse current move/nudge/resize/rotate engine. Harden rotated resize, center resize, aspect behavior, exact multi-edit semantics and universal shape/PATH flip. Defer skew until transform/export matrices are robust.

### Phase 8.1 implementation status
Implemented in `UPDATE_PHASE_8_1_TRANSFORM_HARDENING.md`: rotation-aware resize, opposite-anchor stability, Alt center resize, live Shift aspect toggle, Shift+Rotate 15° snap, in-place SHAPE/PATH/IMAGE/SVG flip, and exact multi-edit engine helpers. Full mixed multi-edit UI remains Phase 8.3. Full Vitest/typecheck/build is environment-blocked because dependencies are absent in this clean bundle.

## Phase 8.2 — Styling Contract & Rendering Parity
Reconcile contracts, editor and export first. Extend core fills/strokes incrementally: radial/pattern only after contract parity; image crop transform; caps/joins/custom dash; then effects. CENTER stroke alignment only initially.

### Phase 8.2 implementation status
Implemented core styling parity: radial gradient, Hatch/Dot/Checker patterns, persistent image-fill zoom/offset/rotation, and vector stroke caps/joins/custom dash/dash offset. CENTER stroke alignment only. Advanced effects remain deferred.

## Phase 8.3 — Multi-Selection Enhancements
Implemented: reused existing multi-select/alignment/distribution; added Align-to-Primary, Same Width/Height/Size, primary-aware UI and mixed exact X/Y/W/H/rotation editing with locked-element filtering. Group-atomic dimension matching remains Phase 8.4.

## Phase 8.4 — Group Hardening
Implemented: reused flat Group/Ungroup/duplicate/visibility/order; fixed proportional PATH child scaling; added atomic group Flip H/V, group-aware Same W/H/Size, editor-session Regroup, group naming and Group/Ungroup shortcuts. Nested groups and edit-inside isolation remain deferred.

## Phase 8.5 — Geometry Editing Completion
Reuse PATH model, node modes, Beziers, segment conversions and Convert-to-Path. Harden conversion fidelity/undo; add explicit open/break/join workflows as needed, exact node editing, Change Shape and dedicated parametric adjustment handles.

## Phase 8.6 — Boolean Hardening + Fragment
Reuse Paper.js Union/Subtract/Intersect/Exclude and compound subpaths. Add capability/precondition validation, deterministic primary target/style semantics, meaningful tests and N-element handling. Implement Fragment as independent closed region generation, not XOR and not merely divider Face Split.

## Phase 8.7 — Shape Text Hardening
Reuse current shape/path labels and font/alignment/padding. Add fit modes, shrink/min-font, dynamic-binding-after-resolution autofit, missing/fallback behavior and export parity.

## Phase 8.8 — Persistence / Export / Regression Hardening
Finalize migration/round-trip compatibility, clipboard coverage, atomic history, canvas/PDF/PNG/JPEG parity, performance checks, full manual matrix and release packaging.

## Permanent rule for every phase
Audit actual affected code → classify REUSE/HARDEN/NEW → implement minimal compatible change → targeted tests → permanent regression suite → typecheck → build → manual smoke → update phase doc → complete source ZIP.
