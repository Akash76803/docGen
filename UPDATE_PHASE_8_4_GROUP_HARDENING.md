# Phase 8.4 — Group Hardening

## Baseline
Phase 8.3 — Multi-Selection Enhancements.

## Goal
Harden the existing flat-group model without introducing nested groups or a new transform representation.

## Reused
- Existing `DesignGroup` / `groupId` contracts.
- Existing Group/Ungroup, duplicate, lock/hide, group-expanded selection.
- Existing shared multi-selection resize and rotation behavior.
- Existing alignment units that already treat a group atomically.
- Existing history snapshot/transaction framework.

## Implemented / Hardened
1. **PATH-safe group scaling**
   - `scaleElements()` now delegates to immutable selection snapshot scaling.
   - PATH point/Bezier handle geometry scales together with the element box.
   - Stroke width/font size are not scaled by this operation.

2. **Atomic grouped Flip H/V**
   - Added `flipElementsAsGroup()`.
   - Child placement mirrors around the shared group bounds.
   - SHAPE/IMAGE/SVG local flip state and PATH geometry are reflected.
   - TEXT/QR/BARCODE stay readable/scannable while their placement is mirrored.
   - Context toolbar automatically uses atomic group flip for one complete flat group; arbitrary multi-selection retains Phase 8.1 per-element flip semantics.

3. **Group-aware Same Width / Height / Size**
   - Added `matchAlignmentUnitsSize()`.
   - A group is treated as one alignment unit and scales atomically to the primary unit's dimensions.
   - PATH children scale correctly.

4. **Editor-session Regroup**
   - Ungroup captures the previous flat group structure in editor-session state only.
   - `Regroup` restores the prior group only while all prior members still exist and remain ungrouped.
   - Regroup metadata is intentionally not persisted in template JSON.
   - Stale Regroup state is cleared when opening/creating a different template.

5. **Group name editing**
   - Added `renameGroup()` and a Group name field in the multi-selection inspector for one complete selected group.

6. **Group shortcuts**
   - `Ctrl/Cmd + G`: Group.
   - `Ctrl/Cmd + Shift + G`: Ungroup.

7. **Layer / toolbar consistency**
   - Layers toolbar exposes Regroup.
   - Context-toolbar unit count now uses group-aware alignment units.
   - Existing duplicate/lock/hide group behavior is preserved.

## Deferred
- Nested groups.
- Group isolation/edit-inside mode.
- Persistent regroup history in saved template JSON.
- Scaling font size/stroke width with group resize (current policy: geometry only).

## Files Changed
- `packages/design-engine/src/layers-groups.ts`
- `packages/design-engine/src/alignment.ts`
- `packages/design-engine/src/mirror.ts`
- `apps/desktop/src/pages/CardDesigner.tsx`
- `apps/desktop/src/components/designer/DesignerContextToolbar.tsx`
- `packages/design-engine/test/phase84-group-hardening.test.ts`
- `packages/design-engine/test/phase84-group-ui-contract.test.ts`
- `package.json`
- Phase/baseline documentation files.

## Verification
- Changed TS/TSX transpile/syntax checks: PASS.
- Direct runtime group math smoke: PASS for PATH group scaling, atomic group flip, Regroup, group-aware Same Size.
- Design-engine typecheck after source fix: no Phase 8.4 diagnostics; blocked only by missing external `paper` typings/dependency.
- Targeted Vitest command: blocked because `vitest` is not installed in the clean source bundle.
- Full repo typecheck/build: blocked by missing clean-bundle dependencies (`paper`, `zod`, `xlsx`, `papaparse`, React/Tauri ecosystem, etc.).
- Protected geometry/style engines remained unchanged: Face Split, point OSNAP, Trimmer, Boolean and Styling.

## Manual Acceptance Focus
See `MANUAL_SMOKE_TESTS.md` for exact steps and expected results. Critical checks are Group/Ungroup/Regroup, group resize with a PATH child, group Flip H/V, group-aware Same Size, duplicate, lock/hide, Undo/Redo and save/reload.
