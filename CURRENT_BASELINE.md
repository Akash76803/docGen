# Current Baseline

## Project Identity

* **Name**: Card Visual Design Studio & Document Generator
* **Version**: `1.0.0-rc.1`
* **Current Phase**: Phase 7.10 (Fix 1 / CAD Point OSNAP) + Image Hyperlinks
* **Schema Version**: `1`
* **Date**: 2026-08-31

## Stack

* **Frontend Framework**: React (`^18.3.1`) with custom context and portal overlays
* **Build System & Compiler**: Vite (`^5.4.0`) and TypeScript (`^5.5.4`)
* **Desktop Runtime Environment**: Tauri (`^1.6.0` CLI and API)
* **Design Canvas rendering**: SVG elements combined with browser-native CSS layouts
* **PDF Compiler**: Custom, dependency-free PDF dictionary generator (builds Page catalog, DCTDecode image streams, fonts dictionary, and `/Annots` hyperlinks manually)
* **Persistence**: Offline-first JSON storage, workspace loader APIs, and template schemas

---

## Verified Existing Features

### Canvas
* **Multi-Artboard layouts**: Renders artboards with zoom, fit, grid, guides, rulers, and custom orientations.
* **Canvas Snap Guides**: Elements snap to custom guides and configurable grids.

### Selection
* **State Manager**: Tracks multiple selected element IDs via a Set.
* **Interactive Borders**: Bounding boxes and rotation anchors are rendered for selected shapes.
* **AUTO_SECTION**: Selecting and editing individual subdivided faces independently.

### Transform
* **Element transforms**: Moving, non-uniform scaling, rotating, and horizontal/vertical mirroring.
* **Keyboard nudge**: Arrow keys move elements by `1mm` (or `5mm` with `Shift`).

### Shape / Path
* **Shape Library**: Square, circle, rounded rectangle, capsule, line, triangle, right triangle, hexagon, octagon, trapezoid, parallelogram, arrow, bracket, banner, shield, chevron, cross, callout, heart, wave, cloud, and speech bubble.
* **Path Tools**: Pen Tool (drawing custom paths), Scissors (vertex splits), Erase Segment/Trimmer (cutting line segments), and node drag adjustments.

### Styling
* **Fills**: Solid colors, linear gradients, radial gradients, patterns (dots, diagonal, grid), and raster image backgrounds.
* **Strokes**: Adjusting stroke color, thickness (width in mm), and style (solid, dashed, dotted, none).
* **Effects**: Opacity slider, corner radius, and drop shadows (color, blur, offset).

### Groups
* **Group Container**: Grouping elements via `Ctrl+G` and ungrouping via `Ctrl+Shift+G` with full z-index calculation safety.

### Boolean
* **Path Boolean Operations**: Unite, Subtract, Intersect, and Exclude operations are implemented in the `booleanUtils.ts` module using the paper.js library.

### Data
* **CSV / Excel importer**: Dynamic parsing and mapping of rows to template fields.
* **Calculated values**: Global calculations, table aggregations, and formatting patterns.
* **Vector barcodes**: Generating QR codes and barcodes bound to dataset column fields.

### Export
* **Page Rasterization**: Fast high-DPI exports to PNG and JPEG.
* **Interactive PDFs**: Single and multi-page PDFs with native `/Annots` mapping overlays to preserve clickable image hyperlinks.

### Persistence
* **JSON Workspace Loader**: Safe loading/saving of artboards, grids, styles, and templates.

---

## Partial Features
* **Multi-selection transform bounding boxes**: Multi-selection handles support moving and deleting grouped items collectively, but scaling groups or rotating selection boxes is not fully generalized.
* **Convert primitive shape to path**: Converting standard shapes (e.g. circle) to freeform Bézier paths is limited to specific geometries.

## Missing Important Features
* **System Clipboard Integration**: Cross-template copy/paste is restricted to duplicate-in-workspace actions.
* **Bezler node mode toggles**: Direct toggles between smooth, symmetric, and corner handles are not built.

## Known Risks / Inconsistencies
* **Monolithic UI Component**: `CardDesigner.tsx` has grown to over 2800 lines due to hosting context panels and canvas renderers; avoid adding new math or logic there.
* **Boolean tests were placeholders**: The boolean path tests in `phase709-boolean-path.test.ts` were empty placeholder functions. We have updated them with real assertions.

---

## Exact Commands

```bash
# Install package dependencies
npm install

# Start local Tauri desktop environment (hot reload)
npm run tauri:dev

# Run type checker
npm run typecheck

# Run the core card bindings tests
npm run test:card-bindings

# Run the complete test suite
npx vitest run

# Compile all workspaces and production assets
npm run build

# Bundle the Tauri production installer executable
npx tauri build
```

## Current Baseline Health

**`READY`**

All 770 test cases pass successfully, the monorepo packages compile without errors, and the baseline files are clean.
