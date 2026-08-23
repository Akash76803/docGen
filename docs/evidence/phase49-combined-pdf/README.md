# Phase 4.9 Combined PDF Evidence

Generated with the low-level Engine PDF `CombinedPdfRenderer`.

- `01-two-single-page-invoices.pdf` - two document boundaries, no blank separator.
- `02-one-and-three-page.pdf` - one-page invoice followed by a three-page invoice.
- `03-three-mixed-invoices.pdf` - 1 + 3 + 2 page sequence. Visual render inspected at transition pages: Invoice ONE page 1/1, Invoice THREE pages 1/3-3/3, Invoice TWO begins on the next fresh page as 1/2.
- `07-per-document-numbering.pdf` - numbering restarts per invoice.
- `08-global-numbering.pdf` - combined physical page numbering.
- `09-large-combined.pdf` - 50 one-page documents in one PDF.
- `10-mixed-page-sizes.pdf` - A4 portrait and A4 landscape physical pages in one PDF.
- `results.json` - generated document/page counts and timings.

The evidence is synthetic renderer-level QA. Final release verification still requires the user's real invoice template and full local monorepo test gate.
