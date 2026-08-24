# Phase 6.0.6 Fix1 — Shape Transparent Fill & Border Controls

Adds explicit shape styling controls without introducing a parallel border model.

- Fill: Solid / Transparent (`DesignFill: NONE`)
- Border: Solid / Dashed / Dotted / None (existing `DesignStroke`)
- Border color and width are shown only when a border is enabled
- Fill color is shown only when solid fill is enabled
- Outline-only shapes are supported and serialize through the existing design contract
- Existing renderer already treats `DesignFill: NONE` as transparent
