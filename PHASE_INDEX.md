# Phase Index

This file prevents older update docs from being mistaken for the current baseline.

## Current card-designer sequence
- Phase 7.4.x — geometry/path workflow updates
- Phase 7.5 — face splitting / related fixes
- Phase 7.6 — export, guides, eraser
- Phase 7.7 — shape text / expanded shape library and fixes
- Phase 7.8 — shape image fill
- Phase 7.9 — dynamic Base64 image binding + UX/date/serialization/layer fixes
- **Phase 7.10 — CAD Point OSNAP** (`UPDATE_PHASE_7_10_CAD_POINT_OSNAP.md`)
- **Phase 7.11 — Dedicated Split Tool** (`UPDATE_PHASE_7_11_DEDICATED_SPLIT_TOOL.md`) — preserved pre-Phase-8 geometry baseline

## Planned Shape Operations
- Phase 8.0 Foundation
- Phase 8.1 Transform Hardening
- Phase 8.2 Styling Contract & Rendering Parity
- Phase 8.3 Multi-Selection Enhancements
- Phase 8.4 Group Hardening
- Phase 8.5 Geometry Editing Completion
- Phase 8.6 Rich Artboard Backgrounds
- Phase 8.7 Boolean Hardening + Fragment
- Phase 8.8 Shape Text Hardening
- Phase 8.9 Persistence / Export / Regression Hardening

Always read `CURRENT_BASELINE.md`, `SHAPE_OPERATIONS_AUDIT.md`, and the latest update docs before implementing the next phase.

| 8.0 | `UPDATE_PHASE_8_0_SHAPE_FOUNDATION.md` | Shape Operations foundation: capability matrix, primary propagation, mixed values, normalization, regression harness | Current |

| 8.1 | `UPDATE_PHASE_8_1_TRANSFORM_HARDENING.md` | Rotation-aware resize, center resize, aspect/rotation modifiers, in-place flip | Current |

| 8.1 Fix1 | `UPDATE_PHASE_8_1_FIX1_MULTI_SELECTION_RESIZE_MODIFIERS.md` | Shared multi-selection resize + Alt/Shift modifiers | Current |

| 8.2 | `UPDATE_PHASE_8_2_STYLING_CONTRACT_RENDERING_PARITY.md` | Radial/pattern fill, image crop transform, advanced stroke, canvas/export parity | Current |

| 8.2 Fix1 | `UPDATE_PHASE_8_2_FIX1_STROKE_UI_DASH_INPUT.md` | Custom Dash input fix + Stroke terminology/alignment UX cleanup | Complete |

| 8.3 | `UPDATE_PHASE_8_3_MULTI_SELECTION_ENHANCEMENTS.md` | Primary-aware multi-selection, match dimensions, mixed exact transforms | Current |
| 8.4 Fix1 | `UPDATE_PHASE_8_4_FIX1_GROUP_INTEGRITY_LAYER_ORDER.md` | Group integrity, visible rename UI, atomic layer order | Current |

- Phase 8.4 Fix2 — Hierarchical Layers + Atomic Group Z-Order (`UPDATE_PHASE_8_4_FIX2_HIERARCHICAL_LAYERS.md`)


## Phase 8.5
Geometry Editing Completion implemented on top of Phase 8.4 Fix2. See `UPDATE_PHASE_8_5_GEOMETRY_EDITING_COMPLETION.md`.

- Phase 8.5 Fix4 — Smart Guides & Symmetric Node Editing — SOURCE COMPLETE / MANUAL PENDING
- Phase 8.5 Fix5 — Path Toolbar UX + Home Navigation — SOURCE COMPLETE / MANUAL PENDING

- Phase 8.5 Fix6 — Auto Mirrored Node Insert (`UPDATE_PHASE_8_5_FIX6_AUTO_MIRRORED_NODE_INSERT.md`) — SOURCE COMPLETE / MANUAL PENDING

## Phase 8.6 — Rich Artboard Backgrounds
Status: SOURCE IMPLEMENTED / MANUAL VERIFICATION PENDING
- Solid + opacity
- Transparent
- Linear / Radial Gradient
- Pattern Hatch / Dots / Checker
- Image asset/upload + crop/fit/opacity
- Dynamic background image field binding
- Canvas + PNG/JPEG/PDF export parity

## Phase 8.7 — Boolean Hardening + Fragment
Status: SOURCE IMPLEMENTED / MANUAL UI VERIFICATION PENDING
Update: `UPDATE_PHASE_8_7_BOOLEAN_HARDENING_FRAGMENT.md`


## Phase 8.7 Fix1 — Boolean Styling & Opacity Parity
- PATH batch opacity + context-toolbar opacity enabled.
- Boolean/Fragment element-opacity inheritance explicit.
- Manual UI verification: PENDING.

## Phase 8.7 Add-on — CAD Reference-Line Mirror
Status: SOURCE IMPLEMENTED / MANUAL UI VERIFICATION PENDING
Update: `UPDATE_PHASE_8_7_ADDON_CAD_REFERENCE_LINE_MIRROR.md`
- Line Copy
- Line Move
- arbitrary 2-point axis
- OSNAP axis points
- PATH/Bezier + group support

- Phase 8.7 Add-on — CAD Drawing Guides & Polar Tracking — IMPLEMENTED, MANUAL VERIFICATION PENDING


## Phase 8.7 CAD Projection / Intersection Tracking
- Full polar/perpendicular construction ray to artboard boundary.
- Nearest projected intersections visible on canvas.
- Near-marker endpoint snaps to exact projected intersection.
- Manual UI verification: PENDING.

### Phase 8.7 Add-on Fix2 — CAD Cardinal Hover Snap Points
Status: IMPLEMENTED / MANUAL UI PENDING
Adds 0°/90°/180°/270° hover boundary snap markers with green exact-lock feedback during drawing workflows.

- Phase 8.7 Add-on Fix3 — CAD Intersection Capture + Draw Tool Exit (`UPDATE_PHASE_8_7_ADDON_FIX3_CAD_INTERSECTION_CAPTURE_DRAW_TOOL_EXIT.md`) — SOURCE IMPLEMENTED / MANUAL PENDING

- Phase 8.7 Add-on Fix4 — CAD Exact Intersection + Deep Zoom — SOURCE VERIFIED / MANUAL PENDING

## Phase 8.8A1 — CAD LINE Hardening
- strict click-click LINE command
- continuous chained independent line segments
- exact endpoint preservation
- Enter finishes chain; Escape returns Select
- future section-ready CAD line metadata
- existing valid face split preserved

## Phase 8.8A2 — CAD Polyline + Canvas Pan
Status: SOURCE IMPLEMENTED / MANUAL UI PENDING
Update: `UPDATE_PHASE_8_8A2_CAD_POLYLINE_AND_CANVAS_PAN.md`
- one-object multi-segment Polyline
- exact CAD snap vertices
- Enter/double-click finish, Esc Select
- future sectioning metadata
- explicit Pan tool + Space/middle-mouse canvas pan

- Phase 8.8A3 — CAD Construction Line / XLINE — IMPLEMENTED, manual UI verification pending.


## Phase 8.8A3 Fix1 — XLINE Reference Tracking + Dynamic Input
- Dedicated XLINE hover/acquire for Parallel/Perpendicular tracking.
- On-canvas editable LINE Length/Angle dynamic input.
- Exact typed endpoint engine helper.
- Manual UI verification: PENDING.

- Phase 8.8A3 Fix2 — Shape Draw Regression Isolation — source verified, manual UI pending.

- Phase 8.8A3 Fix3 — Build + Shape Draw Recovery: IMPLEMENTED, manual verification PENDING.

- Phase 8.8A3 Fix4 — Dynamic Input Interaction + Circle Radius + Projected Perpendicular Intersection — implementation complete, manual UI verification PENDING.


## Phase 8.8A3 Fix5
CAD LINE endpoint double-click Extend-to-Boundary and shape-drawing reference parity implemented. Manual verification: PENDING. See `UPDATE_PHASE_8_8A3_FIX5_LINE_EXTEND_SHAPE_REFERENCES.md`.

- Phase 8.8A3 Fix6 — Shortcuts Help Panel — IMPLEMENTED / MANUAL UI PENDING. See `UPDATE_PHASE_8_8A3_FIX6_SHORTCUTS_HELP_PANEL.md`.

- **Phase 8.8A3 Fix7 — Utility, Shape & Duplicate Shortcuts**: runtime tool/shape hotkeys, Ctrl+Shift+D duplicate-in-place, centralized shortcut registry. Manual verification PENDING.

- Phase 8.8A4 Fix1 — Dashboard/Card navigation recovery; RAY temporarily rolled back after blank-page regression.


## Phase 8.8A4 Fix2 — Card Designer TDZ Runtime Recovery
- Fixed CardDesigner blank-page crash caused by `canEditPath` and related capability constants being read in a hook dependency array before initialization.
- Source transpile and declaration-order regression check: PASS.
- Dashboard -> Card manual runtime verification: PENDING.
