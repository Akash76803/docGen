# Document Generator

Offline-first document generation and visual card-design application built as a TypeScript monorepo with React, Vite, Tauri and Rust.

Current application version: `1.0.0-rc.1`

## Current implementation

The repository currently includes:

- Visual Card Designer with text, image, SVG, QR, barcode, shape and canonical PATH elements.
- Selection, transform, grouping, alignment, snapping, guides and deterministic layer ordering.
- Pen, Flexible Line, path editing, Scissors and CAD-style Fragment-Aware Smart Trimmer tools.
- Boundary snapping and automatic face/region splitting for valid boundary-to-boundary dividers.
- Data bindings, conditional visibility, record preview and bulk document generation.
- PDF, PNG, JPEG, DOCX and combined PDF export workflows.
- Undo/redo history, copy/paste, duplication and multi-artboard design support.

The latest vector tooling work is Phase 7.4, including sticky CAD-style Trimmer interaction, minimal contextual snap markers, Smart Trim, manual point-to-point trimming and disconnected PATH fragment generation.

## Requirements

- Node.js `>=20 <21`
- npm workspaces
- Rust toolchain for the Tauri desktop build
- Windows NSIS tooling used by Tauri for installer packaging

## Install dependencies

```powershell
npm install
```

## Development

Run the web development workspace:

```powershell
npm run dev
```

Run the Tauri desktop application:

```powershell
npm run tauri:dev
```

## Verification

```powershell
npm run typecheck
npm run build
npm test
```

Latest recorded verification:

- Typecheck: passed.
- Workspace production build: passed.
- Tauri release build: passed.
- NSIS packaging: passed.
- Phase 7.4 CAD Trimmer targeted suite: 10/10 passed.
- Full regression snapshot: 106/107 test files and 669/670 tests passed. The remaining Phase 7.1 UI-test failure is a test-only `import.meta.url`/`readFileSync` URL-scheme issue under Happy DOM; the Paper.js canvas initialization blocker is repaired.

## Build the Windows installer

Refresh every workspace package before invoking Tauri so that desktop compilation uses current generated declarations:

```powershell
npm run build
cd apps/desktop
npx tauri build
```

The NSIS installer is generated at:

```text
apps/desktop/src-tauri/target/release/bundle/nsis/Document Tool_1.0.0-rc.1_x64-setup.exe
```

Latest generated package:

- Generated: 29 August 2026, 6:02 PM (Asia/Calcutta)
- Size: 1.71 MB
- SHA-256: `8D2A3560493292144CFF47A27BF097FFA6E223C3A743CBCBBD59EC378DA3106A`

## Repository structure

- `apps/desktop` — React/Vite desktop UI and Tauri host.
- `packages/contracts` — shared document and design contracts.
- `packages/design-engine` — canonical artboard, PATH, snapping, trimming, layering and transform logic.
- `packages/persistence` — local template/workspace persistence.
- `packages/renderer-*` — PDF, image, DOCX and renderer infrastructure.
- `packages/datasource-*` — CSV, Excel and datasource abstractions.
- `packages/template-engine` — document template evaluation and layout behavior.
- `docs` — phase-specific implementation and verification notes.

## Historical phase documentation

Earlier Phase 6 implementation notes remain under the repository root and `docs/`, including Card Designer productivity, smart snapping, export and data-binding milestones.
