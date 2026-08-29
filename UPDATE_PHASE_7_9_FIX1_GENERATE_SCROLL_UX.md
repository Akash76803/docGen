# Phase 7.9 Fix 1 — Generate Page Scroll / UX

## Scope
- Fix Generate page vertical scrolling inside the application shell.
- Keep the sidebar fixed while the main workspace scrolls independently.
- Reduce vertical space used by the upload drop zone after a source file is selected.
- Preserve all Generate import, preview, mapping, grouping and persistence behavior.

## Root Cause
`body` is intentionally viewport-locked with `overflow: hidden`, while the newer `dg-app-shell` used only `min-height: 100vh`. The main content therefore had no bounded flex height for its `overflow-y: auto` scroller.

## Fix
- Bound `dg-app-shell` and `dg-app-main` to the viewport.
- Add `min-height: 0` to the flex chain so `dg-app-content` can shrink and scroll.
- Keep horizontal overflow clipped and vertical overflow scrollable.
- Add stable scrollbar gutter / contained overscroll.
- Make the selected-file upload zone compact while retaining click/drop replacement behavior.
- Add sensible Generate page max width and bottom breathing room.

## Compatibility
No data model, datasource, mapping, grouping, export, Card Designer, QR/barcode or persistence behavior was changed.
