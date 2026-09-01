# Current Baseline

Latest baseline: **Phase 8.7 Add-on Fix3 — CAD Intersection Capture + Draw Tool Exit**

Built on: Phase 8.7 Fix1 — Boolean Styling & Opacity Parity.

Implementation status: SOURCE IMPLEMENTED.
Manual UI verification: PENDING.

Key Phase 8.7 additions:
- Boolean directly on closed SHAPE/PATH
- Primary-driven deterministic Subtract/style semantics
- 2+ operand Union/Subtract/Intersect/Combine
- 2-operand Fragment into independent closed PATH regions
- empty-result cleanup and compound-hole preservation
- generated-result auto-selection
- containment-aware Fragment hole preservation
- Phase 8.7 targeted engine/UI regression tests added

Verification note: changed Phase 8.7 TS/TSX transpile PASS; full typecheck/Vitest blocked by missing clean-artifact dependencies.


## Phase 8.7 Fix1 — Boolean Styling & Opacity Parity
- PATH batch opacity + context-toolbar opacity enabled.
- Boolean/Fragment element-opacity inheritance explicit.
- Manual UI verification: PENDING.

## Phase 8.7 Add-on — CAD Reference-Line Mirror
- Built on Phase 8.7 Fix1.
- Arbitrary 2-point reference-axis mirror added with Copy and Move modes.
- Existing point OSNAP reused for axis definition.
- PATH geometry/Bezier handles and group semantics supported.
- Source transpile + direct reflection math smoke: PASS.
- Full typecheck: BLOCKED by missing clean-artifact dependencies.
- Manual UI verification: PENDING.

## Phase 8.7 Add-on — CAD Drawing Guides & Polar Tracking
Latest add-on after CAD Reference-Line Mirror. Adds live angle/length HUD, Ortho, Polar, configurable angle increment, Parallel/Perpendicular direction tracking, and F8/F10 shortcuts for line-like CAD drawing workflows. Manual UI verification pending.


## Phase 8.7 CAD Projection / Intersection Tracking
- Full polar/perpendicular construction ray to artboard boundary.
- Nearest projected intersections visible on canvas.
- Near-marker endpoint snaps to exact projected intersection.
- Manual UI verification: PENDING.

## Phase 8.7 Add-on Fix2 — CAD Cardinal Hover Snap Points
- Added draw-mode-only cardinal boundary markers for closed SHAPE/PATH geometry.
- Hovering a drawable closed vector exposes exact global cardinal boundary intersections: 0° right, 90° top, 180° left, 270° bottom.
- Existing endpoint/vertex/intersection OSNAP remains higher priority; cardinal snap is evaluated before generic boundary/guide/grid snaps.
- Cardinal point locks render green and commit the exact boundary point.
- Applies to line-like connect workflows: LINE, FLEXIBLE_LINE, PEN, SPLIT, CAD Mirror Line.
- Manual UI verification: PENDING.


## Phase 8.7 Add-on Fix3 — CAD Intersection Capture + Draw Tool Exit
- Added forgiving 18-screen-pixel projected intersection capture for line-like CAD tools.
- Projected intersection capture has priority over generic boundary/guide/grid snaps, while endpoint/vertex/explicit-intersection OSNAP and cardinal snaps remain higher priority.
- First Escape exits active line-like draw modes directly to SELECT and restores the Select cursor.
- Drawing/library tools and Mirror Line actions support explicit double-click reactivation.
- Manual UI verification: PENDING.


## Phase 8.7 Add-on Fix4 — CAD Exact Intersection + Deep Zoom
- Exact Paper.js ray/vector-boundary intersections for CAD connection snapping.
- Intersection snap-lock hysteresis prevents small overshoot from breaking exact capture.
- CAD-style pointer-centered wheel zoom, 5%–3200%, editable percentage; middle-button/Space pan preserved.
- Manual UI verification: PENDING.
