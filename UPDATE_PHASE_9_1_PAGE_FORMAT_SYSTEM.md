# Phase 9.1 — Professional Page Size & Format System

## Delivered

- 38+ production presets across Cards, Folded & Tent, Labels, Tags, Stickers and Paper.
- Business cards (EU/India/US), CR80, playing card, postcards and invitations.
- Product/bottle/shipping labels, hang tag, round sticker and A4 sticker sheet.
- A0–A10, B0–B6, US Letter, Legal and Tabloid.
- Search by name, category and tags such as wedding, membership, barcode or inch.
- Portrait/landscape selection before applying a preset.
- Format-specific bleed, safe-area and 300 DPI defaults.
- Preset identity/layout retained in artboard metadata.
- Custom preset save/list/delete backed by versioned local persistence.
- Manual width/height and mm/in display remain available.
- Existing Create Back Side, artboard pairing, guides, print settings and export remain intact.
- Fix1: choosing a format or orientation now applies immediately to the canvas; the Apply Format button remains available for an explicit re-apply.

## Automated checks

Executed result on the delivered source:

- Typecheck: PASS — 0 errors
- Tests: PASS — 193/193 files, 967/967 tests
- Build: PASS — all 17 workspaces; desktop Vite bundle 1699 modules
- Diff whitespace check: PASS
- Vite reports the existing large-chunk advisory; build exit code is 0.

Run from the repository root:

```powershell
npm install
npm run typecheck
npm test -- --run
npm run build
git diff --check
```

## Manual acceptance scenarios

1. Open Card Designer with no object selected and verify **Page Format** appears.
2. Search `business`; apply 90 × 50 in Landscape; verify size, 3 mm bleed and 3 mm safe area.
3. Search `wedding`; apply 5 × 7 Invitation in Portrait; verify 127 × 177.8 mm.
4. Filter Paper; apply A4 Portrait, then Landscape; verify 210 × 297 and 297 × 210 mm.
5. Filter Labels; apply Shipping Label; verify 100 × 150 mm and zero bleed default.
6. Apply CR80, choose **Create Back Side**, and verify Front/Back share one pair and exact size.
7. Enter a unique custom width/height, click **Save Current**, reload the app, filter **My presets**, and apply it.
8. Delete the saved preset and reload; verify it does not return.
9. Switch display unit mm ↔ inches; verify physical dimensions do not change.
10. Verify the 300 DPI pixel readout updates after format and dimension changes.
11. Add text/image/QR/barcode, change format, Undo/Redo, save/reload and confirm content remains editable.
12. Export PDF/PNG/JPEG and verify the selected trim dimensions; guides/safe zones must remain editor-only.

## Known verification boundary

Automated typecheck/tests/build validate contracts and wiring. Windows/Tauri visual behavior and printer measurement remain manual acceptance items and must not be marked PASS until executed on the target machine.
