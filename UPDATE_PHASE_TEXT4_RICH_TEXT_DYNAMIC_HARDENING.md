# TEXT4 — Rich Text + Dynamic Text Hardening

## Implemented
- Added optional rich text style runs to `TextDesignElement.style.runs`.
- Range-level formatting supports:
  - font family
  - font size
  - font weight / bold
  - italic
  - underline
  - strikethrough
  - text color
  - superscript
  - subscript
- Added **Rich Text Selection** section inside Right Inspector > Text Styling.
- User highlights characters in the Content textarea, then styles only that selected range.
- Added Clear Selection Style.
- Range offsets rebase when text is inserted/deleted so existing rich formatting stays attached to the intended text where possible.
- Existing mixed static + dynamic field mode (`{{field}}`) remains supported.
- Dynamic template resolution remaps styled token ranges to the resolved runtime value, so a styled `{{name}}` token keeps its style after becoming e.g. `Akash`.
- Field insertion now rebases existing rich text ranges rather than silently invalidating them.
- Rich runs render on:
  - normal canvas text boxes
  - Arc / Circular / Text-on-Path SVG rendering
  - isolated export canvas
- Gradient parent fill remains compatible; a range-level explicit color overrides the gradient for that range.
- Rich text data uses the normal element contract, therefore normal duplicate/copy/paste/save/reload history flows preserve it.

## Targeted verification performed
PASS:
- Range style segmentation
- Bold/color selected-range application
- Superscript/subscript metadata
- Partial range clear
- Run rebase after insertion before a styled range
- Styled `{{field}}` remap to resolved dynamic value
- JSON persistence round-trip
- TypeScript/TSX transpile syntax checks for contracts, rich-text engine, dynamic resolver, CardDesigner, and CardExportCanvas

## Full typecheck status
`npm run typecheck` was attempted. It is blocked before project source diagnostics by incomplete extracted dependencies/type packages in this environment, including `@types/react`, `@types/node`, `paper`, `papaparse`, `aria-query`, and related typings. Full repository PASS is not claimed.

## Manual acceptance
1. Add a Text element with `Hello World`.
2. Highlight only `World` in Content.
3. Apply Bold + a different Selection Color.
4. Verify only `World` changes on canvas.
5. Select `2` in `H2O`, apply Subscript.
6. Select a range and apply Superscript.
7. Insert text before a styled range; verify the styled range follows the intended text.
8. Switch Binding Mode to **Insert Dynamic Fields**.
9. Create text such as `Hello {{Name}}`.
10. Highlight the `{{Name}}` token and apply a distinct color/bold style.
11. Preview imported records; verify the resolved name retains the token style.
12. Test Arc / Circular / Text on Path with mixed formatting.
13. Save/reopen and verify formatting persists.
14. Duplicate/copy/paste the text and verify formatting persists.
15. Export PNG/PDF/JPEG and compare with canvas.
