# TEXT1 + TEXT2 — Core Text Styling, Paragraph Alignment, Fill, Outline, Shadow & Glow

## Implemented

### Typography
- Font family
- Font size
- Font weight including 900
- Bold / Italic / Underline
- Strikethrough
- Original / UPPERCASE / lowercase / Title Case
- Line height
- Letter spacing

### Paragraph / text box
- Horizontal alignment: Left / Center / Right / Justify
- Vertical alignment: Top / Middle / Bottom
- Text box padding in mm
- Actual alignment controls live in Right Inspector > Typography > Paragraph

### Fill & outline
- Solid text color
- Linear gradient text fill
- Radial gradient text fill
- Two-color gradient controls
- Linear gradient angle
- Text outline enable/disable
- Outline color
- Outline width
- Element opacity retained

### Effects
- Existing drop shadow retained
- Glow enable/disable
- Glow color
- Glow blur
- Glow opacity

### Rendering / persistence
- Canvas renderer updated for new styling
- Isolated export canvas updated for the same styling
- New style properties are part of the TextDesignElement contract, so normal JSON save/reload, clipboard and history flows preserve them.
- Existing documents remain backward compatible because new fields are optional with runtime fallbacks.
- New text elements receive explicit defaults for the new style properties.

## Files changed
- `packages/contracts/src/design.ts`
- `packages/design-engine/src/elements.ts`
- `packages/design-engine/src/styling.ts`
- `apps/desktop/src/pages/CardDesigner.tsx`
- `apps/desktop/src/pages/CardExportCanvas.tsx`

## Verification completed in this environment
PASS targeted TypeScript/TSX transpile checks:
- contracts design model
- design-engine element defaults
- design-engine styling reset defaults
- CardDesigner
- CardExportCanvas

PASS targeted wiring checks:
- paragraph alignment controls
- vertical alignment controls
- linear/radial gradient controls
- text outline controls
- glow controls
- canvas gradient/text-stroke rendering
- export gradient/text-stroke rendering
- contract persistence fields

Full monorepo typecheck/test/build is not claimed because this extracted artifact contains an incomplete dependency installation in this runtime.

## Manual acceptance
1. Add a Text element.
2. Select it and open Right Inspector > Typography.
3. Verify font, size, weight, italic, underline, strike and case controls.
4. Open Paragraph and test Left / Center / Right / Justify.
5. Test Top / Middle / Bottom vertical alignment in a tall text box.
6. Change text-box padding.
7. Open Fill & Outline and test Solid, Linear Gradient and Radial Gradient.
8. Enable Text Outline and change width/color.
9. Open Effects and test Drop Shadow + Glow.
10. Undo/Redo each change.
11. Save and reopen the design.
12. Export PNG/PDF/JPEG and visually compare with canvas.

## Deliberate next text scope
Not yet included in TEXT1 + TEXT2:
- text on path
- circular/arc text
- wave/warp/perspective text
- selected-range rich text styling inside a single text element
- image-filled text
- advanced multiple shadows / bevel / emboss
