# TEXT6B — True Multi-Stroke + Multi-Shadow Rendering Engine

## Purpose
Build on TEXT6A's stack model so multiple strokes and multiple drop shadows remain independent editable layer effects and render together on the Card Designer canvas and export canvas.

## Implemented
- Multiple STROKE entries can coexist independently.
- Multiple DROP_SHADOW entries can coexist independently.
- Dedicated `+ Add Stroke` and `+ Add Drop Shadow` inspector actions.
- Effect stack reorder controls (up/down).
- Stroke color, width, opacity, blend mode, and Inside/Center/Outside position foundation.
- Drop shadow color, opacity, X/Y offset, blur, spread, angle and distance controls.
- Angle/distance update shadow vector without deleting independent X/Y values.
- Normal BOX text renders each layer-effect stroke as its own paint layer behind the fill.
- Arc/Circle/Text-on-Path SVG text renders each stroke entry independently.
- Export canvas mirrors the independent stroke layer stack for BOX and text-on-path rendering.
- Multiple drop shadows continue to be emitted independently into the text-shadow effect list.
- Legacy single outline is used only when no new STROKE stack entry is enabled.
- JSON normalization and duplicate IDs remain safe.

## Compatibility
- Existing TEXT1–TEXT6A properties are preserved.
- Existing legacy outline/shadow rendering remains a fallback when stack effects are absent.
- Rich text content is reused on every stroke layer so selected-range formatting is retained.

## Verification performed in extracted environment
PASS:
- TypeScript syntax/transpile: contracts design.ts
- TypeScript syntax/transpile: textLayerEffects.ts
- TSX syntax/transpile: CardDesigner.tsx
- TSX syntax/transpile: CardExportCanvas.tsx
- TS syntax/transpile: new TEXT6B test
- Runtime harness: add 2 strokes + 2 shadows, duplicate, reorder, toggle and JSON round-trip
- Wiring markers: inspector, normal text, text-path canvas and export canvas

Blocked / not claimed:
- Full `npm run typecheck` is blocked by missing local type packages in this extracted environment (`@types/node`, React, Paper, etc.).
- Vitest executable is not present in the extracted node_modules, so Vitest PASS is not claimed.

## Notes
Stroke position uses a rendering-compatible foundation for Inside/Center/Outside. Pixel-identical Photoshop stroke rasterization/clipping is not claimed yet; exact contour/clipping refinement belongs to later Photoshop-parity phases.

## Next
TEXT6C — Gradient Overlay + Blend/Opacity fidelity and effect-stack compositing hardening.
