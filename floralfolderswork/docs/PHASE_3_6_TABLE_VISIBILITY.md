# Phase 3.6 — Common Table Visibility Controls

Implemented common header/border visibility controls for TABLE and SUMMARY_TABLE.

## Behavior
- Normal TABLE: Show Header defaults ON.
- TABLE and SUMMARY_TABLE: Show Border defaults ON.
- Header and border are independent.
- Border OFF hides cell/header/footer grid lines while preserving padding, widths, alignment, backgrounds, totals and calculations.
- Existing Summary blocks retain their legacy `showHeader` value; old templates without the new flags remain backward-compatible.

## Renderer contract
`TableStyle` now supports optional `showHeader` and `showBorder` fields. The resolved RenderModel contains explicit `showHeader`/`showBorder` booleans so future PDF/DOCX renderers do not need to infer UI behavior.

## Verification in build environment
- Contracts TypeScript typecheck: PASS
- Contracts + Template Engine build: PASS
- Templates.tsx syntax/transpile: PASS
- TemplatePreview.tsx syntax/transpile: PASS
- Validation schema syntax/transpile: PASS
- Added regression test file: `phase36-table-visibility.test.ts`
