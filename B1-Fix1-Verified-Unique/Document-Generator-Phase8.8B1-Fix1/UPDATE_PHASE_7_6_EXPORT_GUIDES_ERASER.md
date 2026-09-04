# Phase 7.6 — Export Fidelity, Equal-Spacing Guides, Freeform Eraser

## Implemented

### 1) Export fidelity for generated PATH faces
- `IsolatedCardExportCanvas` now renders `PATH` elements.
- Solid fills, fill opacity, linear gradients, stroke color/opacity/width/dash and path shadow are preserved in isolated export rendering.
- Fixes the Phase 7.5 generated face case where the editor showed colored section faces but PDF/PNG/JPEG raster export omitted those faces/colors.
- Fixed export gradient stop percentages to use the canonical 0..100 stop model instead of multiplying by 100 again.

### 2) Precision equal-spacing smart guides
- While moving a selected element between two neighboring elements, the editor detects equal horizontal/vertical gaps.
- When within snap tolerance it snaps to the mathematically equal position.
- Editor-only dimension guides show both equal gaps with an mm measurement label.
- Existing align/distribute commands remain unchanged.
- Hold Alt while dragging to bypass snapping, consistent with existing smart-snap behavior.

### 3) Freeform Eraser
- New `Freeform Eraser` utility tool.
- Drag a freeform/lasso selection around content.
- The lasso is visible while drawing.
- On release, intersecting unlocked elements are removed in one history transaction.
- Locked elements are protected.
- Tool remains active until Select/Escape is used.
- Undo restores the erased elements as one operation.

## Verification performed in this environment
- `npm run typecheck` — PASS
- `npm run build -w @document-tool/design-engine` — PASS
- Focused static smoke assertions for export PATH/fill, gradient-stop handling, equal-spacing guide wiring, eraser wiring/history — PASS
- Vitest/browser bundle could not be run in this Linux container because the uploaded Windows node_modules lacks `@rollup/rollup-linux-x64-gnu`. An install attempt timed out. This is an environment/platform dependency issue.

## Added test
- `apps/desktop/test/phase76-export-guides-eraser.test.tsx`
  - verifies exported PATH face/fill markup
  - verifies equal-spacing guide integration
  - verifies freeform eraser integration

## Current eraser scope
The Phase 7.6 eraser is a freeform **element eraser**: intersected unlocked design elements are removed. It does not yet subtract arbitrary brush-shaped holes from the interior of a single image/text/vector element. A future vector/raster partial-erase phase can build on this interaction without changing the tool UX.
