# VECTOR-UX2 Fix5 — Saved Template Open / Quota Resilience

## Problem
Saved templates in Assets & Templates could appear clickable but fail to open when browser localStorage was full. `openSavedTemplate()` awaited `repo.setActiveId()` before switching the editor to the requested template. Since changing the active id rewrites the workspace, a quota failure aborted the entire open flow.

## Fix
- Load the saved template into the editor before persisting the active-template preference.
- Treat active-template persistence as best-effort only.
- If localStorage quota prevents `setActiveId`, keep the template open and show a non-blocking warning.
- Allow clicking the currently active saved template to reload its persisted copy; dirty-state confirmation still protects unsaved work.
- Reset artboard selection, element selection, regroup history, zoom, history, and dirty state consistently after a successful open.

## Expected UX
Clicking any item in My Templates must open it even when the workspace cannot write another localStorage update. The user may still see the existing quota warning, but navigation is no longer blocked by it.
