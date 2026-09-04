# Phase 4.14 — Global Calculated Fields in Rich Text

## Goal
Make reusable calculated values discoverable and insertable anywhere the shared Rich Text editor is used, without creating a second formula engine.

## Behavior
- Calculated fields continue to resolve once per document as `calc.<alias>`.
- Rich Text accepts tokens such as `{{calc.freightAmount}}`.
- Formula-based calculated fields are consumed the same way after the formula resolves.
- The Rich Text picker groups Calculated Fields separately from source/document fields.
- Token-specific display formatting and fallback continue to work for calculated tokens.
- The same Rich Text contract is used by normal TEXT blocks, ROW text, BOX text, Custom Grid TEXT, header text, and footer text.
- Existing field tokens and legacy plain text remain backward compatible.

## Example
1. Data View: `freightRows` filtered to Freight rows.
2. Calculated Field: `freightAmount = SUM(views.freightRows.finalAmount)`.
3. Rich Text: `Freight Charges: {{calc.freightAmount}}`.
4. Optional token display format: Currency / INR / 2 decimals.
