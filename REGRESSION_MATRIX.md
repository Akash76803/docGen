# Regression Matrix

This document registers test coverage and quality metrics for all critical system features.

| Feature | Existing Test | Quality | Manual Test | Export Risk | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **LINE** | `phase73-divider-draw.test.ts` | **REAL** | Yes | Low | Core line drawer is fully covered. |
| **FLEXIBLE_LINE** | `phase71-flexible-line.test.ts` | **REAL** | Yes | Low | Node tracking is fully covered. |
| **SPLIT** | `phase711-split-tool.test.ts` | **REAL** | Yes | Low | Splitting element geometries. |
| **OSNAP** | `phase710-point-osnap.test.ts` | **REAL** | Yes | N/A | Locks pointer coordinate to target candidate. |
| **Face Split** | `phase73-face-split.test.ts` | **REAL** | Yes | N/A | Subdivides artboard faces correctly. |
| **AUTO_SECTION** | `phase75-multi-section-component.test.tsx` | **REAL** | Yes | Low | Independent face rendering logic. |
| **Fill Bucket** | `phase712-fill-joined-boundary.test.ts` | **REAL** | Yes | Low | Fills targeted closed path face. |
| **Scissors** | `phase74-cad-trimmer-addendum.test.ts` | **REAL** | Yes | Low | Splits path coordinates at vertex. |
| **Erase Segment** | `phase74-cad-trimmer-addendum.test.ts` | **REAL** | Yes | Low | Slice paths between intersections. |
| **Pen** | `phase714-polyline-session-lifecycle.test.ts`| **REAL** | Yes | Low | Pen tool drawing sessions. |
| **Edit Path** | `phase714-polyline-session-lifecycle.test.ts`| **REAL** | Yes | Low | Interact with path nodes. |
| **Boolean** | `phase709-boolean-path.test.ts` | **REAL** | Yes | High | Updated from PLACEHOLDER to REAL. |
| **Guides** | `phase613-rulers-grid-guides.test.ts` | **REAL** | Yes | N/A | Canvas snapping guides. |
| **Grid** | `phase613-rulers-grid-guides.test.ts` | **REAL** | Yes | N/A | Canvas grid locks. |
| **move** | `phase603-selection-transform.test.ts` | **REAL** | Yes | Low | Shift elements. |
| **resize** | `phase603-selection-transform.test.ts` | **REAL** | Yes | Low | Scale elements. |
| **rotate** | `phase603-selection-transform.test.ts` | **REAL** | Yes | Low | Rotate elements. |
| **layers** | `phase73-layer-order-regression.test.ts` | **REAL** | Yes | Low | Z-index sorting. |
| **groups** | `phase605-layers-groups.test.ts` | **REAL** | Yes | Low | Nested group containers. |
| **selection** | `phase603-selection-transform.test.ts` | **REAL** | Yes | N/A | Selection set state updates. |
| **Undo/Redo** | `phase605-layers-groups.test.ts` | **PARTIAL** | Yes | N/A | History stack works via snapshots. |
| **save/load** | `phase505-workspace-persistence.test.ts` | **REAL** | Yes | N/A | Serializing artboards and templates. |
| **Excel** | `phase662-data-context-binding.test.ts` | **REAL** | Yes | Low | Excel data column parsing. |
| **CSV** | `csv-adapter.test.ts` | **REAL** | Yes | Low | CSV comma separation rows parser. |
| **Base64 image** | `phase79-base64-image-binding.test.ts` | **REAL** | Yes | Medium | Dynamic binary strings parse. |
| **Shape image fill** | `phase79-fix4-shape-image-fill-serialization.test.ts`| **REAL** | Yes | Medium | Masking images inside vector paths. |
| **hyperlink** | `phase661-dynamic-binding.test.ts` | **REAL** | Yes | Medium | Image clicking overlays. |
| **QR** | `phase666-qr-barcode-binding.test.ts` | **REAL** | Yes | Low | Vector QR generator. |
| **Barcode** | `phase666-qr-barcode-binding.test.ts` | **REAL** | Yes | Low | Vector 1D barcode generator. |
| **PDF** | `phase650-card-pdf-export.test.ts` | **REAL** | Yes | High | Native PDF link annotations compiler. |
| **PNG** | `phase650-card-image-export.test.ts` | **REAL** | Yes | Medium | PNG high-DPI export canvas. |
| **JPEG** | `phase650-card-image-export.test.ts` | **REAL** | Yes | Medium | JPEG compression canvas renderer. |
