# Phase 8.7 Add-on Fix4 — CAD Exact Intersection + Deep Zoom

Status: SOURCE VERIFIED / MANUAL UI PENDING

## Problem
At high zoom, a line committed near a curved/shape intersection could still reveal a tiny mismatch. The CAD projection overlay previously derived ray intersections from sampled curve segments, so visual snapping could be close without being mathematically identical to the vector boundary. Canvas zoom also stopped at 200%, making these defects hard to inspect.

## Changes
- Added `cadGeometry.ts` with Paper.js vector ray/path intersection calculation.
- CAD projected intersections now use exact vector path intersections for SHAPE and PATH geometry.
- Added intersection acquisition hysteresis: 18 px acquire, 30 px release. Small cursor overshoot keeps the exact acquired coordinate locked.
- Exact endpoint commit uses the locked intersection coordinate, so the newly drawn line endpoint and indicated boundary intersection share the same world coordinate.
- CAD zoom range expanded from 25–200% to 5–3200%.
- Mouse wheel over canvas zooms around the pointer without requiring Ctrl/Cmd.
- Middle mouse pan and Space+drag pan are preserved.
- Zoom control is directly editable as a percentage.

## Protected behavior
Face Split, point OSNAP and Trimmer implementations were not modified.

## Verification
- Changed TS/TSX syntax/transpile: PASS.
- Targeted regression source added: `phase87-cad-exact-intersection-deep-zoom.test.ts`.
- Full workspace typecheck/runtime suite requires dependencies not bundled in the clean artifact.
- Manual UI validation: PENDING.
