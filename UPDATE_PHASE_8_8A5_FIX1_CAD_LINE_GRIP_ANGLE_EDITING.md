# Phase 8.8A5 Fix1 — CAD Line Grip Angle Editing

## Scope
Adds CAD-style anchored geometry editing for PATH elements created as `cadGeometryKind=LINE`.

## Behavior
- Available in **Edit Path** mode for a single CAD LINE / Angle Line.
- Dedicated HUD exposes **Anchor**, **Length (mm)** and **Angle (deg)**.
- Anchor choices: **Start**, **End**, **Center**.
- Selecting a line endpoint grip automatically selects the corresponding Start/End anchor.
- Start anchor keeps the start world coordinate fixed and recalculates only the end point.
- End anchor keeps the end world coordinate fixed and recalculates only the start point.
- Center anchor keeps the world midpoint fixed and moves both endpoints symmetrically.
- Length is preserved unless the user explicitly changes it.
- Enter in either numeric field or Apply commits the exact geometry.
- Uses the normal history transaction, so Undo/Redo remains available.
- Locked lines expose the HUD read-only.

## Compatibility
Normal object Rotate remains unchanged. LINE, Angle Line, Edit Path, Extend-to-Boundary, save/reload and export continue to use the existing PATH model.

## Verification
- CardDesigner TSX transpile: PASS.
- Anchored geometry math: PASS for Start / End / Center at 40 mm, 30 deg.
- Dashboard TDZ declaration order: preserved.
- Manual Windows UI verification: PENDING.
