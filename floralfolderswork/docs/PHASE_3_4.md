# Phase 3.4 — Designer Workflow & Readability UX

Implemented on top of Phase 3.3.

## Added
- Source-driven FIELD/TABLE path dropdowns in Template Designer.
- Imported Excel/CSV workspace persistence using local IndexedDB, including source bytes, preview state, mappings, grouping state and groups.
- App-level sidebar collapse/expand (icon-only collapsed mode).
- Light, Soft and Dark application themes with theme-aware text/input/panel colors.
- Default application theme changed to Light for better readability.
- Theme selector in sidebar and Settings.
- Template save improvements: explicit saved/unsaved indicator, Save Template action, local persistence refresh after save, Ctrl/Cmd+S shortcut.
- Tool palette reorganized into Content and Layout groups.
- Wider document preview layout and theme-aware preview workspace background.

## Persistence boundaries
- Template definitions remain in the existing local template repository.
- Imported source workspace is stored locally in IndexedDB so it survives page navigation and app/browser reload on the same device/profile.
- No cloud upload or external API is used.

## Manual smoke
1. Import Excel/CSV and build groups.
2. Go to Templates and confirm FIELD path is a dropdown populated from imported data.
3. Refresh the app and confirm imported source/group workspace restores.
4. Collapse the main DocTool sidebar and verify preview grows.
5. Switch Light / Soft / Dark themes and verify labels, inputs and panels stay readable.
6. Modify a template, verify `Unsaved changes`, press Ctrl+S, and verify `Saved` plus saved timestamp message.
7. Reopen the saved template and confirm layout/styles persist.
