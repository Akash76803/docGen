# Phase 9.2 — Professional Editable Sample Template Pack

## Motto

Users should not need to start from a blank canvas. Choose a production sample,
replace or bind its content, preflight it and export it.

## Delivered

- 22 editable samples across 14 categories.
- Employee, student and visitor ID cards.
- Modern and creative business cards.
- Loyalty and premium membership cards.
- Floral/minimal wedding and birthday invitations plus thank-you card.
- QR campaign card, botanical/bottle labels and courier shipping label.
- Retail hang tag, gift voucher and two certificate styles.
- Twelve-item A4 sticker sheet, restaurant table tent and packaging front panel.
- Search by title, category, description, format or tags.
- Category filter and compact visual preview metadata.
- Meaningful element names for Layers and editing.
- Dynamic text binding placeholders for bulk CSV/Excel workflows.
- Format-specific dimensions, bleed, safe area and 300 DPI defaults.
- Real paired Front/Back metadata for all two-sided designs.
- Existing dirty-design replacement confirmation remains active.

## Manual acceptance scenarios

1. Open Card Designer → Professional Templates; verify `22/22` appears.
2. Search `student`; load Student ID and verify two equal CR80 artboards.
3. Verify the artboards show Front/Back roles and the same pair relationship.
4. Select Student Name/ID layers and edit their text independently.
5. Import CSV/Excel fields and bind the provided dynamic text placeholders.
6. Search `wedding`; load both floral and minimal invitations and verify exact sizes.
7. Filter Product Label; load bottle label and verify 100 × 60 mm, 2 mm bleed.
8. Load Shipping Label; verify 100 × 150 mm and editable address/tracking layers.
9. Load Hang Tag; verify 50 × 90 mm paired Front/Back artboards.
10. Load Sticker Sheet; verify 12 independent sticker shapes/text layers.
11. Load Certificate; edit recipient, save/reload and verify layout remains unchanged.
12. With unsaved edits, load another template and verify replacement confirmation.
13. For representative single/two-sided designs, test Undo/Redo and duplicate layers.
14. Export PDF/PNG/JPEG; verify correct artboard count, trim size and visual parity.
15. Use a bound ID sample with multiple rows and verify bulk generation output.
16. Confirm CAD/path tools, Page Format selection and custom presets still work.

## Verification boundary

Automated verification on the delivered source:

- Typecheck: PASS — 0 errors
- Tests: PASS — 195/195 files, 973/973 tests
- Build: PASS — all 17 workspaces; desktop Vite bundle 1699 modules
- Diff whitespace check: PASS
- Existing Vite large-chunk advisory remains non-blocking; build exit code is 0.

Automated validation covers contracts, pairing, metadata, bindings, UI wiring,
type safety and build integration. Windows/Tauri interaction, visual quality and
printer measurement remain manual until executed on the target machine.
