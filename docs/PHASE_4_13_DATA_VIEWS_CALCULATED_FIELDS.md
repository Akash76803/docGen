# Phase 4.13 — Named Data Views + Global Calculated Fields

## Goal
Provide reusable, immutable row filtering and document-level calculations without teaching renderers business logic.

## Architecture

```text
DocumentGroup (immutable)
  ├─ items[]
  └─ sourceItems[]
        ↓
Named Data Views
  views.productLines
  views.freightLines
        ↓
Named Calculated Fields
  calc.productSubtotal
  calc.freightAmount
  calc.grandTotal
        ↓
TemplateEngine RenderModel
        ↓
Preview / Exact Print / Engine PDF / Combined PDF / future DOCX
```

Renderers do not filter source rows or calculate business values.

## Contracts

### Data View
- `id`
- `name`
- `alias`
- `sourcePath`
- optional reusable `VisibilityRule` filter
- resolved path: `views.<alias>`

Data Views can derive from another Data View (`views.productLines`) and are evaluated without mutating the parent collection.

### Calculated Field
- `id`
- `name`
- `alias`
- `AggregateValueDefinition value`
- resolved path: `calc.<alias>`

Calculated values remain raw scalars for maximum reuse. Display formatting belongs to the consumer (Field/Text/Summary/Grid/Table), so the same numeric calculation can be shown as number, currency or percentage in different places.

### Table Row Filter
Every Data Table can optionally apply `rowFilter`. The filter is evaluated per source row before:
1. table row resolution,
2. footer aggregation,
3. pagination.

The original source collection remains unchanged.

## Freight acceptance scenario

Input:
- Product A = 1000
- Product B = 500
- Freight = 200

Definitions:
- `views.productLines = items WHERE type != FREIGHT`
- `views.freightLines = items WHERE type = FREIGHT`
- `calc.productSubtotal = SUM(views.productLines.amount)`
- `calc.freightAmount = SUM(views.freightLines.amount)`
- `calc.grandTotal = calc.productSubtotal + calc.freightAmount`

Expected:
- Product table shows A + B only
- Product table total = 1500
- Freight row remains in original `items[]`
- `calc.freightAmount` = 200
- `calc.grandTotal` = 1700
- `calc.freightAmount` can be used in Rich Text, FIELD, Summary, Custom Grid, BOX children, Header/Footer and visibility rules.

## Condition semantics
Phase 4.12's condition evaluator is reused. Row filters support:
- EQUALS / NOT_EQUALS
- IS_EMPTY / NOT_EMPTY
- GREATER_THAN / GREATER_OR_EQUAL
- LESS_THAN / LESS_OR_EQUAL
- IN
- CONTAINS / NOT_CONTAINS
- STARTS_WITH / ENDS_WITH
- nested ALL/ANY groups
- negate

For a row filter, paths are row-relative (for example `type`, `amount`, `product.code`). Document data remains available in the evaluation context as well.

## Calculation semantics
Existing aggregate/formula operations are reused:
- STATIC
- FIELD
- SUM
- FIRST
- COUNT
- AVG
- MIN
- MAX
- FORMULA

Formula functions remain:
- SUM
- AVG
- MIN
- MAX
- COUNT
- FIRST
- ROUND

Named calculations can depend on earlier named calculations through `calc.<alias>`. Dependency order is resolved automatically.

## Dependency safety
- Duplicate/invalid Data View aliases are rejected.
- Data View source cycles are rejected with `DATA_VIEW_CYCLE`.
- Duplicate/invalid calculated aliases are rejected.
- Calculated-field dependency cycles are rejected with `CALCULATED_FIELD_CYCLE`.
- Source data is never modified by a view/filter.

## Backward compatibility
All new properties are optional:
- old templates have no `dataViews`
- old templates have no `calculatedFields`
- old tables have no `rowFilter`

Therefore old templates retain their previous behavior and require no migration.

## UI
Template settings now expose:
- Data Views / Filtered Collections
- Calculated Fields

Data Views are automatically added to collection selectors as `views.<alias>`.
Calculated Fields are automatically added to field selectors as `calc.<alias>`.
Data Table Properties include a dedicated Row Filter using the same rule editor as Phase 4.12.

## Automated test matrix

| ID | Scenario | Expected |
|---|---|---|
| DV-001 | Freight excluded from table | Freight row not rendered |
| DV-002 | Filtered table footer SUM | Product total excludes freight |
| DV-003 | Original items collection | Freight still exists |
| DV-004 | Reusable freight view | `views.freightLines` contains freight |
| DV-005 | Product subtotal calc | 1500 |
| DV-006 | Freight calc | 200 |
| DV-007 | Grand total calc dependency | 1700 |
| DV-008 | Rich Text calc token | Resolved scalar shown |
| DV-009 | Summary FIELD from calc | Same calculated value |
| DV-010 | Multiple freight rows | SUM all matches |
| DV-011 | No freight rows | Empty view, SUM = 0 |
| DV-012 | Chained Data View | Parent unchanged, child correctly filtered |
| DV-013 | Data View cycle | Validation error |
| DV-014 | Calculated field cycle | Validation error |
| DV-015 | Duplicate alias | Validation error |
| DV-016 | Invalid source path | Validation/render controlled failure |
| DV-017 | Row filter with zero value | zero is not treated as empty |
| DV-018 | Row filter with false | false is not treated as empty |
| DV-019 | Legacy table without rowFilter | all rows remain |
| DV-020 | Formula using calc.* | root fallback resolves dependency |
| DV-021 | Summary sourced from Data View | aggregates filtered rows |
| DV-022 | Table sourced directly from Data View | only view rows rendered |
| DV-023 | Preview/Exact/Engine | same RenderModel values |
| DV-024 | Combined PDFs | every invoice resolves its own views/calcs |
| DV-025 | Large selection | one active DocumentGroup remains the generation model |

## Release blockers
Do not release if any of these occur:
- source rows are deleted/mutated by a filter
- table total includes filtered-out rows
- calc value differs between Preview and PDF
- Data View from Invoice A leaks into Invoice B
- missing/empty Freight view throws instead of returning deterministic aggregate result
- circular dependency hangs or recurses indefinitely
- legacy templates change behavior
- table pagination receives a different row set than table footer aggregation

## Commands

```bash
npm install
npm run build
npm run typecheck
npm test
npm run test:visibility-rules
npm run test:data-views
npm run smoke:data-views
npm run test:pdf-freeze
npm run test:combined-pdf
npm run test:advanced-table
npm run test:rich-text
```

## Fix 2 — Data View Filter Builder UX

- New Data Views now start with a visible filter condition instead of an empty filter panel.
- The filter editor exposes Field, Operator, and Compare Value immediately.
- The Field selector is populated from the selected source collection's imported row fields.
- Existing saved Data Views without a filter remain backward compatible and continue to mean "include all rows" until the user adds a rule.
- Multiple AND/OR conditions, nested groups, case sensitivity, IN values, and no-value operators continue to use the shared conditional-rule editor.

## Fix 5 — Global Calculated Value Type

- `CALCULATED` is a first-class aggregate/value operation for builder value editors.
- It resolves only `calc.<alias>` bindings and uses the same raw calculated scalar produced before rendering.
- The shared AggregateCellEditor exposes it consistently in Summary rows, Summary totals, Data Table footer cells, Custom Grid value cells, and calculated-field dependencies.
- Legacy `FIELD` bindings to `calc.<alias>` remain valid for backward compatibility.
- If no calculated fields exist, the builder shows a controlled hint instead of inventing an invalid path.
