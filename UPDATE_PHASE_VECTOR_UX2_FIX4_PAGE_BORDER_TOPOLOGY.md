# VECTOR-UX2 Fix4 — Page Border Snap / Topology Boundary

## Purpose
Make the page border usable as a non-destructive CAD/topology boundary so users can snap geometry to the page edge and create closed regions that terminate on the artboard boundary.

## Implemented
- Page corners participate in point snapping as vertices.
- Page edges participate in nearest-boundary snapping.
- Active drawing rays/segments can acquire exact intersections with the page border.
- Fill Bucket planar-face detection can use the four page edges as virtual topology edges.
- The virtual page border never becomes a normal selectable design element and is excluded from generated section source IDs.
- Turning **Show Page Border** off disables its topology participation.
- Existing PATH/SHAPE OSNAP, Fill Bucket, Split/Trim and page-border visual/export behavior remain intact.

## Expected workflow
1. Keep Show Page Border ON.
2. Draw a line/path toward an artboard edge; the page edge/corner can snap.
3. Crossing the border produces an exact `Page border intersection` snap.
4. A compartment bounded partly by user geometry and partly by the page edge can be filled as a closed AUTO_SECTION.
5. The page border itself is never selectable, movable, trimmed or deleted.

## Verification
- Targeted TypeScript transpile: `pointSnapping.ts`, `joinedLineRegion.ts`, `CardDesigner.tsx`, Fix4 test source.
- Runtime helper harness: page-edge planar region creation and page-border source exclusion.
- Full Vitest is not claimed if the extracted environment still lacks the runner/dependencies.
