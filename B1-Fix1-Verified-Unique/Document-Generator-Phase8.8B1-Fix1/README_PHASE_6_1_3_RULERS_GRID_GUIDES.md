# Phase 6.1.3 — Rulers, Grid & Guides

## Scope delivered
- Top and left rulers on Card Designer artboards.
- Ruler scale follows the artboard display unit (mm/in).
- Zoom-aware ruler tick density.
- Show/hide rulers.
- Editor-only visible grid.
- Configurable grid spacing.
- Separate Snap Grid and Snap Guides controls.
- Drag from top ruler to create a vertical guide.
- Drag from left ruler to create a horizontal guide.
- Drag existing unlocked guides to reposition them.
- Double-click unlocked guide to delete it.
- Per-guide position editing, lock/unlock and delete in Artboard Properties.
- Lock/unlock all guides from canvas toolbar.
- Clear unlocked guides from canvas toolbar.
- Guide CRUD is history-compatible through the existing Card Designer mutation/history path.
- Existing Phase 6.1.2 smart-snapping engine consumes authored guides.
- Grid/rulers/guides remain editor aids; they are not added to the renderer model.

## Shared engine additions
`packages/design-engine/src/guides.ts`
- `addGuide`
- `moveGuide`
- `deleteGuide`
- `setGuideLocked`
- `setAllGuidesLocked`
- `clearGuides`

Guide positions are clamped to the active artboard bounds. Locked guides cannot be moved or deleted accidentally.

## Tests / smoke
Added:
- `packages/design-engine/test/phase613-rulers-grid-guides.test.ts`
- `scripts/phase613-rulers-grid-guides-smoke.mjs`
- root scripts `test:card-guides` and `smoke:card-guides`

Executed in the extracted package:
- `npm run build -w @document-tool/contracts` — PASS
- `npm run build -w @document-tool/design-engine` — PASS
- `node scripts/phase613-rulers-grid-guides-smoke.mjs` — PASS
- Design-template validation + JSON serialization with horizontal/vertical guides — PASS
- TypeScript syntax transpilation of updated CardDesigner and guide engine — PASS

Full workspace Vitest / desktop typecheck was not executable in the extracted ZIP because third-party workspace dependencies (React, Zod, Vitest, Tauri APIs, etc.) are not bundled in the package. Run the normal project gates after extracting over the real repository.

## Recommended Windows verification
```powershell
npm install
npm run typecheck
npm run build
npm run test:card-guides
npm run smoke:card-guides
npm run test:card-snapping
npm test
npm run dev
```

## Manual UI smoke
1. Open Card Designer and toggle Rulers on/off.
2. Change artboard display unit between mm and inches; ruler labels should follow it.
3. Toggle Grid and change Grid spacing.
4. Enable Snap Grid and drag an element near a grid line.
5. Drag from the top ruler into the artboard; a vertical guide should be created.
6. Drag from the left ruler; a horizontal guide should be created.
7. Drag an element near a guide with Snap Guides enabled; it should snap.
8. Disable Snap Guides; guide snapping should stop while other smart snapping remains available.
9. Drag an unlocked guide to reposition it.
10. Lock a guide from Artboard Properties and confirm it cannot be dragged/deleted.
11. Unlock it, edit its exact position and delete it.
12. Undo/redo guide creation, move and deletion.
13. Save, restart and confirm guides persist with the template.
14. Export/preview and confirm rulers/grid/guides are not rendered into document artwork.
