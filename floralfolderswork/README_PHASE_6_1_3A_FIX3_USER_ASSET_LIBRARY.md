# Phase 6.1.3A Fix 3 — User Asset Library

Adds a reusable **My Assets** library to Card Designer.

## User flow
1. Open **My Assets** in the left panel.
2. Click **Add Asset**.
3. Select one or more PNG, JPG, WebP, GIF or SVG files (max 2 MB each).
4. Assets are saved independently from the current template and remain available after restart.
5. Click an asset thumbnail to insert it into the active artboard.
6. Rename or delete assets from the library without breaking elements already copied into saved designs.

## Safety / architecture
- SVG uploads are sanitized before persistence (scripts, foreignObject, event handlers and external/script hrefs are removed).
- User library persistence is isolated under `document-tool.card-user-assets.v1`.
- Inserting an asset copies a reference into the design's `sharedAssets`, preserving template portability.
- Built-in Floral & Decorative assets remain separate from user-owned assets.

## Files
- `packages/persistence/src/asset-library-repository.ts`
- `packages/persistence/src/index.ts`
- `packages/persistence/test/phase613a-user-asset-library.test.ts`
- `apps/desktop/src/pages/CardDesigner.tsx`
- `apps/desktop/src/index.css`
- `scripts/phase613a-user-asset-library-smoke.mjs`

## Verification in this package environment
- contracts + design-engine + persistence TypeScript build: PASS
- user asset library smoke (save / list / rename / restart restore / delete): PASS
- full desktop build/tests not executed here because this extracted ZIP does not include third-party node_modules. Run the normal project gates after extracting over the authoritative repository.
