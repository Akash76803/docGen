# Phase 3.4 Fix 2 — Mapping-Driven Binding + Source Restore

## Fixes

- Generate now saves the completed mapping + `GroupingResult` + `DocumentGroup[]` immediately when **Build Document Groups** succeeds. Navigation to Templates no longer depends on the 250 ms autosave debounce.
- Existing saved workspaces that contain normalized preview data and mappings but no groups are automatically repaired in Templates by rebuilding groups locally from the saved mapping profile.
- Workspace reads normalize `groups` from `groupingResult.groups` for backward compatibility with partially saved Phase 3.4 Fix 1 sources.
- Template Source File group counts use the normalized/restored group list.
- FIELD binding dropdowns use Generate's `Source Column -> Target Path` mappings as the primary source of truth.
- TABLE column dropdowns show the original mapped Target Path such as `Quantity -> items.qty`, while the stored table-cell renderer path is correctly relative (`qty`) because table rendering resolves each column against an item row.
- Discovered collection fields are normalized to row-relative paths for the same reason.
- Custom path remains an advanced fallback only.

## Important role behavior

Only mappings marked **Line Item Field** can resolve inside a TABLE row. If a source column such as Product is mapped as **Header Field**, change its role in Generate to **Line Item Field** before using it as a table column.

## No scope expansion

No PDF/DOCX generation or absolute-position canvas was added.
