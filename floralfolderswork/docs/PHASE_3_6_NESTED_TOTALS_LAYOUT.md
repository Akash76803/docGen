# Phase 3.6 Nested Totals Layout

## Goal
Allow TABLE and SUMMARY_TABLE blocks inside structured Row/Grid cells so invoice amount-in-words and amount summary sections can share one horizontal row without absolute positioning.

## Implemented
- Row/Grid cell children now support TEXT, FIELD, IMAGE, TABLE, SUMMARY_TABLE, DIVIDER, SPACER.
- TemplateDefinition -> TemplateEngine -> RenderModel -> Preview propagation for nested TABLE/SUMMARY_TABLE.
- Nested summaries use the same live aggregate resolver and imported source/header fallbacks as top-level summaries.
- Summary bindings inside rows are canonicalized from Generate mappings when templates are loaded/saved.
- Row cell UI includes Add Table and Add Summary actions.
- Amount Summary preset no longer inserts hardcoded numeric 0.00 values. It builds only rows that can be bound to real imported mappings.
- Amount-in-words is achieved by a dynamic aggregate value with Format=WORDS; no business amount is hardcoded.

## Recommended invoice layout
ROW 100%
- Cell 1: 65% — one or more SUMMARY_TABLE blocks configured with live mapped values and WORDS format.
- Cell 2: 35% — Amount Summary block bound to mapped summary fields.

Labels remain template text; monetary/tax/quantity values are resolved from imported data/calculations.

## Compatibility
Existing Phase 3.6 rows containing only the older supported child block types remain valid.
No PDF or DOCX rendering was added.
