# Phase 3.4 Fix 3 — Complete Imported Header Binding

## Root causes fixed

1. TABLE Path suggestions were filtered to `LINE_ITEM_FIELD`, so most imported headers were invisible when Generate had classified them as Header Field.
2. Fix 2 shortened mapped paths such as `items.qty` to `qty`, but grouped item rows retain the full mapped structure (`{ items: { qty: ... } }`).
3. Older saved groups did not retain their original imported rows, so a table could not safely fall back to a source header that was not mapped as a line item.

## New behavior

- Every imported source header is available in TABLE column Path dropdowns.
- Generate Source Column + Target Path is displayed where a mapping exists.
- TemplateDefinition table columns may retain `sourceField` and `targetPath` binding metadata.
- TemplateEngine resolves the mapped path first, then falls back to the original source row header when needed.
- `DocumentGroup.sourceItems` is transient document data; it is not stored inside templates.
- Existing saved workspaces are automatically repaired/rebuilt when `sourceItems` is missing.

## Compatibility

All new contract fields are optional. Existing templates and DocumentGroup payloads remain valid.

## Scope guard

No PDF, DOCX, pagination, OCR, cloud upload, API, Salesforce or free-position canvas was added.
