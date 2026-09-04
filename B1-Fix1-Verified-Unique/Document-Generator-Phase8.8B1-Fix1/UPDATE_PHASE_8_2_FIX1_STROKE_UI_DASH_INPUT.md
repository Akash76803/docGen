# Phase 8.2 Fix1 — Stroke UI & Custom Dash Input

## Scope
A focused follow-up to Phase 8.2 based on manual QA. No geometry or rendering engine behavior was redesigned.

## Fixed
- Renamed Card Designer vector styling section from **Border** to **Stroke**.
- Custom Dash now uses a draft text field so comma-separated input such as `12, 3, 2, 3` can be entered without controlled-input re-render stripping commas.
- Custom Dash commits on **Enter** or **blur** and supports **Escape** to revert the draft.
- Added validation for at least two positive numeric lengths separated by commas or spaces.
- Added a clear disabled **Stroke alignment = Center** selector with an explanation that Inside/Outside alignment is deferred until renderer/export parity is implemented.

## Compatibility
- Existing `DesignStroke.dashArray` persistence remains unchanged.
- Existing Solid/Dashed/Dotted/Custom rendering remains unchanged.
- Phase 8.2 fill, crop, gradient, pattern and export implementations are unchanged.
- Phase 8.1 transforms and geometry engines are untouched.

## Manual QA
1. Select a Shape or PATH.
2. Open **Stroke**.
3. Style → **Custom Dash**.
4. Type `12, 3, 2, 3` continuously.
5. Press Enter or click outside the field.
6. Confirm the full value remains and the stroke updates.
7. Type an invalid value such as `12, abc`; confirm a validation message appears and the previous committed dash pattern is preserved.
8. Confirm Stroke alignment displays **Center** as disabled/read-only with the deferred note.

## Automated Coverage
`packages/design-engine/test/phase82-fix1-stroke-ui.test.ts`
