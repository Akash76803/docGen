# Phase 3.4 Fix 1 — Source Library + Smart Field Binding

## Status
Implemented on top of Phase 3.4.

## Source Library
- IndexedDB storage upgraded from one active import to a multi-source library.
- Every new Excel/CSV import receives its own stable local source ID.
- Each source retains file bytes, inspection metadata, sheet/header-row selection, normalized preview, mappings, grouping configuration, grouping result and DocumentGroup[] data.
- One source is marked active, but previously imported sources remain available.
- Existing Phase 3.4 single-source IndexedDB data is migrated automatically on first load.
- Imported business data remains local and is not persisted inside TemplateDefinition.

## Template Designer Source Selector
- Added `Template Source File` selector above the designer workspace.
- Selecting a source changes the live DocumentGroup preview context and binding schema.
- Preview Record / Group selector then operates on the selected source only.
- Refresh action reloads the local source library.

## Smart Field Binding
- FIELD binding dropdown shows imported source header first and renderer target path second.
- Example: `Customer Name → customer.name`.
- TABLE source dropdown is built from discovered/mapped line-item collections.
- TABLE column dropdown shows imported source headers mapped to renderer paths.
- Manual custom paths are moved behind `Advanced: custom path…`; the custom input is not the default field UI when imported fields exist.

## Themes
Available themes:
- Light
- Soft
- Ocean
- Lavender
- Forest
- Dark

All themes use application CSS variables so panel, input, label, secondary text and action contrast follows the selected theme.

## Compatibility
- Existing templates are unchanged.
- Existing Phase 3.4 source workspace is migrated locally.
- No PDF/DOCX renderer changes.
- No cloud/API/database integration added.

## Verification in build sandbox
- TypeScript syntax/transpile smoke: PASS for Templates, Generate, App, Settings and workspaceStore.
- Full npm install timed out in the sandbox before node_modules was created, so root build/typecheck/test are not claimed as PASS here.

Run locally:

```bash
npm install
npm run build
npm run typecheck
npm test
npm run dev
```
