# Shape Operations Permanent Regression Matrix

## Phase 8.8B1 Fix8 additions

| Area | Automated coverage | Result | Manual gate |
|---|---|---|---|
| Circle/Bezier boundary participates in region graph | joined-line region tests | PASS | fill curved outer compartment |
| Internal divider produces independent sides | joined-line region tests | PASS | left/right circle halves |
| Nested boundary selects smallest compartment | joined-line region tests | PASS | center diamond only |
| Fill priority: existing face → planar region → parent | desktop wiring test | PASS | recolor, create, ordinary fill |
| Full regression suite | 183 files / 938 tests | PASS | inherited CAD/UI/export smoke |

Fix8 changes region detection and Fill Bucket target priority. It does not modify `faceSplit.ts`, point snapping, Trimmer, Boolean, export or path-topology algorithms.

## Phase 8.8B1 Fix7 additions

| Area | Automated coverage | Result | Manual gate |
|---|---|---|---|
| Multi-endpoint fan consolidation | persistent intersection topology test | PASS | one visible junction at 800% |
| Existing declared point remains master | same engine test | PASS | no coordinate drift |
| Near endpoint-to-segment gap closure | same engine test | PASS | endpoint projects and target splits |
| Guarded 0.2 mm clustering | engine implementation + manual gate | PASS | unrelated point remains separate |
| Full regression suite | 183 files / 935 tests | PASS | inherited CAD/UI/export smoke |

Fix7 changes only straight-PATH intersection materialization; XLINE, Ray, Bezier geometry and protected export/Boolean/Trimmer algorithms remain unchanged.

## Phase 8.8B1 Fix6 additions

| Area | Automated coverage | Result | Manual gate |
|---|---|---|---|
| Crossing segments → persistent nodes | `phase88b1-fix6-persistent-intersection-topology.test.ts` | PASS | cross two LINEs and inspect nodes |
| Endpoint-to-segment T-junction | same engine test | PASS | target segment becomes two segments |
| Declared intersection snap priority | same engine test + point OSNAP suite | PASS | exact coordinate beats projected candidate |
| UI materialization before face rebuild | `phase88b1-fix6-persistent-intersection-ui.test.ts` | PASS | LINE commit then multi-section |
| T-junction multi-section inheritance | Fix5 acceptance tests | PASS | Circle/Triangle network |
| Full regression suite | 183 files / 933 tests | PASS | inherited CAD/UI/export smoke |

Fix6 is limited to straight PATH segments. Bezier self/cross intersection materialization remains outside this phase.

## Phase 8.8B1 Fix5 additions

| Area | Automated coverage | Result | Manual gate |
|---|---|---|---|
| Extended LINE clipped to face intersections | `phase88b1-fix5-tjunction-auto-multisection.test.ts` | PASS | horizontal line through Triangle |
| Shared-divider T-junction | same acceptance test | PASS | corner → divider midpoint |
| Incremental 2 → 3 sections | same acceptance test | PASS | independently select/fill all faces |
| One-crossing invalid divider rejection | same acceptance test | PASS | no corrupt face generated |
| Existing face topology | phase 7.3 + phase 7.5 tests (10 tests) | PASS | dedicated Split regression |
| Full regression suite | 181 files / 929 tests | PASS | inherited CAD/UI/export smoke |

Fix5 changes the canonical face splitter only to resolve and clip valid inside spans between boundary contacts. Existing strict boundary-to-boundary behavior remains covered.

## Phase 8.8B1 Fix4 additions

| Area | Automated coverage | Result | Manual gate |
|---|---|---|---|
| Trim endpoint → canonical node | `phase88b1-fix4-trim-endpoint-weld.test.ts` | PASS | inspect central junction at deep zoom |
| 2+ generated endpoints at one junction | same engine test | PASS | three/four segment junction |
| Guarded 0.15 mm tolerance | same engine test | PASS | distant endpoint remains unchanged |
| Trimmer commit wiring | `phase88b1-fix4-trim-endpoint-weld-ui.test.ts` | PASS | trim and one-step Undo/Redo |
| Existing smart trimmer | `phase71-smart-trimmer.test.ts` (11 tests) | PASS | interval and manual trim |
| Full regression suite | 180 files / 926 tests | PASS | inherited CAD/UI/export smoke |

The existing Trimmer interval algorithm, face split, Boolean, point snapping and export engines were not modified.

## Phase 8.8B1 Fix3 additions

| Area | Automated coverage | Result | Manual gate |
|---|---|---|---|
| Four separate LINEs → closed section | `phase88b1-fix3-joined-line-region.test.ts` | PASS | Fill Bucket inside joined loop |
| CAD endpoint tolerance | same engine test | PASS | ≤0.05 mm accepted |
| Open graph rejection | same engine test | PASS | actionable no-boundary feedback |
| Nested-loop face choice | same engine test | PASS | smallest clicked region |
| Independent persistent AUTO_SECTION | `phase88b1-fix3-joined-line-section-ui.test.ts` | PASS | select/fill/move/delete without source-line mutation |
| Full regression suite | 178 files / 923 tests | PASS | inherited CAD/UI/export smoke |

Existing point snapping, face splitting, trimming, Boolean, export and path-topology algorithms were not modified.

## Phase 8.8B1 Fix2 additions

| Area | Automated coverage | Result | Manual gate |
|---|---|---|---|
| Endpoint grip → endpoint/vertex exact merge | `phase88b1-fix2-cad-grip-angular-osnap.test.ts` + point OSNAP engine tests | PASS | drag and release on highlighted point |
| Endpoint grip → computed intersection | same targeted test + existing intersection engine tests | PASS | stretch endpoint along its segment to crossing |
| Live grip snap classification | same targeted test | PASS | Endpoint / Vertex / Intersection label |
| 45-degree construction guides | same targeted test | PASS | 0° through 315° labels and amber active ray |
| Existing Polar/Ortho/intersection drawing | phase 8.7 targeted regressions | PASS | F8/F10 and exact drop |
| Full regression suite | 176 files / 919 tests | PASS | inherited CAD/UI smoke |

Protected geometry modules and export logic were not modified in Fix2.

## Phase 8.8B1 CAD Arc additions

| Area | Automated coverage | Result | Manual gate |
|---|---|---|---|
| Three-point circular construction | `phase88b1-cad-arc.test.ts` | PASS | Start → Through → End visual check |
| Degenerate/collinear rejection | `phase88b1-cad-arc.test.ts` | PASS | no corrupt element |
| Editable PATH + print metadata | engine + UI targeted tests | PASS | Edit Path and PDF/PNG |
| Shortcut isolation | `phase88b1-cad-arc-ui.test.ts` | PASS | A / Shift+A / Alt+A |
| Full regression suite | 175 files / 916 tests | PASS | inherited CAD/UI smoke |
| Arc pointer ownership over shapes | `phase88b1-cad-arc-ui.test.ts` | PASS | draw all three points over existing shapes |
| Arc crosshair cursor | `phase88b1-cad-arc-ui.test.ts` | PASS | cursor changes immediately on activation |

## Phase 8.8A5 Fix4 additions

| Area | Automated coverage | Result | Manual gate |
|---|---|---|---|
| High-zoom pan footprint | `phase88a5-fix4-zoom-pan-selection-inspection.test.ts` | PASS | 200/400/800%, all edges reachable |
| Shape draw → Select | same targeted test + existing draw regressions | PASS | newly drawn shape immediately editable |
| Vector inspection | same targeted test | PASS | size, angle, endpoints, midpoints, center |
| Full regression suite | 173 files / 910 tests | PASS | inherited CAD/UI smoke required |

Protected geometry algorithms (`faceSplit.ts`, `pointSnapping.ts`, `trimmerUtils.ts`, `booleanUtils.ts`) and export logic were not modified in Fix4.

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

## Phase 8.8A1 CAD LINE Hardening
- [PENDING MANUAL] click-click LINE does not commit on pointer release
- [PENDING MANUAL] chained segment starts exactly at previous endpoint
- [PENDING MANUAL] exact OSNAP/intersection/cardinal endpoint remains welded at deep zoom
- [PENDING MANUAL] Enter finishes chain but keeps LINE ready
- [PENDING MANUAL] Escape exits to Select
- [PENDING MANUAL] closed-face boundary-to-boundary LINE split still works
- [PASS SOURCE] createCadLineGeometry exact endpoint runtime smoke

## Phase 8.8A2 CAD Polyline + Pan
- [SOURCE PASS] Polyline stays one PATH with N vertices / N-1 segments.
- [SOURCE PASS] Exact world vertex coordinates survive bounds normalization.
- [SOURCE PASS] Duplicate final vertex is ignored for double-click finish.
- [SOURCE PASS] Polyline metadata is section-engine ready.
- [MANUAL PENDING] OSNAP/Cardinal/Intersection/Polar/Ortho behavior during Polyline drawing.
- [MANUAL PENDING] Enter / double-click / Escape lifecycle.
- [MANUAL PENDING] Pan toggle, middle-mouse pan, Space+drag pan without accidental geometry.
- [MANUAL PENDING] save/reload/export of Polyline PATH.

| 8.8A3 | CAD XLINE two-point construction geometry | SOURCE PASS / MANUAL PENDING |
| 8.8A3 | XLINE excluded from export | SOURCE PASS / MANUAL PENDING |


## Phase 8.8A3 Fix1 — XLINE Reference Tracking + Dynamic Input
- Dedicated XLINE hover/acquire for Parallel/Perpendicular tracking.
- On-canvas editable LINE Length/Angle dynamic input.
- Exact typed endpoint engine helper.
- Manual UI verification: PENDING.

| Phase 8.8A3 Fix2 | Ordinary shape draw isolation from CAD/XLINE tracking | SOURCE PASS / MANUAL PENDING |
| Phase 8.8A3 Fix2 | LINE dynamic input preserved | SOURCE PASS / MANUAL PENDING |
| Phase 8.8A3 Fix2 | XLINE reference tracking preserved for line-like tools | SOURCE PASS / MANUAL PENDING |

## Phase 8.8A3 Fix4
- LINE stable editable Length/Angle HUD: SOURCE PASS / MANUAL PENDING
- Circle center-first radius input: SOURCE PASS / MANUAL PENDING
- Projected perpendicular virtual intersection: SOURCE PASS / MANUAL PENDING
- Parametric shape drag-release excluding Circle: SOURCE PASS / MANUAL PENDING
- Polyline/XLINE protected behavior: SOURCE PASS / MANUAL PENDING


## Phase 8.8A3 Fix5
CAD LINE endpoint double-click Extend-to-Boundary and shape-drawing reference parity implemented. Manual verification: PENDING. See `UPDATE_PHASE_8_8A3_FIX5_LINE_EXTEND_SHAPE_REFERENCES.md`.

| Phase 8.8A3 Fix6 Shortcuts header button | Source + Manual | PASS source / PENDING manual | `DesignerHeader` exposes Shortcuts action without altering existing actions. |
| Phase 8.8A3 Fix6 Shortcuts modal | Source + Manual | PASS source / PENDING manual | Searchable categorized shortcut/help modal; backdrop/Escape/X close. |

| 8.8A3 Fix7 shortcut registry | Utility + all exposed shapes + duplicate in place | Source PASS / Manual PENDING |


## Phase 8.8A4 Fix2 — Card Designer TDZ Runtime Recovery
- Fixed CardDesigner blank-page crash caused by `canEditPath` and related capability constants being read in a hook dependency array before initialization.
- Source transpile and declaration-order regression check: PASS.
- Dashboard -> Card manual runtime verification: PENDING.

## Phase 8.8A4 Fix3 regression gate
- CardDesigner TDZ-safe initialization order: SOURCE PASS / MANUAL PENDING
- RAY forward-only construction geometry: HELPER PASS / MANUAL PENDING
- RAY non-export metadata: SOURCE PASS / MANUAL PENDING
- Existing CAD/shape/section features: preserved by scoped implementation / MANUAL PENDING

## Phase 8.8A5 CAD Angle Line regression addendum
| Area | Expected | Status |
|---|---|---|
| Dashboard -> Card mount | No TDZ/blank-page regression | Source guard PASS / Manual PENDING |
| Normal LINE | L shortcut + chaining preserved | Source PASS / Manual PENDING |
| Angle Line | A shortcut, exact Length/Angle, no auto-chain | Source PASS / Manual PENDING |
| Arrow shortcut | Alt+A remains Arrow | Source PASS / Manual PENDING |
| Ray/XLINE/Polyline | Existing tool behavior unchanged | Manual PENDING |
| Face Split / OSNAP / Trimmer / Boolean | No engine changes | Source diff PASS |

| Phase 8.8A5 Fix1 CAD Line Grip Angle Editing | Source/transpile PASS; Start/End/Center math PASS; manual UI PENDING |

| 8.8A5 Fix2 Edge Align | SHAPE/PATH straight edge -> Ray/XLINE/LINE segment exact collinearity | Automated math PASS; manual pending |

## Phase 8.8A5 Fix3 stabilization gate
| Gate | Result |
|---|---|
| TypeScript project references | PASS — 0 errors |
| Unit/integration suite | PASS — 172 files / 907 tests |
| Workspace production build | PASS |
| Exact-size multi-edit position stability | PASS automated |
| PATH/image/group persistence normalization | PASS automated |
| Dynamic Base64 and artboard image binding fixtures | PASS automated |
| Edge Align / LINE / Polyline / XLINE / Ray / Angle Line source guards | PASS automated |
| Card Designer TDZ declaration order | SOURCE CHECK PASS / MANUAL PENDING |
| Complete Windows UI smoke | PENDING |
