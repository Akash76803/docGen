# Phase 8.8A4 — CAD Ray

## Scope
Adds an origin-based one-direction CAD construction reference.

## Implemented
- New RAY interaction mode and Utility tool entry.
- `R` keyboard shortcut.
- First click = origin; second click = direction.
- Stored PATH clips from origin to the first forward artboard boundary only.
- Direction uses existing OSNAP, Polar, Ortho, parallel/perpendicular tracking and intersection feedback.
- Ray itself can be hovered as a parallel/perpendicular reference for later line-like drawing.
- Metadata: `cadGeometryKind=RAY`, `cadConstruction=true`, `cadExport=false`, `cadIntent=GUIDE`.
- Export filters already honor construction/non-export metadata, so Ray is editor-only by default.
- Escape returns to Select.

## Verification
- `cadRay.ts` TypeScript transpile: PASS.
- CardDesigner / ElementLibraryPanel / DesignerContextToolbar / shortcut registry transpile: PASS.
- Runtime geometry smoke: horizontal + diagonal: PASS.
- Full workspace build not claimed in this sandbox because workspace dependencies/build outputs are not installed.

## Manual verification
PENDING.
