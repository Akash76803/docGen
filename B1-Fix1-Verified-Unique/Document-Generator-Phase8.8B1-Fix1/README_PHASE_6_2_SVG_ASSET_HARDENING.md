# Phase 6.2 — SVG / Asset Hardening

## Architecture

Reusable asset preparation now lives in the shared Design Engine asset pipeline. Card Designer consumes prepared `AssetReference` records and does not sanitize or normalize stored SVG during React rendering. Existing records remain valid because all additional metadata is optional.

The Phase 6.2 verification pass also removes unused TypeScript imports and regex callback parameters without weakening compiler rules.

## SVG security and normalization

- Uploaded SVG is treated as untrusted input.
- Scripts, embedded HTML containers, event handlers, external links/resources, JavaScript URLs, external stylesheets and unsafe CSS URLs are removed.
- Safe fragment references such as gradients, clips and masks are retained.
- Width, height and viewBox are normalized from unitless, pixel or common physical-unit dimensions.
- Missing dimensions use deterministic fallback dimensions recorded in metadata.

## Assets and duplicates

- Prepared assets record format, intrinsic dimensions, aspect ratio, viewBox, import provenance, sanitization state, recolor capability and deterministic content fingerprint.
- SVG fingerprints use sanitized normalized content; raster fingerprints use stored data content.
- Re-importing an exact fingerprint reuses the existing library entry.
- Catalog search helpers support name, category, folder, tags and format, while existing embedded decorative assets remain compatible.

## Verification

- Focused tests: `npm run test:card-assets`
- Build-backed smoke verification: `npm run smoke:card-assets`
- Smoke success output: `Phase 6.2 SVG asset hardening smoke PASS`

## Rendering and compatibility

- SVG source remains vector data in editor state and is identified as vector in the render model.
- Safe single-color SVG assets expose an optional tint control; multi-color artwork retains original colors.
- Missing and unsupported references render placeholders without deleting element geometry.
- Asset replacement helpers preserve element identity, geometry, grouping and visual style.
