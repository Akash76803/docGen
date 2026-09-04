# Phase 6.5: Render & Export

This phase introduces production-ready export functionality for the Card Designer. 
The architecture integrates with existing rendering and persistence stacks while avoiding unnecessary duplication.

## Architecture Highlights
- **CardExportRequest**: A standardized export contract integrating output mode, dimensions, transparent options, and Print parameters.
- **Export Preflight**: Non-blocking Preflight summary identifying missing assets, bleed recommendations, and resolution constraints. 
- **Target Resolution**: Direct consumption of Phase 6.4 logic covering `CURRENT`, `SELECTED`, and `ALL` artboards.
- **Native Delivery**: Integration with the Phase 5.0.4 native `FileDeliveryService` allowing standard desktop "Save As", multiple folder extraction, and ZIP bundling.

## PDF Export Behavior
- Bleed dimensions correctly map to physical PDF page dimensions dynamically.
- Preserves distinct dimensions across mixed-size artboard documents inside a combined PDF.
- Editor UI markers (guides, grid, bounds) are explicitly excluded from production output.

## PNG & JPEG Rasterization
- Target output maps physical layout sizes using standard formulas (e.g., `pixels = mm / 25.4 × DPI`).
- Supports scalable resolutions spanning 96 DPI to standard high-resolution 600 DPI, with automatic dimension-estimation and memory validations prior to raster generation.
- Handles explicit alpha channel requirements vs. fallback composited solid backgrounds for JPEGs.

## Upcoming / Future Scope
- **Phase 6.6**: Dynamic Data Binding
- **Phase 6.7**: Bulk Personalized Generation
- Direct integration with CMYK conversion, ICC profiling, nested output sheets, and gang-up printing will follow separate pathways decoupled from basic file orchestration.
