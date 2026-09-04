# Phase 6.0.6 — Undo / Redo / Copy-Paste / Productivity Foundation

## Scope
- Bounded in-memory design history (default 100 committed edits).
- Ctrl+Z undo, Ctrl+Y / Ctrl+Shift+Z redo.
- Ctrl+C copy, Ctrl+V paste, Ctrl+D duplicate.
- Header Undo/Redo/Copy/Paste controls with disabled state.
- Copy/paste can target a different artboard in the same template.
- Flat group membership is preserved on copy/paste with regenerated IDs.
- Repeated paste uses deterministic 2 mm incremental offsets.
- Drag/resize/rotate pointer interactions are committed as one history entry instead of one entry per pointer move.
- Existing element, transform, layer/group and persistence contracts remain authoritative.

## Architecture
History is editor-session state and is intentionally not persisted with a template. Clipboard is also editor-session state. Both operate on immutable `DesignTemplate` snapshots/contracts and do not introduce renderer or business-logic responsibilities.

## V1 constraints
- Clipboard is internal to the Card Designer session; it does not serialize proprietary design JSON into the OS clipboard.
- Nested groups remain deferred.
- Fine-grained text-property coalescing is not required for V1; each committed property change can be undone independently.

## Verification
- `npm run typecheck`
- `npm run build`
- `npm run test:card-productivity`
- `npm run test:card-layers`
- `npm run test:card-elements`
- `npm run test:card-transform`
- `npm run test:card-canvas`
- `npm test`
- `npm run smoke:card-productivity`
