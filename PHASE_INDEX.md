# Phase Index

This file prevents older update docs from being mistaken for the current baseline.

## Current card-designer sequence
- Phase 7.4.x — geometry/path workflow updates
- Phase 7.5 — face splitting / related fixes
- Phase 7.6 — export, guides, eraser
- Phase 7.7 — shape text / expanded shape library and fixes
- Phase 7.8 — shape image fill
- Phase 7.9 — dynamic Base64 image binding + UX/date/serialization/layer fixes
- **Phase 7.10 — CAD Point OSNAP** (`UPDATE_PHASE_7_10_CAD_POINT_OSNAP.md`)
- **Phase 7.11 — Dedicated Split Tool** (`UPDATE_PHASE_7_11_DEDICATED_SPLIT_TOOL.md`) — preserved pre-Phase-8 geometry baseline

## Planned Shape Operations
- Phase 8.0 Foundation
- Phase 8.1 Transform Hardening
- Phase 8.2 Styling Contract & Rendering Parity
- Phase 8.3 Multi-Selection Enhancements
- Phase 8.4 Group Hardening
- Phase 8.5 Geometry Editing Completion
- Phase 8.6 Boolean Hardening + Fragment
- Phase 8.7 Shape Text Hardening
- Phase 8.8 Persistence / Export / Regression Hardening

Always read `CURRENT_BASELINE.md`, `SHAPE_OPERATIONS_AUDIT.md`, and the latest update docs before implementing the next phase.

| 8.0 | `UPDATE_PHASE_8_0_SHAPE_FOUNDATION.md` | Shape Operations foundation: capability matrix, primary propagation, mixed values, normalization, regression harness | Current |

| 8.1 | `UPDATE_PHASE_8_1_TRANSFORM_HARDENING.md` | Rotation-aware resize, center resize, aspect/rotation modifiers, in-place flip | Current |

| 8.1 Fix1 | `UPDATE_PHASE_8_1_FIX1_MULTI_SELECTION_RESIZE_MODIFIERS.md` | Shared multi-selection resize + Alt/Shift modifiers | Current |

| 8.2 | `UPDATE_PHASE_8_2_STYLING_CONTRACT_RENDERING_PARITY.md` | Radial/pattern fill, image crop transform, advanced stroke, canvas/export parity | Current |

| 8.2 Fix1 | `UPDATE_PHASE_8_2_FIX1_STROKE_UI_DASH_INPUT.md` | Custom Dash input fix + Stroke terminology/alignment UX cleanup | **Current** |

| 8.3 | `UPDATE_PHASE_8_3_MULTI_SELECTION_ENHANCEMENTS.md` | Primary-aware multi-selection, match dimensions, mixed exact transforms | Current |
| 8.4 Fix1 | `UPDATE_PHASE_8_4_FIX1_GROUP_INTEGRITY_LAYER_ORDER.md` | Group integrity, visible rename UI, atomic layer order | Current |

- Phase 8.4 Fix2 — Hierarchical Layers + Atomic Group Z-Order (`UPDATE_PHASE_8_4_FIX2_HIERARCHICAL_LAYERS.md`)


## Phase 8.5
Geometry Editing Completion implemented on top of Phase 8.4 Fix2. See `UPDATE_PHASE_8_5_GEOMETRY_EDITING_COMPLETION.md`.

- Phase 8.5 Fix4 — Smart Guides & Symmetric Node Editing — SOURCE COMPLETE / MANUAL PENDING
- Phase 8.5 Fix5 — Path Toolbar UX + Home Navigation — SOURCE COMPLETE / MANUAL PENDING

- Phase 8.5 Fix6 — Auto Mirrored Node Insert (`UPDATE_PHASE_8_5_FIX6_AUTO_MIRRORED_NODE_INSERT.md`) — SOURCE COMPLETE / MANUAL PENDING

## Phase 8.6 — Rich Artboard Backgrounds
Status: SOURCE IMPLEMENTED / MANUAL VERIFICATION PENDING
- Solid + opacity
- Transparent
- Linear / Radial Gradient
- Pattern Hatch / Dots / Checker
- Image asset/upload + crop/fit/opacity
- Dynamic background image field binding
- Canvas + PNG/JPEG/PDF export parity
