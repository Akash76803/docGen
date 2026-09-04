# Phase 8.8B1 Fix6 — Persistent Intersection Nodes & Exact OSNAP

## Outcome

- Every newly committed normal LINE is checked against visible editable straight PATH geometry.
- Proper crossings split both involved segments at one canonical world coordinate.
- Endpoint-to-segment contact splits the target segment and declares the branch endpoint as the same intersection.
- Intersection point IDs are persisted in element metadata with topology version 1.
- Future drawing resolves declared intersection nodes before endpoints, vertices, dynamic ray intersections, boundary projections, guides or grid.
- The exact stored coordinate is used for the new LINE start/end.
- Materialization runs before automatic face splitting, enabling accurate subsequent T-junction and multi-section operations.
- XLINE and Ray construction references are excluded from persistent topology mutation.

## Important accuracy regression fixed

A dynamic probe could previously replace a nearby declared node with a mathematically projected point such as `10.0099` instead of stored `10.0000`. Declared intersections now short-circuit dynamic intersection resolution and retain the exact canonical coordinate.

## Scope

Straight `LINE` segments are supported. Bezier intersection-node insertion and automatic topology updates while freely moving whole elements are future scope.

## Verification (Linux sandbox, 2026-09-04)

- `npm run typecheck`: PASS (0 errors)
- Targeted Fix5/Fix6/OSNAP tests: PASS (4 files, 13 tests)
- `npm test -- --run`: PASS (183 files, 933 tests)
- `npm run build`: PASS (1698 modules transformed)
- Manual Windows UI: PENDING

The inherited Vite large-chunk advisory remains non-fatal.
