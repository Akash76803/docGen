# Document Generator — Current Implementation Guide

**Document status:** Current implementation overview  
**Updated:** 23 August 2026  
**Application:** Offline-first multi-format document generation platform

## 1. Application kya hai?

Document Generator ek generic desktop/web application hai jisme imported business data ko reusable templates ke saath combine karke professional documents banaye ja sakte hain.

Application sirf invoice ke liye hardcoded nahi hai. Is architecture se reports, certificates, letters, statements, labels, cards, forms aur custom business documents banaye ja sakte hain.

Current supported export formats:

- Exact PDF / browser print
- Engine PDF
- Combined PDF
- PNG
- JPEG/JPG
- Multiple PNG/JPEG files ka automatic ZIP bundle

DOCX abhi production-ready nahi hai. UI mein ise upcoming format ke roop mein disabled rakha gaya hai.

## 2. High-level workflow

```text
Excel / CSV source
       ↓
Data preview and schema inference
       ↓
Field mapping
       ↓
Document grouping
       ↓
Normalized document data
       ↓
Data Views and Calculated Fields
       ↓
Template Engine
       ↓
Resolved RenderModel
       ↓
Live Preview / Exact pages
       ↓
PDF / PNG / JPEG / ZIP
```

Renderer ko already-resolved `RenderModel` milta hai. PDF, PNG aur JPEG renderer formulas, totals, visibility ya Data Views dobara calculate nahi karte.

## 3. Data import

### Implemented sources

- Excel workbooks
- CSV files
- Imported data ka preview
- Headers aur field types ki inference
- Source metadata
- Multiple imported workspaces
- Active workspace selection
- Imported workspace persistence

### Mapping

Source columns ko canonical document paths se map kiya ja sakta hai, jaise:

```text
Invoice No.   → invoice.number
Customer      → customer.name
Product       → items.product
Amount        → items.amount
```

Application exact source header ko fallback ke roop mein preserve karta hai, isliye imported raw fields aur normalized fields dono safely resolve kiye ja sakte hain.

## 4. Document grouping

Imported rows ko document groups mein organize kiya ja sakta hai.

Example:

```text
100 source rows
group by Invoice Number
→ 12 independent documents
```

Implemented behavior:

- Group-by-field
- Single-document mode
- Group header and item collections
- Source row tracking
- Invalid group warnings
- Current document selection
- Multiple selected documents
- Lazy hydration of stored groups

## 5. Template Builder

Template Builder visual document design surface provide karta hai.

### Regions

- Header
- Body
- Footer

### Supported elements

- Static text
- Dynamic field
- Rich text with field tokens
- Image
- Data table
- Summary table
- Custom grid/table
- Row layout
- Box/container
- Divider
- Spacer
- QR code content
- Formula-based table columns
- Static, field, calculated and aggregate values

### Styling

- Font family
- Font size
- Bold, italic and underline
- Text and background colors
- Left, center and right alignment
- Width percentage
- Fixed and automatic box widths
- Margins and padding
- Borders
- Cell borders and backgrounds
- Vertical alignment
- Row gaps
- Table header and cell styling
- Page background and border

### Layout editing

- Blocks add/remove/duplicate
- Block reordering
- Header/body/footer movement
- Row cells
- Nested row/box content
- Direct cell editing
- Collapsible designer panels
- Fit-page and manual preview zoom
- Focus/full-preview mode

## 6. Tables and summaries

### Data tables

- Collection binding
- Configurable columns
- Explicit or automatic column widths
- Grouped table headers
- Row filtering
- Conditional columns
- Source, formula, static, image, row-number and QR columns
- Footer aggregation rows
- SUM, AVG, COUNT and custom labels
- Repeated table headers during pagination

### Summary tables

- Manual summary rows
- Group-by summary mode
- Total row
- Calculated/aggregate cells
- Independent styling and alignment
- Keep-together pagination behavior

### Custom grids

- Configurable rows and columns
- Row span and column span
- Text, field, calculated value and image content
- Per-cell styling
- Nested document layout use cases

## 7. Display formatting

Formatting template evaluation ke samay resolve hoti hai aur sab export formats same formatted value consume karte hain.

Supported formatting:

- Raw value
- Number
- Integer
- Percentage
- Currency
- Date
- Date/time
- Boolean labels
- Custom prefix and suffix
- Decimal precision
- Digit grouping
- Negative number formats
- Null display value
- Locale settings

Example:

```text
9588.15 → ₹9,588.15
0.18    → 18.00%
date    → 20/08/2026
```

## 8. Data Views

Data View ek named filtered collection hai.

Example:

```text
Source: items
Filter: Product Name = Freight
Alias: FreightRows
```

Template ke andar filtered collection `views.FreightRows` se available hoti hai.

Implemented:

- Named views
- Reusable aliases
- Nested view resolution
- Filter rules
- View dependency/cycle validation
- Tables and calculations mein Data View binding

## 9. Calculated Fields and formulas

Global calculated fields `calc.<alias>` path par available hote hain.

Supported operations:

- Static value
- Field value
- SUM
- COUNT
- AVG
- MIN
- MAX
- FIRST
- Safe formula expressions
- Formula bindings
- Calculated rich-text tokens

Example:

```text
SUM(FreightRows.FinalAmount)
→ calc.FreightAmount
→ ₹47.20
```

JavaScript `eval` use nahi hota. Formula engine controlled expression evaluation use karta hai.

## 10. Conditional visibility

Elements aur table content conditions ke basis par show/hide ho sakte hain.

Supported operators:

- Equals / not equals
- Empty / not empty
- Greater / less comparisons
- Contains / not contains
- Starts with / ends with
- IN list
- ALL and ANY condition groups
- Negation

Visibility Template Engine mein resolve hoti hai, isliye PDF, PNG aur JPEG mein same output milta hai.

## 11. Page setup and pagination

### Page sizes

- A0–A10
- B0–B6
- Letter
- Legal
- Tabloid
- Ledger
- Executive
- Custom physical size

### Geometry

- Portrait and landscape
- Top/right/bottom/left margins
- Page background
- Page border
- Printable width and height

### Pagination

- Stable shared pagination planner
- Repeated header
- Repeated footer
- Flow footer
- Last-page-only footer
- Page numbers
- Keep summary together
- Keep custom grid together
- Long table pagination
- Exact Preview/PDF pagination parity
- Mixed page sizes in Engine Combined PDF

## 12. Live Preview

Template Builder physical pages ka paginated preview dikhata hai.

- Same resolved `RenderModel`
- Page-by-page preview
- Active page detection
- Fit Page
- 75%, 100%, 125%, 150% and custom zoom
- Preview zoom export resolution ko affect nahi karta
- Warnings display
- Hidden measurement surface for deterministic pagination

## 13. PDF export

### Exact Layout PDF

- Browser/system print workflow
- Live Preview ke same physical page plan ka use
- Accurate HTML/CSS appearance
- Exact combined printing for compatible page sizes

### Engine PDF

- Native generated PDF bytes
- Vector text
- Pagination
- Tables, summaries, grids and images
- Headers and footers
- Page numbering
- Diagnostics
- Export Orchestrator integration

### Combined PDF

- Multiple selected documents
- One combined PDF
- Per-document or global page numbering
- Mixed page sizes in Engine mode
- Lazy document resolution
- Image resource namespacing
- Progress and cancellation
- Document-context errors

## 14. PNG export

- Current page or all pages
- Current visible physical page detection
- 96, 150, 300 and 600 DPI
- Template background or transparent background
- Exact physical dimensions
- Page-by-page rendering
- Browser DOM rasterization through `html2canvas`
- Optimized browser PNG compression
- Deterministic filenames
- Memory and pixel limits
- Cancellation between pages/documents

Example:

```text
Report_page_001.png
Report_page_002.png
```

## 15. JPEG export

- PNG ke same physical-page raster pipeline ka reuse
- Current page or all pages
- 96, 150, 300 and 600 DPI
- Quality range 60–100
- Default quality 90
- White or custom hexadecimal background
- Transparent pixels ka background ke against alpha flattening
- `.jpg` deterministic filenames
- Memory safety and cancellation

Recommended bulk settings:

```text
150 DPI + Quality 75–90 → sharing/smaller files
300 DPI + Quality 90    → high-quality output
600 DPI                 → limited print-oriented pages
```

## 16. Bulk image ZIP download

Multiple PNG/JPEG outputs automatically ek ZIP mein download hote hain.

```text
Invoices.zip
├── INV001_page_001.png
├── INV001_page_002.png
├── INV002_page_001.png
└── INV003_page_001.png
```

Behavior:

- One generated image → direct download
- Multiple generated images → one ZIP download
- Standard ZIP structure
- CRC validation
- UTF-8 filenames
- Path-traversal sanitization
- Existing filename collision handling
- Already-compressed images ko ZIP mein STORE mode se package kiya jata hai
- Empty ZIP generation rejected

## 17. General Export UI

Template Builder mein common **Export** dialog available hai.

### Formats

- PDF
- PNG
- JPEG
- DOCX disabled with upcoming-phase indication

### Options

- Current document
- Selected documents
- Filename
- PDF Exact/Engine mode
- Current/all raster pages
- Active current page
- DPI selector
- PNG background mode
- JPEG quality and background
- Approximate pixel dimensions
- Per-page working-memory estimate
- Progress
- Cancellation
- Result download links
- Automatic ZIP for multiple images

Invalid filename, missing document, unsupported DPI, invalid JPEG settings aur unsafe memory configuration par export disabled/error hota hai.

## 18. File naming and security

- Reusable filename templates
- Invalid filename character sanitization
- Duplicate suffixes (`_2`, `_3`, etc.)
- Directory traversal removal
- Safe ZIP entry names
- Renderers arbitrary output paths write nahi karte
- Template content arbitrary JavaScript execute nahi karta
- Cross-origin unsafe raster resources canvas ko taint nahi kar sakte (`allowTaint: false`)

## 19. Progress, cancellation and memory safety

- Resolve, render and finalize progress phases
- Document number and generated page count
- Cancellation token
- Safe cancellation boundaries
- Maximum pixels per page
- Maximum estimated raster memory
- Page-at-a-time image processing
- Large combined PDF ke liye lazy resolution

300 DPI A4 page approximately:

```text
2480 × 3508 pixels
~33 MB temporary RGBA working memory
```

Final compressed PNG/JPEG file working memory se normally kaafi chhoti hoti hai.

## 20. Persistence

- Templates local repository mein save hote hain
- Template versions and metadata
- Imported workspace persistence
- Active workspace tracking
- Mapping and grouping state
- Export dialog settings session/component state mein rehti hain; template schema mutate nahi hota

## 21. Technical architecture

### Frontend/Desktop

- React
- TypeScript
- Vite
- Tauri desktop shell
- Offline-first local storage/IndexedDB-style persistence

### Important packages

| Package | Responsibility |
|---|---|
| `contracts` | Shared data, template and render contracts |
| `datasource-sdk` | Data-source interfaces and inference |
| `datasource-excel` | Excel import |
| `datasource-csv` | CSV import |
| `mapping-engine` | Source-to-document mapping |
| `grouping-engine` | Document grouping |
| `calculation-engine` | Calculations |
| `template-engine` | Template validation and resolved RenderModel |
| `renderer-sdk` | Fidelity, pagination, export orchestrator, registry and ZIP bundler |
| `renderer-pdf` | Engine and combined PDF |
| `renderer-image` | PNG/JPEG raster export |
| `persistence` | Local repositories |
| `validation` | Schema validation |
| `core` | Application services/pipeline |
| `apps/desktop` | React/Tauri user interface |

## 22. Important commands

```powershell
npm install
npm run dev
npm run tauri:dev
npm run typecheck
npm run build
npm test
```

Focused verification:

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

## 23. Current limitations / pending work

### Not production-ready yet

- Editable DOCX renderer
- Export presets
- Export history
- Background job queue
- Streaming ZIP directly to disk for extremely large batches
- Cloud storage upload
- Email sending
- HTML/SVG/WebP/TIFF export
- Advanced bulk retry/resume
- Final golden screenshot production-freeze suite for every real-world template

### Practical bulk-export guidance

- 150 DPI JPEG bulk sharing ke liye fastest/smaller option hai
- 300 DPI high-quality output ke liye suitable hai
- 600 DPI large batches ke liye slow aur memory-heavy ho sakta hai
- Thousands of documents ko batches mein export karna preferable hai

## 24. Recommended roadmap

1. **Phase 4.19.4 — DOCX Renderer**
   - Editable text
   - Tables and summaries
   - Images and QR
   - Page geometry
   - Header/footer
   - Fidelity warnings

2. **Export UI advanced UX**
   - Presets
   - Better selected/all document controls
   - Export history
   - Output management

3. **Bulk hardening**
   - Streaming ZIP
   - Very large batch strategy
   - Retry and partial-failure reporting

4. **Cross-format production freeze**
   - Golden visual baselines
   - Exact/PDF/PNG/JPEG/DOCX comparison
   - Large dataset benchmarks

## 25. Summary

Application ka current core ek functional, generic document platform hai:

- Data import aur mapping working hai
- Document grouping working hai
- Visual Template Builder working hai
- Tables, summaries, grids, formulas aur conditional visibility working hain
- Physical pagination aur Exact Preview working hai
- PDF, PNG aur JPEG export working hain
- Multiple images ka automatic ZIP download working hai
- Progress, cancellation, diagnostics aur memory guards available hain

Next major capability editable DOCX export hai.
