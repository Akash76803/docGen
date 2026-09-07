# VECTOR-UX2 Fix15 — Trim Pointer Pass-through & Multi-Segment Bounded Hover

## Problem
In Trim mode, large trim-node hit overlays and the 20px X cursor made precise intersection targeting awkward. More importantly, direct smart-trim only considered two intersections on the same canonical segment. Curves such as circles are composed of multiple Bezier segments, so an overlap arc bounded by two real intersections could cross segment boundaries and never highlight.

## Changes
- Reduced the X cursor to 12px with a centered hotspot and thinner stroke.
- Trim-mode node overlays are visual-only (`pointer-events: none`) so the segment hit corridor always receives hover/click events near intersections.
- Increased Trim segment hit corridor from 14px to 20px (zoom-aware).
- Added `findBoundedTrimRoute()` in the design engine to resolve the complete path route between the two nearest real intersections, including routes spanning multiple canonical segments.
- Added `trimSegmentIntervals()` to commit a multi-segment route atomically.
- Hover preview now highlights every segment portion in the bounded route as one thick red candidate.
- Click deletes the whole highlighted route and passes its two real boundary intersections into Fix14 shared-junction materialization.
- Open-path outer tails remain excluded from direct smart trim; Shift+click manual A/B behavior is preserved.

## Manual Smoke
1. Draw two overlapping circles.
2. Activate Trim.
3. Hover the overlapping arc on either circle, including near either intersection.
4. Expected: the entire arc between the two intersections highlights thick red even when that arc crosses Bezier segment boundaries.
5. Click once.
6. Expected: exactly the highlighted arc is removed and the two endpoints become shared junctions per Fix14.
7. Undo/redo once each; expected atomic restoration/removal.
8. Repeat at 50%, 100%, 200%, and 400% zoom.
9. Verify the small X cursor does not block the visible intersection and moving directly across the intersection does not make hover disappear.
10. Verify Shift+click manual A/B still works and Split/Scissors are unchanged.
