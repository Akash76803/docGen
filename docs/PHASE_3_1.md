# Phase 3.1 — Advanced Template Styling & Layout Controls

## Scope
Phase 3.1 upgrades the block-based Template Designer and preserves the existing renderer-independent flow:

TemplateDefinition → TemplateEngine → RenderModel → TemplatePreview

No real PDF/DOCX/ZIP rendering is introduced.

## Contract additions
- BlockLayout: width %, block alignment, margins in document units.
- TextStyle: offline font family, font size, bold, italic, underline, HEX text/background color, text alignment, line height.
- FIELD: separate label/value style, INLINE/STACKED mode, text alignment, spacing.
- IMAGE: DATA_URL/LOCAL_ASSET, alt text, width/height, aspect ratio, alignment and block layout.
- TableStyle: table width/page alignment, header/cell styles, border and cell padding.
- Table columns: width %, body alignment, header alignment, optional header/cell overrides.
- DIVIDER: width/alignment/margins, thickness, color and NONE/SOLID/DASHED style.

## Offline font list
Arial, Calibri, Times New Roman, Georgia, Verdana, Tahoma, Courier New, Segoe UI, system-ui, sans-serif, serif and monospace. No remote font loading or bundled proprietary font files are used.

## Image security
Designer upload accepts PNG/JPEG/WEBP only with a 5 MB UI limit. Uploaded images are stored as controlled data URLs in the template. Remote image/script URLs are rejected by template validation. Legacy/placeholder LOCAL_ASSET entries remain loadable and render a controlled preview placeholder/warning.

## Backward compatibility
All Phase 3.1 properties are optional in TemplateDefinition version 1. TemplateEngine resolves stable defaults into RenderModel, allowing existing version-1 templates without new fields to validate and render without migration.

## Verification notes
The supplied ZIP contained 11 test files / 46 `it(...)` test cases, despite the external requirement stating 53 baseline tests. Phase 3.1 adds one test file with 11 cases, giving 12 source test files / 57 source cases.

In the implementation sandbox, `npm install`/`npm ci` timed out before dependencies were installed, so full `npm run build`, `npm run typecheck`, and `npm test` could not be truthfully certified. Package-level contracts/template-engine TypeScript compilation succeeded, both modified TSX files passed TypeScript transpilation syntax checks, and a direct TemplateEngine runtime smoke passed after temporary local workspace linking.

## Manual smoke checklist
- Text: font, size, bold/italic/underline, colors, 50% width, centered block and centered text.
- Field: independent label/value fonts/colors, INLINE/STACKED, 50% width, right block/text alignment.
- Image: local PNG/JPEG/WEBP upload, width, aspect ratio, left/center/right, save/reopen persistence.
- Table: 25/50/75/100/custom width, left/center/right page alignment, column widths/alignment, header/cell styles, border and padding.
- Divider: width, alignment, thickness, color/style, margins.
