# TEXT6D — Bevel & Emboss / Global Light

## Purpose
Upgrade the TEXT6 layer-effects stack from the earlier bevel approximation to an editable Photoshop-like bevel/emboss lighting model while preserving existing templates and export behavior.

## Implemented
- Bevel styles: Inner Bevel, Outer Bevel, Emboss, Pillow Emboss, Stroke Emboss.
- Techniques: Smooth, Chisel Hard, Chisel Soft.
- Depth %, Size, Soften and Up/Down direction.
- Lighting Angle + Altitude.
- `Use Global Light` synchronization across all text elements in the template that opt into global light.
- Template-level global-light metadata (`metadata.textGlobalLight`) with default 120° / 30°.
- Highlight color, opacity and blend metadata.
- Shadow color, opacity and blend metadata.
- Gloss contour presets: Linear, Cone, Cone Inverted, Ring, Gaussian.
- Canvas and export shadow synthesis now derive highlight/shadow offsets from angle, altitude, size, depth, bevel style and technique.
- Legacy layer-effects and legacy advanced bevel remain supported.

## Rendering note
The app uses browser/SVG/CSS rendering, so this is an editable Photoshop-like layer-style model rather than a pixel-identical clone of Adobe's proprietary renderer. Chisel/contour/style controls affect the generated lighting approximation and are persisted for future renderer fidelity work.

## Verification performed
- `packages/contracts` TypeScript build: PASS.
- Targeted TypeScript transpile: PASS for CardDesigner, CardExportCanvas, textLayerEffects and contracts.
- Design-engine full build attempted but blocked by pre-existing/incomplete extracted dependencies (`paper`) and unrelated existing diagnostics.
- Desktop full typecheck attempted but blocked by missing React/lucide typings in the extracted environment.
- TEXT6D test source added for defaults, normalize and duplicate persistence.

## Manual smoke
1. Add text and add Layer Effects > Bevel & Emboss.
2. Verify each Style and Technique changes the rendered depth/edge appearance.
3. Change Depth %, Size and Soften.
4. Toggle Direction Up/Down and confirm lighting swaps direction.
5. Keep Use Global Light on, change Angle/Altitude, then select a second text object using global light; values must stay synchronized.
6. Turn Use Global Light off on one effect and confirm its Angle/Altitude can diverge.
7. Change highlight/shadow colors and opacity.
8. Save/reload and verify all settings persist.
9. Export PNG/JPEG/PDF and compare bevel direction and lighting with canvas.
