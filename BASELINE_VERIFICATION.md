# Baseline Verification — Phase 8.7 Add-on CAD Reference-Line Mirror

Baseline folder: Phase 8.7 Fix1 — Boolean Styling & Opacity Parity.

## Verification performed
- Changed TS/TSX source transpile via TypeScript `transpileModule`: PASS.
- New test source transpile: PASS.
- Direct arbitrary-axis reflection math smoke: PASS for 45-degree and vertical axes.
- Protected geometry hashes vs Phase 8.7 Fix1:
  - `packages/design-engine/src/faceSplit.ts`: UNCHANGED
  - `packages/design-engine/src/pointSnapping.ts`: UNCHANGED
  - `packages/design-engine/src/trimmerUtils.ts`: UNCHANGED
- Full `npm run typecheck`: attempted, BLOCKED by missing dependency packages in this clean artifact (`zod`, `xlsx`, `papaparse`, `paper`, React, etc.).
- Manual UI verification: PENDING.

No full runtime/build PASS is claimed.

## Phase 8.7 Add-on Fix3 — CAD Intersection Capture + Draw Tool Exit
- `CardDesigner.tsx` transpile: PASS.
- `ElementLibraryPanel.tsx` transpile: PASS.
- `DesignerContextToolbar.tsx` transpile: PASS.
- targeted Fix3 test source transpile: PASS.
- `faceSplit.ts`, `pointSnapping.ts`, `trimmerUtils.ts`: unchanged vs previous Cardinal Hover baseline.
- `npm run typecheck`: ATTEMPTED / BLOCKED by missing generated package declarations and Tauri dependencies in the clean artifact; no full-project PASS claimed.
- Manual UI verification: PENDING.

## Phase 8.7 Add-on Fix4 verification
- CardDesigner.tsx transpile: PASS
- cadGeometry.ts transpile: PASS
- index.ts transpile: PASS
- targeted regression source transpile: PASS
- protected faceSplit.ts / pointSnapping.ts / trimmerUtils.ts hashes: unchanged from Fix3 baseline
- `npm run typecheck`: attempted; BLOCKED by missing clean-artifact dependencies/build declarations (`zod`, `xlsx`, `papaparse`, workspace dist typings, etc.). No full-project PASS claimed.
- Manual UI: PENDING
