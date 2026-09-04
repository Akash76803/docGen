# Phase 6.6.6 — QR Code & Barcode Dynamic Binding

## Goal
Implement dynamic data binding for `QR` and `BARCODE` elements, allowing them to bind to datasource fields and resolve their values at runtime, similar to `TEXT` and `IMAGE`/`SVG` elements.

## Features Implemented

1. **Element Library Integration**
   - Added `QR Code` and `Barcode` options under the "DYNAMIC" category in the Elements Panel (`ElementLibraryPanel.tsx`).
   - Reused existing `createQrElement` and `createBarcodeElement` factory methods from `@document-tool/design-engine`.

2. **Inspector & Properties Integration**
   - Enabled the `DATA_BINDING` section for `QR` and `BARCODE` elements in the Right Inspector (`designerInspectorConfig.ts`).
   - Embedded the `SearchableFieldPicker` inside `AdvancedQrProperties` and `AdvancedBarcodeProperties` to select dynamic source fields.
   - Wired up the `getValueBinding`, `setValueFieldBinding`, and `removeValueBinding` actions for these elements.

3. **Fallback Inspector Routing (Bug Fix)**
   - Fixed an issue where switching from a `TEXT` element (with the `TYPOGRAPHY` tab active) to a `QR` or `BARCODE` element caused the Right Inspector to enter a blank state.
   - Implemented a clean fallback to the `GENERAL` section in `CardDesigner.tsx` whenever the currently active section becomes invalid for a newly selected element type.
   - This ensures the `DATA_BINDING` configuration remains visible and interactable.

4. **Dynamic Value Resolution**
   - The runtime preview resolves dynamic field values for QR and Barcode using the `DesignDataContext` architecture.
   - Verified that `resolveArtboardBindings` resolves values properly prior to PDF/PNG/JPEG export rendering.

## Status
- **Implemented:** Yes
- **Tested:** Yes (16 tests passed in `phase666-qr-barcode-binding.test.ts`)
- **Verified:** Yes, fallback routing verified and UI behaves cleanly.
