# Phase 8.5 Fix3 — Shift+Click Add Node

## User-reported issue
In Edit Path mode, Shift+Clicking a different line/curve did not create an additional node. The visible active dot appeared to move because segment clicks only changed segment selection.

## Fix
- Existing node + normal click: single-select node.
- Existing node + Shift+Click: toggle/add that node in multi-node selection.
- Empty segment + Shift+Click: split the clicked segment at the exact hit position and insert a new persistent PATH node.
- Repeating Shift+Click on other segments inserts additional nodes; prior selected/inserted nodes stay selected.
- Segment insertion uses the existing `splitPathSegment()` engine, preserving line/Bezier geometry semantics.
- Each node insertion is one history transaction.
- Normal segment click remains segment selection and does not insert geometry.
- Existing double-click midpoint split remains available.

## Regression guard
SCISSORS, TRIMMER, Split, OSNAP and existing node/handle interactions are not changed by this fix.
