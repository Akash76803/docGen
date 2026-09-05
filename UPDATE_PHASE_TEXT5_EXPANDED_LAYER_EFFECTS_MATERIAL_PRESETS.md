# TEXT5 Expansion — Advanced Layer Effects + Expanded Material Presets

## Implemented

### New editable layer effects
- Inner Shadow
- Inner Glow
- Second Outline
- Reflection / Gloss
- Grain / Texture

These extend the existing Drop Shadow, Outer Glow, Bevel / Emboss, Highlight / Shine, and Long Shadow effects.

### Expanded editable material preset library
Existing presets retained:
- Gold
- Silver
- Chrome
- Neon
- Glass
- Vintage

New presets:
- Rose Gold
- Bronze
- Copper
- Steel
- Holographic
- Glitter
- Foil
- Glossy Plastic
- Candy / Gel
- Frosted Glass
- Retro
- Comic
- Grunge
- Ink Stamp
- Embossed Paper
- Engraved
- Wood
- Stone
- Leather
- Gradient Neon
- Outline Neon

Total material presets visible in the Text Styling inspector: 27.

## Architecture
- Presets remain parameter-based and editable; they are not flattened images.
- Preset contract persists in the text style schema.
- New layer effect properties are optional and backward-safe for older templates.
- Canvas text-shadow/compositing path and isolated export text-effects path both receive the new effect settings.
- Existing solid/gradient fill, outline, rich-text, arc/circle/path text and auto-fit contracts remain intact.

## Verification performed
PASS targeted TypeScript/TSX transpile syntax checks:
- `packages/contracts/src/design.ts`
- `packages/design-engine/src/elements.ts`
- `apps/desktop/src/pages/CardDesigner.tsx`
- `apps/desktop/src/pages/CardExportCanvas.tsx`
- `packages/design-engine/test/phase-text5-advanced-material-styles.test.ts`

PASS static UI wiring check:
- all 21 new preset labels found
- 27 total material preset action buttons found
- all 5 new layer-effect controls found

The targeted Vitest file was updated with default and JSON persistence coverage for the new effect contract, but Vitest is not installed in this extracted environment, so a Vitest PASS is not claimed here.

## Manual acceptance
1. Create a large text element on a contrasting background.
2. Open Text Styling > Layer Effects.
3. Test Inner Shadow and adjust X/Y/Blur/Opacity.
4. Test Inner Glow.
5. Enable Second Outline and verify an additional surrounding edge appears.
6. Test Reflection / Gloss.
7. Test Grain / Texture at low and high amount.
8. In Style Presets, test Rose Gold, Holographic, Glitter, Foil, Comic, Ink Stamp, Wood, Stone and Outline Neon.
9. After applying a preset, edit one effect and verify the style becomes Custom while retaining the visual settings.
10. Save/reload the design.
11. Export PNG, JPEG and PDF and compare with canvas.
12. Re-test Arc, Circle and Text-on-Path with at least Gold, Neon and Holographic.

## Note
These are editable real-time design effects built from the app's rendering primitives. They are not a complete Photoshop Layer Styles engine yet; texture/displacement-map based effects and true 3D extrusion remain separate future work.
