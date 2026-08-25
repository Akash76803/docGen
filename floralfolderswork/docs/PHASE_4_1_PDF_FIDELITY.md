# Phase 4.1 — PDF Fidelity Fix

This patch focuses on matching the renderer-ready Template Preview more closely in generated PDFs without changing business calculations or template semantics.

## Fixed
- Text LEFT/CENTER/RIGHT alignment now uses the available block width.
- Text wrapping uses width-based character measurement instead of a fixed character count.
- Background text blocks receive vertical breathing room so strips do not clip text.
- Data-table header height is content-driven and wrapped headers are vertically centered.
- Data rows and footer rows are content-driven and preserve configured alignment.
- Summary-table rows auto-grow for wrapped labels and values (including amount-in-words rows).
- Row/Grid cells measure padding and content, and honor TOP/CENTER/BOTTOM vertical alignment.
- Custom-grid row heights are content-driven; empty rows are compact instead of fixed at 10 mm.
- Custom-grid rowspan content contributes to spanned-row height.
- JPEG DATA_URL images are embedded directly in the PDF.
- PNG/WEBP DATA_URL images are converted to JPEG using browser raster APIs before PDF embedding when available.
- Image aspect ratio and LEFT/CENTER/RIGHT placement are respected.
- Common punctuation is normalized instead of rendering as `?` for basic Type1-font compatibility.
- Multi-page data-table splitting and repeated table headers remain intact.

## Deliberately deferred
- Full Unicode/custom-font embedding.
- Splitting a single extremely tall row across pages.
- Pagination of a large table nested inside a Row/Cell.
- Page X of Y two-pass numbering.
