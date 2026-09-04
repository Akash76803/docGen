# Phase 8.8A3 Fix2 — Shape Draw Regression Isolation

## Problem
After Phase 8.8A3 Fix1, ordinary DRAW_SHAPE workflows could be blocked/regressed because the CAD/XLINE direction-tracking pipeline was entered too broadly for every DRAW_SHAPE mode.

## Fix
- Added an explicit line-like CAD tool capability gate.
- XLINE reference acquisition now runs only for PEN, POLYLINE/FLEXIBLE_LINE, SPLIT, MIRROR_LINE, XLINE, and DRAW_SHAPE+LINE.
- Rectangle/Circle/Polygon/Star/other ordinary shapes bypass CAD direction/XLINE snap resolution and use their direct draw path.
- CAD angle/length HUD is no longer created for ordinary shape drafts.
- LINE dynamic input and XLINE Parallel/Perpendicular acquisition remain enabled.

## Regression safety
Protected geometry systems were not modified: Face Split, point OSNAP, Trimmer, Boolean.

## Verification
- CardDesigner.tsx transpile: PASS
- dedicated phase88a3-fix2-shape-draw-regression.test.ts transpile: PASS
- full workspace typecheck: not claimed; baseline clean bundle lacks installed dependency/workspace build outputs.
- manual UI: PENDING
