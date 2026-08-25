# Phase 4.11 Fix 1 — Unified Rich Text Everywhere

## Goal
Make TEXT behave identically wherever it is used in the Template Designer.

## Unified locations
- Header TEXT
- Body/top-level TEXT
- Footer TEXT
- Legacy ROW child TEXT
- ROW Grid/Cell child TEXT
- BOX child TEXT
- Custom Grid TEXT content

## One contract
Normal TextBlock and Custom Grid TEXT now support the same concepts:
- static text
- `{{field.path}}` dynamic tokens
- manual line breaks
- blank lines
- per-token fallback
- per-token DisplayFormat
- shared TextStyle

Custom Grid uses optional `fieldTokens` on `CustomGridCellContent`. Old saved plain text without `fieldTokens` remains valid.

## One UI behavior
A reusable `RichTextComposer` is used by top-level/nested Text editors and Custom Grid TEXT cells.
It exposes the same controls:
- Text multiline editor
- Insert Dynamic Field
- Insert at Cursor
- Dynamic field formatting
- fallback
- global DisplayFormat editor
- Text Style where embedded editing is used

## Resolution
TemplateEngine uses the existing `resolveRichText()` path for Custom Grid TEXT as well as normal TextBlock.
Renderers continue to receive resolved text only; no renderer performs field lookup or display formatting.

## Backward compatibility
- Existing normal TEXT blocks unchanged.
- Existing ROW/BOX TEXT blocks unchanged.
- Existing Custom Grid `{type:'TEXT', text:'...'}` remains valid.
- `fieldTokens` is optional.

## Tests
Added `phase411-unified-rich-text.test.ts` covering:
1. top-level TEXT
2. ROW cell TEXT
3. BOX child TEXT
4. Custom Grid TEXT
5. legacy Custom Grid plain text

Recommended local gate:

```bash
npm install
npm run build
npm run typecheck
npm test
npm run test:rich-text
npm run test:unified-rich-text
npm run smoke:rich-text
```

## Release blocker rules
Do not release if:
- Grid Text cannot insert a field.
- Grid Text collapses manual new lines.
- BOX/ROW Text has different token behavior from top-level Text.
- old Custom Grid plain text stops rendering.
- token formatting differs by container.
