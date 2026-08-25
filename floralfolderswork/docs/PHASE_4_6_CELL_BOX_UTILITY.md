# Phase 4.6 — Cell Box Controls + Reusable Box Utility

## Implemented
- Shared `BoxStyle` contract used by enhanced grid cells and BOX blocks.
- Width modes: AUTO, PERCENT, FIXED_MM.
- Height modes: AUTO, MINIMUM, FIXED.
- Overflow modes: EXPAND, CLIP, SHRINK_CONTENT (renderer-safe contract; low-level PDF CLIP is conservative).
- Background, border style/width/color, border radius, padding, horizontal/vertical alignment.
- Legacy `CellStyle.minHeight` retained and resolved alongside `minHeightMm`.
- Custom Grid `1 × 1 Box` quick action.
- Reusable top-level/nested `BOX` block with Plain/Rounded/Filled/Signature style presets.
- BOX supports Text, Field, Image, Divider, Spacer children through Designer controls; renderer contract also permits existing structured child blocks.
- Live Preview / Shared HTML Print consume the same `RenderBoxBlock`.
- Low-Level PDF measures BOX before placement and draws background/border/content using resolved RenderModel values.
- BOX defaults to keep-together pagination behavior.
- Custom Grid 1×1 fixed/percentage width and fixed/minimum height are honored by Preview/PDF.

## Backward compatibility
Existing row/grid cells with only `minHeight`, border, padding, background and alignment remain valid. New properties are optional.

## Known graceful degradation
The low-level PDF renderer currently draws rectangular borders for BOX. `borderRadiusMm` is fully represented in RenderModel/HTML print and is retained for future rounded-path PDF refinement / DOCX mapping.
