# Phase 8.3 — Multi-Selection Enhancements

## Goal
Complete primary-aware multi-selection operations by reusing the existing selection, alignment, transform and mixed-value foundations.

## Implemented
- `DesignAlignmentReference` now supports `PRIMARY`.
- `alignElements(..., 'PRIMARY', primaryElementId)` aligns unlocked alignment units against the primary element/unit without moving the primary.
- Added `matchElementsSize()` with `WIDTH`, `HEIGHT`, and `BOTH` modes.
- PATH geometry scales with matched dimensions.
- Locked elements are skipped by exact edits and match-size operations.
- Multi-selection Inspector now shows the actual primary element name.
- Reference dropdown: Selection bounds / Primary element / Artboard.
- Same Width / Same Height / Same Size buttons.
- Mixed X / Y / Width / Height / Rotation fields: blank + `Mixed` placeholder; entering an exact value applies to every unlocked selected element.
- Existing distribution remains Selection/Artboard based; it is disabled while Primary reference is selected because distribution-to-primary has no unambiguous meaning.
- Top context toolbar adds quick Primary alignment and Same W/H/Size actions.

## Reused
- Existing deterministic `primaryElementId` selection state.
- Existing group-aware `alignmentUnits()` logic.
- Existing Phase 8.1 exact multi-edit helpers.
- Existing `resizeElement()` PATH geometry scaling.
- Existing history `mutate()` boundary so one button/field commit is one operation.

## Deferred
- Group dimension matching as a true atomic group operation (Phase 8.4).
- Nested group semantics (Phase 8.4+).
- Full heterogeneous fill/stroke batch editor; Phase 8.3 keeps existing batch opacity and focuses mixed transform editing.

## Files changed
- `packages/design-engine/src/alignment.ts`
- `packages/design-engine/src/transform.ts`
- `packages/design-engine/test/phase83-multi-selection-enhancements.test.ts`
- `apps/desktop/src/components/designer/DesignerContextToolbar.tsx`
- `apps/desktop/src/pages/CardDesigner.tsx`
- `package.json`
- phase/baseline documentation

## Verification
- TypeScript transpile/syntax check for every changed TS/TSX file: PASS.
- Phase 8.3 targeted Vitest command added: `npm run test:card-phase83`.
- Targeted Vitest execution in clean source bundle: BLOCKED (`vitest` dependency absent).
- Full typecheck/build: BLOCKED by absent installed React/Tauri/etc. dependencies; existing environment-level missing-module/JSX typing errors, not a Phase 8.3 runtime acceptance result.
- Manual UI verification is required using the checklist below / `MANUAL_SMOKE_TESTS.md`.
