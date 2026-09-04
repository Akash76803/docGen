# Phase 3.6 — Custom Grid Table Designer

Adds a renderer-ready custom/manual grid table without changing the existing data-driven TABLE behavior.

## Features
- New `CUSTOM_TABLE` block, separate from the existing line-item/data table.
- Configurable row and column count (1–100 rows, 1–50 columns).
- Per-cell content: Blank, Text, Dynamic Field, Calculated Value, Image.
- Per-cell Row Span and Column Span.
- Quick Merge Right, Merge Down, and Reset Merge actions.
- Cell background, border, padding, horizontal/vertical alignment.
- Common table border visibility; border defaults ON.
- Width and page alignment controls.
- Dynamic/calculated values flow through TemplateDefinition -> TemplateEngine -> RenderModel -> Preview.
- Custom grid can also be placed inside a Row/Grid cell.

## Backward compatibility
Existing `TABLE` and `SUMMARY_TABLE` contracts and behavior are unchanged. Existing templates load as before.

## Verification performed in implementation environment
- Contracts + Template Engine TypeScript build: PASS.
- Runtime smoke: 2x3 grid with colSpan=2, rowSpan=2, dynamic field, and SUM calculation: PASS.
- TSX syntax parse: no syntax diagnostics (full desktop dependency install unavailable in sandbox).

## Local verification
```bash
npm install
npm run build
npm run typecheck
npm test
npm run dev
```
