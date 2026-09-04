# Phase 8.8A3 Fix6 — Shortcuts Help Panel

## Goal
Make the growing Card Designer/CAD keyboard and mouse controls discoverable from the main designer header.

## Implemented
- Added a `Shortcuts` button to the top Designer header.
- Added a dedicated searchable modal listing currently enabled keyboard and mouse controls.
- Organized shortcuts into General, Selection & Clipboard, Groups, CAD Drawing, Path Editing, and Canvas Navigation.
- Every entry explains what the shortcut does instead of only showing the key combination.
- Modal closes through the Close button, backdrop click, or Escape.
- The shortcut reference includes CAD-specific controls such as F8 Ortho, F10 Polar, dynamic-input Enter/Tab, drawing Escape, wheel zoom, and Space/middle-mouse pan.
- Added a focused source regression test: `apps/desktop/test/phase88a3-fix6-shortcuts-panel.test.ts`.

## Scope safety
No design geometry, snapping, face split, boolean, path topology, export rendering, or persistence behavior was changed in this fix.

## Verification
- Changed TS/TSX syntax/transpile: PASS.
- Focused source assertions: PASS.
- Full workspace build: BLOCKED in the clean sandbox by incomplete inherited type packages (`@types/*` / workspace dependency state); no Fix6-specific source diagnostic was reached.
- Manual UI verification: PENDING.
