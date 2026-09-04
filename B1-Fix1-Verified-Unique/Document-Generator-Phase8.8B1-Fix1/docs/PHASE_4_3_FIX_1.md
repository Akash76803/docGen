# Phase 4.3 Fix 1 — Pagination Correctness

- Fixes blank first page in shared HTML print by allowing the outer pagination body row to split across pages.
- Keeps actual data-table rows non-splittable.
- Collapses fully empty zero-height custom grids in print output.
- Removes full-page min-height reservation from the print wrapper while preserving screen preview sizing.
- Existing repeat header/footer and engine PDF page-number behavior remain unchanged.
