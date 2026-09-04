# Current Baseline

Latest implementation: **Phase 9.4L–9.4M — SVG Dieline Import + Manual Panel Mapping**, on top of the verified Phase 9.4K Fix6 export baseline. See `UPDATE_PHASE_9_4L_TO_9_4M_SVG_DIELINE_IMPORT_PANEL_MAPPING.md`. Full dependency-based verification for L–M is pending; targeted functional harnesses passed in the implementation environment.

Latest implementation: **Phase 9.3 — Parameterized Folding-Carton Dieline Generator**.

Phase 9.3 generates five editable ECMA-style folding-carton structures from
finished dimensions: Straight Tuck End, Reverse Tuck End, both slit-lock
variants and Simple Sleeve. It produces a continuous CUT contour, independent
CREASE paths, panel mapping, editor-only BLEED/SAFE/ANNOTATION guides,
manufacturing input validation, guarded deterministic regeneration and
technical-layer visibility controls. Converter approval remains mandatory.
See `UPDATE_PHASE_9_3_CARTON_DIELINE_GENERATOR.md`.

Automated verification after Phase 9.3:
- `npm run typecheck`: PASS — 0 errors
- `npm test -- --run`: PASS — 198 files, 983 tests
- `npm run build`: PASS — 17 workspaces, desktop Vite bundle 1700 modules
- `git diff --check`: PASS
- Manual Windows UI, 100% paper fold and converter review: PENDING

Previous implementation: **Phase 9.2 — Professional Editable Sample Template Pack**.

Phase 9.2 provides 22 editable, print-configured sample designs across ID,
business, membership, invitation, greeting, promotional, label, shipping, tag,
voucher, certificate, sticker, menu/tent and packaging categories. The gallery
supports search/category filters and displays format, sidedness and print-ready
metadata. Two-sided samples use real paired Front/Back artboards and the pack is
dynamic-field-ready. See `UPDATE_PHASE_9_2_PROFESSIONAL_TEMPLATE_PACK.md`.

Automated verification after Phase 9.2:
- `npm run typecheck`: PASS — 0 errors
- `npm test -- --run`: PASS — 195 files, 973 tests
- `npm run build`: PASS — 17 workspaces, desktop Vite bundle 1699 modules
- `git diff --check`: PASS
- Manual Windows UI verification: PENDING

Previous implementation: **Phase 9.1 — Professional Page Size & Format System**.

Phase 9.1 adds a searchable categorized catalog for cards, folded work, labels,
tags, stickers, ISO A0–A10, ISO B0–B6 and US paper. Presets carry orientation,
layout, bleed, safe-area and DPI defaults. Users can save/delete custom formats
in local persistence, while existing front/back pairing and free dimensions remain
available. See `UPDATE_PHASE_9_1_PAGE_FORMAT_SYSTEM.md`.

Automated verification after Phase 9.1:
- `npm run typecheck`: PASS — 0 errors
- `npm test -- --run`: PASS — 193 files, 967 tests
- `npm run build`: PASS — 17 workspaces, desktop Vite bundle 1699 modules
- `git diff --check`: PASS
- Manual Windows UI verification: PENDING

Previous stabilization: **Phase 9.0 — Test Stabilization and WAVE Geometry Recovery**.

Automated verification after Phase 9.0:
- `npm run typecheck`: PASS
- `npm test -- --run`: PASS — 190 files, 957 tests
- `npm run build`: PASS — 17 workspaces, desktop Vite bundle 1698 modules
- Manual Windows UI verification: PENDING

Phase 9.0 restores the missing editable closed WAVE conversion geometry and
reconciles seven inherited source-string regression files with the current
modular Split, Fill Bucket, joined-region, Polyline and CAD tracking behavior.
See `UPDATE_PHASE_9_0_TEST_STABILIZATION.md`.

Previous geometry implementation: **Phase 8.8B1 Fix8 — Smallest Planar Compartment Fill**.

Feature baseline: **Phase 8.8A5 Fix2 — Edge Align to Reference Geometry**.

Automated verification after Phase 8.8B1 Fix8:
- `npm run typecheck`: PASS
- `npm test -- --run`: PASS — 183 files, 938 tests
- `npm run build`: PASS
- Manual Windows UI verification: PENDING for Fix8

Fix8 makes Fill Bucket resolve the smallest planar compartment before falling back to the containing parent shape. Closed SHAPE/PATH boundaries, curved circle/ellipse edges and internal LINE/polyline segments participate in one intersection-split face graph. Existing generated sections remain directly recolorable, while a click inside a new compartment creates only that independent `AUTO_SECTION` face instead of filling the complete outer circle.

Fix7 consolidates nearby endpoint fans into one persistent intersection. Within a guarded 0.2 mm topology tolerance, an existing declared intersection remains the deterministic master; all new endpoints move to that exact coordinate. Near endpoint-to-segment gaps are projected closed, the target segment is split, and no additional nearby intersection is created.

Fix6 materializes straight-line crossings and endpoint-to-segment T-junctions as persistent intersection nodes. Both involved PATH segments split at one canonical coordinate, future LINE start/end hover resolves the declared intersection before dynamic/projected candidates, and face splitting records its entry/exit intersection nodes for subsequent multi-section operations.

Fix5 allows a normal CAD LINE to extend beyond a closed face: the splitter resolves the actual boundary entry/exit intersections, clips the divider to the interior span and creates independent faces. A subsequent boundary-to-shared-divider line forms a canonical T-junction and incrementally splits the affected face, producing three or more independently selectable sections.

Fix4 canonicalizes endpoints produced by Trimmer/Erase Segment. Every generated fragment endpoint within 0.15 mm of an existing PATH node is moved to that exact node coordinate; 2, 3 or more generated endpoints can share the same junction without inserting artificial connector segments. Non-target geometry and endpoints outside tolerance remain unchanged.

Fix3 recognizes a closed graph made from separate point-connected straight LINE/PATH elements. Fill Bucket inside the loop creates a new independent closed `AUTO_SECTION` PATH while preserving all source lines. Endpoint clustering uses the existing 0.05 mm CAD topology tolerance, open graphs are rejected, and nested loops choose the smallest region containing the click.

Fix2 enables endpoint grip stretching to snap exactly onto other-element endpoints, vertices, boundaries and computed intersections. Live green snap markers identify the acquired target. LINE and Angle Line drawing now display labelled 0°/45°/90°/135°/.../315° construction guides while preserving configurable Polar, F8 Ortho and F10 Polar behavior.

Phase 8.8B1 adds an isolated three-point CAD Arc command: Start → Through → End. It creates an editable open cubic PATH with circular handles, OSNAP input, live preview, printable metadata, collinear-point rejection and one-step undo. Shortcut parity: `A` Angle Line, `Shift+A` CAD Arc, `Alt+A` Arrow.

Fix1 adds the missing Arc drawing-mode capture and crosshair cursor gates. Arc clicks now reach the canvas even when an existing shape occupies the pointer location.

Fix4 reserves a zoom-scaled scroll footprint with a top-left transform origin, so every canvas edge remains reachable above 200% zoom. Ordinary shape draw now returns to Select, and selected SHAPE/PATH elements expose live size, angle, endpoint, midpoint and center inspection markers. The earlier Card Designer TDZ declaration order remains preserved.

Previous manually verified baseline: **Phase 8.8A2 — CAD Polyline + Canvas Pan**.

Baseline inherited from **Phase 8.8A1 — CAD LINE Hardening**, manually verified PASS by the user.

Status:
- A1 CAD LINE manual verification: PASS
- A2 source implementation: COMPLETE
- Changed-source transpile: PASS
- CAD Polyline runtime exact-coordinate smoke: PASS
- Full monorepo typecheck: BLOCKED by inherited dependency/workspace build-output gaps
- A2 manual UI verification: PENDING

Next planned tool after A2 verification: **Phase 8.8A3 — Construction Line (XLINE)**.


## Phase 8.8A3 Fix1 — XLINE Reference Tracking + Dynamic Input
- Dedicated XLINE hover/acquire for Parallel/Perpendicular tracking.
- On-canvas editable LINE Length/Angle dynamic input.
- Exact typed endpoint engine helper.
- Manual UI verification: PENDING.

## Phase 8.8A3 Fix2 — Shape Draw Regression Isolation
- Status: SOURCE VERIFIED / MANUAL UI PENDING
- Ordinary SHAPE drawing is isolated from CAD/XLINE tracking.
- CAD tracking remains limited to line-like tools.

## Phase 8.8A3 Fix3 — Build + Shape Draw Recovery
- Real Windows compile error log addressed.
- Dynamic CAD state moved into CardArtboardCanvas scope.
- Parametric shape drag-release commit restored.
- XLINE toolbar mode typing and strict unused-local blockers fixed.
- Manual Windows build/UI verification: PENDING.

## Phase 8.8A3 Fix4 pending manual verification
- LINE dynamic input is mouse-editable via a stable first-point anchored HUD.
- Circle center + exact radius input supported.
- Projected horizontal/vertical virtual intersection snap supported for CAD line-like tools.


## Phase 8.8A3 Fix5
CAD LINE endpoint double-click Extend-to-Boundary and shape-drawing reference parity implemented. Manual verification: PENDING. See `UPDATE_PHASE_8_8A3_FIX5_LINE_EXTEND_SHAPE_REFERENCES.md`.

## Phase 8.8A3 Fix6 — Shortcuts Help Panel
- Top header now exposes a dedicated `Shortcuts` button.
- Searchable modal documents enabled keyboard/mouse shortcuts and their use.
- No geometry or CAD behavior changed.
- Changed-source transpile: PASS.
- Manual UI verification: PENDING.

## Phase 8.8A3 Fix7
Utility, shape, and duplicate keyboard shortcuts added on top of Fix6. Runtime and help modal now share a centralized shortcut registry. Manual UI verification: PENDING.

## Phase 8.8A4 Fix1 — Navigation Recovery
Manual regression after A4 RAY: Dashboard → Card produced a blank page. Recovery baseline restores Phase 8.8A3 Fix7 runtime and temporarily rolls back RAY pending isolated runtime verification.


## Phase 8.8A4 Fix2 — Card Designer TDZ Runtime Recovery
- Fixed CardDesigner blank-page crash caused by `canEditPath` and related capability constants being read in a hook dependency array before initialization.
- Source transpile and declaration-order regression check: PASS.
- Dashboard -> Card manual runtime verification: PENDING.

## Phase 8.8A4 Fix3 — CAD Ray Isolated Reimplementation
RAY re-added on top of the manually verified TDZ-recovery baseline. Dashboard/Card Designer mount-order fix is preserved. Manual Windows UI verification pending.

## Phase 8.8A5 — CAD Angle Line
- Dedicated `A` Angle Line tool added on top of manually verified A4 Ray baseline.
- Exact Length + Angle dynamic input reuses existing CAD endpoint resolver.
- Angle Line commits standard LINE geometry but does not auto-chain.
- Dashboard/Card TDZ recovery ordering preserved.
- Manual UI verification: PENDING.

## Phase 8.8A5 Fix1 — CAD Line Grip Angle Editing
Added anchored Start/End/Center Length + Angle editing for CAD LINE PATHs in Edit Path mode. Manual UI verification pending.

- Phase 8.8A5 Fix2: Edge Align to Reference Geometry implemented; manual UI verification pending.

## Phase 9.4D–9.4F add-on
Panel-aware packaging artwork operations are now layered on top of Phase 9.4A–C. See `UPDATE_PHASE_9_4D_TO_9_4F_PACKAGING_ARTWORK.md`. Full workspace verification must still be executed on the supported Node 20 environment with dependencies installed.

## Local continuation — Phase 9.4J-K
Packaging persistence normalization and packaging export modes have been implemented on top of the Phase 9.4G-I working source. Fresh full-suite verification is pending in a complete Node 20 dependency environment; see `UPDATE_PHASE_9_4J_TO_9_4K_PACKAGING_PERSISTENCE_EXPORT_MODES.md`.

## Phase 9.4 IMG1–IMG2 — Image Background Removal Foundation + UI
- Border-connected Auto/Selected Color removal implemented for normal IMAGE elements.
- Non-destructive derived PNG assets preserve original assets.
- Inspector preview includes tolerance, eyedropper, checkerboard, Before/After, Apply as Copy and Reset Original.
- Targeted processing/persistence harness: PASS.
- Changed UI/browser helper transpile syntax: PASS.
- Full Node 20 monorepo verification: PENDING in a complete dependency environment.
- See `UPDATE_PHASE_9_4_IMG1_IMG2_BACKGROUND_REMOVAL.md`.
