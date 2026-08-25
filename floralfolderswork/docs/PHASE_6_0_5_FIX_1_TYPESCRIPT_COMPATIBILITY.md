# Phase 6.0.5 Fix 1 — TypeScript Compatibility

## Issue
The desktop TypeScript target does not include `Array.prototype.at`, causing `CardDesigner.tsx` to fail typecheck/build.

## Fix
Replaced `newIds.at(-1)` with compatibility-safe indexing:

```ts
newIds.length > 0 ? newIds[newIds.length - 1] : undefined
```

No TypeScript target/lib upgrade was made, preserving the existing project compatibility baseline.

## Regression status before this patch
User-reported Windows verification:
- card layers: 8/8 PASS
- card elements: 6/6 PASS
- card transform: 7/7 PASS
- card canvas: 8/8 PASS
- full regression: 60 files / 289 tests PASS
- card layers smoke: PASS

After applying this patch, rerun:
- `npm run typecheck`
- `npm run build`
