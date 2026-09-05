# TEXT6A — Photoshop-like Layer Effects Engine Foundation

## Objective
Introduce a stack-based, editable text Layer Effects architecture so future Photoshop-like effects can be built as independent effect items instead of fixed one-off style properties.

## Implemented
- New `TextLayerEffect` contract with:
  - unique id
  - effect type
  - enabled flag
  - opacity
  - blend-mode-ready field
  - effect-specific settings
- Supported foundation effect types:
  - Stroke
  - Gradient Overlay
  - Inner Shadow
  - Inner Glow
  - Outer Glow
  - Drop Shadow
  - Bevel & Emboss
- New design-engine helpers:
  - create/default effect
  - normalize stack
  - add
  - remove
  - enable/disable
  - duplicate
  - reset
  - legacy-effect migration
- Text defaults now include an empty `layerEffects` stack.
- Backward-safe migration helper can import existing stroke/glow/inner-shadow/inner-glow/bevel settings without deleting legacy properties.

## Inspector UI
Text Styling now includes a new **Layer Effects Engine** section:
- Add Effect selector
- + Add
- enable/disable checkbox per effect
- collapsible effect details
- opacity
- blend mode field
- effect-specific controls
- Duplicate
- Reset
- Remove
- Import Current Effects for legacy styles

Multiple Stroke and Drop Shadow entries can coexist in the stack, establishing the foundation for later Photoshop-like multi-effect rendering.

## Canvas / Export foundation
Both editor canvas and isolated export renderer now read the new stack for:
- Stroke
- Gradient Overlay
- Drop Shadow
- Outer Glow
- Inner Shadow approximation
- Inner Glow approximation
- Bevel / Emboss foundation approximation

Arc / Circle / Text-on-Path paths also read stack Stroke / Gradient Overlay / shadow-effect foundation.

This phase establishes deterministic stack consumption. It does **not** yet claim Photoshop-pixel-identical rendering for inner effects or bevels; later TEXT6 phases will replace approximations with dedicated SVG/canvas filter primitives and contour/light models.

## Verification performed
Custom targeted verification PASS:
- contract syntax transpile
- design-engine layer-effect module syntax transpile
- CardDesigner TSX syntax transpile
- CardExportCanvas TSX syntax transpile
- TEXT6A test-file syntax transpile
- add + duplicate stack behavior
- unique IDs
- toggle
- remove
- legacy migration

A Vitest run was attempted but timed out in this extracted environment, so a full Vitest PASS is not claimed.

## Manual acceptance
1. Add/select a text element.
2. Open Text Styling > Layer Effects Engine.
3. Add Stroke and change width/color.
4. Add Drop Shadow and change offsets/blur.
5. Add a second Drop Shadow; verify both remain in the stack.
6. Toggle an effect off/on.
7. Duplicate an effect; verify a new independent row appears.
8. Reset one effect.
9. Remove one effect.
10. Add Gradient Overlay and change colors/angle.
11. Save/reopen the template.
12. Undo/Redo effect-stack edits.
13. Export PNG/PDF and compare with the canvas.
14. Open an older styled text element and use Import Current Effects; verify legacy styling remains intact.

## Deliberately deferred to TEXT6B+
- true multi-stroke compositing with inside/center/outside geometry
- multiple shadow compositing with dedicated filter primitives
- accurate inner-shadow clipping
- accurate inner-glow clipping
- Photoshop-style Bevel Technique / Contour / Global Light
- Pattern Overlay
- Satin
- Blend If
