# Phase 1 — Excel / CSV Import + Data Preview

## Scope
Phase 1 implements real local XLSX/CSV ingestion while preserving the Phase 0 architecture:

```text
UI
  -> ImportDataService
  -> ExcelDataSourceAdapter / CsvDataSourceAdapter
  -> NormalizedData
  -> DataPreviewTable
```

## Implemented
- XLSX workbook inspection and sheet discovery.
- Configurable 1-based header row.
- CSV parsing with quoted/escaped values.
- Duplicate/blank header normalization with warnings.
- Conservative CSV datatype inference.
- Native Excel number/boolean/date preservation where SheetJS exposes native values.
- Normalized schema + records + metadata.
- First-100-row responsive preview.
- Friendly import errors.
- No persistent storage of imported business rows.
- Unit-test fixtures and Vitest test suites.

## Dependencies
- `xlsx` in `@document-tool/datasource-excel`
- `papaparse` + `@types/papaparse` in `@document-tool/datasource-csv`
- `vitest` at workspace root

Run `npm install` after pulling this phase so package-lock/node_modules are refreshed.

## Verification
```bash
npm install
npm run typecheck
npm test
npm run build
```

Tauri native verification remains separate and requires Rust/Cargo.

## Explicitly Not Implemented
Template Designer, mapping UI, formulas, PDF/DOCX rendering, grouping, ZIP generation, OCR, API/database/Salesforce connectors.

## Next Phase
Phase 2 — Field Mapping + Grouping Foundation.
