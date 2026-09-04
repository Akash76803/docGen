# Phase 4.11 — Global Display Formatting + Rich Dynamic Text

## Goal
Centralize display formatting and make TEXT blocks capable of static text + dynamic field tokens + explicit line breaks without moving data/business logic into renderers.

## Global Display Formatting
`packages/template-engine/src/display-format.ts` is the shared formatter.

Supported types:
- RAW (native scalar type preserved)
- NUMBER
- INTEGER
- PERCENT (FRACTION / WHOLE input modes)
- CURRENCY
- DATE
- DATETIME
- BOOLEAN
- CUSTOM pattern

Shared options include decimals, grouping, locale, currency code/symbol, prefix/suffix, negative parentheses, null display, boolean labels, and date style.

Formatting is opt-in. RAW numeric/boolean values are not converted to strings, preserving Phase 4.10 backward compatibility.

Formatting is wired to:
- Field blocks
- Data-table columns
- Rich-text field tokens
- Custom-grid FIELD cells
- Aggregate/Summary values via `displayFormat`

## Rich Dynamic Text
TEXT remains backward compatible (`text: string`). New optional `fieldTokens` stores per-path fallback and display format.

Editor supports:
- Multiline textarea
- Enter/new lines and blank lines
- `{{path.to.field}}` dynamic tokens
- Insert Field at Cursor
- Per-token fallback
- Per-token DisplayFormat
- malformed tokens remain literal
- missing valid tokens emit FIELD_VALUE_MISSING warning and use fallback
- `\\{{` escape convention for literal opening braces

TemplateEngine resolves tokens before RenderModel. Renderers never resolve paths.

HTML Preview / Exact Print uses `white-space: pre-wrap`. Engine PDF already splits explicit `\n` before word wrapping and measures all generated lines.

## Renderer Contract
Resolved RenderTextBlock remains simple text for maximum backward compatibility. Its `text` contains already-resolved field values and preserved newlines. This maps directly to future DOCX paragraph/run + break generation without re-reading source data.

## Edge Cases
- `0` and `false` must not disappear.
- RAW must preserve native scalar values.
- `0.18` with PERCENT/FRACTION becomes `18%`.
- `18` with PERCENT/WHOLE becomes `18%`.
- malformed `{{field` stays literal.
- unknown `{{field}}` uses fallback and warning.
- repeated fields are allowed.
- blank lines are preserved.
- long resolved field values word-wrap normally.
- explicit line breaks participate in PDF height measurement/pagination.

## Tests
Added:
- `phase411-display-format.test.ts`
- `phase411-rich-text.test.ts`
- `scripts/phase411-rich-text-smoke.mjs`

Commands:
```bash
npm run test:display-format
npm run test:rich-text
npm run smoke:rich-text
```

Full release gate:
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
npm run smoke:advanced-table
npm run smoke:rich-text
```

## Sandbox verification
- contracts build: PASS before unrelated missing dependency failures
- template-engine build: PASS
- renderer-sdk build: PASS
- renderer-pdf build: PASS
- rich-text runtime smoke: PASS
- RAW `2 -> 2`: PASS
- percentage `0.18 -> 18%`: PASS

Full monorepo build/test was not declared PASS because sandbox dependency installation did not complete; local release gate is mandatory.
