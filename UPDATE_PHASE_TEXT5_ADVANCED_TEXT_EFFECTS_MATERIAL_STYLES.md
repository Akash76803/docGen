# TEXT5 — Text Styling Inspector UX + Advanced Effects + Material Presets

## UI arrangement first
The Text Styling inspector was polished before adding new effects:
- consistent card-style sections
- tighter spacing and clearer hierarchy
- sticky section headers while scrolling
- grouped controls kept in this order:
  1. Typography
  2. Rich Text Selection
  3. Paragraph
  4. Advanced Text Layout
  5. Fill & Outline
  6. Effects
  7. Style Presets
- preset grid uses two columns and clear active state

## Advanced effects implemented
- existing Drop Shadow retained
- existing Outer Glow retained
- Bevel / Emboss approximation
  - depth
  - highlight color
  - shadow color
  - intensity
- Highlight / Shine
  - color
  - vertical offset
  - blur
- Long Shadow
  - color
  - distance
  - angle
- Canvas renderer and isolated export renderer both consume the same new effect contract.

## Editable material presets
One-click presets:
- Gold
- Silver
- Chrome
- Neon
- Glass
- Vintage

Presets populate editable fill/stroke/effect values. They are not flattened images. A user can apply a preset and then change the underlying controls.

## Contract additions
`TextDesignElement.style` now optionally supports:
- `materialPreset`
- `advancedEffects.bevel`
- `advancedEffects.highlight`
- `advancedEffects.longShadow`

The properties are optional in the contract for backward compatibility with old templates. New text elements receive safe defaults.

## Verification performed
Targeted TypeScript/TSX transpile diagnostics: PASS
- contracts text schema
- design-engine text defaults
- CardDesigner UI/render path
- CardExportCanvas export path

Static wiring verification: PASS
- preset buttons: Gold/Silver/Chrome/Neon/Glass/Vintage
- Bevel/Emboss controls
- Highlight/Shine controls
- Long Shadow controls
- material preset state
- canvas `textEffectShadowCss(...advancedEffects)` wiring
- export `exportTextEffects(...advancedEffects)` wiring

A Vitest regression file is included at:
`packages/design-engine/test/phase-text5-advanced-material-styles.test.ts`

Full monorepo typecheck/test/build is not claimed in this environment if dependency installation is incomplete.

## Manual acceptance
1. Add/select a text element and open Right Inspector > Text Styling.
2. Verify sections are visually grouped and scrolling does not require zooming the entire screen out.
3. Apply Gold. Verify metallic gradient, outline, depth/highlight and shadow appear.
4. Change Bevel depth and verify the preset remains editable.
5. Test Silver, Chrome, Neon, Glass and Vintage.
6. Enable/disable Bevel, Highlight and Long Shadow independently.
7. Test gradient fill + outline + advanced effects together.
8. Test Arc/Circle/Text-on-Path with effects.
9. Save/reopen and verify settings persist.
10. Export PNG/PDF/JPEG and compare with canvas.
11. Test Undo/Redo after preset/effect changes.
