# Phase 4.4 — Production Pagination Architecture

## Region semantics
- HEADER is the only repeatable document-header region. When Repeat Header is enabled, every block in HEADER repeats as one region.
- BODY is flow content.
- FOOTER supports REPEAT_PAGE, FLOW, and LAST_PAGE_ONLY.
- Legacy `repeatFooter` remains supported for existing saved templates.

## Designer workflow
Top-level blocks can be moved between Header, Body, and Footer. A block such as a registered-office strip that must appear on every page must be placed in Header rather than inferred from Body.

## Pagination rules
- Data-table rows avoid splitting and table headers repeat on continuation pages.
- Block keep-together / break-before / break-after settings remain renderer-level layout settings.
- LAST_PAGE_ONLY footer is measured and kept together at the end of the document.
- Engine PDF page numbers are injected after pagination, so total page count is known.

## Shared HTML print
The exact-print path uses the same document component and explicit header/footer regions. Browser pagination remains responsible for physical page allocation; the region semantics match the engine PDF settings as closely as browser print CSS permits.
