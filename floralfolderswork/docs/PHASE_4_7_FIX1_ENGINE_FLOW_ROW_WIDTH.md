# Phase 4.7 Fix 1 — Engine PDF Flow + Row Width Semantics

## Purpose
This patch completes the previously partial Phase 4.7 integration in the low-level `Generate Engine PDF` path.

## Permanent row width rules
Structured ROW cells now use one explicit sizing model:

- `FIXED_MM`: reserves an exact physical width (subject only to impossible-page clamping).
- `PERCENT`: consumes the requested share of the non-fixed row pool.
- `AUTO`: acts as FLEX and shares all remaining row width.

Legacy `RowColumn.widthPercent` remains backward-compatible and is interpreted as `PERCENT` when no newer `CellStyle.widthMode` exists.

Typical QR/Bank layout:

- QR cell: `FIXED_MM`, 30–35mm
- Bank cell: `AUTO / FLEX`
- Row gap: 2–4mm

This removes the large unused percentage cell between a compact QR image and its bank-detail text.

## Shared allocator
`packages/renderer-sdk/src/row-width.ts` owns renderer-neutral width allocation. The low-level PDF engine consumes it directly. HTML Preview/Print uses the same width-mode semantics through flex sizing.

## Engine flow measurement
The low-level PDF engine now uses shared `layoutFlow()` for measured child-block sequences. Ordinary blocks remain cursor-driven at draw time, but their measured sequential height/margins use the shared flow contract instead of an independent additive implementation.

## Verification
- renderer-sdk build/typecheck: PASS
- template-engine build/typecheck: PASS
- renderer-pdf build/typecheck: PASS
- Runtime Engine PDF smoke: PASS
  - QR cell fixed 30mm
  - Bank cell AUTO/FLEX
  - measured text origin delta ~33mm including configured gap
- Valid PDF 1.4 generated and verified with `pdfinfo`.

## Backward compatibility
Existing percentage rows continue to render as percentage rows. No business-specific QR/Bank auto-positioning heuristic was introduced.
