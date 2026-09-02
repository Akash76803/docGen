# Phase 8.8A5 — CAD Angle Line

## Baseline
Built on Phase 8.8A4 Fix3 CAD Ray isolated reimplementation, which the user manually verified as working.

## Scope
Adds a dedicated CAD Angle Line authoring mode without changing normal LINE chaining behavior.

## Behavior
- `A` activates Angle Line.
- First click sets the start point using existing CAD OSNAP/reference snapping.
- A stable Length/Angle HUD is available after the start point.
- Length is entered in mm; Angle is entered in degrees.
- `Tab` switches Length/Angle fields.
- `Enter` commits the exact typed endpoint through the existing dynamic endpoint resolver.
- Mouse preview remains available; second click can also commit the current endpoint.
- The committed object remains a standard CAD LINE PATH so existing edit, extend-to-boundary, snapping, persistence, export, and section-candidate behavior continue to work.
- Unlike normal LINE, Angle Line does not auto-chain from the previous endpoint after commit. It returns to "Specify next start point".
- `Esc` returns to Select.

## UI
- Added Angle Line to Utility Tools.
- Added `A — Angle Line` to the centralized shortcuts registry and Shortcuts modal.
- Normal `L — Line`, `R — Ray`, `X — XLINE`, and `Alt+A — Arrow` are unchanged.

## Regression protection
- CardDesigner TDZ ordering (`canEditPath` before keyboard effect) preserved.
- No changes to Face Split, Boolean, Trimmer, OSNAP geometry engines, persistence contracts, or export engines.

## Verification
- CardDesigner.tsx transpile: PASS.
- ElementLibraryPanel.tsx transpile: PASS.
- DesignerContextToolbar.tsx transpile: PASS.
- designerShortcutRegistry.ts transpile: PASS.
- Phase 8.8A5 test source transpile: PASS.
- Static TDZ ordering assertion: PASS.
- Static dedicated-mode/no-auto-chain assertions: PASS.
- Full workspace build attempted but blocked by inherited stale workspace build outputs / missing dependency typings; this is not reported as PASS.
- Manual Windows UI verification: PENDING.
