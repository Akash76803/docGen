# Shape Operations Master Plan

This document details the multi-phase implementation plan for hardening and expanding Shape Operations.

---

## Phase 8.0 — Foundation

* **Goal**: Establish a robust Capability Matrix, support Mixed Values inspector displays, unify Primary Selection, and build a shape migration/regression harness.
* **Existing functionality to REUSE**: `selectedIds` state tracking, basic inspector rails, existing selection highlights.
* **Existing functionality to HARDEN**: Primary selection highlight and single selection boundary box.
* **New functionality**:
  * Unified `SelectionModel` designating a "Primary Selection" (last selected item) and a list of secondary items.
  * Mixed Values rendering helper in inspector fields (e.g. showing "—" or "Mixed" when selected shapes have different fills or opacity).
  * Auto-migration of optional schema fields when loading old cards.
* **Deferred functionality**: Multi-selection handles, group transforms.
* **Affected source areas**:
  * `packages/contracts/src/design.ts` (Selection types)
  * `apps/desktop/src/pages/CardDesigner.tsx` (Selection handlers & inspector display)
* **Contract changes**: None.
* **Migration impact**: None; ensures backward compatibility on older templates.
* **Export impact**: None.
* **Regression risks**: Unintended selection clears on drag start.
* **Tests**: Mixed values inspector rendering unit tests.
* **Manual verification**: Select two shapes with different colors and verify color field displays "Mixed".
* **Definition of Done**: Typecheck, Vitest, and manual verification pass.

---

## Phase 8.1 — Transform Hardening

* **Goal**: Enable proportional group scaling and uniform resizing via `Shift` key constraint.
* **Existing functionality to REUSE**: Core element positioning and scaling handlers.
* **Existing functionality to HARDEN**: Element resize handles dragging logic in `CardDesigner.tsx`.
* **New functionality**:
  * Proportional scaling bounding box constraints when dragging corner handles.
  * Multi-item combined bounding box movement.
* **Deferred functionality**: Group rotations.
* **Affected source areas**:
  * `packages/design-engine/src/styling.ts`
  * `apps/desktop/src/pages/CardDesigner.tsx`
* **Contract changes**: None.
* **Migration impact**: None.
* **Export impact**: None.
* **Regression risks**: Off-center coordinates shifting during scaling.
* **Tests**: Bounding box size calculations unit tests.
* **Manual verification**: Select two shapes, resize them together, and verify relative positioning remains proportional.
* **Definition of Done**: Proportional multi-element scaling runs smoothly in the UI.

---

## Phase 8.2 — Styling Contract & Rendering Parity

* **Goal**: Add dashed stroke styles, stroke cap/join options, and gradient angle controls with complete PDF/image export parity.
* **Existing functionality to REUSE**: `artboardFillStyle` and `normalizeStroke` in `CardExportCanvas.tsx`.
* **Existing functionality to HARDEN**: PDF stroke compiler inside `pdf-renderer.ts`.
* **New functionality**:
  * Stroke joins (miter/round/bevel) and caps (butt/round/square) properties.
  * Customizable dash arrays (e.g., `5 5` dashed stroke).
* **Deferred functionality**: Multi-color drop shadows.
* **Affected source areas**:
  * `packages/contracts/src/design.ts`
  * `packages/renderer-pdf/src/pdf-renderer.ts`
  * `apps/desktop/src/pages/CardExportCanvas.tsx`
* **Contract changes**: Adds `strokeDashArray`, `strokeLineCap`, `strokeLineJoin` to contracts.
* **Migration impact**: Older shapes default to `SOLID` stroke style and `round` caps.
* **Export impact**: Exports must display correct stroke joins and dash intervals in PNG, JPEG, and PDF.
* **Regression risks**: Missing stroke styling in PDF renders.
* **Tests**: Test PDF exporter outputs dash array arrays and cap settings.
* **Manual verification**: Verify a dashed-stroke rectangle prints correctly to PDF.
* **Definition of Done**: Exported cards matches the designer view perfectly.

---

## Phase 8.3 — Multi-Selection Enhancements

* **Goal**: Add drag-to-select marquee box functionality in the designer canvas.
* **Existing functionality to REUSE**: Multi-selection selection set (`selectedIds`).
* **Existing functionality to HARDEN**: Click selection selection toggle.
* **New functionality**:
  * Canvas-level marquee selection box overlay drawing.
  * Element collision detection checking which elements intersect the selection box.
* **Deferred functionality**: Lasso selection.
* **Affected source areas**:
  * `apps/desktop/src/pages/CardDesigner.tsx`
* **Contract changes**: None.
* **Migration impact**: None.
* **Export impact**: None.
* **Regression risks**: Preventing click dragging elements when starting a drag within selection.
* **Tests**: Collision detection functions tests.
* **Manual verification**: Drag a selection box over two elements and confirm both become selected.
* **Definition of Done**: Smooth marquee selection box.

---

## Phase 8.4 — Group Hardening

* **Goal**: Make grouping (`Ctrl+G`), ungrouping (`Ctrl+Shift+G`), and regrouping nested elements robust.
* **Existing functionality to REUSE**: Basic group contracts.
* **Existing functionality to HARDEN**: Z-index recalculations and parenting logic.
* **New functionality**:
  * Regroup command keeping track of previously ungrouped selection sets.
  * Hierarchical relative-offset transforms.
* **Deferred functionality**: Deep multi-level nested group transforms.
* **Affected source areas**:
  * `packages/design-engine/src/styling.ts`
  * `apps/desktop/src/pages/CardDesigner.tsx`
* **Contract changes**: Adds metadata to keep track of group relationships.
* **Migration impact**: Backward-compatible; older card groups load as flat groups.
* **Export impact**: Sub-elements of groups export in correct relative coordinates.
* **Regression risks**: Elements shifting out of coordinate bounds on ungroup.
* **Tests**: Group/Ungroup coordinates stability test.
* **Manual verification**: Group two elements, move the group, ungroup, and verify their coordinates remain stable.
* **Definition of Done**: Grouping and ungrouping behaves predictably without shifting elements.

---

## Phase 8.5 — Geometry Editing Completion

* **Goal**: Integrate smooth and symmetric Bezier control handles into the Pen / Edit Path mode.
* **Existing functionality to REUSE**: Basic path editor vertex drag logic, Scissors, Erase Segment, and CAD OSNAP.
* **Existing functionality to HARDEN**: Path editor segment drawing and editing.
* **New functionality**:
  * Smooth and Symmetric Bezier handle locks.
  * Node double-click to insert vertices on active segments.
* **Deferred functionality**: Automated path simplification.
* **Affected source areas**:
  * `packages/design-engine/src/pathUtils.ts`
  * `apps/desktop/src/pages/CardDesigner.tsx`
* **Contract changes**: Extends vertex node properties with handle styles (`CORNER | SMOOTH | SYMMETRIC`).
* **Migration impact**: Older paths default all vertices to `CORNER`.
* **Export impact**: Custom curves export accurately as SVG paths.
* **Regression risks**: Control handle coordinates skewing on vertex reconnect.
* **Tests**: Handle constraint updates unit tests.
* **Manual verification**: Select a path node, set to "Smooth", and verify dragging one handle moves the opposite handle symmetrically.
* **Definition of Done**: Seamless Bezier vertex curves editing.

---

## Phase 8.6 — Boolean Hardening + Fragment

* **Goal**: Complete Boolean operations (Union, Subtract, Intersect, Combine) and add the **Fragment** command.
* **Existing functionality to REUSE**: Core `booleanUtils.ts` algorithms.
* **Existing functionality to HARDEN**: Simple vector union and subtraction routines.
* **New functionality**:
  * Shape Fragment tool breaking overlapping elements into independent closed paths.
  * Multi-contour compound paths.
* **Deferred functionality**: Non-closed path Boolean operations.
* **Affected source areas**:
  * `packages/design-engine/src/booleanUtils.ts`
* **Contract changes**: Compound path serialization schema.
* **Migration impact**: Older shapes load normally.
* **Export impact**: Complex compound paths render perfectly in vector output format.
* **Regression risks**: Topology solver crashing on self-intersecting loops.
* **Tests**: Complex boolean intersection test harness.
* **Manual verification**: Draw overlapping circles, click Fragment, and verify three distinct shape sections are created.
* **Definition of Done**: Stable Boolean operations and Fragment splits.

---

## Phase 8.7 — Shape Text Hardening

* **Goal**: Support multi-column flows, text padding offsets, and automatic overflow notifications inside shapes.
* **Existing functionality to REUSE**: ShapeText rendering.
* **Existing functionality to HARDEN**: Text wrapping constraints.
* **New functionality**:
  * Padding sliders (top, right, bottom, left) for text inside shapes.
  * Warning indicator for text overflowing shape dimensions.
* **Deferred functionality**: Flow-to-next-shape columns.
* **Affected source areas**:
  * `packages/contracts/src/design.ts`
  * `apps/desktop/src/pages/CardDesigner.tsx`
* **Contract changes**: Add `paddingMm` to ShapeText properties.
* **Migration impact**: Older templates default padding to `0mm`.
* **Export impact**: Text renders with correct offset padding in exports.
* **Regression risks**: Text truncation on high-DPI rasterization.
* **Tests**: Text bounds offset unit tests.
* **Manual verification**: Type inside a circle shape, increase padding, and verify text wraps to match padding limits.
* **Definition of Done**: Text wraps correctly inside padded shape bounds.

---

## Phase 8.8 — Persistence / Export / Regression Hardening

* **Goal**: Complete automation of schema migrations, clipboard copy/paste stability, and extensive PDF export verification.
* **Existing functionality to REUSE**: Base persistence and PDF annotations.
* **Existing functionality to HARDEN**: JSON serializer schema verification.
* **New functionality**:
  * Native clipboard serialization enabling cross-template element copy/paste.
  * Automated migration engine loading templates from any older schema version.
* **Deferred functionality**: None.
* **Affected source areas**:
  * `packages/persistence/src/`
  * `apps/desktop/src/`
* **Contract changes**: Versioned template serialization schemas.
* **Migration impact**: Safe template import for legacy templates.
* **Export impact**: Reliable multi-page PDFs.
* **Regression risks**: Clipboard corrupted payload crash.
* **Tests**: Schema migration backward-compatibility test suites.
* **Manual verification**: Copy an element from card A, paste it into card B, and verify positioning and styling remain intact.
* **Definition of Done**: 100% stable serialization, clipboard, and PDF export migrations.
