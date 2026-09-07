# VECTOR-UX2 Fix11 — Professional CAD Trim UX

## Goal
Make Trim behave like a fast CAD editing tool: hover the bounded segment that will be removed, see an exact live preview, then click once to trim it.

## Implemented
- Added snapshot-level caching for Paper.js intersection-derived trim intervals so pointer-move does not rebuild the complete intersection topology on every frame.
- Consolidated hover candidate evaluation through one `updateTrimCandidate(...)` flow.
- Normal click on a valid hovered interval now trims immediately as one undo/redo transaction.
- Manual A/B range trim remains available explicitly through **Shift+click** (or when a manual range is already in progress).
- Removed the misleading blue full-segment fallback that previously looked trimmable even when no bounded interval existed.
- Added dedicated scissors-style Trim cursor plus active candidate cursor state.
- Replaced cubic hover preview approximation with an exact De Casteljau sub-curve preview.
- Made trim preview and manual-range highlight stroke widths zoom-consistent.
- Added a compact Trim HUD describing one-click Trim and Shift+click manual A/B.
- Existing Scissors, Split, Edit Path, node snapping, intersection snapping, undo/redo and fragment-aware trim commit paths are preserved.

## Testing performed
- `CardDesigner.tsx` targeted TypeScript transpile: PASS.
- Fix11 test source targeted TypeScript transpile: PASS.
- Fix11 source-marker harness: PASS for cache wiring, single candidate updater, direct click trim, Shift manual mode, active cursor, exact cubic preview, legacy fallback removal, and zoom-consistent candidate styling.
- Existing Vitest targeted run was attempted but timed out in the extracted environment; no Vitest PASS is claimed.
- Design-engine workspace build was attempted but blocked before source checking by missing local `@types/*` packages (including node/react/paper/etc.); no full build PASS is claimed.

## Manual acceptance
1. Draw/cross a LINE or POLYLINE with two boundaries so a bounded middle piece exists.
2. Activate Trim.
3. Hover the bounded piece: only that exact interval should highlight red/orange and cursor should switch to active scissors.
4. Click once: highlighted piece should be removed immediately.
5. Undo: complete original geometry should restore in one step.
6. Shift+click two trim points: manual A/B range workflow should remain available.
7. Repeat at 50%, 100%, 200%, 400% zoom: hit area and preview thickness should remain usable/consistent.
8. Test a cubic PATH: hover preview should follow the exact curve, not a quadratic approximation.
