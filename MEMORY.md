# Document Generator Development Rules

## Source of Truth
- This extracted folder is the only implementation source of truth.
- Never continue from an older phase copy or nested backup.
- Read the baseline/audit/plan documents before coding.

## Pre-Development Gate
Before any feature change: trace existing behavior, identify reusable implementation, inspect tests, identify persistence/export impact, and document regression risk.

## Architecture Rules
- Avoid adding reusable geometry/business logic to `CardDesigner.tsx`; keep it as orchestration where possible.
- Geometry/math belongs in `packages/design-engine`.
- Persistent models belong in `packages/contracts`.
- Reusable UI belongs in designer components.
- Reuse existing snapping, history, path, face-split, Boolean, and export pipelines instead of creating duplicate engines.

## Critical Regression Protection
Preserve LINE, FLEXIBLE_LINE, SPLIT, CAD point OSNAP, Face Split/AUTO_SECTION faces, Fill Bucket, Scissors, Erase Segment/Trimmer, Pen/Edit Path, grid/guides/general snapping, layers/groups, undo/redo, save/load, Excel/CSV binding, Base64 image binding, shape image fill, QR/Barcode, and PDF/PNG/JPEG export.

## Persistence Gate
Contract changes must be backward compatible, normalize missing optional fields, avoid destructive rewriting, and include round-trip/migration tests.

## Geometry Gate
Before changing PATH, Boolean, Face Split, point OSNAP, or snapping, inspect and run relevant regression coverage. Do not loosen geometry tolerances to hide interaction problems.

## Test Gate
Every phase requires targeted tests, permanent regression tests, typecheck, build, and manual smoke verification where runtime is available. Never report PASS unless the command actually ran successfully.

## Release Gate
Return a complete updated source ZIP, update phase documentation, list exact changed files, record verification results and limitations, and exclude temporary build/install artifacts.
