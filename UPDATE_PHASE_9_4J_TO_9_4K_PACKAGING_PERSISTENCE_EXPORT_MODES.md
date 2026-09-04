# Phase 9.4J-K — Packaging Persistence + Export Modes

## Scope

This batch continues the verified Phase 9.4G-I packaging baseline.

### Phase 9.4J — Persistence / Undo-Redo hardening

- Packaging state is normalized at the design serialization boundary.
- Generated/legacy carton files recover canonical `packagingPanels` when possible.
- Panel artwork orientation is normalized to `0/90/180/270`.
- Assigned artwork keeps `packagingPanelId` and `packagingPanelOrientationDeg` across save/reload.
- Virtual panel artwork group indexes are rebuilt from actual element ownership before persistence.
- Packaging orientation remains a normal history operation and therefore supports Undo/Redo.
- View-only panel selection/focus remains outside design history.

### Phase 9.4K — Packaging Export Modes

The Export dialog now exposes packaging-specific output policy when the active artboard is a carton dieline:

1. **Artwork Only · Client Proof**
   - Artwork exported.
   - CUT / CREASE / technical guides excluded.

2. **Artwork + CUT/CREASE · Dieline Proof**
   - Artwork exported.
   - CUT and CREASE exported.
   - BLEED / SAFE / ANNOTATION editor guides excluded.

3. **CUT/CREASE + Labels · Technical View**
   - Artwork excluded.
   - CUT, CREASE and ANNOTATION panel labels exported.

A single design-engine export filter is used for render-model and isolated raster artboards so PDF/PNG/JPEG paths share the same element policy. Bulk personalized generation uses the same packaging mode.

## Regression safeguards

- Non-packaging artboards retain the pre-existing export policy.
- CAD construction geometry stays excluded.
- Existing Phase 9.3 default dieline proof behavior remains available through `DIELINE_PROOF` / legacy `STANDARD` policy.
- Existing export DPI, crop marks, transparent PNG and JPEG quality controls are unchanged.

## Added tests

- `packages/design-engine/test/phase94-persistence-export-modes.test.ts`
- `apps/desktop/test/phase94jk-packaging-export-ui.test.ts`

## Manual acceptance

1. Create carton and add Front artwork.
2. Rotate Front artwork orientation to 90°.
3. Save and reopen: ownership/orientation must remain.
4. Undo/Redo orientation before save: must restore 0° / 90° respectively.
5. Export `Artwork Only`: no CUT/CREASE visible.
6. Export `Dieline Proof`: artwork + CUT/CREASE visible; panel labels absent.
7. Export `Technical View`: CUT/CREASE + labels visible; artwork absent.
8. Repeat at least one PNG and one PDF export to confirm parity.
9. If data binding exists, generate two records and confirm the selected packaging export mode is retained for both.

## Verification status in this environment

Targeted tests were authored, but the extracted source contains an incomplete `node_modules` tree with no local Vitest binary. Therefore fresh automated PASS is not claimed here. Run the project under Node 20 and execute the standard typecheck/test/build gates on Windows.
