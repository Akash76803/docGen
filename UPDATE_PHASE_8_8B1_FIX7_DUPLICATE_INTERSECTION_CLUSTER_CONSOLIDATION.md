# Phase 8.8B1 Fix7 — Duplicate Intersection Cluster Consolidation

## Problem

Several manually drawn lines aimed at one location could store slightly different endpoints. Even with persistent intersection support, those nearby endpoints could render as a small fan or triangle and prevent reliable closed-boundary detection.

## Fix

- Build transitive endpoint clusters within 0.2 mm whenever a new straight LINE participates.
- Require at least two participating PATH elements before declaring a junction.
- Reuse an existing declared intersection as the canonical master when present.
- Otherwise choose a deterministic stable endpoint; do not average and drift geometry.
- Move every clustered endpoint and its handles to the exact master coordinate.
- Detect an endpoint ending within 0.2 mm of another straight segment.
- Project the endpoint onto that segment and split the target at the same canonical coordinate.
- Mark every participating point as a persistent intersection topology node.
- Keep XLINE/Ray and unrelated endpoints outside tolerance unchanged.

## Verification (Linux sandbox, 2026-09-04)

- `npm run typecheck`: PASS (0 errors)
- Targeted intersection/T-junction/OSNAP tests: PASS (3 files, 14 tests)
- `npm test -- --run`: PASS (183 files, 935 tests)
- `npm run build`: PASS (1698 modules transformed)
- Manual Windows UI: PENDING

The inherited Vite large-chunk advisory remains non-fatal.
