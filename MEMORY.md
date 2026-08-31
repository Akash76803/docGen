# Document Generator Development Rules

## Source of Truth

* The current extracted folder is the only source of truth.
* Never continue from an older phase copy.
* Read this file before changing code.
* Read [`CURRENT_BASELINE.md`](file:///e:/Project/Document%20Generator/CURRENT_BASELINE.md).

## Pre-Development Gate

Before implementing anything:
* Inspect actual code.
* Determine what already exists.
* Classify existing code as `REUSE` or `HARDEN` before planning `NEW` work.
* Identify potential regression risks.
* Inspect existing tests.
* Do not implement based on filenames or assumptions.

## Architecture

* Avoid growing `CardDesigner.tsx` with reusable engine logic. Keep it focused on panel states and top-level events.
* Geometry and math belong in `design-engine` package modules.
* Persistent data models belong in `@document-tool/contracts`.
* Reusable UI controls belong in separate designer components.
* Do not create duplicate snapping, history, or geometry engines.

## Critical Regression Protection

You must preserve the following existing features:
* **LINE**: Drawing lines and dividers.
* **FLEXIBLE_LINE**: Drawing multi-point polylines/curves.
* **SPLIT**: Splitting elements and artboards.
* **OSNAP**: Object snapping (endpoints, vertices, boundaries, intersections, grid, guides, centers).
* **Face Split**: Incremental face subdivision and strict `0.05mm` boundary checking.
* **Fill Bucket**: Filling closed regions with solid colors or patterns.
* **Scissors**: Splitting vector paths at clicked nodes/points.
* **Erase Segment / Trimmer**: Deleting segments of line between intersections.
* **Pen / Edit Path**: Adjusting path vertices and control points interactively.
* **Guides/Grid**: Aligning elements to rulers, grids, and guidelines.
* **Selection**: Bounding boxes, primary selection highlights, and multi-selection sets.
* **History**: Undo/Redo command transaction stacks.
* **Save/Load**: Template persistence and schema serialization.
* **Bindings**: Data mapping from CSV/Excel, visible states, and dynamic calculations.
* **Image Fill**: Fitting and masking images inside vector paths.
* **QR/Barcode**: Dynamic rendering of vector QR codes and barcodes.
* **Export**: PNG/JPEG rasterization, and PDF generation with native hyperlink annotation overlays.

## Persistence Gate

Any contract or schema change must:
* Remain backward compatible.
* Normalize missing optional fields automatically when loading.
* Include migration/roundtrip tests.
* Avoid destructive template rewriting.

## Test Gate

Every development phase requires:
* Targeted tests verifying new logic.
* Permanent regression suites protecting existing features.
* Running typecheck (`npm run typecheck`).
* Running full compilation build (`npm run build`).
* Running manual smoke tests.

## Reporting Rule

* Never claim runtime verification or test success unless actually performed.
