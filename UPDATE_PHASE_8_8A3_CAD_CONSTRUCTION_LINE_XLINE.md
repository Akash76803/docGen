# Phase 8.8A3 — CAD Construction Line / XLINE

Status: IMPLEMENTED — MANUAL UI VERIFICATION PENDING

## Scope
- Added CAD Construction Line / XLINE drawing tool.
- Two clicks define an origin and direction.
- The resulting editor PATH is clipped to both artboard boundaries while metadata preserves the defining infinite-line semantics.
- XLINE participates in the existing CAD direction, OSNAP, cardinal, intersection and deep-zoom workflows.
- XLINE is editor/reference geometry only by default and is excluded from PNG/JPEG/PDF export pipelines.
- Construction metadata is persisted for future Convert-to-Divider / Region Section phases.
- Escape exits to Select.

## Metadata contract
- `cadGeometryKind: XLINE`
- `cadConstruction: true`
- `cadExport: false`
- `cadSectionCandidate: false`
- `cadIntent: GUIDE`
- defining origin/through coordinates are persisted.

## Verification
- Changed source transpile: PASS.
- Direct XLINE geometry smoke: PASS.
- Export filters updated in render-model and exact export canvas.
- Full workspace typecheck remains dependent on the baseline dependency/build-output state.
- Manual UI verification: PENDING.
