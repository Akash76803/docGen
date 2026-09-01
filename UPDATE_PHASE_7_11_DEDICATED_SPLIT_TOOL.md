# Phase 7.11 — Dedicated Split Tool + CAD Naming Clarification

## Baseline

This change was implemented only on top of the uploaded latest baseline:

`Document-Generator-Current-Project(1).zip`

No older Phase 7.10/Fix1 folder was used as the source of truth.

## Part A — Trace Before Change

### User-visible tool entries before this change

From `apps/desktop/src/components/designer/ElementLibraryPanel.tsx` and the canvas/context toolbar:

| Tool / entry | User-facing label | Tooltip / visible help before change |
|---|---|---|
| SELECT | Select Tool | `Exit the active drawing or trimming tool` |
| FLEXIBLE_LINE | Flexible Line | `Draw and bend editable lines` |
| PEN | Pen Tool | `Draw custom paths` |
| EDIT_PATH | Edit Path | `Edit path nodes and curves` |
| SCISSORS | Scissors | `Split a path segment` |
| TRIMMER | Trimmer | `Remove a segment between intersections or points` |
| ERASER | Freeform Eraser | `Draw a freeform selection around unlocked elements to erase them` |
| FILL_BUCKET | Fill Bucket | `Fill a closed shape or section` |
| Join action | Join Path | `Join two open paths` |
| Close action | Close Path | `Close an open path` |
| DRAW_SHAPE / LINE | Line | Shape-library button tooltip: `Add Line` |
| DRAW_SHAPE / other shapes | Shape name | Shape-library button tooltip: `Add <Shape>` |
| PEN duplicate top-toolbar entry | Pen Tool | `Pen Tool (Draw Paths)` |
| Boolean UNION | Union | `Boolean Union` |
| Boolean SUBTRACT | Subtract | `Boolean Subtract` |
| Boolean INTERSECT | Intersect | `Boolean Intersect` |
| Boolean EXCLUDE | Exclude | `Boolean Exclude` |

Basic/dynamic insert entries also remain available: Text, Shape, Image, QR Code, Barcode.

### Existing LINE pipeline

`DRAW_SHAPE + drawShapeType === 'LINE'` is handled by the shared canvas pointer path in `CardDesigner.tsx`:

- `downCanvas()` captures the first/second point.
- `drawingSnap()` calls the Phase 7.10 `resolvePointSnap()` OSNAP resolver.
- `moveCanvas()` updates the same live line preview and snap marker.
- `commitDrawDraft()` creates the divider PATH.
- For normal LINE, `splitComponentFaceByDivider()` is already attempted as a side effect; if no split is proven the line remains a normal line.

### Existing FLEXIBLE_LINE pipeline

`FLEXIBLE_LINE` is handled in the Pen/Flexible-Line branch of `downCanvas()`:

- Current endpoint is resolved by `activePathLineStart()`.
- `drawingSnap()` reuses `resolvePointSnap()`.
- New path points/segments are appended to the selected open PATH.
- In FLEXIBLE_LINE mode the resulting divider is passed to `splitComponentFaceByDivider()`.

### Cleanest implementation decision

A new `SPLIT` interaction mode is the cleanest implementation.

It reuses the same two-point line preview and Phase 7.10 OSNAP path as LINE. It does **not** introduce a second geometry engine or a duplicate snapping resolver.

The only intentional commit-semantic difference is:

- LINE: attempt split; if it fails, keep the line as a normal line.
- SPLIT: attempt split; if it fails, discard the attempted divider and show a non-blocking status message.

This was chosen over a wrapper around the external LINE button because the canvas interaction state already owns the preview, snapping and two-point commit lifecycle.

## Part B — Implementation

### 1. Dedicated SPLIT mode

Added `SPLIT` to the interaction-mode union used by:

- `CardDesigner`
- `CardArtboardCanvas`
- `LayerPanel`
- `ElementLibraryPanel`
- `DesignerContextToolbar`

### 2. Discoverable Split utility entry

Added a dedicated Utility entry:

- Label: `Split`
- Dedicated split icon distinct from the existing Scissors and Erase Segment icons
- Tooltip:

`Split — draw a snapped divider across a closed shape to create separate, independently editable parts.`

The tool is independently selectable and stays active after a successful/failed attempt so another split can be drawn.

### 3. Reused OSNAP — no OSNAP changes

`pointSnapping.ts` was not modified.

`drawingSnap()` now treats `SPLIT` as a line/connect context in addition to:

- PEN
- FLEXIBLE_LINE
- DRAW_SHAPE + LINE

The existing snap indicator and line live preview are reused.

### 4. Reused face-split engine — no geometry changes

`faceSplit.ts` was not modified.

On SPLIT commit, the new divider PATH is created in memory and passed directly to:

`splitComponentFaceByDivider([...artboard.elements, divider], divider, ...)`

If a valid split is returned:

- Source closed shape is replaced by the generated faces.
- Generated faces keep the same existing component/group semantics used by the LINE face-split path.
- First generated face becomes selected.
- Status shows e.g. `Split created 2 independent parts`.

### 5. Failed SPLIT behavior

If the divider does not satisfy the existing face-split preconditions:

- No divider is persisted.
- No stray line is left on the canvas.
- No geometry algorithm/tolerance is changed.
- A non-blocking status-bar message is shown:

`Split failed — line must start and end on a closed shape boundary`

This behavior was chosen because a dedicated Split tool has one explicit purpose. Silently leaving a line after a failed split would make failure ambiguous and would differ from the tool's stated intent.

### 6. LINE/FLEXIBLE_LINE behavior preserved

The existing normal LINE code path remains present and still calls:

`splitComponentFaceByDivider(nextArt.elements, divider, ...)`

Its existing fallback remains unchanged: if no split occurs, the line can remain as a regular line.

The FLEXIBLE_LINE split side effect is also still present and unchanged.

### 7. Trimmer UI relabeled to Erase Segment

Internal names such as `TRIMMER`, `trimmerUtils.ts`, and trimmer function names were deliberately left unchanged to avoid unnecessary risk.

User-facing changes:

- Old label: `Trimmer`
- New label: `Erase Segment`
- New tooltip:

`Erase Segment — remove a path interval between intersections or chosen points; this does not split a filled region.`

Canvas command/help text was also changed from `TRIM ...` to `ERASE SEGMENT ...` while the underlying interval-deletion behavior remains untouched.

### 8. Scissors tooltip clarification

Scissors remains a distinct tool.

New tooltip:

`Scissors — cut an existing path at a point; it does not divide a closed shape into faces.`

No Scissors geometry behavior was changed.

### 9. Boolean tooltip clarification

Boolean operation names remain:

- Union
- Subtract
- Intersect
- Exclude

`Subtract` was **not** renamed to `Trim` because `Subtract` already communicates the actual boolean operation clearly and avoids reintroducing the same naming ambiguity.

New one-line tooltips explain each operation, including:

`Subtract — remove the second/top selected path from the first/bottom selected path.`

## Part C — Verification

### Source / integration verification

PASS:

- `SPLIT` exists in the interaction mode and utility UI.
- SPLIT uses the existing `resolvePointSnap()` drawing snap resolver.
- SPLIT uses the same line live-preview/two-point interaction structure as LINE.
- SPLIT calls the existing `splitComponentFaceByDivider()` engine.
- Failed SPLIT does not persist the divider.
- LINE's original split side effect remains in the source.
- FLEXIBLE_LINE's original split side effect remains in the source.
- TRIMMER internals remain unchanged; only user-facing copy was changed.
- Scissors behavior code was not changed.
- Boolean implementation was not changed; only tooltips were clarified.

### Core engine integrity

SHA-256 comparison against the uploaded baseline confirmed both files are byte-for-byte unchanged:

- `packages/design-engine/src/faceSplit.ts`
- `packages/design-engine/src/pointSnapping.ts`

### TypeScript syntax/transpile verification

PASS for:

- `apps/desktop/src/pages/CardDesigner.tsx`
- `apps/desktop/src/components/designer/ElementLibraryPanel.tsx`
- `apps/desktop/src/components/designer/DesignerContextToolbar.tsx`
- `apps/desktop/test/phase711-dedicated-split-tool.test.ts`
- `apps/desktop/test/phase710-point-osnap-live-wiring.test.ts`

### Tests added/updated

Added:

`apps/desktop/test/phase711-dedicated-split-tool.test.ts`

Updated Phase 7.10 live-wiring assertion to recognize SPLIT as an additional line/connect OSNAP context.

Added script:

`npm run test:card-split-tool`

The script targets:

- `phase711-dedicated-split-tool.test.ts`
- `phase710-point-osnap-live-wiring.test.ts`
- `phase710-point-osnap.test.ts`
- `phase73-face-split.test.ts`

### Full Vitest execution limitation

A dependency installation was attempted in the sandbox so the requested Vitest suite could be executed, but the install hit the environment transport timeout before dependencies became usable. The temporary partial `node_modules` directory was removed before packaging.

Therefore the following are verified by source trace + TypeScript transpile + static integration assertions, but not by an interactive Electron/browser session in this environment:

- Actual visible click selection of Split in the running desktop UI
- Mouse-driven Split success/failure interaction
- Runtime layer count after split

These should be smoke-tested in the normal Node 20 project environment after `npm install`.

## Monolith note

The previously flagged `CardDesigner.tsx` orchestration concern remains real.

Adding a dedicated mode necessarily required touching this file because it currently owns:

- interaction mode state
- pointer-down/move/up lifecycle
- drawing preview state
- OSNAP dispatch
- split commit behavior
- command hints
- pointer-event routing

This change adds roughly 45 source lines to `CardDesigner.tsx`. No new geometry logic was duplicated there, but the interaction orchestration file has grown further. This should be treated as an architectural debt note, not as a geometry-engine change.

## Files changed

- `apps/desktop/src/pages/CardDesigner.tsx`
- `apps/desktop/src/components/designer/ElementLibraryPanel.tsx`
- `apps/desktop/src/components/designer/DesignerContextToolbar.tsx`
- `apps/desktop/test/phase710-point-osnap-live-wiring.test.ts`
- `apps/desktop/test/phase711-dedicated-split-tool.test.ts` (new)
- `package.json`
- `UPDATE_PHASE_7_11_DEDICATED_SPLIT_TOOL.md` (new)

## Files explicitly not changed

- `packages/design-engine/src/faceSplit.ts`
- `packages/design-engine/src/pointSnapping.ts`
- `packages/design-engine/src/trimmerUtils.ts`
- `packages/design-engine/src/booleanUtils.ts`
