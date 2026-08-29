# Phase 7.9 Fix 5 — Layers Scroll & Ordering Actions

## Issue
The Card Designer Layers workspace became difficult to use on normal laptop-height screens. Users had to zoom the entire application out to reach lower layers, and the z-order commands were no longer discoverable after the side-panel redesign.

## Fix
- Layers mode now owns a bounded, dedicated layer-list scroll container.
- The outer left-panel content no longer competes with the inner layer list for scrolling while in Layers mode.
- Added a sticky layer command area that remains visible while the layer list scrolls.
- Restored explicit selected-layer order commands: **Front**, **Up**, **Down**, **Back**.
- Existing per-row visibility, lock, bring-forward/backward and front/back actions remain available.
- Duplicate / Group / Ungroup remain in the sticky command area.
- Other left-panel modes keep their existing scrolling behavior.

## Compatibility
No design schema, persistence, renderer, export, datasource or binding behavior changed.
