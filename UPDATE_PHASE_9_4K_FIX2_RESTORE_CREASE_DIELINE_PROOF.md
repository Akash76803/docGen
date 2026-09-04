# Phase 9.4K Fix2 — Restore CREASE in Dieline Proof

## Problem
A real Aura Dream Straight Tuck End PDF exported after 9.4K Fix1 correctly removed panel annotations, SAFE and BLEED guides, but CREASE/fold lines were also absent. The export filter rejected hidden technical elements before packaging-mode rules could restore them.

## Fix
- DIELINE_PROOF now treats CUT and CREASE as required physical technical geometry and exports them even when their editor layer/element visibility is temporarily off.
- TECHNICAL mode likewise forces CUT, CREASE and ANNOTATION visibility for the exported artboard.
- CLIENT_PROOF and normal artwork retain editor visibility behavior.
- Prepared export artboards trim group memberships to exported elements and force the required technical groups visible, preventing downstream renderers from suppressing them because the editor group was hidden.
- Technical-layer detection now supports metadata, technical group name, and narrow legacy generated element-name fallbacks (`CUT ...`, `CREASE ...`, `... Panel Label`).

## Expected packaging modes
- Client Proof: artwork only.
- Dieline Proof: artwork + CUT + CREASE; no SAFE/BLEED/ANNOTATION.
- Technical View: CUT + CREASE + panel annotations; no artwork.

## Regression coverage
Added a test that explicitly hides CUT and CREASE elements/groups in editor state, prepares a Dieline Proof export, and verifies both physical technical layers are present and forced visible.
