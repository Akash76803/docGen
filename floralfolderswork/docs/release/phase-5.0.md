# Phase 5.0 Production Stabilization

## Baseline

- Version: `1.0.0-rc.1`
- Channel: `rc`
- Status: Release candidate; feature freeze active
- Authoritative source root: `E:\Project\Document Generator`
- Renderer fidelity contract: Phase 4.16
- Supported and verified build runtime: Node.js 20.x

This phase freezes the existing feature set. Work is limited to stability, persistence, export delivery, security, performance, tests, diagnostics, repository hygiene, and release automation.

## Excluded scope

- New template elements or formula functions
- New datasource or export formats
- DOCX expansion
- Mobile, cloud, and new business features
- Major UI redesign

## Repository audit (5.0.1)

- Removed the stale nested `Document Generator/Document Generator` source snapshot.
- Removed generated package/application `dist` output and TypeScript build metadata.
- Reinstalled dependencies from `package-lock.json` with `npm ci`.
- Added repository artifact exclusions in `.gitignore`.
- Replaced the artifact-dependent workspace typecheck with dependency-aware `tsc -b`.
- Preserved fixtures and `docs/evidence` renderer evidence.

Baseline verification on 2026-08-23:

| Gate | Result |
| --- | --- |
| `npm ci` | PASS (locked install) |
| `npm audit` | PASS (0 known vulnerabilities after lockfile refresh) |
| `npm run typecheck` | PASS |
| `npm run build` | PASS |
| `npm test` | PASS (49 files, 237 tests) |

## Current release decision

`PHASE 5.0 BLOCKED`

The clean source baseline is established, but desktop-native file delivery, persistence recovery/versioning verification, CSP/permission hardening, dependency vulnerability disposition, performance evidence, and full manual UAT remain release gates.

This document must be updated with security findings, performance results, manual UAT, and the final release gate matrix before Phase 5.0 can be marked complete.

## Native delivery progress (5.0.4)

- Added renderer-neutral `FileDeliveryService` and platform adapter contracts.
- Added browser/dev fallback and Tauri native adapter.
- Native writes verify file existence and exact byte count.
- Single output uses Save As; multiple output uses one folder selection.
- Filename traversal/unsafe characters, empty output, cancellation, and write failure have explicit results.
- PNG/JPEG export completion is reported only after delivery succeeds.
- Contract tests: 3 PASS.
- Engine PDF and Combined PDF now use the same verified native delivery entry point as raster exports; legacy Blob/object-URL download UI was removed.
- Exact PDF uses the existing isolated system print dialog (Phase 5.0.4A Option C) and never reports a verified `SAVED` state.
- Automated result: typecheck PASS; build PASS; 51 test files / 245 tests PASS; PDF delivery 5/5 PASS; file delivery 3/3 PASS; PDF freeze and Combined PDF smoke PASS.
- Packaged build configuration blocker fixed by removing unsupported Tauri 1 `schemaVersion`.
- Remaining P0: packaged RC/UAT cannot be completed until Rust/Cargo is installed on the build machine.

## Persistence hardening (5.0.5)

Architecture: platform-neutral `VersionedWorkspaceStore` -> `LocalStorageTemplateRepository`; imported source configurations remain in the existing transactional IndexedDB v3 stores.

| Durable data | Storage | Backup v1 |
| --- | --- | --- |
| Templates, layout, page setup, styles | Versioned localStorage envelope | Included |
| Data Views and calculated fields | Inside templates | Included |
| Mappings/source configuration | IndexedDB | Included |
| Original Excel/CSV bytes and parsed rows | IndexedDB runtime workspace | Excluded intentionally; source must be reselected |
| Theme/UI state | Separate local preference | Excluded |
| Export progress, blobs and object URLs | Ephemeral memory | Excluded |

- Workspace schema source of truth: `CURRENT_WORKSPACE_SCHEMA_VERSION = 1`.
- Legacy unversioned template arrays migrate automatically from v0 to v1 after in-memory validation.
- Future schema, malformed JSON and invalid shapes enter recovery state without overwriting raw data.
- Recovery UI supports Retry, Import Backup, Download Recovery Copy and confirmed Reset.
- Saves are serialized; last edit wins. Last-known-good payload is retained before replacement.
- `.dgw` backup/import uses native file delivery, validates before replacement and rolls back template/source stores on import failure.
- Automated result: typecheck PASS; build PASS; 52 test files / 254 tests PASS; persistence hardening 9/9 PASS; renderer/export regressions PASS.
- Updated NSIS RC installer build PASS. Packaged backup/restart/corruption UAT remains pending; Phase 5.0.5 is therefore BLOCKED.
