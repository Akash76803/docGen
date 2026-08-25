# Phase 6.1.3A Fix1 — Card Designer Left Panel UX

## Problem
Starter Templates and Floral & Decorative libraries consumed the left panel height and pushed the core Elements tools below the visible viewport.

## Fix
- Elements are now the first section in the left panel.
- Elements are sticky while the left panel scrolls, so Text / Shape / Image remain available.
- Starter Templates and Floral & Decorative are collapsible library sections.
- Library lists have bounded responsive heights instead of consuming the whole sidebar.
- Artboard and Layers lists also use bounded heights so all major editor areas remain reachable.
- The whole left sidebar owns vertical scrolling, producing one predictable scroll surface instead of nested content hiding controls.

## Regression boundary
No DesignTemplate, RenderModel, persistence, element, snapping, alignment, or export contracts were changed.
