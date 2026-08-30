# Document Generator

Offline-first desktop application for importing spreadsheet data, designing reusable cards and documents, and exporting generated output as PDF, PNG, JPEG, or DOCX.

Current version: `1.0.0-rc.1`

## Main tools

- Import Excel and CSV data.
- Create and manage reusable document templates.
- Design cards on one or more artboards.
- Bind text, images, QR codes, and barcodes to imported fields.
- Preview individual records and perform bulk generation.
- Export individual files, combined PDFs, and ZIP bundles.
- Configure application database, folders, and output directories.

Every major tool screen includes a Back to Home button.

## Card Designer

The Card Designer currently supports:

- Text, images, SVG assets, QR codes, barcodes, and vector shapes.
- Rectangle, rounded rectangle, circle, ellipse, triangle, polygon, star, arc, wave, line, and editable path geometry.
- Move, resize, rotate, duplicate, copy/paste, lock, visibility, layers, groups, alignment, and distribution.
- Solid, gradient, pattern, and image/texture artboard styling.
- Shape fill, stroke, opacity, shadow, and other supported style properties.
- Rulers, grid, draggable guides, smart snapping, and object/point OSNAP.
- Edit Path, Pen, Flexible Line/Polyline, Split, Trimmer, Eraser, and Fill Bucket tools.
- Multi-artboard designs, print settings, bleed, safe area, crop marks, watermark, and border settings.

## Drawing and snapping

### Line

Choose Line, click the first point, and click the second point. A distinct second click commits the line even if the browser misses the first pointer-up event.

### Flexible Line / Polyline

1. Choose **Flexible Line**.
2. Click the first point.
3. Click additional points to create bends.
4. Press **Enter** or double-click to finish.
5. Press **Escape** to cancel/end the active drawing session.

Each drawing session tracks one explicit open path. Completing a split, changing tools, pressing Enter/Escape, or double-clicking clears the active session, preventing a later click from extending a stale path.

### Angle constraint

Hold **Shift** while placing or previewing a PEN/Flexible Line point to lock the current segment to the nearest 45-degree angle:

`0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°`

An amber preview and angle label indicate that the constraint is active. Boundary, vertex, intersection, guide, and grid OSNAP candidates take priority over the angle constraint, so endpoints can still land exactly on a boundary.

### Divider and Split

- A straight Line whose endpoints lie on the same closed face can split it into two independent faces.
- Flexible Line supports a continuous bent/multi-segment divider, including L-shaped cuts.
- The divider must begin and end on the target boundary, and its intermediate route must remain inside or on that face.
- Generated faces are independently selectable and fillable.

Self-intersecting multi-segment dividers are not explicitly validated yet and should be avoided.

### Fill Bucket

- Click a closed shape or generated section to apply/remove fill.
- Joined straight-line boundaries can be detected and converted into an independently fillable section.
- Open or disconnected boundaries cannot be filled until their segments are joined and closed.

## Recently added

- Wave shape in the element library.
- Dedicated Divider/Split element and tool flow.
- Joined-line region support for Fill Bucket.
- Reliable two-click Line commit.
- Explicit PEN/Flexible Line session lifecycle.
- Shift-based 45-degree angle snapping with live feedback.
- Back to Home navigation across application tools.
- Page/artboard image and texture styling with file selection.

## Parked scope

The complete PowerPoint/CAD-style Shape Operations project is planned but not fully implemented. Parked work includes:

- Complete exact transform, flip, skew, and advanced effect support for every element type.
- Full Edit Points/Convert to Freeform/adjustment-handle workflow.
- Text-inside-shape and shape-aware autofit/wrapping.
- Regroup and fully consistent nested-group transforms.
- Merge Shapes: Union, Combine/XOR, Fragment, Intersect, and Subtract.
- Full cross-renderer fidelity for advanced effects and compound paths.

## Development

Requirements:

- Node.js `>=20 <21`
- npm
- Rust toolchain and Tauri prerequisites for Windows packaging

Install and run:

```powershell
npm install
npm run dev
```

Useful verification commands:

```powershell
npm run typecheck
npm test
npm run build -w @document-tool/desktop
```

Build the Windows installer:

```powershell
cd apps/desktop
npx tauri build
```

Generated NSIS installer:

```text
apps/desktop/src-tauri/target/release/bundle/nsis/Document Tool_1.0.0-rc.1_x64-setup.exe
```

## Source archive

`Document-Generator-Current-Project.zip` contains editable source files and excludes generated dependencies/build artifacts such as `.git`, `node_modules`, `dist`, and `target`.

Older phase-specific README files and detailed phase documentation remain available for historical implementation notes.
