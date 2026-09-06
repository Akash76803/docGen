# VECTOR-UX2 Fix2 — Polyline Closure + Face Fill Hardening

## Problem
A visually closed CAD Polyline could remain `geometry.closed=false`, so normal fill/closed-shape operations rejected it. Fill Bucket generated AUTO_SECTION faces at the top of the layer stack, which could visually paint over existing filled curved bands even when those bands were intended to remain visible boundaries.

## Fix
- Added `cadPolylineCanCloseAtPoint()` using world-space, zoom-derived tolerance.
- Added `closeCadPolyline()` which explicitly creates the final last→first segment, marks `geometry.closed=true`, and records `metadata.cadClosed=true`.
- Polyline drawing now closes/finishes when the user clicks back near its first node (3+ vertices).
- Fill Bucket still resolves an existing AUTO_SECTION first, then the smallest planar region, but new generated sections are layered immediately below already-filled source boundary elements.
- AUTO_SECTION topology version advanced to 2 and records `preserveSourceFills=true`.

## Why this fixes the reported certificate case
The blue Fill Bucket face can no longer visually cover the already-filled gray/yellow curved bands that participate in the boundary. Those existing fills stay above the generated face while the clicked compartment remains independently editable.

## Verification
- `packages/design-engine/src/cadPolyline.ts` targeted TS transpile: PASS
- `apps/desktop/src/pages/CardDesigner.tsx` targeted TSX transpile: PASS
- new VECTOR-UX2 Fix2 test source transpile: PASS
- runtime helper harness: PASS (world-space near-start detection + explicit closing segment)
- Full Vitest suite not claimed in this extracted environment because the runner is unavailable.

## Manual acceptance
1. Draw a 3+ node Polyline and click close to its first node: tool exits and path is closed.
2. Use normal fill on that closed Polyline: fill is accepted.
3. Build nested/overlapping curved filled bands like the certificate sample.
4. Use Fill Bucket in a white compartment: only the independent generated face changes; existing gray/yellow filled paths remain visually intact above it.
5. Save/reload and confirm closure/fill/layer order persists.
