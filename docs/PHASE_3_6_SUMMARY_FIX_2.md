# Phase 3.6 Summary Fix 2

## Fixes
- Manual Summary Tables no longer evaluate an empty array when an older template persisted `sourcePath: fields` while aggregate cells point to item-level mappings.
- Aggregate source resolution falls back to the selected DocumentGroup item rows when the configured source path is a scalar object.
- Existing aggregate bindings are canonicalized by original imported `sourceField` against the active Generate mapping. This repairs stale `fields.*` vs `items.*` paths.
- Saving a template with a source loaded persists the repaired canonical bindings.
- `+ Add Summary Row` creates an auto-calculating value cell using the first `SUMMARY_FIELD` (or first imported aggregate-capable field) instead of creating only blank static cells.
- Changing Value Type to SUM/FIRST/AVG/MIN/MAX/COUNT prefers `SUMMARY_FIELD` bindings and immediately configures the selected mapping metadata.

## Backward compatibility
- Existing templates remain version 1.
- Existing STATIC/FIELD/aggregate rows remain supported.
- Old `sourcePath: fields` summary blocks continue to render and are repaired on save when mappings are available.
