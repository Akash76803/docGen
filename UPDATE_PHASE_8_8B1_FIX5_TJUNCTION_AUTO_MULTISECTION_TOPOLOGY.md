# Phase 8.8B1 Fix5 — T-Junction Auto Multi-Section Topology

## Root cause

The face splitter required the raw start and end of a divider to lie on the same closed boundary. A CAD LINE drawn beyond a Triangle could visually cross it twice but was rejected, so no first pair of faces existed for a later T-junction to subdivide.

## Implementation

- Collect exact divider endpoint contacts and true divider/boundary crossings.
- Sort contacts along the divider.
- Identify a consecutive contact span whose interior lies inside the closed face.
- Clip extended divider geometry to the valid entry/exit span.
- Project both clipped endpoints to canonical boundary coordinates.
- Preserve incremental splitting of generated `AUTO_SECTION` faces.
- Allow a later corner/boundary-to-shared-divider LINE to split one affected face, preserving all unaffected faces.
- Reject dividers with only one valid boundary crossing or no inside span.
- Preserve a single history transaction per committed divider.

## Acceptance result

The reproduced topology test performs:

1. Triangle + long horizontal LINE crossing outside-to-outside → 2 closed faces.
2. Triangle top corner → horizontal shared-divider midpoint → 3 closed independent faces.

## Verification (Linux sandbox, 2026-09-04)

- `npm run typecheck`: PASS (0 errors)
- Targeted Fix5 + existing face tests: PASS (3 files, 13 tests)
- `npm test -- --run`: PASS (181 files, 929 tests)
- `npm run build`: PASS (1697 modules transformed)
- Manual Windows UI: PENDING

The inherited Vite large-chunk advisory remains non-fatal.
