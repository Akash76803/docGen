# Phase 3.5 — Table Totals, Summary Blocks & Tax Tables

## Status
Implemented in source. Full workspace dependency install could not be completed in the sandbox, so final root build/typecheck/test must be run on the target workstation.

## Added
- TABLE `footerRows` contract and resolved RenderModel footer rows.
- Footer calculations: STATIC, FIELD, SUM, COUNT, AVG, MIN, MAX.
- Footer colspan, alignment and text styling.
- New reusable `SUMMARY_TABLE` block.
- Manual summary mode for GST / Net Amount / Freight / Round Off / Grand Total style layouts.
- GROUP_BY summary mode for HSN/GST/tax breakdown layouts.
- Summary columns, rows, total row, width/alignment, border, padding and typography.
- Numeric formatting and number-to-words output for renderer-ready amount-in-words use cases.
- Designer palette `Summary` block.
- Quick Amount Summary and Tax Summary presets.
- Preview support for table footer rows and summary tables.
- Basic Invoice sample demonstrates an item-table total row and amount summary.
- Phase 3.5 engine regression tests.

## Architecture
TemplateDefinition → TemplateEngine → RenderModel → TemplatePreview.

No calculation is implemented as preview-only CSS/React business logic.

## Verification performed in sandbox
- Contracts build: PASS.
- Template Engine build: PASS.
- Template Designer TSX syntax parse: PASS.
- Template Preview TSX syntax parse: PASS.
- Direct TemplateEngine runtime smoke for footer SUM, grouped tax summary and amount-in-words: PASS.
- Full npm install/npm ci: blocked by sandbox timeout.

## Local verification
Run:

```bash
npm install
npm run build
npm run typecheck
npm test
npm run dev
```

## Manual smoke
1. Add/select TABLE → Footer / Total Rows → Add Total Row.
2. Configure static label and SUM Qty/Taxable/Amount cells.
3. Add Summary block → choose Amount Summary preset.
4. Bind rows to imported source fields and aggregates.
5. Add another Summary block → choose Tax Summary preset.
6. Set GROUP_BY path to HSN and aggregate taxable/SGST/CGST/IGST fields.
7. Verify total row and preview styling.
8. Test Format = WORDS for a numeric FIELD/SUM value.
9. Save, reopen and confirm all totals/summary definitions persist.

## Known limitation
Phase 3.5 freezes the summary/totals layout contract; real PDF/DOCX generation and pagination are intentionally deferred to Phase 4.
