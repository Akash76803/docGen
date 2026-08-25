# Phase 3.6 — Pre-Renderer Contract Freeze

This increment closes two renderer-contract gaps before PDF/DOCX work begins.

## Summary Field role
Mapping roles now include `SUMMARY_FIELD` in addition to group/header/line-item/ignore. Summary fields are row-varying values retained in `DocumentGroup.items` and therefore do not participate in header-conflict validation. Each Summary Field can store a default aggregation: SUM, FIRST, AVG, MIN, MAX, or COUNT.

The mapping UI exposes the role and default aggregation. Template Summary controls identify mapped Summary fields, and the `Mapped Summary Fields` preset can create a summary directly from those mappings. Existing mappings remain backward compatible.

## Expanded page sizes
The core page contract now supports ISO A0–A10, B0–B6, Letter, Legal, Tabloid, Ledger, Executive, and CUSTOM dimensions in millimetres. `PAGE_SIZE_DIMENSIONS`, `PAGE_SIZE_OPTIONS`, and `getPageDimensions()` are the single dimension source for validation, preview, and future renderers.

CUSTOM pages persist `customWidthMm` and `customHeightMm`. Portrait/Landscape is resolved centrally without changing the stored physical custom dimensions.

## Renderer rule
Future PDF/DOCX renderers should consume the resolved page contract and `RenderModel`; they should not maintain independent page-size lookup tables.
