# Phase 4.9 — Multi-Invoice Combined PDF + Break-Safe Rendering

## Goal
Generate one physical PDF from multiple `DocumentGroup`s while keeping every invoice as an isolated document. A new invoice always starts on a fresh PDF page. Combined mode reuses the exact Phase 4.8 low-level Engine PDF layout/pagination path; it does not concatenate RenderModel bodies and it does not implement a second pagination algorithm.

## Architecture

```text
Selected DocumentGroup IDs (ordered)
        ↓
Lazy per-group resolver
        ↓
ONE active DocumentGroup
        ↓
TemplateEngine → RenderModel
        ↓
existing layoutPdfDocument()
        ↓
existing table/row/trailing-section pagination rules
        ↓
physical PdfPage[] for that invoice
        ↓
append to one combined PDF writer
        ↓
release RenderModel / hydrate next group
```

The coordinator retains only already-drawn PDF page operations, lightweight page metadata and PDF image resources. It does not retain all source RenderModels.

## Implementation

### Renderer lifecycle
`PdfRenderer.render()` and `CombinedPdfRenderer.render()` now share `layoutPdfDocument()`. This is the same low-level renderer path for header/footer measurement, table pagination, final-row/footer guard, atomic trailing section, numeric no-wrap, grids, boxes and page sizing.

### CombinedPdfRenderer
Exports:
- `CombinedPdfRenderer`
- `CombinedPdfDocumentSource`
- `CombinedPdfOptions`
- `CombinedPdfProgress`
- `CombinedPdfResult`
- `CombinedPdfError`

`CombinedPdfDocumentSource` supports a lazy `resolve()` callback so the desktop app can hydrate and build one RenderModel at a time.

### Document boundaries
Each invoice layout starts with a fresh renderer context and its own first physical page. No unused space from Invoice A is offered to Invoice B. No blank separator page is inserted.

### Header/footer isolation
Every document gets its own:
- FIRST/MIDDLE/LAST pagination context
- repeat-header behavior
- repeated table headers
- footer mode (`REPEAT_PAGE`, `FLOW`, `LAST_PAGE_ONLY`)
- trailing-section decision

Therefore `LAST_PAGE_ONLY` means the last page of that invoice, not only the last page of the combined file.

### Page numbering
Two modes:
- `PER_DOCUMENT` (default): each invoice prints `Page 1 of N`, `Page 2 of N`, etc.
- `GLOBAL`: after all page counts are known, physical pages print `Page X of TOTAL_COMBINED_PAGES`.

Global mode retains only lightweight page/document metadata; full RenderModels are not retained.

### Mixed page sizes
The PDF writer already emits a `MediaBox` per physical page. Combined mode therefore supports A4 Portrait, Landscape, A3, Letter, custom sizes, etc. in the same final PDF without resizing earlier pages.

### Images
Each isolated document begins image resource numbering at `Im1`. Combined mode namespaces those PDF XObject names per invoice (`D1_Im1`, `D2_Im1`, ...) before finalization to prevent resource collisions.

### Failure policy
Current Phase 4.9 policy is **FAIL_FAST**. A failed invoice aborts combined generation and no misleading partial file is returned as success.

Controlled codes:
- `EMPTY_DOCUMENT_SELECTION`
- `DOCUMENT_RENDER_FAILED`
- `COMBINED_PDF_CANCELLED`
- `COMBINED_PDF_FINALIZE_FAILED`

Existing renderer errors such as `TRAILING_BLOCK_EXCEEDS_PAGE` remain visible inside the document-context failure message.

### Cancellation
Cancellation is safe at document boundaries. The current invoice may finish its atomic render operation; generation will not begin the next invoice after cancellation is observed. A cancelled job does not finalize a success result.

## Desktop UX
Template Designer now includes a **Combined PDF** panel:
- group multi-select
- Add Current
- Select All
- Clear
- search/filter (DOM capped to first 300 matches for large group libraries)
- file name
- Per Invoice / Global numbering
- Generate Selected as One PDF
- progress (phase, document count, pages, percent)
- Cancel

Selection order follows the current source group order. Duplicate IDs are deduplicated by the renderer while preserving first occurrence.

## Break-safe release blockers
Phase 4.9 must fail release QA if any of these occur:
- clipped table row
- orphan total row
- orphan group subtotal
- merged Custom Grid cell split incorrectly
- BOX/signature clipped
- QR separated from Bank Details when configured keep-together
- atomic trailing section partially moved
- body/footer overlap
- next invoice starts in previous invoice remaining whitespace
- blank separator page
- stale previous-invoice header/data/footer leaks into next invoice
- wrong page number total
- character-by-character numeric wrapping

## Test matrix

| ID | Scenario | Expected |
|---|---|---|
| TC-COMB-001 | 1 invoice | valid 1-document combined PDF |
| TC-COMB-002 | 2 one-page invoices | exactly 2 pages, fresh page boundary |
| TC-COMB-003 | mixed 1/3/2-page invoices | deterministic contiguous page ranges |
| TC-COMB-004 | exact bottom capacity | next invoice still starts fresh page |
| TC-COMB-005 | last row + table total boundary | same Phase 4.8 keep-together behavior |
| TC-COMB-006 | grouped subtotal boundary | subtotal not orphaned |
| TC-COMB-007 | atomic trailing section | moves together / controlled overflow |
| TC-COMB-008 | long product text | word-wrap + auto row height |
| TC-COMB-009 | numeric values | never char-wrap |
| TC-COMB-010 | Custom Grid rowspan/colspan | no merged-cell corruption |
| TC-COMB-011 | BOX keep-together | no clipping |
| TC-COMB-012 | QR fixed + Bank flex | same row behavior |
| TC-COMB-013 | dynamic header reset | no stale document data |
| TC-COMB-014 | LAST_PAGE_ONLY footer reset | final page of each invoice |
| TC-COMB-015 | per-document numbering | numbering restarts per invoice |
| TC-COMB-016 | global numbering | one continuous X of TOTAL sequence |
| TC-COMB-017 | duplicate group IDs | dedupe, preserve first order |
| TC-COMB-018 | lazy 10/50/100 documents | one active RenderModel at a time |
| TC-COMB-019 | cancellation | controlled cancel, no partial success |
| TC-COMB-020 | one document fails | FAIL_FAST with document ID |
| TC-COMB-021 | mixed page sizes | physical MediaBox preserved per document |
| TC-COMB-022 | repeated images across invoices | no PDF XObject name collision |

## Performance / memory contract
Large source example: 12,753 rows / 2,856 groups. If 50 invoices are selected, only those 50 are resolved sequentially. The combined selector does not create all RenderModels. UI renders at most 300 matching group checkboxes at once; Select All still selects all group IDs without rendering all checkbox nodes.

## Release commands

```bash
npm install
npm run build
npm run typecheck
npm test
npm run test:pdf-freeze
npm run test:combined-pdf
```

Phase 4.8's full regression suite remains mandatory.

## Status
Implementation candidate. Release verification requires the full local monorepo gate plus visual QA of invoice transition pages using real business templates.
