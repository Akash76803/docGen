# Phase 3.7 — Dynamic Formula Builder

Adds renderer-ready, safe dynamic formulas to AggregateValueDefinition.

Supported syntax:
- Operators: `+ - * /`
- Parentheses
- Functions: `SUM`, `AVG`, `MIN`, `MAX`, `COUNT`, `FIRST`, `ROUND`
- Imported/mapped fields are stored as stable formula bindings (`{{f1}}`, `{{f2}}`, ...).
- No JavaScript `eval` or arbitrary code execution.

Examples:
- Row-style: `{{f1}} + {{f2}} + {{f3}}`
- Column/group total: `SUM({{f1}}) + SUM({{f2}}) + SUM({{f3}})`
- Rounded: `ROUND(SUM({{f1}}) * 1.18, 2)`

The same AggregateValueDefinition is already used by Summary Table cells, table footer cells, and Custom Grid calculated values, so formulas resolve in TemplateEngine before RenderModel and are therefore shared by Live Preview, HTML Print/PDF, low-level PDF, and future DOCX rendering.

Formula bindings are hydrated against current Generate mappings by source header/target path to remain resilient when a mapping target changes.
