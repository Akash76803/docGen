# Phase 8.8A3 Fix7 — Utility, Shape & Duplicate Shortcuts

## Baseline
Phase 8.8A3 Fix6 — Shortcuts Help Panel.

## Implemented
- Centralized shortcut registry shared by the help modal and runtime keyboard resolver.
- Direct utility-tool shortcuts:
  - V Select
  - L Line
  - P Polyline
  - X Construction Line / XLINE
  - N Pen
  - E Edit Path (eligible selection only)
  - K Scissors (eligible selection only)
  - Shift+S Split
  - T Erase Segment
  - Shift+E Freeform Eraser
  - B Fill Bucket
  - J Join Path (eligible selection only)
  - Shift+C Close Path (eligible selection only)
- Alt-based shortcuts for every drawable shape currently exposed by Card Designer except LINE, which uses L.
- Duplicate enhancements:
  - Ctrl+D — duplicate with existing 2 mm offset.
  - Ctrl+Shift+D — duplicate in place at exact same coordinates.
- Shortcuts modal now displays dedicated `Utility Tools`, `Shapes`, and `Selection, Clipboard & Duplicate` groups.
- Keyboard shortcuts are ignored while typing in form controls/search/dynamic inputs.

## Safety
- No geometry, snap, face-split, trimmer, boolean, export, or persistence engine behavior changed.
- Invalid path-only utility shortcuts do not mutate geometry; status text explains the selection requirement.

## Verification
- Changed TS/TSX transpile: PASS.
- All current non-LINE shape kinds have a unique registered shape shortcut: PASS (37/37).
- Shape shortcut key-combo collision check: PASS.
- Targeted regression source checks: PASS.
- Full workspace build remains environment-dependent and should be run after dependency installation on the Windows project.
- Manual UI verification: PENDING.
