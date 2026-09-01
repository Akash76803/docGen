# Phase 8.5 Fix5 — Path Toolbar UX + Home Navigation

## Status
Source implementation complete. Manual UI verification: PENDING.

## Baseline
Phase 8.5 Fix4 — Smart Guides & Symmetry.

## Changes
- Reworked Edit Path contextual toolbar into compact logical groups:
  - Nodes
  - Symmetry
  - Node Type
  - Segment
  - Tools
- Symmetry Off/H/V stays on one horizontal segmented control.
- Selected node count shown as a compact badge.
- Node actions use shorter labels to reduce toolbar width.
- Page-level Mirror H/V controls are hidden while actively editing a PATH to avoid unrelated clutter.
- Context toolbar now supports horizontal overflow rather than wrapping/breaking controls.
- Responsive rule hides group labels on narrower screens while preserving all controls.
- Restored Home icon in DesignerHeader.
- Wired CardDesigner `onBack` to App navigation so Home returns to the dashboard.

## Regression intent
No geometry, PATH mutation, OSNAP, Split, Face Split, Trimmer, Boolean, Smart Guide or symmetry math was changed in this fix.

## Verification
- DesignerContextToolbar.tsx transpile: PASS
- DesignerHeader.tsx transpile: PASS
- CardDesigner.tsx transpile: PASS
- App.tsx transpile: PASS
- Manual UI verification: PENDING
