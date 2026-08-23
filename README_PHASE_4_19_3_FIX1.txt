Phase 4.19.3 Fix 1 - Export Dialog Runtime Wiring

IMPORTANT:
Extract/merge THIS ZIP directly into your existing project root:
E:\Project\Document Generator

The ZIP intentionally starts with apps/... and does NOT contain an extra
Document Generator wrapper, so it will not create Document Generator\Document Generator.

Changed files:
- apps/desktop/src/pages/Templates.tsx
- apps/desktop/src/index.css

Fixes:
1. Export toolbar button is always openable unless an export is already running.
2. Missing/not-yet-ready preview is shown as validation inside the Export dialog instead of a dead disabled button.
3. Export/Close/Cancel buttons explicitly use type=button.
4. Export modal pointer event behavior is explicitly enabled.
5. Added dialog accessibility state markers.

Verification performed in sandbox:
- Desktop TypeScript typecheck via tsc --noEmit: PASS.
- Vitest could not run in the Linux sandbox because the uploaded Windows node_modules lacks @rollup/rollup-linux-x64-gnu.

Run on Windows after merge:
npm install
npm run typecheck
npm run build
npm test
npm run test:export-framework
npm run test:image-renderer
npm run test:jpeg-renderer
npm run test:export-fidelity
npm run dev
