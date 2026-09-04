# Phase 8.8A2 — CAD Polyline + Canvas Pan

Baseline: Phase 8.8A1 CAD LINE Hardening (manual PASS).

## Implemented
- Renamed legacy Flexible Line authoring workflow to CAD **Polyline**.
- Polyline is one open PATH object with multiple connected LINE segments.
- Exact snapped world coordinates are preserved for every vertex.
- Bounds are re-normalized after every append so geometry is not clipped when drawing left/up/outside the initial bounds.
- Zero-length duplicate vertex is ignored; this makes double-click finish safe.
- Enter finishes current polyline but keeps Polyline tool ready for a new object.
- Double-click finishes current polyline and keeps Polyline tool ready.
- Escape exits to Select.
- Polyline only continues a PATH marked `cadGeometryKind=POLYLINE`; arbitrary selected PATHs are not accidentally extended.
- Metadata contract: `cadGeometryKind=POLYLINE`, `cadSectionCandidate=true`, `cadIntent=DRAW`, start/end target references when snapped.
- Existing CAD OSNAP, exact intersection, cardinal, polar, ortho, parallel/perpendicular tracking and HUD are reused.
- Intermediate automatic Face Split was removed from Polyline authoring. Region conversion belongs to the later dedicated Section Engine phase.

## Canvas Pan
- Added explicit **Pan** toolbar toggle.
- Pan ON switches drawing interaction to Select and lets left mouse drag the canvas.
- Middle mouse drag always pans.
- Space + left-drag pans even while another drawing tool is active, intercepted before canvas draw handlers to prevent accidental geometry.
- Wheel pointer-centered deep zoom remains unchanged.

## Verification
- Changed TS/TSX transpile: PASS.
- `cadPolyline.ts` runtime exact-coordinate smoke: PASS.
- Full monorepo typecheck: attempted; BLOCKED by inherited missing dependencies/workspace build outputs (`zod`, `xlsx`, generated dist declarations, etc.).
- Manual UI verification: PENDING.
