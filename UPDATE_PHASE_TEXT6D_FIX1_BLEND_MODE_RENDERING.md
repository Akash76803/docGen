# TEXT6D Fix1 — Layer Effect Blend Mode Rendering

## Problem
Blend Mode controls were exposed for text overlay effects, but the HTML/export renderer composed Color/Gradient/Pattern Overlay backgrounds without placing the base text fill inside the same blend stack. A single overlay therefore had nothing meaningful to blend against, so Normal / Multiply / Screen / Overlay / Soft Light could look identical.

## Root cause
`textOverlayCss()` and `exportTextOverlayCss()` built CSS background layers only from overlay effects and then applied `background-blend-mode`. The original/base text fill was replaced by transparent clipped text and was not present as the bottom background layer.

## Fix
- Added a bottom base-fill background layer for solid, linear-gradient and radial-gradient text fills.
- Overlay effect layers now blend against the actual base fill.
- Preserved effect opacity in the overlay colors/stops.
- Mirrored the same composition in CardExportCanvas for canvas/export parity.

## Verified scope
- Normal box text: Color Overlay blend visibly differentiates Normal/Multiply/Screen/Overlay/Soft Light.
- Gradient Overlay: blends against base text fill instead of replacing the only compositing backdrop.
- Pattern Overlay: shares the same base-fill blend stack.
- Export HTML rasterization path uses the same stack semantics.

## Known limitation / future work
The generic Blend selector is still displayed on shadow/glow/bevel effect rows, while those effects are currently synthesized through `text-shadow`; CSS `text-shadow` does not provide independent per-shadow blend modes. Stroke effects use independent layers and can use `mix-blend-mode`. Arc/Circle/PATH text currently uses top-overlay SVG fill semantics rather than the full multi-overlay blend stack. These should be handled by a dedicated independent effect-layer renderer rather than silently claiming Photoshop-identical behavior.

## Targeted verification
- CardDesigner.tsx transpile: PASS
- CardExportCanvas.tsx transpile: PASS
- Source audit: base fill appended as bottom blend layer in both live canvas and export renderer.
