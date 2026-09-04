# Phase 6.1.3 Fix1 — Responsive Toolbar & Layers at 100% Zoom

## Problem
At normal 100% browser/app zoom, the Card Designer canvas toolbar could overflow horizontally when the center workspace became narrower. Controls such as zoom, Actual, Fit, guide tools, or Grid Size could be clipped. The Layers panel could also become too compressed to keep layer names/actions readable.

## Fix
- Canvas toolbar now wraps naturally instead of clipping controls.
- Artboard identity stays readable and controls move to an additional row when required.
- Grid Size is no longer intentionally hidden at <=1450px.
- Zoom / Actual / Fit / ruler / grid / guide controls remain accessible.
- Added compact responsive behavior for medium desktop widths.
- Layers panel now constrains internal grids correctly and prevents horizontal clipping.
- Layer name/type/group layout is stable in narrow sidebars.
- Layer action buttons use equal responsive columns.

## Changed
- `apps/desktop/src/index.css`

No business logic, snapping behavior, guide data, history, or renderer/export behavior was changed.
