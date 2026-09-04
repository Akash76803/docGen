# Phase 4.8 - PDF Production Freeze & Regression Validation

## Status

Implementation complete as a **PDF Production Freeze Candidate**. The low-level PDF core and shared pagination modules compile and runtime smoke/evidence generation pass in this sandbox. Final `PRODUCTION BASELINE / RELEASE VERIFIED` status must be assigned only after the full monorepo `npm install && npm run build && npm run typecheck && npm test` succeeds on the development machine; sandbox dependency installation timed out before React/zod/xlsx/papaparse/vitest dependencies were available.

## Frozen architecture

`RenderModel -> MEASURE -> PaginationItem[] -> shared pagination planner -> DRAW/DOM`

Business values remain resolved before renderers. PDF/HTML renderers do not calculate invoice business logic.

## Production pagination policy

- Safety gap: 3mm
- EPSILON: 0.1mm
- HTML/PDF parity tolerance: +/-2mm
- Keep final table row with footer: enabled
- Keep group subtotal with final group row: enabled
- Trailing block mode: ATOMIC
- Minimum fill target: 20%
- Emergency trailing split: disabled

## Phase 4.8 hardening

### Stable last-page planning

`paginateStable()` was added to renderer-sdk. It reruns planning after the actual LAST-page capacity is known. This prevents a plan from remaining valid only under provisional FIRST/MIDDLE reservations.

### Final row + table footer

The Engine PDF table adapter continues to supply `keepWithNextHeight = tableFooterHeight + bottomMargin` for the last row. The shared planner therefore moves the final row to the next page before drawing when its required follow-up cannot fit.

### Atomic post-table trailing section

Engine PDF detects the normal post-table document tail and measures it before drawing. If the complete tail fits a fresh body but not the current remainder, it starts a fresh page first. If the atomic tail itself exceeds a page and emergency splitting is disabled, it raises `TRAILING_BLOCK_EXCEEDS_PAGE` instead of silently entering the footer region.

### Numeric integrity

Data Table rows, table footer totals, Summary Table values and Custom Grid numeric values use single-line numeric rendering. Low-level PDF shrinks numeric font size within the existing safe minimum instead of character-wrapping numbers.

### Shared exact-print planning

HTML print pre-pagination now uses `paginateStable()` and still waits for image decoding before DOM measurement. Print CSS locks numeric cells to no-wrap and keeps normal document blocks in relative/normal flow.

### Production diagnostics

Engine PDF supports an optional `RenderOptions.options.onDiagnostics` callback containing only:

- templateId
- documentGroupId/groupId when supplied in RenderModel metadata
- pageCount
- renderDurationMs
- warningsCount

Entire business records are not logged.

## Automated regression source tests added

- `packages/renderer-sdk/test/phase48-freeze.test.ts`
- additional boundary/stable-planner cases in `packages/renderer-sdk/test/pagination.test.ts`
- `packages/renderer-pdf/test/phase48-production-freeze.test.ts`
- dependency-free runtime smoke: `scripts/phase48-freeze-smoke.mjs`

The runtime smoke validates pagination constants, last-row/footer placement predicate, repeated headers, multi-page Engine PDF generation, diagnostics and controlled oversized trailing-tail failure.

## Evidence fixtures

Generated in `docs/evidence/pdf-freeze/`:

- `01-single-page.pdf` - 1 page
- `02-two-page.pdf` - 2 pages
- `03-three-page.pdf` - 3 pages
- `04-long-table.pdf` - 10 pages
- `05-custom-grid.pdf` - rowspan/colspan + numeric cell
- `06-qr-bank.pdf` - 30mm fixed QR-like cell + FLEX bank-details cell
- `07-a4-landscape.pdf`
- `08-a3.pdf`
- `09-long-text.pdf`
- `results.json`

PDFs were rendered to PNG with the PDF verification pipeline. The checked two-page and custom-grid outputs showed no clipped table rows, no numeric character wrapping, no footer overlap, correct repeated header/footer, and compact fixed/FLEX QR-bank positioning.

## Performance evidence

Sandbox fixture timings in `results.json` are renderer-only timing snapshots. The 300-row/10-page Engine PDF fixture completed in tens of milliseconds in this sandbox. Treat these as relative smoke metrics, not hardware-independent SLAs.

## Full monorepo verification note

`npm install --ignore-scripts` exceeded the sandbox time limit. Global TypeScript successfully compiled the modified core packages:

- renderer-sdk: PASS
- template-engine: PASS
- renderer-pdf: PASS

A root `tsc --build` then failed because external packages were not installed (`zod`, `xlsx`, `papaparse`, `react`, `lucide-react`), not because of errors reported in the modified renderer core packages.

Run locally before release freeze:

```bash
npm install
npm run build
npm run typecheck
npm test
npm run test:pdf-freeze
```

## Release gate

Do not label Phase 4.8 `PRODUCTION BASELINE / RELEASE VERIFIED` until all five commands above pass on the normal project environment and manual Exact Print vs Engine PDF checks are accepted.

After that gate, PDF architecture should be frozen except for bug fixes and Phase 5 DOCX can start from the same renderer-ready RenderModel contracts.
