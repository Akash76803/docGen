# Phase 6.6.8–6.7 Engineering Reference

## Overview

This document describes the complete **Dynamic Personalization** architecture for the Card Designer, covering preview record navigation (6.6.8), binding freeze/hardening (6.6.9), and bulk personalized generation (6.7).

---

## Architecture: Source / Resolved Invariant

```
Source Template (DesignTemplate)
  ├─ artboard.elements[]  (bindings, visibilityRule, static values)
  └─ sharedAssets[]

                    ↓  resolveArtboardBindings(artboard, context)

Resolved Runtime Clone (Artboard)
  ├─ elements[] (resolved text, resolved image/SVG source, resolved QR/Barcode value)
  └─ elements[n].runtimeHidden = true | false
```

**Critical invariants:**
- Source template is **never mutated**
- `runtimeHidden` is set only on resolved clones — it is **never persisted**
- Every render and export path operates on resolved clones
- `resolvePath` blocks `__proto__`, `constructor`, `prototype`

---

## Phase 6.6.8 — Preview Record Navigator

### New state in `CardDesigner.tsx`

| State | Type | Purpose |
|---|---|---|
| `importedRows` | `Record<string, unknown>[]` | Canonical single source of imported datasource rows |
| `previewRecordIndex` | `number` | Current zero-based row index |
| `safePreviewIndex` | derived | Clamped to valid range |
| `currentPreviewRecord` | derived | The active row (or manual override) |
| `recordCount` | derived | `importedRows.length` |

`importedRecord` (previously separate state) is now derived as `importedRows[0] ?? {}` for backward compatibility.

### Pure Helpers: `apps/desktop/src/services/previewRecordHelpers.ts`

| Function | Description |
|---|---|
| `clampPreviewRecordIndex(index, rowCount)` | Safe clamp; returns 0 for empty |
| `getPreviewRecord(rows, index)` | Returns row at clamped index |
| `createRecordDesignDataContext(record)` | Wraps record in `DesignDataContext` |
| `getRecordDisplayLabel(record, index)` | Human-readable label for UI |
| `sanitizeFilenameSegment(value)` | Strips filesystem-invalid chars |
| `expandFilenameTemplate(tpl, record, idx, artboard)` | Token expansion for filenames |
| `deduplicateFilename(name, usedSet)` | Appends `-2`, `-3` on collision |

### Record Navigator UI

A `card-record-navigator` bar appears below the canvas toolbar when rows exist:
```
Preview:  [‹]  [EMP001 ▼]  1 of 125  [›]
```

- Previous/Next buttons are disabled at boundaries and during manual override
- Dropdown jump-to-record for direct navigation
- "Manual override active" indicator when `previewContextSource === 'MANUAL'`
- Navigator is hidden when `recordCount === 0`

### Context Precedence

1. **Manual override** (`previewContextSource === 'MANUAL'`): `dataContext.record` is set by PreviewDataPanel JSON editor
2. **Imported datasource**: `importedRows[safePreviewIndex]` drives `dataContext`

Switching to a new record automatically sets `previewContextSource = 'IMPORTED'`.

### Front/Back Consistency

`dataContext` is a single React state. Every artboard resolves using the same context. Switching the active artboard does NOT change `previewRecordIndex`.

### Export Consistency

`performExport` uses `dataContext` directly (already the canonical current-record context). No separate context for export vs. canvas.

---

## Phase 6.6.9 — Hardening & Phase 6.6 Freeze

### Source/Resolved Audit Results

- All `mutate()` calls operate on source template
- `resolveArtboardBindings()` always returns a new clone
- `runtimeHidden` is not present in persistence layer (verified in `packages/persistence`)
- `resolvePath` blocks prototype pollution at line 15 of `resolver.ts`

### Binding Fallback Behavior

| Binding type | Missing field | Invalid value |
|---|---|---|
| TEXT template `{{field}}` | Replaced with `""` | Safe string conversion |
| IMAGE source field | Falls back to static assetId | N/A |
| SVG source field | Falls back to static assetId | N/A |
| QR value field | Falls back to static `value` | Empty QR rendered |
| Barcode value field | Falls back to static `value` | Empty barcode |
| Visibility rule field | Safe visible fallback | Safe visible fallback |

### Persistence

Persisted in template JSON:
- `element.bindings[]`
- `element.visibilityRule`
- `element.text` (source template)
- `element.assetId` (source template)

NOT persisted (runtime only):
- `element.runtimeHidden`
- Resolved dynamic text
- Resolved image/SVG URL
- `previewRecordIndex`

### Copy/Paste/Duplicate

The existing `duplicateDesignElements` preserves `bindings` and `visibilityRule` on duplicated elements (verified — deep clones via spread). Undo/redo uses existing history infrastructure; record navigation does not create history entries.

---

## Phase 6.7 — Bulk Personalized Generation

### Service: `apps/desktop/src/services/cardBulkGeneration.ts`

#### Request Contract: `BulkCardGenerationRequest`

```typescript
{
  recordTarget: 'CURRENT_RECORD' | 'SELECTED_RECORDS' | 'ALL_RECORDS';
  currentRecordIndex: number;
  selectedRecordIndexes?: number[];
  artboardTarget: 'CURRENT' | 'SELECTED' | 'ALL';
  currentArtboardId?: string;
  selectedArtboardIds?: string[];
  format: 'PDF' | 'PNG' | 'JPEG';
  filenameTemplate?: string;
  combinePdf?: boolean;
  dpi?: number; jpegQuality?: number; transparentBackground?: boolean;
  includeBleed?: boolean; includeCropMarks?: boolean;
}
```

**Two independent dimensions:**
- `recordTarget` — which rows to process (distinct from artboard targeting)
- `artboardTarget` — which artboards per record (reuses existing `CURRENT`/`SELECTED`/`ALL` semantics but kept separate from export target mode)

#### Pure Planner: `createBulkGenerationPlan(template, rows, request)`

Returns a `BulkGenerationPlan` with:
- `items[]` — record-major ordered plan items
- `totalRecords`, `totalArtboards`
- Each item: `{ recordIndex, artboard, context, filename, label }`

**Record-major order:**
```
R1 Front → R1 Back → R2 Front → R2 Back → ...
```

The planner is **pure** — no rendering, no side effects, fully testable.

#### Pipeline in `performBulkExport`

```
Plan items
  ↓ sequential iteration (memory-safe)
  ↓ resolveItemArtboard(item)  — fresh clone per item
  ↓ validateExportMemory(...)
  ↓ runOrchestrator([resolved], cardRequest, exportReq)
  ↓ collect result
  ↓ release references (setTimeout 0)
```

- One bad record → failure recorded, next records continue
- `BulkCancellationToken.cancel()` stops after current item
- No all-at-once pre-resolution

#### Filename Template Tokens

| Token | Expands to |
|---|---|
| `{{recordIndex}}` | Zero-padded (001, 002, ...) |
| `{{artboardName}}` | Artboard name (sanitized) |
| `{{FieldName}}` | Field value from record (sanitized) |

Missing fields → `record-{N}` fallback. No arbitrary expressions.

#### UI in Export Dialog

- **Personalized Generation** section (shown when datasource is present)
- **Generate For**: Current Record / Selected Records / All Records
- **Choose** button → opens record selection modal with checkboxes
- **Artboard Target**: All / Current / Selected
- **Filename Template**: Editable text field
- **Combine into single PDF** checkbox (PDF format only)
- Export button changes to "Generate (N records)" when bulk mode active
- **Progress overlay**: deterministic progress bar, Cancel button
- **Result summary**: success/fail counts, expandable failure list

---

## Known Limitations

The following are explicitly OUT OF SCOPE for Phase 6.6.8–6.7:

- Scheduled/background batch jobs
- Cloud rendering / distributed processing
- Database storage of imported records
- Email delivery of generated files
- Arbitrary expression evaluation in filename templates
- Conditional artboards (showing/hiding entire artboards per record)
- Vector/path editing
- Real-time collaboration
- Salesforce-specific bulk logic
- Server render farm
- Record-level preview in the record selector (thumbnails)
- Undo/redo of record navigation (intentional — navigator is transient UI state)

---

## Verification Commands

```bash
npm run test:card-preview-context
npm run test:card-binding-freeze
npm run test:card-bulk-generation
npm run test:card-conditional-visibility
npm run test:card-bindings
```

## Manual Smoke Checklist

1. Import a CSV with 3+ rows
2. Record navigator appears below canvas toolbar; Previous/Next work
3. Switching record updates all dynamic text, images, QR, Barcode, visibility
4. Switching artboard (Front/Back) does NOT change the active record
5. Click Export → Personalized Generation section appears
6. Set "All Records" + "All Artboards" → Generate button shows count
7. Click Generate → progress overlay appears → completes with result summary
8. Static templates (no datasource) → still export normally
