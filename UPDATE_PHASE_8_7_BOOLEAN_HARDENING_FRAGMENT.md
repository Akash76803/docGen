# Phase 8.7 — Boolean Hardening + Fragment

Status: SOURCE IMPLEMENTED / MANUAL UI VERIFICATION PENDING
Baseline: Phase 8.6 — Rich Artboard Backgrounds

## Implemented
- Boolean operations now accept closed SHAPE and closed PATH elements directly.
- Primary element is the deterministic base/style source.
- UNION supports 2+ selected closed vectors.
- SUBTRACT uses Primary as base and subtracts every other selected vector.
- INTERSECT supports 2+ selected closed vectors.
- COMBINE (XOR / Exclude) supports 2+ selected closed vectors.
- FRAGMENT supports exactly 2 closed vectors and emits independent closed PATH regions.
- Fragment order/style semantics:
  1. Primary-only regions -> Primary style
  2. Overlap regions -> Primary style
  3. Secondary-only regions -> Secondary style
- Compound-path hole rings are grouped back with their containing outer region when possible.
- Empty boolean results no longer leave a zero-size ghost element.
- Replacement uses existing group-integrity repair and layer replacement flow.
- Generated Boolean result is selected automatically; Fragment selects all generated regions with the first region as Primary.
- Fragment decomposition is containment-aware so hole contours stay attached to their filled outer region instead of becoming filled fragments.

## Preconditions
All selected Boolean operands must be:
- visible
- unlocked
- closed vector-capable SHAPE/PATH elements

Open PATHs and open shapes (LINE/FLEXIBLE_LINE/ARC/BRACKET) are excluded.

## Files
- packages/design-engine/src/boolean-selection.ts (new)
- packages/design-engine/src/booleanUtils.ts
- packages/design-engine/src/index.ts
- apps/desktop/src/components/designer/DesignerContextToolbar.tsx
- packages/design-engine/test/phase87-boolean-hardening-fragment.test.ts (new)
- packages/design-engine/test/phase87-boolean-fragment-hardening.test.ts (new)
- apps/desktop/test/phase87-boolean-toolbar-fragment.test.ts (new)

## Verification
- Changed TS/TSX syntax transpile: PASS
- Targeted runtime/UI Vitest files added.
- Vitest execution attempted but dependency bootstrap is unavailable in this clean artifact.
- `npm run typecheck` attempted: blocked by missing external dependencies (`paper`, React, zod, xlsx, papaparse, etc.), not by a Phase 8.7 syntax error.
- Changed Phase 8.7 TS/TSX files transpile successfully with the available TypeScript compiler.
- Manual UI verification: PENDING.
