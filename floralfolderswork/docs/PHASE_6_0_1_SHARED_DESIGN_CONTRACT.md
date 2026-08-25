# Phase 6.0.1 — Shared Design Contract & Card RenderModel

Status: Implementation Candidate

## Scope
This phase establishes the shared, platform-level contract for fixed-dimension Visual Design Studio artboards. It intentionally does not add editor UI or renderer drawing logic.

## Architecture
`DesignTemplate -> Artboard[] -> DesignElement[] -> upstream binding resolution -> CardRenderModel -> renderer`

Key rules:
- Multi-artboard is first-class from schema version 1.
- Physical geometry is canonical in millimetres; UI may display mm/inches.
- An artboard is the atomic render surface.
- Renderers receive only resolved `CardRenderModel` data and do not evaluate Data Views, formulas or mappings.
- New element kinds use `DesignElementRegistry`; renderer-specific one-offs are prohibited.
- Mixed artboard sizes are valid by contract.

## Contracts
Shared contracts live in `@document-tool/contracts`. The behavior/validation/resolution implementation lives in `@document-tool/design-engine` so future Packaging Studio can reuse the same low-level design primitives.

## Gate
Run `npm run test:design-contract` plus full build/typecheck/regression. Contract freeze requires these gates to pass before Phase 6.0.2 Canvas & Artboards begins.
