# Phase 3.6 Performance Fix 1

## Goal
Reduce Generate and Templates startup/render delays for large imported datasets without changing document/template semantics.

## Implemented

### Workspace persistence
- IndexedDB schema upgraded to v3 with a lightweight `source-meta` store.
- Source-library dropdowns read metadata only; full file bytes/records/groups are lazy-loaded only for the selected source.
- `groupingResult.groups` is no longer duplicated on disk beside `workspace.groups`.
- transient `sourceItems` and `itemDetails` are omitted from persisted groups and rehydrated from normalized source rows + source row indexes on load.
- existing v2 source libraries are migrated automatically once.

### App startup
- Removed eager loading of the entire active import workspace from `App.tsx`.
- Generate loads the active workspace only when Generate is opened.
- Templates loads source metadata first and then only the selected source.

### Generate
- Removed 250ms full-workspace autosave on every mapping/configuration change.
- Source snapshot is saved after import/reload; completed mapping/grouping snapshot is saved after Build Document Groups.
- Grouping busy state paints before CPU-bound grouping starts.
- Warning UI renders only first 50 warnings with an overflow count.
- Group list renders 100 groups per page instead of thousands of buttons simultaneously.

### Templates
- Source library is metadata-first.
- Full workspace lazy-loads only for selected source.
- Group repair runs only for selected source and only when required.
- Existing template/render architecture remains unchanged.

## Backward compatibility
- Existing IndexedDB v1/v2 data remains supported.
- Existing templates are unchanged.
- Group source-row fallback remains available because transient source rows are reconstructed on load.

## Verification in sandbox
- TypeScript syntax/transpile smoke PASS for:
  - workspaceStore.ts
  - Generate.tsx
  - Templates.tsx
  - App.tsx
- Full npm install/build/test could not be run because npm install timed out in the sandbox.

## Recommended local verification

```bash
npm install
npm run build
npm run typecheck
npm test
npm run dev
```

Large-data smoke:
1. Open Generate with a 10k+ row source.
2. Confirm restored source UI appears without the whole app startup being blocked.
3. Build groups and confirm a busy state appears immediately.
4. Confirm only 50 warnings render at once.
5. Confirm group list paginates 100 at a time.
6. Open Templates and confirm source selector appears quickly from metadata.
7. Switch sources and confirm only the selected source shows a loading state.
8. Reopen app and verify source library remains available.
