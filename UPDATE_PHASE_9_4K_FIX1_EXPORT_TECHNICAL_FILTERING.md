# Phase 9.4K Fix1 — Export Technical Filtering

## Purpose
Harden packaging export modes after a real carton PDF proof showed generated panel annotation labels (for example GLUE / RIGHT / BACK / LEFT) leaking into a dieline proof.

## Required output policy
- **Artwork Only · Client Proof**: artwork only. CUT, CREASE, SAFE, BLEED and ANNOTATION are excluded.
- **Artwork + CUT/CREASE · Dieline Proof**: artwork + CUT + CREASE only. SAFE, BLEED and ANNOTATION are excluded.
- **CUT/CREASE + Labels · Technical View**: CUT + CREASE + ANNOTATION only. Artwork, SAFE and BLEED are excluded.

## Implementation
`packages/design-engine/src/card-export.ts`
- Added a canonical packaging technical-layer resolver.
- Uses element `metadata.technicalLayer` when present.
- Falls back to the owning technical group name for older/migrated designs.
- Recognizes legacy generated `* Panel Label` text as ANNOTATION without treating arbitrary user text as technical content.
- Dieline Proof now explicitly admits only CUT/CREASE among all recognized technical layers instead of relying on `nonPrintingGuide` alone.
- The same `prepareArtboardForCardExport()` filtering remains shared by PDF, PNG, JPEG and bulk export paths.

## Regression coverage
Expanded `packages/design-engine/test/phase94-persistence-export-modes.test.ts` with legacy annotation and SAFE/BLEED compatibility cases.

## Manual acceptance
1. Generate a carton and place artwork on FRONT.
2. Export **Artwork Only**: no CUT, CREASE, SAFE, BLEED or panel labels.
3. Export **Dieline Proof**: artwork + CUT + CREASE; no GLUE/FRONT/RIGHT/BACK/LEFT labels, SAFE or BLEED guides.
4. Export **Technical View**: CUT + CREASE + panel labels; no artwork.
5. Compare PDF and PNG outputs for parity.
