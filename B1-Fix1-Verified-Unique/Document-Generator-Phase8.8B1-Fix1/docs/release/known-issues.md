# Phase 5.0 Known Issues Register

| ID | Severity | Description | Workaround | Release blocker? | Target |
| --- | --- | --- | --- | --- | --- |
| P50-001 | P0 | Engine PDF, Combined PDF, PNG and JPEG use verified native delivery. Exact PDF remains an explicitly classified isolated system-print path because Tauri 1 exposes no safe print-to-PDF bytes API in the current shell. Packaged save/print UAT is pending. | Use the system print dialog for Exact PDF and verify the selected PDF destination manually. | Yes | Phase 5.0.4A |
| P50-007 | P0 | Packaged RC build cannot run on the current machine because the Rust/Cargo toolchain is not installed (`failed to get cargo metadata: program not found`). | Install the supported Rust toolchain, rebuild, then execute the packaged save-dialog UAT matrix. | Yes | Phase 5.0.4A |
| P50-002 | Resolved | Corrupt/future template persistence now enters recovery without mutation and supports recovery-copy download, validated backup import, and confirmed reset. | None. | No | Phase 5.0.5 |
| P50-008 | P1 | Persistence hardening automated gates pass, but packaged backup/restore, restart, and safe corruption-recovery UAT are not yet recorded. | Keep a `.dgw` backup before RC testing. | Yes | Phase 5.0.5 |
| P50-003 | P1 | Tauri CSP is currently `null` and filesystem/path permissions are broader than production requirements. | Run trusted local content only. | Yes | Phase 5.0.8 |
| P50-004 | Resolved | Initial clean install reported findings; the current refreshed lockfile audit reports 0 known vulnerabilities. | Keep `npm audit` in the release gate. | No | Phase 5.0.8 |
| P50-005 | P2 | Desktop production JavaScript bundle is about 1.08 MB before gzip and triggers the Vite chunk-size warning. | None required for functional testing. | No | Phase 5.0.7 |
| P50-006 | P1 | Full restart/reopen persistence UAT and complete export delivery UAT are not automated. | Perform the documented workflows manually. | Yes | Phase 5.0.11 |
