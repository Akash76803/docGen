# Phase 7.5 Fix 1 — First Divider Face Generation

## User-reported regression
A valid boundary-to-boundary line could remain an overlay instead of replacing the closed source with two generated faces.

## Root causes repaired
1. `splitClosedElementByDivider()` required `Paper.Path#getIntersections()` to return exactly two intersections. Endpoint-only contacts are not a reliable contract for Paper.js intersection enumeration, even when the two divider endpoints are geometrically on the boundary.
2. CAD Line integration attempted FaceSplit only when both UI snap metadata objects were present. A valid exact boundary click could therefore skip geometry-level face discovery.
3. Flexible Line integration similarly required the current click to carry a snap object before attempting topology splitting.

## Fix
- FaceSplit now validates divider endpoints by nearest boundary location with a tight 0.05 mm geometric tolerance instead of depending on intersection enumeration at path endpoints.
- Interior divider samples must remain inside/on the target boundary.
- Generated face candidates are rejected when their area is degenerate.
- The divider endpoints used for generated faces are projected to the canonical target boundary coordinates.
- Every committed CAD `LINE` now asks the existing geometry engine whether it partitions a current closed face. Snap IDs are treated only as discovery hints, not as a prerequisite.
- Flexible Line similarly allows the geometry engine to decide whether a newly committed divider segment/path creates a valid split.
- Existing strict two-click behavior is unchanged: no face split runs until the second explicit commit click.

## Regression coverage added
- Rounded rectangle + exact top-to-bottom divider => 2 closed faces.
- UI source regression ensures LINE face splitting is not gated by `draft.startSnap && endSnap`.
- Flexible Line split attempt is not gated solely by current snap metadata.

## Verification
Tests/build/typecheck were not executed in this packaging environment. Re-verification is required in the user's normal project environment.
