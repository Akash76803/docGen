# Phase 9.4A–9.4C — Panel-Aware Packaging Foundation

Implemented on top of Phase 9.3.

## 9.4A Canonical packaging panel model
- Added semantic BODY / GLUE / TUCK / DUST panel metadata.
- Added FRONT / RIGHT / BACK / LEFT / GLUE faces and BODY / TOP / BOTTOM edge semantics.
- Coordinates are explicitly ARTBOARD-local to avoid Phase 9.3 cut-local offset ambiguity.
- Generated tuck cartons now persist top and bottom semantic panels in `artboard.metadata.cartonDieline.packagingPanels`.
- Sleeve remains body-panel only.
- Existing Phase 9.3 `measurements.panels` is retained for backward compatibility.

## 9.4B Panel selection
- Packaging documents expose a `Panels` canvas-toolbar mode.
- Panel hit regions overlay the dieline only while panel mode is active.
- Click selects a panel and reports name/dimensions without changing design history.
- Double-clicking an editable panel enters focus mode.

## 9.4C Panel focus mode
- Selected panel can be entered with `Focus <face>`.
- Non-active canvas is visually dimmed while technical geometry/artwork remains intact.
- `Exit Panel` or Escape exits focus mode.
- Focus/selection are view state and do not pollute undo/redo or template persistence.

## Compatibility
- No existing technical CUT / CREASE / BLEED / SAFE / ANNOTATION groups were replaced.
- No existing Phase 9.3 body-panel contract was removed.
