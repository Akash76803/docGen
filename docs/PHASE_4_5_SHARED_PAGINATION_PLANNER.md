# Phase 4.5 — Shared Pagination Planner / Boundary Guard

## Goal
Make one renderer-agnostic pagination planner the source of truth for boundary decisions in the low-level PDF engine and the shared HTML print path.

## Added
- `packages/renderer-sdk/src/pagination.ts`
  - `PageCapacity`
  - `PaginationPolicy`
  - `PaginationItem`
  - `PlannedPage`
  - `resolvePageCapacity()`
  - `requiredPlacementHeight()`
  - `canPlace()`
  - `paginate()`
  - `PAGINATION_SAFETY_GAP_MM = 3`
  - `PAGINATION_EPSILON_MM = 0.1`
  - HTML/PDF parity tolerance = 2 mm
- PDF Data Table adapter now measures first, maps rows/footer rows into shared pagination items, calls `paginate()`, then draws planned pages.
- Final data row reserves the complete table footer + bottom margin before placement.
- Runtime `PAGINATION_OVERFLOW` guard prevents drawing inside the reserved footer zone.
- HTML exact-print path now waits for image decode, measures rendered rows, uses the same shared planner, and annotates planned continuation-row breaks before calling `window.print()`.
- HTML measurement host is offscreen but layout-active; it never uses `display:none` during measurement.
- Custom-grid rowspan measurement uses deterministic last-covered-row remainder propagation.

## Parity Policy
DOM and low-level font metrics can differ. QA parity accepts up to 2 mm measurement divergence where it does not change the intended keep-together/page-boundary decision. A break-point divergence must be documented and treated as a bug unless caused by an unsupported browser print limitation.

## Verification performed in sandbox
- renderer-sdk TypeScript build PASS
- renderer-pdf TypeScript build PASS
- shared planner runtime: last row + footer lookahead moves together PASS
- modified Templates/TemplatePreview/HTML pagination helper syntax transpilation PASS
- full desktop typecheck not available because extracted sandbox has no React/lucide dependencies installed

## Next validation on developer machine
Run:

```bash
npm install
npm run build
npm run typecheck
npm test
```

Then run the QA boundary matrix, especially exact-fit, 99%, 101%, last-row-fits-but-total-does-not, 2/3/10-page invoices, long text rows, image rows, and HTML-vs-engine page-break parity.
