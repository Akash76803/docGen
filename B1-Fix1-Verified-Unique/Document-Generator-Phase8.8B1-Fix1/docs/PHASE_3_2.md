# Phase 3.2 — Live Data Designer + Row Layout + Preview UX

## Status
Implemented on top of the Phase 3.1 project baseline.

## Files inspected
- `README.md`
- `packages/contracts/src/template.ts`
- `packages/contracts/src/grouping.ts`
- `packages/core/src/template-service.ts`
- `packages/template-engine/src/template-engine.ts`
- `packages/template-engine/src/template-validator.ts`
- `packages/template-engine/src/field-discovery.ts`
- `packages/persistence/src/template-repository.ts`
- `packages/validation/src/template.schema.ts`
- `apps/desktop/src/app/App.tsx`
- `apps/desktop/src/pages/Generate.tsx`
- `apps/desktop/src/pages/Templates.tsx`
- `apps/desktop/src/components/template/TemplatePreview.tsx`
- `apps/desktop/src/index.css`
- Phase 3.1 tests and sample template

## Data-flow change
`GroupingResult.groups` is copied into transient app-level React state. `Generate` publishes groups to that state after grouping, and `Templates` consumes the state for live preview. Imported business data is never written to `TemplateDefinition` or the template repository.

## Contract changes
- Added `VerticalAlignment`.
- Added `RowChildBlock` and `RowBlock`.
- Added `RenderRowChildBlock` and `RenderRowBlock`.
- Added row validation codes.
- `RenderSpacerBlock` now carries resolved `BlockLayout`, enabling renderer-ready spacer placement inside rows.

## Designer changes
- Real `DocumentGroup[]` preview instead of a permanent hardcoded invoice sample.
- Preview group selector.
- Safe placeholder mode when no live groups are available.
- Manual field/table/column path entry with datalist suggestions from live data.
- Independent FIELD Label and Value style controls, including their own alignment controls.
- ROW palette block and row child hierarchy.
- Add TEXT/FIELD/IMAGE/DIVIDER/SPACER children into a row.
- Child width %, left/right reordering, removal and full child property editing.
- Row gap and TOP/CENTER/BOTTOM vertical alignment.
- Basic Invoice sample header now demonstrates Logo + TAX INVOICE in one row.

## Preview UX
- Preview is the central/flexible workspace.
- Left designer and right properties panels can be collapsed.
- Preview presets: 75%, 100%, 125%, 150%, plus +/-.
- Fit Page mode uses container measurements without persisting zoom into the template.
- Full Preview hides the editor sidebars without navigating away or losing the draft.
- A4/Letter aspect ratio is retained and zoomed previews scroll instead of clipping.

## Validation / tests
Added `packages/template-engine/test/phase32-live-row.test.ts` covering live field/table resolution, switching group input, missing paths, independent value styles, row rendering, row child widths, gap/alignment validation and backward compatibility.

The local sandbox could not complete `npm install` because dependency installation timed out, so root workspace build/typecheck/Vitest are intentionally not claimed here. The following source-level checks did run successfully:
- contracts TypeScript build: PASS
- template-engine TypeScript noEmit check: PASS
- core TypeScript noEmit check: PASS
- direct Phase 3.2 engine runtime smoke (ROW + live FIELD + live TABLE): PASS

Run the normal verification on the target machine:

```bash
npm install
npm run build
npm run typecheck
npm test
```

## No Phase 4 work
No PDF generation, DOCX generation, pagination, Chromium/Playwright/Puppeteer, ZIP output, OCR, API, database, Salesforce or AI integration was added.
