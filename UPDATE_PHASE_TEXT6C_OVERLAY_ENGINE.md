# TEXT6C — Gradient / Color / Pattern Overlay Engine

## Purpose
Turn text overlays into independent Layer Effects instead of baking them into the base text fill.

## Implemented
- New `COLOR_OVERLAY` effect type.
- Existing `GRADIENT_OVERLAY` expanded with:
  - Linear / Radial modes.
  - Multi-stop editor.
  - Stop color / position / opacity.
  - Add/remove stops.
  - Reverse.
  - Scale.
  - Effect opacity and blend mode.
- New `PATTERN_OVERLAY` effect type with editable built-in pattern recipes:
  - Hatch.
  - Dot.
  - Checker.
  - Foreground/background colors.
  - Scale / rotation / X-Y offset / opacity.
- Quick Add buttons for Color / Gradient / Pattern overlays in Text Styling → Layer Effects.
- Multiple overlay effects are composited as independent CSS background layers for normal/rich text.
- Arc/Circle/Text-on-Path SVG rendering supports the topmost active Color/Gradient/Pattern overlay, including SVG pattern definitions.
- Export canvas mirrors overlay rendering, including normal/rich text and SVG path-text top-overlay handling.
- Save/reload / copy / duplicate remain JSON-safe through the stack model.
- Legacy base text fill remains available when no overlay is active.

## Deliberate boundary
- Reflected and Diamond gradient modes are not claimed in TEXT6C; Linear and Radial are the production-supported modes in this batch.
- Built-in procedural patterns are implemented. External pattern-asset browser/import can be added later without changing the effect-stack contract.
- Normal/rich text can composite multiple overlay layers; SVG text-on-path currently renders the topmost active overlay for predictable cross-export behavior.

## Verification performed
- TypeScript transpile diagnostics: PASS for contracts, textLayerEffects engine, CardDesigner, CardExportCanvas and TEXT6C test source.
- Runtime design-engine harness: Color + Gradient + Pattern creation, duplicate deep copy and JSON round-trip.
- UI marker/wiring checks: quick overlay actions, multi-stop controls, pattern controls, canvas/export helpers.
