# Phase 9.4G–I — Packaging Orientation, Panel Inspector & Preflight

## Scope
This batch builds on the working Phase 9.4 UX1 Fix1 baseline and preserves panel selection/focus, artwork ownership, fit/fill/contain/bleed-fill, warnings, and any-tool temporary pan.

### 9.4G — Panel Artwork Orientation
- 0° / 90° / 180° / 270° orientation control.
- Orientation is a real design mutation: assigned artwork rotates around the panel center.
- Panel metadata persists the selected artwork orientation.
- Per-element applied-orientation metadata prevents accidental double rotation and upgrades older Phase 9.4 artwork safely.
- New artwork prepared for a panel inherits that panel orientation.
- Orientation changes participate in normal design undo/redo because they modify design state.

### 9.4H — Packaging Panel Inspector
When a packaging panel is selected or focused, the right Inspector shows:
- semantic panel name/type/edge
- width and height
- safe margin
- bleed
- artwork orientation
- assigned artwork count
- warning count
- Enter/Exit Panel
- Select Artwork
- Preflight

### 9.4I — Packaging Preflight
Dedicated preflight checks:
- CUT exists
- CUT paths are closed
- CREASE exists
- CUT/CREASE technical groups are locked
- artwork safe-area / panel-overflow / bleed-coverage warnings
- stale artwork references to missing panels
- informational unassigned-artwork notices

The Preflight dialog reports Error / Warning / Info counts. Only structural Errors make `passed=false`; warnings remain actionable but non-blocking.

## Engine additions
`packages/design-engine/src/packagingArtwork.ts`
- `PackagingArtworkOrientation`
- `PackagingPreflightResult`
- `setPackagingPanelArtworkOrientation(...)`
- `selectPackagingPanelArtworkIds(...)`
- `runPackagingPreflight(...)`

## UI additions
`apps/desktop/src/pages/CardDesigner.tsx`
- Orientation dropdown in focused-panel toolbar
- Preflight button with E/W summary
- Packaging Panel Inspector
- Packaging Preflight dialog

## Automated coverage added
`packages/design-engine/test/phase94-panel-inspector-preflight.test.ts`
- panel artwork quarter-turn rotation + persistence
- inspector artwork-id helper
- safe-area warning included in preflight
- missing CUT produces blocking preflight error

## Manual acceptance
1. Generate a tuck carton.
2. Panels → select FRONT.
3. Confirm Inspector shows FRONT size, safe, bleed, orientation, artwork count.
4. Focus FRONT and add text + image.
5. Change orientation 0° → 90° → 180° → 270° and verify assigned artwork rotates around panel center.
6. Undo/Redo orientation and verify state restores.
7. Save/reopen and verify orientation remains.
8. Select Artwork from Panel Inspector and confirm panel-owned artwork is selected.
9. Move text outside safe area; Preflight should show SAFE_AREA warning.
10. Use background without full bleed; Preflight should show BLEED_COVERAGE warning.
11. Confirm normal generated dieline has no CUT_MISSING error.
12. Existing panel focus, Fit/Fill/Contain/Bleed Fill and any-tool auto-pan should still work.

## Verification status in this environment
- Source and conflict-marker sanity checks performed.
- `npm run typecheck` cannot reach reliable project diagnostics because extracted source has no `node_modules`.
- `npm ci` timed out in this container.
- Container Node is 22.16.0 while project `.nvmrc` is Node 20.
- Full typecheck/test/build must be run on the supported Node 20 Windows environment before release PASS is claimed.
