# Phase 3.6 Summary Aggregate Resolver Fix

## Scope
Fix Summary Table / Table Footer aggregate calculations that displayed `0.00` even when an imported numeric field such as `Final Amount` was selected.

## Root cause handled
Aggregate bindings can store canonical Generate mapping paths such as `items.finalAmount`, while the selected source collection is already iterating one item row at a time. Depending on when the template/source was created, a row may be stored as either `{ items: { finalAmount } }`, `{ finalAmount }`, or the value may only be available in the lazily hydrated original imported row under `Final Amount`.

## Resolution order
For each aggregate cell the engine now attempts:
1. exact selected path
2. exact target path
3. collection-relative path (`items.finalAmount` -> `finalAmount`)
4. last path segment fallback
5. nested collection wrapper fallback
6. original imported source header fallback (`Final Amount`)

For canonical `items` / `sourceItems` aggregate sources, the selected `DocumentGroup` arrays are used directly so lazy workspace/root aliases do not affect aggregate source selection.

## Operations covered
- SUM
- FIRST
- COUNT
- AVG
- MIN
- MAX

## Regression coverage added
- collection-prefixed SUM path against flat line-item rows
- original imported numeric source-header fallback for compact/lazy groups

No PDF or DOCX rendering changes are included.
