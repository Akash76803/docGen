# Phase 6.0.3 — Selection & Transform Engine

## Scope
Adds the shared, renderer-neutral selection and transform foundation for Card Designer elements without adding element creation tools (those remain Phase 6.0.4).

## Implemented
- Single select, Shift-toggle, Ctrl/Cmd+A, Escape deselect.
- Marquee selection with additive Shift behavior.
- Locked/hidden selection rules.
- Multi-element move and keyboard nudge (0.5 mm / Shift 5 mm).
- Precise X/Y/Width/Height/Rotation transforms.
- Rotation normalization and minimum-size enforcement.
- Aspect-ratio-aware resize contract and anchor semantics.
- Selection bounds calculation.
- Generic canvas element shells so the UI is ready for Phase 6.0.4 element renderers.
- Selection is artboard-scoped and sanitized on artboard/template changes.

## Deliberate boundary
Interactive corner/edge resize handles and the rotation handle are active now. Phase 6.0.4 supplies the concrete text/shape/image creation and visual renderers that use this transform foundation.

## Gate
Run:
- `npm run typecheck`
- `npm run build`
- `npm run test:card-transform`
- `npm run test:card-canvas`
- `npm test`
