# Phase 6.7: UI Redesign & Modernization (In Progress)

This phase focuses on refactoring the monolithic UI into a modern, professional, desktop-class design tool architecture without changing any underlying business logic, renderers, or data models.

## Goals
- Establish a scalable semantic CSS foundation (Design Tokens).
- Implement a robust Dark/Light theme system that does not interfere with document artboard backgrounds.
- Introduce a global AppShell for generic application routing (Templates, Datasources, etc.).
- Safely decompose the massive `CardDesigner.tsx` into a professional `DesignerShell` (Header, Toolbar, Workspace, Inspector, Tool Rail).
- Improve code maintainability and visual density to match industry-standard design tools.

## Checkpoint A (Foundation) - IN PROGRESS
- [x] Create `tokens.css` (semantic variables for colors, typography, spacing, radii, shadows, z-index).
- [x] Create `themes.css` (implement `[data-theme="dark"]` and `[data-theme="light"]`).
- [x] Create `globals.css` (global resets and base app body styling).
- [x] Integrate new CSS tokens into `main.tsx`.
- [ ] Create `app-shell.css` and `AppShell.tsx`.
- [ ] Wrap existing routes (except the CardDesigner canvas) in the new AppShell.

## Checkpoint B (Designer Shell) - PENDING
- [ ] Create `DesignerShell.tsx` layout.
- [ ] Extract `DesignerHeader` (Undo, Redo, Preview, Export).
- [ ] Extract `DesignerContextToolbar` (Type-aware formatting options).
- [ ] Extract `DesignerToolRail` & `DesignerLeftPanel` (Layers, Elements, Artboards).
- [ ] Extract `DesignerWorkspace` (Canvas wrapper).
- [ ] Extract `DesignerInspector` (Properties pane).
- [ ] Map all existing `CardDesigner` UI controls to their new modular locations.

## Design Rules Imposed
- **IMPLEMENT ONLY.** No business logic changes allowed.
- **NO Tailwind.** Standard CSS using BEM-style `.dg-` namespace.
- **NO State Libraries.** Reuse existing state/callbacks; keep UI state localized.
- **Safe Extraction.** Do not pass resolved artboards back to mutation functions.
