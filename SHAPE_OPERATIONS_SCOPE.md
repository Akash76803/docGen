# Shape Operations Scope

> [!WARNING]
> **TARGET REQUIREMENTS — THIS FILE DOES NOT REPRESENT CURRENT IMPLEMENTATION STATUS.**
> This document details the desired target scope for the Document Generator / Card Visual Design Studio's Shape Operations. These represent future target capabilities to be built and should not be assumed as already completed.

---

## 1. Single Shape Transforms
* **Bounding Box**: Drag-and-scale controls with 8 corner/edge resize handles and top rotate handles.
* **Uniform Resize**: Restricting width/height ratios when holding the `Shift` key.
* **Rotation**: Angle dragging with `15-degree` snaps when holding the `Shift` key.
* **Aspect Ratio**: Toggling aspect ratio locks via the properties rail.
* **Flip/Mirror**: Manual flipping across horizontal and vertical center axes.

## 2. Advanced Styling
* **Fills**: Linear/Radial gradients with custom stops, tileable/stretched patterns, and solid colors.
* **Strokes**: Dash arrays, thickness (width in mm), and stroke properties (line caps, line joins).
* **Effects**: Opacity transparency slider, independent corner radii, and drop shadows (blur, color, offsets).
* **Image Fill/Crop**: Masking/cropping images directly inside shape geometries.

## 3. Geometry Editing
* **Convert to Freeform**: Decomposing primitive shapes (rectangle, circle) into editable curves/paths.
* **Node Editing (Edit Path)**: Direct manipulation of anchor points.
* **Node Modes**: Toggling vertices between Corner (sharp), Smooth (aligned handles), and Symmetric (equal handle length).
* **Segment Editing**: Inserting vertices by double-clicking segments, deleting nodes via the `Delete` key.
* **Shape Adjustments**: Smart handle control for primitive shapes (e.g. inner radius for stars).
* **Change Shape**: Swapping a shape element's primitive type without resetting coordinates or colors.

## 4. Text & Metadata
* **Shape Text**: Auto-wrapping paragraphs inside shapes, vertical text alignment, and margins/padding.
* **Dynamic Bindings**: Mapping properties (text, colors, hyperlinks) directly to imported datasets.

## 5. Selection & Arrange commands
* **Marquee Selection**: Multi-selecting items by dragging a selection rectangle over the canvas.
* **Multi-selection Transforms**: Moving, rotating, and scaling multiple selected elements as a unified boundary.
* **Align/Distribute**: Aligning elements to canvas boundaries or selection bounds. Spacing elements with equal gaps.
* **Match Dimensions**: Equalizing widths, heights, or both across selected items.
* **Grouping / Ungrouping**: Binding elements via `Ctrl+G` and unbinding via `Ctrl+Shift+G`.
* **Regroup**: Re-grouping previously ungrouped items with a single shortcut command.

## 6. Boolean Operations
* **Union**: Merging overlapping elements into one closed boundary.
* **Subtract**: Deleting overlapping top boundaries from the bottom shape.
* **Intersect**: Keeping only overlapping regions.
* **Exclude (XOR)**: Keeping non-overlapping regions.
* **Fragment**: Splitting all overlapping regions into separate independent shapes.
* **Compound Paths**: Managing multiple inner holes/subpaths within a single vector shape.

## 7. App Integration & Operations
* **Clipboard**: Support for copying (`Ctrl+C`) and pasting (`Ctrl+V`) elements between templates.
* **Persistence**: Serializing new shape properties cleanly, with automated legacy migration.
* **History**: Saving Undo/Redo states on transform release.
* **Export**: Outputting shapes, texts, and borders to PNG, JPEG, and PDF format.
* **Testing**: Automated unit tests and browser smoke test coverage.
