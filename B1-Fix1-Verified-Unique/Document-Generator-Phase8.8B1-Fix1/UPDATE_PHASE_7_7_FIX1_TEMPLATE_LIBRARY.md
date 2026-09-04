# Phase 7.7 Fix1 — Saved Template Library Visibility

- Added a dedicated **My Templates** section under **Assets & Templates** in Card Designer.
- Card Designer now loads the full saved design-template list from `LocalStorageDesignTemplateRepository` on startup instead of only restoring the active/first template.
- Save refreshes the list immediately.
- Clicking a saved template opens that template and preserves unsaved-change confirmation.
- Saved templates can be deleted from the list; deleting the currently open template falls back to the next saved template or a fresh unsaved design.
- Existing storage key remains `document-tool.card-design-templates.v1`, so existing saved Card Designer templates are not intentionally migrated or cleared by this fix.
