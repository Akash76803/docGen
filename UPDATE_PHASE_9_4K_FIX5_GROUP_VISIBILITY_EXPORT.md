# Phase 9.4K Fix5 — Group-Aware Export Visibility

## Purpose
Make packaging export visibility deterministic at the export-policy boundary while preserving editor group visibility for ordinary artwork.

## Root cause
`filterCardExportElements()` evaluated element visibility but did not evaluate the element's group hierarchy. Imported, migrated, or hierarchical documents could therefore export ordinary artwork from a hidden group when the element itself remained `visible: true`.

## Fix
- Added hierarchical group-visibility evaluation for non-technical artwork.
- `CLIENT_PROOF`, `DIELINE_PROOF` artwork, and `STANDARD` output now require both element visibility and all ancestor groups to be visible.
- `DIELINE_PROOF` still force-includes CUT and CREASE regardless of editor element/group visibility.
- `TECHNICAL` still force-includes CUT, CREASE, and ANNOTATION regardless of editor visibility.
- Added cycle protection while resolving parent groups.
- Updated the Dieline Proof UI description so it no longer incorrectly says only "visible" CUT/CREASE are exported.
- Kept source and checked-in design-engine `dist/card-export.js` aligned.

## Regression coverage
- Hidden direct artwork group is excluded.
- Artwork under a hidden ancestor group is excluded.
- Visible artwork remains exported.
- CUT and CREASE remain present in Dieline Proof even when their editor layers are hidden.
- Client Proof follows the same artwork group-visibility contract.

## Verification note
Full typecheck/test/build must be run in the supported Node 20 workspace because this extracted source does not contain installed local toolchain dependencies.
