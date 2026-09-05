# TEXT6B-FONT2 — Professional Font Manager + Custom Font Upload

## Purpose
Upgrade Card Designer font handling from a curated dropdown into a reusable design-app font workflow while keeping user font licensing explicit.

## Implemented
- Upload `.ttf`, `.otf`, `.woff`, `.woff2` font files (5 MB per file safety limit).
- Persist uploaded fonts in the existing user asset repository as `OTHER` assets with `fontAsset` metadata; this avoids misclassifying fonts as image assets.
- Register persisted fonts in the browser with `FontFace` and `document.fonts` whenever Card Designer loads.
- `My Fonts` library with live sample preview, load status, favorites, recent fonts, search, and removal.
- Missing-font warning for the active text font and a replacement-font selector.
- Font favorites and recent history persist in local storage.
- Curated font groups remain available and uploaded fonts appear in the normal Font Family dropdown.
- Normal text, rich-text selection, and Shape/PATH label font selectors use the shared font library.
- Context toolbar expanded from the old seven-font list to the full curated library while preserving a custom current family.
- Existing My Assets image/SVG library hides font assets so font files do not render as broken thumbnails.

## Licensing / portability rule
No third-party proprietary font files are bundled by this phase. A user may upload fonts they are licensed to use. Designs keep the font-family name; on a machine where the uploaded/installed font is unavailable the UI warns that fallback rendering may occur.

## Known boundaries
- Font family is inferred from the filename; internal OpenType name-table parsing is not included in this phase.
- System-installed font enumeration is browser/platform dependent, so this phase supports typed installed-family names and availability checks rather than unrestricted OS font scanning.
- True font embedding/subsetting into vector PDF is a later export-hardening concern; current raster/export workflows use the registered browser font where supported.
