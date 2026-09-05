# TEXT5 Expansion Fix1 — Card Designer Blank Page Recovery

## Symptom
After installing the TEXT5 Expansion build, opening **Dashboard → Card Designer** could render a blank page, especially when the current design contained TEXT elements.

## Root cause
The TEXT5 Expansion edit accidentally removed several pre-existing TEXT3/TEXT4 render helper functions from `CardDesigner.tsx` while leaving their call sites intact. The missing helpers were:

- `applyTextCase`
- `resolveTextAutoFitPt`
- `richTextRunCss`
- `renderRichTextHtmlSegments`
- `renderRichTextSvgSegments`
- `resolveTextPathInfo`
- `textSvgPaint`

When a text element rendered, the Card Designer hit an undefined helper at runtime, causing the React page to fail and appear blank.

## Fix
Restored the missing TEXT3/TEXT4 helper implementations into the latest TEXT5 Expansion baseline without removing the newly added TEXT5 material presets or layer effects.

## Verification performed
PASS:
- `CardDesigner.tsx` TypeScript/JSX transpile syntax check.
- `CardExportCanvas.tsx` TypeScript/JSX transpile syntax check.
- Static helper-recovery verification confirms all seven required helper definitions are present exactly once.
- TEXT5 Expansion effect/preset code remains in the fixed baseline.

Full monorepo typecheck/test/build is not claimed in this environment because the extracted dependency installation is incomplete.

## Manual acceptance
1. Open Dashboard.
2. Click **Card Designer**.
3. Verify the designer opens instead of a blank page.
4. Open an existing design containing normal text.
5. Test rich-text formatting.
6. Test Arc/Circle/Text-on-Path.
7. Apply Gold/Chrome/Neon or another TEXT5 material preset.
8. Reopen Card Designer from Dashboard.
9. Export PNG/PDF and verify text remains visible.
