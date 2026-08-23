# Phase 4.0 - PDF Core + Multi-page Pagination Foundation

Implemented a real, dependency-free PDF writer in `@document-tool/renderer-pdf` that consumes the resolved `RenderModel`.

## Implemented
- Real `%PDF-1.4` output (`Uint8Array`), replacing the old mock renderer.
- A0-A10, B0-B6, Letter, Legal, Tabloid, Ledger, Executive and Custom sizes via the shared page registry.
- Portrait/Landscape, margins, page background and page border.
- Text, fields, dividers, spacers, row/cell layout, data tables, summary tables and custom-grid drawing.
- Automatic body pagination.
- Multi-page data tables with row-safe page breaks.
- Table header repetition on each continuation page when `showHeader=true`.
- Template header/footer repetition on generated pages.
- Table footer rows render only after the final data row.
- Header/border visibility settings are respected.
- Desktop Template Designer actions: Generate PDF, Open PDF and Download PDF.

## Current Phase 4.0 limitations
- Raster image bytes are not embedded yet; image blocks render a controlled placeholder/alt text. Real PNG/JPEG embedding is Phase 4.1.
- Built-in PDF fonts use Helvetica/Times/Courier fallbacks; full Unicode/custom-font embedding is Phase 4.1.
- Page `X of Y` numbering and a full two-pass page-variable engine are Phase 4.2.
- Tables nested inside a row/cell are treated as keep-together blocks in this foundation; top-level data tables paginate row-by-row.
- Extremely tall single rows are not split across pages yet.

## Verification
A smoke PDF with 80 item rows generated two valid A4 pages, repeated the document header/footer, repeated the table header on page 2, and was successfully parsed by `pdfinfo` and rendered to PNG using the PDF skill renderer.
