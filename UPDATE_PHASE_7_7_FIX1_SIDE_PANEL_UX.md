# Phase 7.7 Fix 1 — Side Panel UX / Scroll Repair

## Problem fixed
On short desktop/laptop windows, the Elements palette and right Inspector could extend below the visible designer area while their nested scroll containers were not reliably constrained. This made lower shapes and Shape Text controls appear inaccessible.

## Changes
- Constrained left panel, inspector layout, inspector body and rails with `min-height: 0`, `max-height: 100%` and hidden outer overflow.
- Made left library and right inspector explicit vertical scroll containers with stable scrollbar gutters and bottom breathing room.
- Added visible, usable scrollbar styling.
- Made the Elements library denser (62px tiles; 58px on short windows) so more tools are visible before scrolling.
- Added responsive panel widths for narrower desktops.
- Prevented inspector grids, textareas, inputs and controls from overflowing horizontally.
- Added a focused CSS regression test.

## Scope
No geometry, export, snapping, trimmer, face-split, mirror or document-model behavior was changed.
