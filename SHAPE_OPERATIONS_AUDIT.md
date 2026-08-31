# Shape Operations Audit

This document audits the actual source code of the Document Generator project against the target requirements for Shape Operations.

| Capability | Status | Code Evidence | Current Behavior | Gap / Risk | Decision |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Selection** | PARTIAL | `CardDesigner.tsx` selection state (`selectedIds: Set<string>`). | Supports selecting individual elements and clicking multiple elements holding Shift. | Bounding box is only rendered for single selection; no group bounding box. | **HARDEN** |
| **Transform** | PARTIAL | `styling.ts` and handles logic in `CardDesigner.tsx`. | Supports moving, scaling, and rotating individual elements. | Multi-element rotate and resize transforms are missing. | **HARDEN** |
| **Styling** | PARTIAL | `design.ts` contracts and `CardDesigner.tsx` inspector rails. | Fills support Solid, Linear Gradient, Radial Gradient, Pattern, and Images. Strokes support width, color, styles. | Advanced stroke join/cap configurations are missing. | **REUSE** |
| **Geometry** | PARTIAL | Pen tool, Scissors (`splitPathSegment`), Erase Segment (`erasePathWithWorldStroke`). | Node dragging, endpoint reconnection with OSNAP, path cutting. | Node types toggling (corner, smooth, symmetric) is missing. | **NEW** |
| **Shape Library** | IMPLEMENTED | Basic shapes rail on the left in `CardDesigner.tsx`. | Inserts rectangle, circle, ellipse, triangle, hexagon, octagon, capsule, line. | Hardcoded templates; lacks a generalized custom polygon builder. | **REUSE** |
| **Shape Text** | IMPLEMENTED | `ShapeText` component rendering and text binding. | Renders custom bound text inside vector shapes. | Advanced vertical text alignment and inner padding controls are missing. | **REUSE** |
| **Arrange** | IMPLEMENTED | Context toolbar actions and layers drag-and-drop hierarchy. | Reorders elements on the z-axis. | Bounding box align actions are present, but distribution spacing is basic. | **REUSE** |
| **Layers** | IMPLEMENTED | Layers panel rail in `CardDesigner.tsx`. | Reorders, locks, and hides elements. | Scroll positioning bugs inside layers pane on long element list. | **REUSE** |
| **Multi-selection** | PARTIAL | `selectedIds` state tracking. | Collects multiple selected elements. | Drag-to-select marquee box is missing. | **NEW** |
| **Groups** | PARTIAL | `phase605-layers-groups.test.ts` group structure. | Packages elements into a group container. | Scaling groups proportionally is not fully generalized. | **HARDEN** |
| **Boolean** | IMPLEMENTED | `booleanUtils.ts` and `phase709-boolean-path.test.ts`. | Path union, subtraction, intersection, and exclude operations using paper.js. | Heuristics were untested (placeholders). We have converted tests to real. | **HARDEN** |
| **Face Split** | IMPLEMENTED | `faceSplit.ts` topology solver at `splitComponentFaceByDivider()`. | Subdivides faces using dividers with `0.05mm` snapping. | Self-overlapping lines can throw topology errors. | **HARDEN** |
| **OSNAP** | IMPLEMENTED | `pointSnapping.ts` and OSNAP tests. | Coincident coordinate snapping across 8 priority levels. | Green snap indicator gets stuck on screen boundary release. | **REUSE** |
| **Persistence** | IMPLEMENTED | `persistence` package schemas. | Saves/loads JSON templates safely. | Schema migrations are not automated if shape properties change. | **HARDEN** |
| **Clipboard** | MISSING | No system-wide clipboard commands. | Local duplicate action works, but cross-template copy is missing. | Local template limit only. | **NEW** |
| **History** | IMPLEMENTED | Custom history stack in `CardDesigner.tsx`. | Saves full snapshots of design elements. | High memory footprint due to full layout clone. | **REUSE** |
| **Export** | IMPLEMENTED | `CardExportCanvas.tsx` and custom `pdf-renderer.ts`. | Generates PNG, JPEG, and PDF. Just added PDF image hyperlinks. | Raster rendering memory footprint for very high-DPI canvases. | **REUSE** |
| **Testing** | IMPLEMENTED | 770 Vitest tests running. | Comprehensive test suites. | Interactive UI browser smoke tests are mostly manual. | **REUSE** |
