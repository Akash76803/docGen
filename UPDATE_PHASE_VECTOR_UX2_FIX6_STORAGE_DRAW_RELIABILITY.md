# VECTOR-UX2 Fix6 — IndexedDB Storage + Canvas Draw Reliability

## Root causes
1. Card templates and user assets were persisted as large JSON/data-URL workspaces in localStorage. VersionedWorkspaceStore also maintained a `.last-good` copy, so large image/font/template workspaces could exceed browser localStorage quota.
2. The explicit Pan tool could remain toggled on after another drawing tool was selected. Viewport pointer capture treated every left-button press as pan whenever `panMode` was true, so the drawing tool never received pointer input.

## Fix
- Card templates now use `IndexedDbDesignTemplateRepository`.
- User assets/custom fonts now use `IndexedDbUserAssetLibraryRepository`.
- First launch performs a non-destructive best-effort migration from existing localStorage data into IndexedDB; legacy values are left untouched as rollback/recovery data.
- IndexedDB stores one canonical workspace copy instead of the localStorage `.last-good` duplication path.
- If IndexedDB is unavailable, repositories fall back to the existing localStorage implementation.
- Storage save failures no longer mutate/disable the in-memory canvas; errors describe that the canvas remains editable.
- Pan-tool pointer capture is now active only while interaction mode is `SELECT`; Space+drag and middle-button pan still work globally, and the existing any-tool double-click-drag temporary pan remains available.

## Manual acceptance
1. Open a legacy workspace that previously showed `local storage is full`; verify templates/assets migrate and load.
2. Save a template containing multiple images/fonts; reload and verify fidelity.
3. Enable Pan, then choose Rectangle/Circle/Line/Polyline/Pen/Arc and draw immediately; the selected drawing tool must win without manually disabling Pan first.
4. Space+drag, middle-mouse and temporary double-click-drag pan must still work.
5. Reopen the app and verify saved templates/assets remain available.
