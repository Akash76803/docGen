# Phase 7.9 — Dynamic Base64 image binding from imported data

## Goal
Allow IMAGE elements to bind their source to imported CSV/Excel fields containing supported raster image Data URLs or raw Base64 while preserving the manually selected asset as the fallback.

## Implementation
- Reused the existing IMAGE `source` field binding contract from Phase 6.6.5.
- Added safe runtime normalization for PNG, JPEG, GIF, and WebP Data URLs/raw Base64.
- Raw Base64 MIME type is detected from common file signatures and normalized to a Data URL.
- Existing HTTP/blob image bindings remain supported for backward compatibility.
- Malformed, unsupported, empty, or oversized runtime values do not mutate template data and fall back to the manually selected asset.
- Dynamic runtime image source is kept only on the cloned resolved element; source binding metadata and the original `assetId` remain persisted.
- Live canvas and isolated export canvas now use the same shared raster-source resolver, fixing export parity for dynamic IMAGE bindings.
- Bulk generation already resolves each plan item with its own `DesignDataContext`, so each record receives its own runtime image source.

## Safety
- No `eval`.
- No Base64 payload logging.
- Maximum decoded dynamic image payload: 5 MiB.
- MIME detection decodes only a small prefix; large payloads are size-checked before signature decoding.
- Imported rows are not mutated.

## Tests
- `packages/design-engine/test/phase79-base64-image-binding.test.ts`
- `packages/persistence/test/phase79-base64-image-binding-persistence.test.ts`
