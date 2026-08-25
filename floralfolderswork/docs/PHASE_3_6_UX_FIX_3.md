# Phase 3.6 UX Fix 3 — Direct Cell Editing + Properties Clarity

## Goal
Reduce repetitive Row → Properties → Cell workflows and make the Properties panel easier to understand.

## Direct Cell Editing
- Each grid cell in the left block tree has its own inline add toolbar.
- Add Text, Field, Image, Table, Summary, Divider, or Spacer directly to that cell.
- Adding a child immediately selects that child for editing.
- Each child has direct Move Up, Move Down, Duplicate, and Remove controls.
- Quick `+ Add another field` action supports repeated field entry.
- Cells can be collapsed/expanded independently.
- Blank cells show a clear local call-to-action.

## Properties UX
- Sticky Properties header remains visible while scrolling.
- Context breadcrumb identifies the active element, e.g. `Row > Cell 2 > Customer Name`.
- Field/Text properties are grouped into Basic, Data Binding, Style, and Layout sections.
- Property sections are collapsible.
- Row cell settings are collapsed into per-cell settings cards instead of rendering all controls at once.
- Cell content actions were removed from Row Properties to avoid duplicate workflows; content is managed directly in the left tree.
- Improved spacing, contrast, labels, selected-state visuals, and destructive-action visibility.

## Compatibility
No renderer contracts or saved TemplateDefinition formats were changed. Existing templates remain compatible.
