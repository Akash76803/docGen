# VECTOR-UX2 Fix13 — Trim X Cursor + Bounded Hover Delete

## Behavior
- Trim cursor is a simple centered X.
- Hovering a segment interval bounded by two real intersections shows a thick solid red preview.
- Clicking the highlighted interval removes exactly that interval in one atomic trim action.
- Outer tails are not direct-hover trim candidates; Shift+click manual A/B remains available for explicit range trimming.
- Existing cached intersection computation, exact sub-curve preview, Split, Scissors, OSNAP and undo/redo behavior remain unchanged.

## Verification
- CardDesigner.tsx targeted TypeScript transpile: PASS.
- Fix13 source test targeted TypeScript transpile: PASS.
- Marker harness: PASS for X cursor, centered hotspot, internal two-intersection candidate restriction, thick solid highlight, and one-click trim commit.
- Targeted Vitest run was attempted but timed out in the extracted environment; full Vitest PASS is not claimed.
