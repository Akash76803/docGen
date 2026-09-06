# VECTOR-UX2 Fix9 — Double-Click Nearest Intersection Commit Restore

Restores CAD finishing behavior for LINE and POLYLINE after the Fix8 capture-priority routing changes.

## Behavior
- Double-click while finishing LINE or POLYLINE resolves an exact nearby intersection first.
- If the cursor is not directly on an intersection, the active segment direction is projected and the nearest forward CAD intersection is used.
- The already-created final endpoint from the first click of the double-click gesture is moved/welded to the resolved intersection; no tiny duplicate segment is intentionally added.
- LINE chain is finished and reset to “Specify first point”.
- POLYLINE is finished while preserving the open/closed state unless the normal close-path rule already closed it.
- The endpoint target metadata is updated and straight-path intersections are materialized after the correction.
- Existing Fix8 capture-priority input routing and temporary double-click-drag pan are preserved.

## Verification
- CardDesigner.tsx targeted TypeScript transpile PASS.
- Fix9 source-marker test targeted TypeScript transpile PASS.
- Source marker runtime harness PASS.
- Full Vitest suite is not claimed in the extracted environment.
