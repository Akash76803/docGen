# Phase 4.8 Fix 2 — Exact Print / Live Preview Page Parity

## Problem
Live Preview was upgraded to render pre-planned physical pages, but **Print / Save PDF (Exact)** still mounted the legacy continuous `PrintableDocument`. The browser then performed a second independent pagination pass. This could shift a repeated header above/through the page border, change row/page boundaries, or move summaries compared with the designer preview.

## Permanent rule
There is now one HTML page plan:

`RenderModel -> hidden unscaled measurement -> buildPaginatedPreviewPlan() / paginateStable() -> physical planned pages`

Live Preview owns the computed `PreviewPagePlan[]`. Exact Print receives that exact already-computed plan instance and renders it into fixed physical sheets. The browser only prints those sheets; it does not decide invoice page breaks again.

## Implementation
- Exported the shared `buildPaginatedPreviewPlan()` used by Live Preview.
- Added `PaginatedPrintableDocument`.
- Exact Print first renders an off-screen, layout-active measurement document and waits for images/layout.
- The print dialog opens only after planned pages are ready.
- Each planned page has exact resolved page width/height and `break-after: page`.
- Header, table continuation/header, body fragments and footer are already assigned to each page before printing.
- Each page border is absolute to its own page instead of viewport-fixed.
- Legacy `prepareHtmlPrintPagination()` is no longer used by the Exact Print action.

## Acceptance
For the same RenderModel:
- Preview Page N == Exact Print Page N logical contents.
- Header cannot cross the page's top border due to browser repeat positioning.
- No browser-created extra page break inside a planned page.
- No blank separator page.
- Table row fragments are identical to Live Preview planning.
- Exact Print retains the selected physical page size through `@page { margin: 0 }`.

Minor printer/PDF-driver rasterization or font rendering differences remain possible, but logical page assignment is shared.
