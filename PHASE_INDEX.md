# Phase Index

## Phase 9.3 — Parameterized Folding-Carton Dieline Generator

- Straight/Reverse Tuck End, slit-lock variants and Simple Sleeve.
- Internal/external measurement basis and material-caliper compensation.
- Width/depth/height, glue, tuck, dust, bleed, safe and tolerance inputs.
- Continuous CUT contour and independently editable CREASE paths.
- Front/Back/Left/Right/Glue panel mapping and technical annotations.
- CUT, CREASE, BLEED, SAFE and ANNOTATION technical groups with visibility controls.
- Input validation, guarded regeneration, Undo integration and metadata round-trip.
- Editor guides excluded from export; visible CUT/CREASE retained for dieline proof.
- Update: `UPDATE_PHASE_9_3_CARTON_DIELINE_GENERATOR.md`.

## Phase 9.2 — Professional Editable Sample Template Pack

- 22 editable print samples across 14 production categories.
- Searchable and category-filtered gallery with format and front/back information.
- Named editable elements, dynamic field bindings and 300 DPI print defaults.
- Correct paired Front/Back artboards for every two-sided sample.
- Dedicated samples for ID, business, membership, invitations, labels, shipping,
  hang tags, vouchers, certificates, stickers, table tents and packaging panels.
- Update: `UPDATE_PHASE_9_2_PROFESSIONAL_TEMPLATE_PACK.md`.

## Phase 9.1 — Professional Page Size & Format System

- Searchable categories for cards, folded formats, labels, tags, stickers and paper.
- ISO A0–A10, B0–B6 and Letter/Legal/Tabloid plus production card formats.
- Portrait/landscape application with format-specific bleed and safe-area defaults.
- Front/back layout metadata and existing paired-artboard workflow preserved.
- Locally saved custom presets with validation and deletion.
- Exact 300 DPI pixel dimensions shown beside manual dimensions.
- Update: `UPDATE_PHASE_9_1_PAGE_FORMAT_SYSTEM.md`.

## Phase 9.0 — Test Stabilization and WAVE Geometry Recovery

- Missing editable WAVE path conversion implemented.
- Seven inherited regression files reconciled with current modular behavior.
- Typecheck PASS; 190/190 test files and 957/957 tests PASS; build PASS.
- Windows manual UI verification pending.
- Update: `UPDATE_PHASE_9_0_TEST_STABILIZATION.md`.

## Current stabilization addendum

- **Phase 8.8B1 Fix8 — Smallest Planar Compartment Fill** (`UPDATE_PHASE_8_8B1_FIX8_SMALLEST_PLANAR_COMPARTMENT_FILL.md`) — typecheck, 183/183 test files (938/938 tests), and build PASS; Windows UI pending.
- **Phase 8.8B1 Fix7 — Duplicate Intersection Cluster Consolidation** (`UPDATE_PHASE_8_8B1_FIX7_DUPLICATE_INTERSECTION_CLUSTER_CONSOLIDATION.md`) — typecheck, 183/183 test files (935/935 tests), and build PASS; Windows UI pending.
- **Phase 8.8B1 Fix6 — Persistent Intersection Nodes & Exact OSNAP** (`UPDATE_PHASE_8_8B1_FIX6_PERSISTENT_INTERSECTION_NODES_EXACT_OSNAP.md`) — typecheck, 183/183 test files (933/933 tests), and build PASS; Windows UI pending.
- **Phase 8.8B1 Fix5 — T-Junction Auto Multi-Section Topology** (`UPDATE_PHASE_8_8B1_FIX5_TJUNCTION_AUTO_MULTISECTION_TOPOLOGY.md`) — typecheck, 181/181 test files (929/929 tests), and build PASS; Windows UI pending.
- **Phase 8.8B1 Fix4 — Post-Trim Multi-Point Endpoint Weld** (`UPDATE_PHASE_8_8B1_FIX4_POST_TRIM_MULTI_POINT_ENDPOINT_WELD.md`) — typecheck, 180/180 test files (926/926 tests), and build PASS; Windows UI pending.
- **Phase 8.8B1 Fix3 — Joined-Line Independent Sections** (`UPDATE_PHASE_8_8B1_FIX3_JOINED_LINE_INDEPENDENT_SECTIONS.md`) — typecheck, 178/178 test files (923/923 tests), and build PASS; Windows UI pending.
- **Phase 8.8B1 Fix2 — CAD Grip Stretch & Angular OSNAP Feedback** (`UPDATE_PHASE_8_8B1_FIX2_CAD_GRIP_STRETCH_ANGULAR_OSNAP.md`) — typecheck, 176/176 test files (919/919 tests), and build PASS; Windows UI pending.
- **Phase 8.8B1 Fix1 — CAD Arc Pointer/Cursor Activation** (`UPDATE_PHASE_8_8B1_FIX1_ARC_POINTER_CURSOR_ACTIVATION.md`) — typecheck/test/build PASS; Windows UI pending.
- **Phase 8.8B1 — CAD Arc** (`UPDATE_PHASE_8_8B1_CAD_ARC.md`) — three-point editable circular PATH; automated tests/typecheck PASS, build/manual gate pending.
- **Phase 8.8A5 Fix4 — Zoom Pan & Vector Selection Inspection** (`UPDATE_PHASE_8_8A5_FIX4_ZOOM_PAN_VECTOR_SELECTION_INSPECTION.md`) — SOURCE/TYPECHECK/TEST/BUILD PASS; Windows UI verification pending.
- High zoom now has a scaled scrollable footprint anchored at the artboard top-left.
- Completed normal shapes return to Select and expose live vector inspection markers.

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

- Phase 8.8A4 Fix3 — CAD Ray Isolated Reimplementation — implemented, manual UI verification pending.

## Phase 8.8A5 — CAD Angle Line
Status: SOURCE VERIFIED / MANUAL UI PENDING
- Dedicated Angle Line utility tool and `A` shortcut.
- Exact Length/Angle entry with stable HUD.
- Reuses existing OSNAP/Polar/Ortho/reference tracking and standard LINE geometry.
- No automatic chaining after commit.

- Phase 8.8A5 Fix1 — CAD Line Grip Angle Editing — IMPLEMENTED, MANUAL UI PENDING

- 8.8A5 Fix2 — Edge Align to Reference Geometry — IMPLEMENTED / MANUAL PENDING

- **Phase 8.8A5 Fix3 — Build, Typecheck & Test Stabilization** — TYPECHECK PASS / 172 TEST FILES, 907 TESTS PASS / BUILD PASS / MANUAL WINDOWS UI PENDING. See `UPDATE_PHASE_8_8A5_FIX3_BUILD_TYPECHECK_TEST_STABILIZATION.md`.

## Phase 9.4D–9.4F — Packaging Artwork Operations
- Automatic panel artwork ownership/index
- Focused-panel artwork insertion
- Assign / Fit / Fill / Contain / Bleed Fill
- Focus preview clipping
- Safe-area / panel-overflow / bleed warnings
- Details: `UPDATE_PHASE_9_4D_TO_9_4F_PACKAGING_ARTWORK.md`

## Phase 9.4 UX1 — Professional Canvas Workspace
- Larger Illustrator/Photoshop-style canvas workspace foundation.
- Side content panels collapsed by default; rails remain available.
- Canvas/Tab toggles side panels.
- Compact single-row local canvas toolbar with horizontal overflow.
- SELECT mode double-click-and-drag empty canvas activates temporary pan.
- Existing Space/middle-mouse/Pan tool behavior preserved.
- See `UPDATE_PHASE_9_4_UX1_PROFESSIONAL_CANVAS_WORKSPACE.md`.

## Phase 9.4J-K — Packaging Persistence + Export Modes
- Serialization-boundary packaging normalization and artwork-index repair.
- Undo/Redo coverage for panel orientation.
- Client Proof, Dieline Proof and Technical View export policies.
- Shared export filtering across PDF/PNG/JPEG and bulk generation.

## Phase 9.4L–9.4M — SVG Dieline Import + Manual Panel Mapping
- Printer SVG import with physical size preservation.
- Editable vector extraction with multi-subpath splitting.
- Manual CUT / CREASE / Other classification and technical locking.
- Manual Front/Back/Left/Right/Glue + Top/Bottom Tuck/Dust panel mapping.
- Existing panel Focus / Inspector / Preflight / artwork pipeline reused.
- PDF recognition remains later scope.
- See `UPDATE_PHASE_9_4L_TO_9_4M_SVG_DIELINE_IMPORT_PANEL_MAPPING.md`.

## Phase 9.4 IMG1–IMG2 — Image Background Removal
- Connected-border Auto/Color background removal.
- Internal matching foreground protection.
- Non-destructive transparent derived assets.
- Inspector live preview, tolerance, eyedropper, Before/After, Apply as Copy, Reset Original.
- IMG3 remains edge refinement/manual brushes; IMG4 remains shape-fill/dynamic/packaging-wide integration.
