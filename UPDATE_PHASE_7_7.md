# Phase 7.7 — Shape Text, Expanded Shape Library, Page-Center Mirror

Implemented on top of the Phase 7.6 baseline.

## Implemented
- Inline editable text for SHAPE and closed PATH-style faces through optional label/text styling.
- Shape text controls in the inspector (content, font, size, weight, style, color, alignment, vertical alignment, padding, line height).
- Shape text rendering in the editor and export canvas.
- Expanded shape library including Square, Diamond, Pentagon, Hexagon, Octagon, Trapezoid, Parallelogram, Right Triangle, Chevron, Double Chevron, Heart, Cloud, Speech Bubble, Callout, Document, Cylinder, Cross, Plus, Banner, Shield, Half Circle, Arc, Curved Arrow, Double Arrow, Bracket, Capsule/Pill, Label Tag and existing normalized shapes.
- Canonical geometry support for new shapes in path utilities so live draw/convert-to-path/export share the same geometry source.
- Page-center mirror commands for horizontal and vertical reflection.
- Mirror defaults to COPY, keeps originals, uses the active artboard center in mm, preserves readable text, preserves QR/barcode orientation, and reflects path geometry/handles.
- Mirror UI exposed in context toolbar and inspector.
- Focused Phase 7.7 tests added for shape text, expanded shape library, and mirror behavior.

## Verification in this environment
`npm run typecheck` was attempted but could not complete because the uploaded source-clean/node_modules state is missing local TypeScript type packages (for example @types/node, @types/react, paper, aria-query and related typings). This is an environment/dependency-state failure, not a reported Phase 7.7 TypeScript source diagnostic.

Run on the user's normal Windows project after dependencies are installed:

```
npm install
npm run typecheck
npm run build
npm test
```
