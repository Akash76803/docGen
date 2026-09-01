# Phase 8.0 — Shape Operations Foundation

## Baseline
Implemented only on top of `Document-Generator-Implementation-Ready-Baseline-ChatGPT.zip` (Phase 7.11 Dedicated Split Tool + Phase 7.10 CAD Point OSNAP).

## Audit decisions applied
- Existing `primaryElementId` selection state was reused, not rebuilt.
- New capability policy and mixed-value infrastructure were added to the design engine.
- Current-schema deserialization now passes through non-destructive normalization before validation.
- Context Toolbar now resolves the real primary element by `primaryElementId` instead of assuming `sourceElements[0]`.
- Multi-selection primary gets an editor-only dashed outline; global selection/transform behavior is unchanged.

## New modules
- `packages/design-engine/src/capabilities.ts`
- `packages/design-engine/src/mixedValues.ts`
- `packages/design-engine/src/normalization.ts`

## Regression safety
No geometry algorithms were changed. `faceSplit.ts`, `pointSnapping.ts`, Boolean geometry, trimmer/scissors geometry, and draw commit logic were not modified.

New scripts:
- `npm run test:shape-foundation`
- `npm run test:shape-ops-regression`

## Deferred to later phases
Rotated resize, generic flip, advanced fills/strokes, Match Size, group hardening, geometry completion, Boolean Fragment, and shape-text autofit remain deferred to Phase 8.1+.
