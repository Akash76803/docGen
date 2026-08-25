# Phase 4.3 — Multi-page Print Hardening + Production PDF Flow

Implemented on top of Phase 4.2 Shared HTML Print.

## Added
- Page-level pagination settings: repeat header/footer, engine PDF page numbers, page-number position, keep summary/custom-grid together.
- Block-level print controls: keep together, page break before, page break after.
- Shared HTML print uses a print-only pagination shell with repeating `thead`/`tfoot` regions while preserving the same `renderBlock` output as Live Preview.
- Data-table headers repeat on continuation pages; data rows avoid page splits; table footers remain end-of-table only.
- Engine PDF honors repeated document regions and adds `Page X of Y` after final pagination is known.
- Generate page includes an explicit handoff from the selected document group to Templates/PDF generation.
- Existing templates remain compatible; all new pagination fields are optional with safe defaults.

## Defaults
- Repeat document header: ON
- Repeat document footer: ON
- Page numbers (engine PDF): ON, bottom center
- Keep summary/custom-grid blocks together: ON

## Verification
Run `npm install`, `npm run build`, `npm run typecheck`, and `npm test` on the target machine. A renderer smoke verifies 90 table rows across multiple pages with repeated regions and Page X of Y.
