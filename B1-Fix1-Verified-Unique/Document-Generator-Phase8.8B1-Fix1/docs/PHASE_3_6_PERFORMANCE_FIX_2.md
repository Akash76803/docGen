# Phase 3.6 Performance Fix 2

Fixes a main-thread freeze regression seen when opening Generate and Templates with large persisted workspaces.

## Root causes
- Workspace load rehydrated sourceItems/itemDetails for every persisted group synchronously.
- Template source repair interpreted intentionally compact groups as corrupted and rebuilt all groups on every source load.
- Generate restored the entire active workspace automatically on navigation.
- Templates automatically loaded the entire active source on navigation.

## Changes
- Persisted groups remain compact in memory after IndexedDB load.
- Only the selected group gets source-row context via `hydrateWorkspaceGroup()`.
- Compact groups are accepted as valid and do not trigger repair/re-grouping.
- Generate mounts using metadata only. A `Restore Saved Source` button explicitly loads the heavy workspace.
- Templates mounts using metadata only. Source selection is lightweight and `Load Source` explicitly loads the full selected source.
- Existing source library and persistence remain backward-compatible.

## Expected behavior
Generate and Templates should paint immediately even when the active source has thousands of groups. Heavy source cloning happens only after an explicit restore/load action, with a visible loading state.
