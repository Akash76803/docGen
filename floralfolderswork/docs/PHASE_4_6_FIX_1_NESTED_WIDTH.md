# Phase 4.6 Fix 1 — Nested Width & Numeric Overflow Guard

## Problem
Nested summary/data/custom tables could apply their configured width twice: once through the parent row cell and again through the child table's own `widthPercent`. A 40% row cell containing a 45% summary could therefore render at roughly 18% of the page width. Narrow numeric columns then wrapped values character-by-character.

## Permanent rules
1. Top-level block width is relative to the page/body content area.
2. A TABLE, SUMMARY_TABLE, or CUSTOM_TABLE nested inside a Row/Cell is normalized to 100% of the immediate parent content box.
3. The same normalization applies to supported nested content inside BOX containers in the low-level PDF renderer.
4. Numeric summary values never character-wrap. HTML uses `white-space: nowrap`; the low-level PDF renderer shrinks numeric text only when necessary, with a guarded minimum font size.
5. Text labels and headers continue to wrap normally.
6. No business-specific QR/bank positioning heuristic is introduced. Their spacing remains controlled by the row cell widths, padding, and row gap so layout stays reusable.

## Compatibility
Top-level table widths are unchanged. Existing row/cell percentage widths remain unchanged. Only nested child-table width semantics are normalized.
