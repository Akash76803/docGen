# Document Generator

Offline-first, reusable document generation platform built with React, TypeScript and Tauri.

Import Excel/CSV data, map fields, group records into documents, design reusable templates, and export the same resolved document as PDF, PNG or JPEG. Multi-page and multi-document image exports are automatically packaged into ZIP files.

> Detailed product documentation: [Application Implementation Guide](docs/APPLICATION_IMPLEMENTATION_GUIDE.md)

## Current status

Implemented and working:

- Excel and CSV import
- Data preview and schema inference
- Field mapping and document grouping
- Visual Template Builder
- Data tables, summary tables and custom grids
- Rows, boxes, images, QR codes, dividers and spacers
- Rich text and formatted dynamic fields
- Data Views and global Calculated Fields
- Formula columns and aggregate totals
- Conditional visibility
- Physical page setup and stable pagination
- Paginated Live Preview
- Exact PDF/print
- Engine PDF
- Combined PDF
- PNG export
- JPEG export
- Current/all page raster export
- Multiple selected documents
- Automatic ZIP download for multiple images
- Export progress, cancellation and memory guards

Not production-ready yet:

- Editable DOCX export
- Export presets/history
- Streaming ZIP for extremely large batches
- Cloud/email delivery
- HTML, SVG, WebP and TIFF renderers

## Export formats

| Format | Status | Main capabilities |
|---|---|---|
| Exact PDF | Available | Browser/system print using the same physical pages as Live Preview |
| Engine PDF | Available | Generated PDF bytes, vector text, pagination and mixed page sizes |
| Combined PDF | Available | Multiple documents, lazy resolution and per-document/global numbering |
| PNG | Available | 96/150/300/600 DPI, transparency, current/all pages |
| JPEG | Available | 96/150/300/600 DPI, quality 60–100 and background flattening |
| ZIP | Available | Automatic bundle when PNG/JPEG export produces multiple files |
| DOCX | Planned | Editable Word document with explicit fidelity warnings |

## Processing architecture

```text
Excel / CSV
    ↓
Normalized Data
    ↓
Mapping and Document Groups
    ↓
Data Views and Calculated Fields
    ↓
Template Engine
    ↓
Resolved RenderModel
    ↓
Unified Fidelity / Pagination Contract
    ↓
Export Orchestrator and Renderer Registry
    ├── PDF Renderer
    ├── PNG Renderer
    ├── JPEG Renderer
    └── ZIP Bundler
```

The resolved `RenderModel` is the renderer source of truth. Renderers do not independently recalculate formulas, totals, Data Views, visibility or display formatting.

## Technology stack

- React 18
- TypeScript
- Vite
- Tauri desktop shell
- Vitest
- Monorepo with npm workspaces
- Browser Canvas and `html2canvas` for isolated physical-page rasterization

## Repository structure

```text
apps/
└── desktop/                 React and Tauri desktop application

packages/
├── contracts/               Shared data/template/render contracts
├── datasource-sdk/          Data-source interfaces and inference
├── datasource-excel/        Excel import
├── datasource-csv/          CSV import
├── mapping-engine/          Source-field mapping
├── grouping-engine/         Document grouping
├── calculation-engine/      Calculations
├── template-engine/         Validation and RenderModel resolution
├── renderer-sdk/            Fidelity, pagination, orchestrator, registry, ZIP
├── renderer-pdf/            Engine and combined PDF
├── renderer-image/          PNG and JPEG export
├── persistence/             Local repositories
├── validation/              Schema validation
└── core/                    Application services

docs/                        Phase documentation and implementation guide
fixtures/                    Test/sample data
scripts/                     Smoke and regression scripts
```

## Prerequisites

- Node.js 18 or newer
- npm
- Rust/Cargo only when running the Tauri desktop shell

## Install

```powershell
npm install
```

## Run

Browser development:

```powershell
npm run dev
```

Tauri desktop development:

```powershell
npm run tauri:dev
```

## Build and verification

```powershell
npm run typecheck
npm run build
npm test
```

Focused export and fidelity gates:

```powershell
npm run test:export-framework
npm run test:image-renderer
npm run test:jpeg-renderer
npm run test:zip-bundler
npm run test:export-fidelity
npm run test:pdf-freeze
npm run test:combined-pdf
npm run smoke:combined-pdf
```

## Basic workflow

1. Import an Excel or CSV source.
2. Review detected headers and data types.
3. Map source fields to document paths.
4. Configure document grouping.
5. Open Template Builder.
6. Add and style document elements.
7. Bind fields, collections, Data Views and Calculated Fields.
8. Verify the paginated Live Preview.
9. Click **Export**.
10. Choose PDF, PNG or JPEG and download the result.

For multiple PNG/JPEG pages or documents, the application downloads one ZIP:

```text
Documents.zip
├── INV001_page_001.png
├── INV001_page_002.png
└── INV002_page_001.png
```

## Raster export guidance

| Use case | Recommended setting |
|---|---|
| Screen/preview | 96 DPI |
| Bulk sharing | JPEG 150 DPI, quality 75–90 |
| High-quality document | PNG/JPEG 300 DPI |
| Specialist print | 600 DPI with small batches |

Preview zoom does not affect export resolution. A 300 DPI A4 page is approximately `2480 × 3508` pixels and uses about 33 MB of temporary RGBA working memory before compression.

## Security and safety

- Filename and ZIP-entry sanitization
- Path-traversal protection
- Renderer registry validation
- Controlled formula evaluation without JavaScript `eval`
- Cross-origin-safe raster capture (`allowTaint: false`)
- Maximum pixel and estimated-memory limits
- Cancellation between safe page/document boundaries
- No arbitrary output-path writes from renderers

## Documentation

- [Complete implementation guide](docs/APPLICATION_IMPLEMENTATION_GUIDE.md)
- [Unified renderer fidelity](docs/phase416-unified-renderer-fidelity.md)
- [Combined PDF](docs/PHASE_4_9_MULTI_DOCUMENT_COMBINED_PDF.md)
- [Data Views and Calculated Fields](docs/PHASE_4_13_DATA_VIEWS_CALCULATED_FIELDS.md)
- [Conditional Visibility](docs/PHASE_4_12_CONDITIONAL_VISIBILITY_RULES.md)
- [PDF production freeze](docs/PHASE_4_8_PDF_PRODUCTION_FREEZE.md)

## Roadmap

1. Editable DOCX renderer
2. Export presets and improved output management
3. Streaming ZIP and very-large-batch hardening
4. Cross-format golden visual regression
5. Additional renderer plugins such as HTML, SVG and WebP

## Product principle

One template and one resolved data model should be reusable across every output format. Business logic belongs in normalization and the Template Engine—not inside individual renderers.
