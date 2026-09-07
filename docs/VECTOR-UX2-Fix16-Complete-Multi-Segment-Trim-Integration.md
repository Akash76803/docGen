# VECTOR-UX2 Fix16 — Complete Multi-Segment Trim Integration

## Why Fix16 exists
Fix16 removes the remaining legacy single-interval smart-trim state and makes the multi-segment bounded route the only smart-trim path in CardDesigner. Manual Shift+A/B trim remains separate.

## Implementation cross-check

### Cursor
- `TRIMMER_CURSOR`: 12×12 SVG simple X, hotspot 6,6.
- `TRIMMER_ACTIVE_CURSOR`: same 12×12 X in red when a valid bounded route is under the pointer.

### Pointer routing
- PATH node overlays use `pointerEvents: interactionMode==='TRIMMER' ? 'none' : undefined`.
- Segment hit target uses a 20 px-equivalent zoom-aware corridor in TRIMMER mode.
- Nodes no longer steal trim hover/click; manual A/B still uses segment proximity snapping via `acquireTrimSnap()`.

### Smart trim state
- `hoveredTrimRoute: TrimInterval[]` is the only smart-hover candidate state.
- Removed legacy `hoveredInterval` and `selectedInterval` smart states.
- Smart trim is always `hover -> click -> delete`; Delete/Backspace is reserved for explicit manual Shift+A/B trim.

### Multi-segment route integration
- `findBoundedTrimRoute()` is imported from design-engine and invoked from `updateTrimCandidate()`.
- `getTrimIntervalMap()` provides all canonical segment intersection intervals from the current cached topology snapshot.
- The route may span multiple LINE/CUBIC segments.
- Open-path outer tails return no smart candidate because they are not bounded by two real intersections.

### Preview
- Every interval in `hoveredTrimRoute` is rendered as `data-trim-candidate`.
- Preview is solid red, 6 px-equivalent and zoom-aware, with round caps.
- Cubic partial preview uses exact De Casteljau splitting.

### Commit
- Clicking a valid smart candidate calls `trimSegmentIntervals(element.geometry, route)`.
- Both route-boundary points are passed to Fix14 shared-junction materialization.
- The whole operation remains inside one history transaction.

### Manual trim
- Shift+click starts/continues A/B manual trim.
- Delete/Backspace removes the selected manual route.
- Smart Trim no longer silently falls back into manual mode when no bounded route exists.

## Source files changed in Fix16
- `apps/desktop/src/pages/CardDesigner.tsx`
- `apps/desktop/test/vector-ux2-fix16-trim-integration.test.ts`
- this analysis document

## Verification performed
- TypeScript `transpileModule` syntax checks: PASS for CardDesigner, trimmerUtils and Fix16 test source.
- Source integration marker harness: PASS for 12×12 cursor, node pointer pass-through, 20px hit corridor, route wiring, whole-route preview, atomic multi-interval delete, and removal of legacy single-interval state.
- `npm run typecheck`: attempted; blocked by missing extracted-environment type definition packages (`node`, `react`, `paper`, etc.). No full typecheck PASS claimed.
- Vitest: attempted through `npx`; runner unavailable/timed out in this extracted environment. No full Vitest PASS claimed.

## Manual acceptance test
1. Draw two overlapping circles.
2. Select Trim.
3. Hover an overlap arc between the two intersections.
4. Expected: the entire bounded arc, even if it crosses multiple Bezier segments, becomes thick red.
5. Click once.
6. Expected: exactly that red route disappears.
7. Expected: both trim boundaries become Fix14 shared junctions.
8. Move a shared junction in Edit Path: connected participants remain attached.
9. Use Split on the shared junction: it detaches into independent coincident nodes.
10. At 50%, 100%, 200%, 400% zoom, hover acquisition remains practical and preview thickness stays visually consistent.
