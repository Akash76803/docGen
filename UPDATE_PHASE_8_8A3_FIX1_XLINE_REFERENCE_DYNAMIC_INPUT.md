# Phase 8.8A3 Fix1 — XLINE Reference Tracking + Dynamic Input

Status: SOURCE VERIFIED / MANUAL UI PENDING

## Implemented
- Dedicated XLINE hover/acquire reference during CAD line-like drawing.
- Acquired XLINE direction persists until another XLINE is acquired or draw tool exits.
- Tracking labels: `XLINE Parallel` and `XLINE Perpendicular`.
- XLINE reference is excluded from generic element-angle candidates to avoid duplicate/ambiguous labels.
- LINE dynamic input HUD after first point:
  - editable Length (mm)
  - editable Angle (deg)
  - Tab switches fields
  - Enter commits exact endpoint
  - Escape exits to Select
- Typed length/angle use exact engine math via `resolveCadDynamicEndpoint()`.
- Blank fields fall back to current live/tracked values.
- Existing OSNAP, exact intersection capture, Polar, Ortho, Cardinal snap and deep zoom remain in the pipeline.

## Verification
- CardDesigner TSX transpile: PASS
- cadDynamicInput engine source transpile: PASS
- targeted test sources transpile: PASS
- dynamic endpoint runtime smoke (0deg and 45deg): PASS
- full workspace typecheck: attempted separately; baseline dependency/workspace build-output failures may block completion
- manual UI: PENDING
