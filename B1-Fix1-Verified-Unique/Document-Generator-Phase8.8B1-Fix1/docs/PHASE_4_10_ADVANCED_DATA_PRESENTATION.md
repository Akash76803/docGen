# Phase 4.10 — Advanced Data Presentation & Dynamic Table Columns

## Goal
Phase 4.10 moves display logic out of ad-hoc renderer code and into reusable TemplateDefinition → TemplateEngine → RenderModel contracts. Preview, Exact Print, Engine PDF, Combined Engine PDF and Combined Exact Print all consume the same resolved values.

## Implemented capabilities

### 1. Reusable display formatting
`DisplayFormatDefinition` is reusable by Dynamic Fields and Data Table columns.

Supported modes:
- RAW
- NUMBER
- INTEGER
- PERCENT
- CURRENCY

Percentage supports two source semantics:
- `FRACTION`: `0.18 → 18%`
- `WHOLE`: `18 → 18%`

Precision is configurable (0–8). Percentage defaults to 0 decimals so common GST values show as `18%`, not `18.00%`.

### 2. Conditional Data Table columns
A column can carry a document-level `VisibilityCondition`.

Operators:
- EQUALS / NOT_EQUALS
- IS_EMPTY / NOT_EMPTY
- GREATER_THAN / GREATER_OR_EQUAL
- LESS_THAN / LESS_OR_EQUAL
- IN (contract support; UI can be expanded later)

The condition is evaluated once against document/header/root data. The entire column is included or removed before RenderModel generation. This keeps table geometry and pagination deterministic.

Example: show IGST only when `gst.type = IGST`; show SGST/CGST only when `gst.type = LOCAL`.

### 3. Custom/generated Data Table columns
`TableColumnKind`:
- SOURCE
- FORMULA
- STATIC_TEXT
- ROW_NUMBER
- IMAGE
- QR

FORMULA uses the existing safe formula parser; JavaScript `eval` is not used. Formula context is the current row, so `{{qty}} * {{rate}}` resolves independently per item.

IMAGE and QR resolve their source/value from the current row path, so a product/row id can drive a row-specific visual.

### 4. Offline QR generation
QR generation does not call a remote API. A vendored MIT QR matrix encoder generates an SVG Data URL in TemplateEngine.

Preview/Exact Print render the SVG directly. Engine PDF additionally draws generated QR SVG modules as vector PDF rectangles, so QR rendering is not dependent on browser image rasterization.

Configurable QR settings currently include:
- Error correction L/M/Q/H
- Width / height in mm
- Quiet-zone margin in contract

### 5. Data Table header colSpan
Normal repeating Data Tables now support optional grouped headers (`headerGroups`). A group specifies:
- label
- start column
- colspan
- alignment/style

Example: `Tax Details` spanning CGST + SGST + IGST.

Footer colSpan already existed. Phase 4.10 also makes footer cells position-aware by `columnId`, which prevents totals shifting when a conditional column is hidden.

### 6. Grid rowSpan / colSpan status
Custom Grid retains full rowSpan + colSpan support, including deterministic merged-cell height propagation.

Normal repeating Data Table **dynamic body rowSpan is intentionally not enabled in Phase 4.10**. A row merge can cross a PDF page boundary, so a naive HTML-style rowspan would violate the existing no-split pagination guarantees. A future page-aware grouped-row merge feature should split groups only at safe boundaries and repeat/continue labels by explicit policy.

## Architecture

```text
TemplateDefinition
  ├─ DisplayFormatDefinition
  ├─ VisibilityCondition
  ├─ TableColumnKind
  ├─ Header Groups
  └─ QR options
        ↓
TemplateEngine
  ├─ evaluate document-level visibility
  ├─ resolve each row's custom columns
  ├─ format percentage/number/currency
  ├─ evaluate row formula
  └─ generate offline QR SVG
        ↓
RenderTableBlock
  ├─ only visible columns
  ├─ already-formatted text values
  ├─ row image/QR sources
  └─ resolved header groups
        ↓
Preview / Exact Print / Engine PDF / Combined PDF
```

Renderers do not decide GST rules, percentages, formula values, or conditional business visibility.

## Edge-case policy

1. Missing visibility field: normal comparison evaluates false; `IS_EMPTY` evaluates true.
2. Non-numeric value with numeric comparison: condition evaluates false rather than throwing.
3. Percentage value not numeric: original source text is preserved.
4. Zero percentage: renders `0%`.
5. Negative percentage: supported (`-5%`).
6. Fraction percentage over 1: mathematically scales, e.g. `1.25 → 125%`; designer chooses WHOLE if source already stores 125.
7. Formula divide-by-zero: existing safe formula error handling prevents invalid numeric output; row cell resolves blank rather than crashing the full document.
8. Missing image/QR source: cell remains blank.
9. Very large QR payload: QR encoder throws through TemplateEngine render protection; document does not silently emit a fake code.
10. Conditional column hidden with footer total: footer cell is removed/repositioned using visible column ids.
11. Header group whose start column is hidden: group is omitted rather than spanning the wrong columns.
12. Header group colspan exceeds remaining visible columns: clamped at RenderModel resolution; invalid design-time settings are rejected by validator.
13. Generated column with no data path: ROW_NUMBER / STATIC / FORMULA are valid without a source path.
14. SOURCE / IMAGE / QR with invalid path: validation error.
15. Dense/narrow image/QR column: visual size is bounded by cell width in Preview/PDF.
16. Multi-page table: same repeated table header, grouped header and row measurement path is reused.
17. Combined PDF: each invoice independently resolves its conditions/custom columns, preventing stale visibility from the previous invoice.
18. Legacy templates: `kind` and `format` are optional; omitted values preserve old SOURCE/RAW behavior.

## Test matrix

- TC-410-001: 0.18 FRACTION percentage → 18%
- TC-410-002: 18 WHOLE percentage → 18%
- TC-410-003: decimal percentage precision
- TC-410-004: currency formatting
- TC-410-005: LOCAL invoice hides IGST
- TC-410-006: IGST invoice hides local-only column
- TC-410-007: missing condition field
- TC-410-008: numeric visibility comparison
- TC-410-009: row number increments 1..N
- TC-410-010: static text column repeats per row
- TC-410-011: row formula Qty × Rate
- TC-410-012: formula with zero/missing values
- TC-410-013: row image Data URL
- TC-410-014: QR generated from row id
- TC-410-015: QR is vector-rendered in Engine PDF
- TC-410-016: header group colspan
- TC-410-017: conditional hidden start column omits header group
- TC-410-018: footer total remains under intended column after hidden column
- TC-410-019: multi-page table repeats grouped + leaf headers
- TC-410-020: numeric no-wrap regression
- TC-410-021: Preview vs Exact Print parity
- TC-410-022: Single Engine vs Combined Engine same resolved columns
- TC-410-023: legacy SOURCE columns unchanged
- TC-410-024: Custom Grid rowSpan/colSpan regression
- TC-410-025: invalid generated-column config rejected

## Reusability / future-proofing

The same `DisplayFormatDefinition` can later be extended with DATE/DATETIME, locale, accounting, scientific, mask, phone and custom numeric patterns without renderer changes.

`VisibilityCondition` should later evolve into a reusable RuleExpression tree (`AND`/`OR` groups), shared by blocks, rows, columns and styling. Phase 4.10 intentionally starts with one deterministic condition per column.

`TableColumnKind` can later add BARCODE, LINK, ICON, STATUS_BADGE and LOOKUP_DISPLAY without changing the repeating-table data model.

A future `ROW_MERGE` / grouped rowSpan feature must be pagination-aware. Recommended contract should define merge key, page-break continuation policy and whether the label repeats on a continuation page.

## Release commands

```bash
npm install
npm run build
npm run typecheck
npm test
npm run test:pdf-freeze
npm run test:combined-pdf
npm run test:advanced-table
npm run smoke:advanced-table
npm run dev
```
