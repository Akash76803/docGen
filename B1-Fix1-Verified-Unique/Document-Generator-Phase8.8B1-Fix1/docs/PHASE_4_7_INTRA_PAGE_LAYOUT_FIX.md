# Phase 4.7 — Intra-Page Layout Fix

## Scope
- Custom Grid text measurement/wrapping guardrails.
- Runtime sequential block-flow helper; ordinary blocks do not use saved absolute Y.
- Per-column Data Table footer aggregation configuration.
- Numeric no-character-wrap behavior in HTML/PDF custom grids.

## Permanent rules
1. Text wraps on word boundaries. Numeric display values remain single-line and may shrink in the low-level PDF engine.
2. Custom-grid rowspan height propagation continues to use the deterministic "last covered row absorbs remainder" rule.
3. Ordinary blocks are flow-positioned from measured previous block bottom + configured margins/spacing. Absolute Y remains legacy-only and is not used by the current RenderModel path.
4. Footer calculations resolve in TemplateEngine; renderers only draw resolved values.

## Footer aggregation
Each Data Table column may select `SUM`, `AVG`, `COUNT`, `BLANK`, or `CUSTOM_LABEL`. Selecting a value updates the first footer row for that column while retaining the existing explicit footer-row model and backward compatibility.

## Designer guardrails
Dense Data Tables/Custom Grids display a soft warning. Recommended custom-grid column width is 15mm; the renderer does not force width expansion because that could overflow the configured page.
