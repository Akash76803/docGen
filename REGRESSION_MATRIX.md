# Shape Operations Permanent Regression Matrix

| Feature | Existing automated coverage | Quality | Manual check | Export risk |
|---|---|---|---|---|
| LINE | existing drawing/path tests | PARTIAL/REAL mixed | draw normal line | medium |
| FLEXIBLE_LINE | existing designer tests | PARTIAL | polyline drawing | medium |
| SPLIT | `phase711-dedicated-split-tool.test.ts` | REAL source-level coverage | split closed shape | high |
| Point OSNAP | `phase710-point-osnap.test.ts`, live-wiring test | REAL | endpoint/vertex/boundary snap | high |
| Face Split | `phase73-face-split.test.ts` | REAL | 2-face then N-face split | high |
| AUTO_SECTION selection | existing CardDesigner logic/tests | PARTIAL | select/move/delete one face | high |
| Fill Bucket | existing phase tests/source | PARTIAL | fill closed region | medium |
| Scissors | existing path tool tests/source | PARTIAL | split path | high |
| Erase Segment | existing trimmer/eraser tests | REAL/PARTIAL | erase segment | high |
| Pen/Edit Path | existing path tests | PARTIAL | nodes/handles | high |
| Boolean | `phase709-boolean-path.test.ts` | PLACEHOLDER | all 4 ops | high |
| Guides/Grid/Snapping | phase 6.12/6.13 tests | REAL | guide/grid snapping | medium |
| Move/Resize/Rotate | `phase603-selection-transform.test.ts` | REAL | transformed selections | high |
| Align/Distribute | `phase611-alignment-distribution.test.ts` | REAL | multi-select | low |
| Groups/Layers | `phase605-layers-groups.test.ts` + persistence | REAL | group/ungroup/order | high |
| Undo/Redo | productivity/history tests | PARTIAL | one undo per gesture/op | high |
| Save/Load | persistence test family | REAL/PARTIAL | round trip template | high |
| Excel/CSV | fixtures + data tests | REAL | import records | medium |
| Base64 image | dynamic image tests | REAL | bind row image | high |
| Shape image fill | Phase 7.8/7.9 tests/docs | REAL/PARTIAL | fit + binding | high |
| QR/Barcode | dynamic code tests | REAL | binding preview/export | medium |
| PDF | renderer tests | REAL | export visual parity | high |
| PNG | renderer-image tests | REAL | export parity | high |
| JPEG | renderer-image tests | REAL | export parity | high |

Any Phase 8 change touching a row marked high export/regression risk must add targeted coverage before release.

## Phase 8 permanent gates
- `npm run test:shape-foundation` — targeted Phase 8.0 capability/mixed/normalization/primary wiring coverage.
- `npm run test:shape-ops-regression` — permanent critical regression aggregate covering transform, groups, alignment, snapping, CAD point OSNAP, Face Split and dedicated Split wiring.

## Phase 8.1 transform additions
| Feature | Existing Test | Quality | Manual Test | Export Risk | Notes |
|---|---|---|---|---|---|
| Rotated resize local delta | `phase81-transform-hardening.test.ts` | REAL (added; not executed here) | Required | Medium | opposite visual anchor must remain stable |
| Center resize | `phase81-transform-hardening.test.ts` | REAL (added; not executed here) | Required | Low | Alt/Option captured at resize start |
| Shift rotation snap | `phase81-transform-hardening.test.ts` + UI wiring test | REAL (added; not executed here) | Required | Low | 15° increments |
| In-place Flip H/V | `phase81-transform-hardening.test.ts` + UI wiring test | REAL (added; not executed here) | Required | Medium | PATH IDs preserved; verify PDF/PNG/JPEG visually in later hardening |

## Phase 8.1 Fix1 additions
- Multi-selection shared resize frame — targeted engine + UI wiring tests added.
- Alt/Option center resize — targeted engine test added.
- Shift aspect-constrained multi-resize — targeted engine test added.
- Alt/Option + Shift combined multi-resize — targeted engine test added.
- PATH geometry scaling during multi-resize — targeted engine test added.


## Phase 8.2 styling additions
- `npm run test:shape-styling` — legacy Phase 6.1.4 styling + Phase 8.2 contract/normalization/UI/export wiring.
- Permanent shape-ops regression now includes `phase82-styling-parity.test.ts` and `phase82-styling-ui-wiring.test.ts`.
- Manual parity gate: Radial, Pattern, Image Crop and Custom Stroke must be compared on canvas vs PDF/PNG/JPEG.

## Phase 8.7 Boolean / Fragment
- [ ] SHAPE + SHAPE Union without Convert to Path
- [ ] SHAPE + PATH Boolean
- [ ] Primary-driven Subtract
- [ ] 3+ operand Union / Subtract / Intersect / Combine
- [ ] Fragment creates independently selectable closed regions
- [ ] Fragment style inheritance (Primary-only/overlap vs secondary-only)
- [ ] Compound-path / hole persistence
- [ ] Locked/open vector precondition safety
- [ ] Empty Intersect leaves no ghost element
- [ ] Undo / Redo atomicity
- [ ] Save / Reload / PNG / JPEG / PDF parity

## Phase 8.7 Add-on — CAD Reference-Line Mirror
| Area | Check | Status |
|---|---|---|
| Reference mirror | 2-point arbitrary axis Copy | SOURCE CHECKED / MANUAL PENDING |
| Reference mirror | 2-point arbitrary axis Move | SOURCE CHECKED / MANUAL PENDING |
| Reference mirror | 45-degree reflection math | PASS (direct smoke) |
| Reference mirror | PATH nodes / Bezier handedness | SOURCE CHECKED / MANUAL PENDING |
| Reference mirror | group copy/move semantics | SOURCE CHECKED / MANUAL PENDING |
| Reference mirror | OSNAP axis endpoint wiring | SOURCE CHECKED / MANUAL PENDING |
| Regression | existing Flip H/V + Page Mirror | UNCHANGED SOURCE / MANUAL PENDING |
| Regression | Face Split / OSNAP / Trimmer | BYTE-FOR-BYTE UNCHANGED |

## CAD Drawing Guides / Polar Tracking
- LINE live angle/length HUD: PENDING MANUAL
- Ortho H/V constraint: PENDING MANUAL
- Polar angle increment: PENDING MANUAL
- Parallel/Perpendicular tracking: PENDING MANUAL
- FLEXIBLE_LINE/PEN tracking: PENDING MANUAL
- SPLIT + OSNAP coexistence: PENDING MANUAL
- Mirror reference line + tracking: PENDING MANUAL


## Phase 8.7 CAD Projection / Intersection Tracking
- Full polar/perpendicular construction ray to artboard boundary.
- Nearest projected intersections visible on canvas.
- Near-marker endpoint snaps to exact projected intersection.
- Manual UI verification: PENDING.

| Phase 8.7 Add-on Fix2 | Cardinal hover points visible only in drawing workflows | SOURCE PASS / UI PENDING |
| Phase 8.7 Add-on Fix2 | Exact green cardinal lock and commit | SOURCE PASS / UI PENDING |
| Phase 8.7 Add-on Fix2 | Existing endpoint/vertex/intersection OSNAP priority preserved | SOURCE PASS / UI PENDING |

| 8.7 Fix3 CAD intersection capture / Escape lifecycle | Near before/after intersection captures exact point; first Escape => SELECT; double-click reactivates tool | SOURCE IMPLEMENTED / MANUAL PENDING |

| 8.7 Fix4 | Exact vector intersection welding | Source PASS | Manual PENDING |
| 8.7 Fix4 | CAD wheel zoom 5%–3200% + pointer anchor | Source PASS | Manual PENDING |
