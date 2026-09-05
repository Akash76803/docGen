# TEXT3 — Advanced Text Path + Auto Fit

## Implemented

### Advanced text layouts
Text element now supports an optional `style.textPath` contract with these modes:
- `BOX` — normal text box
- `ARC_UP`
- `ARC_DOWN`
- `CIRCLE`
- `PATH` — follows an existing PATH element on the same artboard

Controls in **Right Inspector > Text Styling > Text Path & Auto Fit**:
- Text Layout
- Start Offset (%)
- Reverse
- Circle Inside / Outside
- Source Path selector for Text on Path

### Auto Fit
Text style now supports:
- Shrink text to fit box
- Minimum font size

The font size is reduced only when required by the current text box bounds and never below the configured minimum.

### Rendering
- Canvas curved/path text uses SVG `<textPath>`.
- Arc and circle geometry use stable normalized 0–100 SVG paths.
- Existing PATH geometry can be selected as a text guide and is normalized into the text element box.
- Existing text solid/linear-gradient/radial-gradient fill and outline styling is reused for path text.
- Drop shadow / glow continue through the text effect rendering path.

### Export parity
`CardExportCanvas.tsx` now renders the same TEXT3 modes:
- Arc Up
- Arc Down
- Circular Text
- Text on Path
- Start Offset
- Reverse
- Auto-fit font size
- text gradient fill / outline compatibility

### Persistence / backward compatibility
New fields are optional on `TextDesignElement.style`, so existing templates without TEXT3 metadata continue as normal BOX text.
New text elements default to:
- `textPath.mode = BOX`
- `startOffsetPct = 50`
- `reverse = false`
- `side = OUTSIDE`
- auto fit disabled
- minimum font size 6pt

## Files changed
- `packages/contracts/src/design.ts`
- `packages/design-engine/src/elements.ts`
- `apps/desktop/src/pages/CardDesigner.tsx`
- `apps/desktop/src/pages/CardExportCanvas.tsx`
- `packages/design-engine/test/phase-text3-advanced-text.test.ts`

## Verification performed
PASS targeted checks:
- TypeScript/TSX transpile syntax: CardDesigner
- TypeScript/TSX transpile syntax: CardExportCanvas
- contract syntax
- text factory syntax
- Arc Up marker / wiring
- Arc Down marker / wiring
- Circular Text marker / wiring
- Text on Path marker / wiring
- Source Path selector wiring
- Start Offset wiring
- Reverse wiring
- Shrink-to-Fit wiring
- export `<textPath>` wiring
- export auto-fit wiring

Full `npm run typecheck` was attempted but was blocked by incomplete extracted dependencies/type packages (`@types/react`, `@types/node`, `aria-query`, Paper typings, etc.). No full-repository PASS is claimed.

## Manual test checklist
1. Add a Text element.
2. Open Right Inspector > Text Styling > Text Path & Auto Fit.
3. Test Normal Text Box.
4. Select Arc Up; verify text curves upward.
5. Select Arc Down; verify text curves downward.
6. Move Start Offset from 0 to 100; verify text moves along curve.
7. Toggle Reverse.
8. Select Circular Text; test Outside / Inside.
9. Draw a PATH on the artboard.
10. Select Text on Path and choose the PATH in Source Path.
11. Verify text follows the selected PATH shape.
12. Resize the text box and enable Shrink text to fit box.
13. Set minimum font size and verify text does not shrink below it.
14. Apply gradient fill, outline, shadow/glow and verify curved text still renders.
15. Save and reopen template.
16. Export PNG and PDF and compare against canvas preview.
17. Test Undo / Redo after changing text-path mode and auto-fit settings.
