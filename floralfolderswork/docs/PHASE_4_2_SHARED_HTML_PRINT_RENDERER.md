# Phase 4.2 — Shared HTML Print Renderer

## Goal
Use the same React/HTML/CSS document renderer for Live Preview and user-facing print/PDF output, so layout, alignment, fonts, wrapping, borders, nested grids, summaries and images match the preview as closely as the browser print engine allows.

## Architecture

TemplateDefinition → TemplateEngine → RenderModel → PrintableDocument

PrintableDocument is shared by:
- Live Preview (scaled editor shell)
- Print / Save PDF (Exact) via the browser/system print pipeline

The low-level PDF renderer remains available as an Engine PDF fallback for deterministic programmatic/batch generation and advanced pagination work.

## UI
The Template Designer toolbar now exposes:
- Print / Save PDF (Exact) — primary WYSIWYG path. Choose “Save as PDF” in the system print dialog.
- Generate Engine PDF — low-level PDF renderer.
- Download Engine PDF / Open Engine PDF — available after engine generation.

## Print behavior
- Dynamic @page size uses the selected template page dimensions, including custom sizes.
- Print margin is zero at the browser page layer because template margins are already part of PrintableDocument.
- Browser print color adjustment is enabled for backgrounds and borders.
- Data table THEAD repeats when the browser paginates a long table.
- Table rows use break-inside: avoid where supported.
- TFOOT is kept as normal rows so totals do not repeat on every page.
- Print output has no editor scaling, shadow or workspace chrome.
- Images are the same DOM images used by Preview; the print action waits for image decode where supported before opening the print dialog.

## Future hardening
The shared HTML print path is now the fidelity-first user path. Follow-up pagination work can add dedicated repeated document header/footer print rules and page-number support. The low-level renderer remains useful for automation/batch generation where no interactive print dialog is available.
