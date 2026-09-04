# Phase 8.8B1 Fix4 — Post-Trim Multi-Point Endpoint Weld

## Problem

Trimmer correctly split and removed intervals but normalized each remaining fragment independently. Endpoints near a shared junction could therefore remain at slightly different coordinates, creating a visible gap/wedge at deep zoom and preventing a clean multi-point connection.

## Fix

- After fragment replacement, generated open PATH endpoints are canonicalized against existing visible PATH nodes.
- A guarded 0.15 mm tolerance absorbs trim/floating-point drift without pulling unrelated nearby geometry together.
- Two or more generated fragment endpoints may resolve to the same canonical junction.
- Endpoint Bezier handles move by the same delta as their node.
- No artificial connector segment is added.
- Existing/non-target elements remain unchanged.
- Weld occurs inside the same history commit as the trim, preserving one-step Undo/Redo.

## Verification (Linux sandbox, 2026-09-03)

- `npm run typecheck`: PASS (0 errors)
- Targeted trim/weld/regression tests: PASS (4 files, 17 tests)
- `npm test -- --run`: PASS (180 files, 926 tests)
- `npm run build`: PASS (1697 modules transformed)
- Manual Windows UI: PENDING

The inherited Vite large-chunk advisory remains non-fatal.
