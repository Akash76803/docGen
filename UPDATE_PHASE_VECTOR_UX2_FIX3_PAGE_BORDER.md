# VECTOR-UX2 Fix3 — Default Page Border + Settings

## Scope
- Editor page border is ON by default for every artboard, including legacy designs without metadata.
- Page-level settings: Show, Color, Width, Solid/Dashed/Dotted, Inside/Center/Outside, Print/Export Border, Reset to Default.
- Border is not a selectable design element and does not enter layer ordering.
- Default export behavior is OFF so existing output does not change unexpectedly.
- Optional export border renders above design content when explicitly enabled.

## Default
- Show: ON
- Color: #64748b
- Width: 1 px screen-equivalent
- Style: Solid
- Position: Inside
- Export: OFF

## Compatibility
Settings are persisted in `artboard.metadata.pageBorder`, avoiding schema breakage for existing templates. Legacy artboards automatically receive the editor default at render time.
