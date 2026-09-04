# Phase 9.4L–9.4M — SVG Dieline Import + Manual Panel Mapping

## Scope

Phase 9.4L adds a printer-supplied SVG/vector dieline import foundation. Phase 9.4M adds manual technical-layer assignment and manual packaging-panel mapping on imported geometry.

## Implemented

- SVG import from Card Designer → Assets → Import Printer Dieline.
- Physical size preservation from SVG `width` / `height` and `viewBox`.
- Units supported: mm, cm, in, pt, pc, px (px uses CSS 96 DPI fallback).
- Supported vector primitives: path, line, polyline, polygon, rect.
- Path commands: M/L/H/V/C/S/Q/T/Z; SVG A arcs are foundation-mode endpoint approximations with a warning.
- Multi-subpath `<path>` data is split into independent editable PATH elements.
- Common semantic ids/classes containing cut/knife/die-cut or crease/fold/score are auto-classified when present.
- Imported vectors can be manually assigned CUT / CREASE / Other.
- CUT / CREASE can be explicitly locked/unlocked after classification.
- Manual panel mapping can create FRONT/BACK/LEFT/RIGHT/GLUE and TOP/BOTTOM face panels from selected vector bounds.
- Top/bottom mapping supports explicit Tuck or Dust flap semantics.
- Safe margin and bleed are stored per mapped panel.
- Imported panel metadata feeds the existing Panel selection, Focus mode, Inspector, artwork operations and Preflight pipeline.
- Source and generated `dist` design-engine exports are synchronized so the feature is available before a clean rebuild.

## Deliberate Foundation Limits

- PDF vector extraction/recognition is not part of this phase.
- SVG `transform` attributes are detected and warned; transformed geometry must be visually verified in this foundation release.
- SVG elliptical arc (`A`) commands are represented by endpoint lines for now. Use printer SVGs with flattened curves or visually verify curved flap geometry.
- Panel mapping uses the combined bounds of the selected vector geometry; automatic planar-region/panel detection comes later.

## Verification performed in this environment

PASS:
- TypeScript syntax/transpile check for `svgDielineImport.ts`.
- TypeScript/JSX syntax/transpile check for `CardDesigner.tsx`.
- Functional harness: 200 × 100 mm SVG physical size preserved.
- Functional harness: multi-subpath crease path split into independent vectors.
- Functional harness: inferred CUT/CREASE semantics and technical groups.
- Functional harness: manual technical reassignment.
- Functional harness: explicit technical lock.
- Functional harness: TOP FRONT + TUCK panel mapping and canonical panel metadata.
- UI wiring source contract: import, CUT, CREASE, lock/unlock and map-panel controls present.
- Conflict-marker scan on changed files.

BLOCKED / NOT CLAIMED PASS:
- `npm install --ignore-scripts` timed out in the container.
- Full `npm run typecheck`, `npm test -- --run`, and `npm run build` therefore could not be executed with the project dependency graph.
- Container Node is 22.16.0 while project `.nvmrc` targets Node 20.

## Manual acceptance

1. Open Card Designer → Assets → Import Printer Dieline.
2. Import a printer SVG with physical dimensions.
3. Confirm artboard size matches expected millimetres.
4. Select cut vectors and click CUT; select fold vectors and click CREASE.
5. Lock CUT + CREASE.
6. Unlock while mapping if more vector selection is required.
7. Select the vector/region defining Front; choose Front and Map Selected Bounds as Panel.
8. Repeat Back/Left/Right and top/bottom flaps; choose Tuck/Dust as applicable.
9. Click Panels and verify mapped regions are selectable/focusable.
10. Add artwork in a focused panel and run Preflight.
11. Save/reopen and verify imported geometry + panel mappings persist.
12. Export Dieline Proof and verify CUT + CREASE parity.
