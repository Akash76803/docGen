# Phase 4.8 Fix 1 — Paginated Live Template Preview

## Problem
The Template Designer preview rendered one continuous `.paper-page`, while browser Print/Save PDF paginated the same content into multiple physical sheets. This made a two-page invoice appear as one page during design.

## Fix
The Live Preview now performs a browser-layout measurement pass in an off-screen, unscaled page, waits for images, measures header/footer/body blocks and dynamic table rows, and uses the existing renderer-sdk `paginateStable()` planner to build physical preview pages.

### Behaviour
- Each physical preview page uses the resolved page size and margins.
- Preview displays `Preview pages: N` and a `Page X of N` badge.
- Repeated document headers are rendered on continuation preview pages when enabled.
- REPEAT_PAGE footers are reserved and rendered per preview page.
- FLOW / LAST_PAGE_ONLY footer content is rendered only on the final preview page and gets a fresh page if it cannot fit.
- Dynamic Data Tables are split by measured row heights; table headers repeat on continuation pages and footer rows remain on the final table fragment.
- Existing `breakBefore` / `breakAfter` are respected for top-level body blocks.
- Existing Exact Print `PrintableDocument` remains unchanged and is still the source for browser print.

## Architecture

RenderModel
→ hidden unscaled DOM measurement
→ row/block pixel measurements
→ shared `paginateStable()`
→ PreviewPagePlan[]
→ physical A4/A3/Letter/etc. preview sheets

The visible preview does not use `overflow:hidden` as a fake pagination algorithm; the body content is assigned to actual page models before rendering.

## Files
- `apps/desktop/src/components/template/TemplatePreview.tsx`
- `apps/desktop/src/index.css`

## Validation
The extracted ZIP did not contain a complete `node_modules`. Sandbox `npm install` timed out before all type packages were installed, so full desktop build could not be truthfully marked PASS here. Run the normal release gate locally:

```bash
npm install
npm run build
npm run typecheck
npm test
```

Manual regression:
1. Open the same invoice that becomes two pages in Print/Save PDF.
2. Live Preview must show `Preview pages: 2`.
3. Page 2 must repeat the document header and Data Table header when configured.
4. Total / summaries / QR-bank / final box must appear on the correct physical preview page.
5. Print/Save PDF should retain its existing output.
