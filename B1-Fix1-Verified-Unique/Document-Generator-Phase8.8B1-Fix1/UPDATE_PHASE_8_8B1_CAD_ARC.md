# Phase 8.8B1 — CAD Arc

## Delivered behavior

- Dedicated Utility `CAD Arc` tool.
- Three-click workflow: Start → Through → End.
- Exact circular circumcenter/radius calculation through all three points.
- Two cubic Bezier segments with editable endpoint, through-node and handles.
- OSNAP-enabled point acquisition and live arc preview.
- Collinear/degenerate input is rejected without creating corrupt geometry.
- Normal printable PATH (`cadExport: true`), excluded from automatic section-divider semantics.
- One history transaction per completed arc.
- Repeats for another arc until Esc returns to Select.
- Shortcut: `Shift+A`; existing `A` Angle Line and `Alt+A` Arrow remain distinct.

## Risk containment

No changes were made to Face Split, point snapping, Trimmer, Boolean algorithms, path topology or export renderers. Fix4 zoom/pan and selection inspection remain intact. The Card Designer TDZ-safe declaration order remains intact.

## Automated verification

- Typecheck: PASS
- Targeted tests: PASS — 2 files / 6 tests
- Full tests: PASS — 175 files / 916 tests
- Build: PASS — 1695 modules transformed; only the existing non-fatal Vite large-chunk advisory remains
- Windows manual UI: PENDING
