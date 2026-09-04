# Phase 4.16 – Unified Renderer Fidelity

## Goal

Same Template + Same Data must produce semantically identical and visually near-identical output in Live Preview / Exact Print and Native Engine PDF.

## Implemented in this baseline

### 4.16.1 Shared fidelity contract
- Added `packages/renderer-sdk/src/fidelity.ts`.
- Central page geometry resolver (`resolvePageGeometry`).
- Central block frame resolver (`resolveBlockFrame`).
- Central deterministic table-column width resolver (`resolveFidelityColumnWidths`).
- Shared financial/no-wrap classifier (`isFinancialDisplayValue`).
- Semantic column weighting for auto table layouts.
- No renderer may square a block/table width by applying `widthPercent` twice.

### 4.16.2 Unified value presentation
- Template Engine remains the source of formatted display strings.
- Native PDF no longer changes the shared `₹` display value to renderer-specific `Rs.` text.
- Financial strings are classified consistently in Preview and Engine PDF for no-wrap behavior.

### 4.16.3 Unicode / INR strategy
- Core PDF Type-1 fonts do not contain U+20B9.
- Native PDF now renders the rupee glyph through a dependency-free vector fallback while leaving the shared display string unchanged.
- This removes the previous `₹ -> Rs.` semantic divergence without bundling a proprietary font.
- Future custom-font embedding can replace the vector fallback without changing the presentation contract.

### 4.16.4 Shared table width behavior
- Data tables and Summary tables in Native PDF now use the shared fidelity width resolver.
- Explicit percentages remain authoritative ratios.
- Auto columns receive remaining space using semantic weights/minimum content width.
- Financial values contribute a natural minimum width and stay on one line.
- Total configured table width is preserved; content cannot expand the table outside its block.

### 4.16.5 Row/text measurement hardening
- Financial values are measured as a single line in Engine PDF.
- Font measurement uses the same PDF Core-14 AFM metrics used by the actual native PDF fonts.
- If a numeric/currency value is wider than its cell, Engine PDF fits font size rather than splitting digits vertically.

### 4.16.6 Shared page geometry
- Live Preview / Exact Print and Engine PDF now resolve physical page size/margins through `resolvePageGeometry`.
- Engine content width is derived from the shared physical contract.
- Header/footer/body block frames use the same width/alignment/margin resolver.

### 4.16.7 Header/footer
- Existing repeated/flow/last-page footer policies remain unchanged.
- Repeated header/footer margins are applied during both measurement and drawing.

### 4.16.8 Block coverage
Existing renderer paths continue to cover Text, Field, Image, Row/Grid, Box, Data Table, Summary Table, Custom Grid, Divider, Spacer and QR. Phase 4.16 centralizes the geometry/table/value decisions that previously caused the largest Exact-vs-Engine divergence.

### 4.16.9 Pagination
- Existing shared stable pagination policy remains in use.
- Preview continues to measure browser physical layout; Engine continues deterministic native measurement.
- Page geometry and numeric/table measurement are now closer by construction.

### 4.16.10 Combined PDF
- Engine Combined PDF continues to append pages produced by the exact same single-document native layout path; it does not independently re-layout a document.
- Exact Combined Print remains isolated to printable roots; UI drawers are excluded from print.

### 4.16.11 Regression gates
Added:
- `npm run test:renderer-fidelity`
- `npm run smoke:renderer-fidelity`
- renderer-sdk contract tests
- renderer-pdf fidelity tests
- deterministic smoke fixture for A4 margins, table widths, INR values and numeric preservation

## Current verification in the implementation sandbox

- `@document-tool/renderer-sdk` build: PASS
- `@document-tool/renderer-pdf` build: PASS
- Phase 4.16 direct smoke: PASS
- Existing Phase 4.8 PDF production-freeze smoke: PASS (3 pages; fidelity diagnostics emitted)
- Existing Phase 4.9 Combined PDF smoke: PASS (single-vs-combined pagination parity, mixed page sizes, image namespacing, cancellation and fail-fast behavior)
  - A4 content width: 180 mm for 16/14 mm horizontal margins
  - shared table widths total exactly 600 units
  - `Rs.` renderer substitution absent
  - numeric payload preserved
  - INR display classified as financial/no-wrap
- Full monorepo build is environment-blocked by missing third-party packages in the extracted sandbox (`xlsx`, `papaparse`, `zod`, React/lucide types). This is not a renderer TypeScript failure.
- Vitest process could not complete in the sandbox runtime; run the listed regression commands in the Windows workspace.

## Production freeze gate

Do not mark Phase 4.16 production-frozen until the Windows workspace passes:

```powershell
npm install
npm run build
npm run typecheck
npm test
npm run test:renderer-fidelity
npm run smoke:renderer-fidelity
npm run test:pdf-freeze
npm run test:combined-pdf
```

Then visually compare the same real-world fixture in Exact and Engine modes for:
- page margins / physical bounds
- product table
- tax summary
- amount summary
- QR/image bounds
- header/footer
- page count and breaks

The real-world invoice is a regression fixture only; the fidelity contract is document-type neutral and must also be tested with a report, certificate, letter/card and long multi-page table before production freeze.
