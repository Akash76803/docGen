# Phase 3.5 Fix 1 — Summary Calculation Binding Repair

## Problem
Summary/Amount Summary controls rendered correctly but aggregate values could remain `0.00` even after selecting imported fields. The aggregate editor stored only a path string, while imported data may live either in mapped line-item objects or the original source row. Collection-prefixed mapped paths also needed consistent resolution inside each item row.

## Fix
- Aggregate bindings now optionally retain `sourceField` and `targetPath`, matching table-column binding metadata.
- Summary aggregate dropdowns now use all imported/mapped source fields rather than only discovered collection fields.
- Aggregate engine resolves values in this order: selected path, mapped target path, collection-relative path, original imported source header fallback.
- Manual summaries, table footer totals, grouped summaries, and total rows all receive raw source-row fallback context.
- Existing saved Phase 3.5 summaries are hydrated at preview time from the active Generate mapping so users do not have to recreate them.
- Validation accepts a valid source-field/target-path aggregate binding.

## Verification performed in sandbox
- Contracts + Template Engine TypeScript build: PASS
- Templates.tsx syntax transpilation: PASS
- TemplatePreview.tsx syntax transpilation: PASS
- Runtime SUM over raw imported source header fallback: PASS (`100.5 + 249.5 = 350.00`)
- Runtime SUM over collection-prefixed mapped path: PASS (`125 + 75 = 200.00`)

Run full workspace verification locally:

```bash
npm install
npm run build
npm run typecheck
npm test
npm run dev
```
