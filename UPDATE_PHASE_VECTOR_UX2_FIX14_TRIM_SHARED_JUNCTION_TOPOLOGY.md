# VECTOR-UX2 Fix14 — Trim Shared Junction Topology

## Goal
After Trim removes a bounded interval, the two trim-boundary intersections become persistent common junctions across every participating vector. Curved SHAPEs are converted to editable PATHs only when a trim junction touches them.

## Behavior
- Trim still uses the Fix13 X cursor and thick bounded hover preview.
- The two trim-boundary world points are forwarded into the commit transaction.
- Every PATH/SHAPE touching either boundary receives an exact node at that coordinate.
- SHAPEs touched by the trim junction are converted to PATH while preserving id, style, position and metadata.
- Participants store a shared junction id in `metadata.sharedJunctionIds` and persistent intersection-node markers.
- Dragging a shared node in Edit Path moves every participant in the same junction to the same world coordinate.
- Split clicked directly on a shared junction detaches the relationship without moving geometry; the coincident nodes become independent.
- Trim + materialize + weld remains one history transaction.

## Verification
Targeted TypeScript transpile and source/runtime harnesses are required. Full monorepo PASS must not be claimed unless dependencies are available and the commands actually complete.

## Test results in extracted source
- `packages/design-engine/src/sharedJunctionTopology.ts` targeted TypeScript transpile: PASS.
- `apps/desktop/src/pages/CardDesigner.tsx` targeted TypeScript transpile: PASS.
- Fix14 test source targeted TypeScript transpile: PASS.
- Runtime harness with two overlapping CIRCLE shapes: PASS for Shape→PATH conversion, common junction id assignment, synchronized junction move, and Split detach.
- Source-marker integration harness: 8/8 PASS.
- Targeted Vitest command was attempted but timed out.
- Contracts workspace build PASS; design-engine workspace build was attempted but stopped before source diagnostics because several local type definition packages are missing from the extracted environment (`@types/node`, React, Paper, etc.). Full design-engine build PASS is therefore not claimed.
