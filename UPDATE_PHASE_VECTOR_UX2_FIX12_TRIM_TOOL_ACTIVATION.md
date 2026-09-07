# VECTOR-UX2 Fix12 — Dedicated Trim Tool Activation

## Goal
Expose the enhanced Fix11 CAD Trimmer as an obvious first-class **Trim** tool in the Utility panel.

## Changes
- Renamed the former ambiguous **Erase Segment** tile to **Trim**.
- Moved Trim directly next to **Scissors**, before **Split**, so related path-cutting tools are grouped together.
- Added a dedicated trim/cut SVG icon instead of the generic interval icon.
- Tooltip explains one-click smart trim and Shift+click manual A/B trim.
- Keyboard shortcut `T` is now labelled **Trim**.
- Status bar and micro-hint now consistently say **TRIM**.
- Search accepts `trim`, `trimmer`, legacy `erase segment`, and `path eraser`.
- No geometry behavior was changed; Fix11 smart-trim engine remains authoritative.

## Expected Utility ordering
`Edit Path | Scissors | Trim | Split | Freeform Eraser ...`

## Testing
- Targeted TypeScript transpile for ElementLibraryPanel, designerShortcutRegistry, CardDesigner, and Fix12 test source.
- Source marker checks for visible Trim tile, `TRIMMER` activation, active-state wiring, tooltip, `T` shortcut, search alias, and TRIM status/hint.
- Manual smoke: select Trim -> active tile highlights -> cursor changes -> hover bounded interval -> one click removes -> Ctrl+Z restores.
