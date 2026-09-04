# Phase 9.4D–9.4F — Panel Artwork Operations

## Scope
- 9.4D: panel-owned artwork metadata and virtual artwork group index
- 9.4E: panel Fit / Fill / Contain / Bleed Fill and focused-panel clipping
- 9.4F: safe-area, panel-overflow and bleed-coverage warnings

## Key behavior
- Focused-panel insertions for Text, Shape, QR, Barcode, uploaded Images and library/decorative assets are automatically tagged with `packagingPanelId` and centered in the panel.
- Packaging ownership is intentionally independent of normal `DesignGroup.groupId` so existing grouping/regrouping, transforms and group integrity repair remain safe.
- Generated carton metadata now initializes `artworkGroups` for every editable packaging panel.
- `Assign` can attach an existing selection to the focused panel.
- `Fit`, `Fill`, `Contain`, and `Bleed Fill` are undoable design mutations.
- `Bleed Fill` marks the selection as packaging background artwork and expands it by the panel bleed amount.
- Focus mode clips zero-rotation panel-owned artwork to the active panel boundary for editing preview. Rotated artwork is left unclipped rather than applying an incorrect axis-aligned crop.
- Warnings currently cover critical content outside safe margin, content crossing the assigned panel boundary, and background artwork that fails to cover required bleed.

## Verification
Fresh full workspace verification requires Node 20 and installed workspace dependencies. The provided extraction had no `node_modules`; the available runtime was Node 22, so `npm run typecheck` stopped on missing third-party modules before a trustworthy full verification could be completed.
