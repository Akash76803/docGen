# Phase 4.12 — Conditional Visibility & Rules Engine

## Status
Implementation candidate. Local full monorepo release gate must pass before marking RELEASE VERIFIED.

## Goal
Provide one reusable document-level rules engine for conditional inclusion of Template blocks and Data Table columns without adding renderer-specific condition logic.

## Architecture

```text
TemplateDefinition
  visibility?: VisibilityRule
        ↓
TemplateEngine
  evaluateVisibilityRule()
        ↓
Hidden blocks/columns removed BEFORE measurement
        ↓
Resolved RenderModel
        ↓
Preview / Exact Print / Engine PDF / Combined PDF / future DOCX
```

Renderers never evaluate visibility rules. This keeps all renderers deterministic and consistent.

## Supported targets

Whole-block visibility is available for every TemplateBlock, including:
- TEXT / Rich Dynamic Text
- FIELD
- TABLE
- SUMMARY_TABLE
- CUSTOM_TABLE (custom grid)
- IMAGE
- SPACER
- DIVIDER
- BOX
- ROW
- blocks inside ROW cells
- blocks inside BOX
- HEADER / BODY / FOOTER blocks

Data Table columns use the same rule contract and evaluator.

## Rule model

Legacy single conditions remain valid:

```ts
{ path: 'gst.type', operator: 'EQUALS', value: 'IGST' }
```

New Boolean groups:

```ts
{
  logic: 'ALL',
  conditions: [
    { path: 'status', operator: 'EQUALS', value: 'PAID' },
    { path: 'amount', operator: 'GREATER_THAN', value: 0 }
  ]
}
```

Groups support `ALL` (AND), `ANY` (OR), nesting, and optional `negate`.

## Operators
- EQUALS
- NOT_EQUALS
- IS_EMPTY
- NOT_EMPTY
- GREATER_THAN
- GREATER_OR_EQUAL
- LESS_THAN
- LESS_OR_EQUAL
- IN
- CONTAINS
- NOT_CONTAINS
- STARTS_WITH
- ENDS_WITH

Text comparison is case-insensitive by default and can be case-sensitive.

## Important semantics
- Missing `visibility` => visible (backward compatibility).
- Hidden block is removed from RenderModel before layout and pagination => no blank gap.
- `0` and `false` are NOT empty.
- null / undefined / blank string / empty array are empty.
- Numeric comparisons fail closed (`false`) for non-numeric values.
- Existing Data Table conditional columns use this same evaluator.
- Column visibility remains document-level, not per-row, to keep table geometry deterministic.

## Grouped header safety
When conditionally hidden Data Table columns are part of a grouped header, the resolved colSpan includes only visible members of the original configured group. It never expands onto unrelated neighboring columns.

## UI
All block types use one `VisibilityRuleEditor`:
- Add Visibility Rule
- field path picker
- operator
- compare value / IN values
- case-sensitive toggle where applicable
- + AND Condition
- + OR Condition
- ALL / ANY group mode
- Negate Result
- nested group
- Always Visible

Data Table columns reuse the same editor.

## Backward compatibility
No template migration is required.
- Old blocks with no visibility stay visible.
- Existing Phase 4.10 single-column visibility objects remain valid.
- Rich Text, formatting, grids, BOX, pagination and Combined PDF contracts are unchanged.

## Explicitly not included in Phase 4.12
- per-row hide/show inside repeating Data Table
- Custom Grid individual-cell collapse (would change grid geometry)
- conditional styles/colors
- formula-expression conditions
- role/user permission conditions

The shared `VisibilityRule` contract/evaluator is intended to be reused by those future features with explicit geometry/security semantics.

## Edge cases
1. Missing field path with IS_EMPTY => true.
2. Missing field path with NOT_EMPTY => false.
3. Zero and false remain non-empty.
4. Empty group defaults visible so an unfinished rule group does not accidentally erase content.
5. Nested group depth is validator-limited.
6. Maximum 50 conditions per group.
7. Invalid unsafe field paths fail template validation.
8. Hidden header/footer blocks do not reserve repeat-region height.
9. Hidden nested Row/BOX children do not reserve child layout space.
10. Conditional table columns keep footer filtering and grouped-header colSpan aligned.

## Test matrix
- TC-VIS-001 no rule => visible
- TC-VIS-002 simple equals show
- TC-VIS-003 simple equals hide
- TC-VIS-004 empty/not-empty
- TC-VIS-005 zero/false not empty
- TC-VIS-006 numeric comparisons
- TC-VIS-007 IN
- TC-VIS-008 contains/start/end
- TC-VIS-009 case-sensitive comparison
- TC-VIS-010 ALL group
- TC-VIS-011 ANY group
- TC-VIS-012 negate
- TC-VIS-013 nested group
- TC-VIS-014 top-level BODY block removal
- TC-VIS-015 HEADER block removal
- TC-VIS-016 FOOTER block removal
- TC-VIS-017 nested Row child removal
- TC-VIS-018 nested BOX child removal
- TC-VIS-019 whole Summary block visibility
- TC-VIS-020 whole Custom Grid visibility
- TC-VIS-021 Data Table conditional column
- TC-VIS-022 grouped header with hidden member
- TC-VIS-023 old single-column condition compatibility
- TC-VIS-024 invalid unsafe path validator
- TC-VIS-025 renderer parity via same RenderModel

## Release gate

```bash
npm install
npm run build
npm run typecheck
npm test
npm run test:pdf-freeze
npm run test:combined-pdf
npm run test:advanced-table
npm run test:display-format
npm run test:rich-text
npm run test:unified-rich-text
npm run test:visibility-rules
npm run smoke:advanced-table
npm run smoke:rich-text
```

Phase 4.12 is release verified only after all prior regressions plus the new visibility suite pass.
