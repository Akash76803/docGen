# Phase 7.7 Fix2 — PATH serialization

## Root cause
`PathDesignElement` was already a first-class contract/render element, but `createDefaultDesignElementRegistry()` still registered only TEXT/SHAPE/IMAGE/SVG/QR/BARCODE. Validation therefore marked every generated face/path as `ELEMENT_TYPE_UNSUPPORTED`, and `serializeDesignTemplate()` refused to save the template.

## Fix
- Registered `PATH` in the default design element registry.
- Allowed the existing `visible` binding target on PATH, matching generated faces that inherit source visibility bindings.
- Added a regression proving PATH validation + serialize/deserialize round-trip.

## Files
- `packages/design-engine/src/element-registry.ts`
- `packages/design-engine/src/validation.ts`
- `packages/design-engine/test/phase77-path-serialization.test.ts`

## Verification
Source-level regression added. Full npm verification should be run in the normal Windows workspace with dependencies installed.
