// VECTOR-UX2 Fix8 source-level regression markers.
// Runtime UI verification is covered by MANUAL_SMOKE_TESTS.md.
export const VECTOR_UX2_FIX8_EXPECTATIONS = [
  'capturePriorityDraw',
  "interactionMode==='FLEXIBLE_LINE'",
  "interactionMode==='PEN'",
  "interactionMode==='DRAW_SHAPE'&&!!drawShapeType",
  "target.closest('button,input,select,textarea,[contenteditable=\"true\"]')",
  'e.preventDefault();e.stopPropagation();downCanvas(e);return;'
] as const;
