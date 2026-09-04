# Phase 8.8A5 Fix2 — Edge Align to Reference Geometry

## Goal
Allow a vector shape/path edge to be picked and aligned exactly onto a Ray, XLINE, normal LINE, Angle Line, or Polyline straight segment.

## Workflow
1. Select one SHAPE or PATH.
2. Click `⌁ Align Edge` in the context toolbar.
3. Click the exact straight target edge.
4. Click the reference Ray/XLINE/LINE/Polyline segment.
5. The target rotates and translates so the selected edge is collinear with and positioned on the reference geometry.

## Geometry contract
- Target shape/path dimensions are unchanged.
- Reference geometry is never modified.
- Selected target edge midpoint is used as the default attachment anchor.
- Rotation uses the minimum undirected line-angle delta (avoids unnecessary 180-degree flips).
- XLINE projection is infinite.
- RAY projection is forward-only.
- Normal finite LINE/Polyline projection clamps to the selected segment.
- Operation completes as one history transaction.
- Straight edges only in this phase; curved Bezier edges are not accepted as target/reference segments.

## Regression protection
- CardDesigner TDZ ordering preserved.
- LINE / Angle Line / Ray / XLINE drawing behavior untouched.
- Face Split, OSNAP, Boolean, Trimmer geometry modules untouched.
- Existing Edit Path and line grip angle editing remain independent.

## Verification
- CardDesigner.tsx transpile: PASS
- DesignerContextToolbar.tsx transpile: PASS
- ElementLibraryPanel.tsx transpile: PASS
- Triangle-to-angled-reference collinearity math: PASS
- Manual Windows UI verification: PENDING
