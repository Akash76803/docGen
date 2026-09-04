# Shape Operations Pre-Implementation Audit

This audit is based on the locally available Phase 7.11 source plus prior inspection of the public Git repository.

| Capability | Status | Evidence / Current behavior | Gap / Risk | Decision |
|---|---|---|---|---|
| Primary selection state | IMPLEMENTED | `selection.ts` contains `primaryElementId` and deterministic helpers | Not propagated consistently | HARDEN |
| Primary in Context Toolbar | PARTIAL | Toolbar uses `sourceElements[0]` | Can disagree with real primary | HARDEN |
| Capability Matrix | MISSING | Type checks are scattered across UI/tools | Duplicated policy logic | NEW |
| Mixed inspector values | MISSING | No reusable semantic mixed-value resolver | Multi-edit ambiguity | NEW |
| Move/nudge | IMPLEMENTED | Existing transform/selection engine | Preserve history/snapping | REUSE |
| 8-handle resize | IMPLEMENTED | Existing interaction flow | Rotation-aware resize incomplete | HARDEN |
| Rotation | IMPLEMENTED | Canvas + transform engine | Advanced multi/group semantics need tests | HARDEN |
| Generic flip | PARTIAL | Image/page mirror/flip-related behavior exists | No unified shape/PATH transform policy | HARDEN/NEW |
| Skew | MISSING | No generalized transform matrix | High parity risk | DEFER |
| Solid fill | IMPLEMENTED | Existing fill/styling engine | — | REUSE |
| Linear gradient | IMPLEMENTED | Existing normalization/render support | Contract/export parity must remain synced | REUSE/HARDEN |
| Radial/pattern fill | INCONSISTENT/PARTIAL | Some renderer references existed in audited Git history | Contract/UI parity uncertain | INVESTIGATE |
| Image fill | IMPLEMENTED | Shape/PATH image fills and dynamic binding | Crop/pan/zoom contract incomplete | HARDEN |
| Advanced stroke | PARTIAL | Color/width/basic styles exist | caps/joins/custom dash absent | NEW |
| Shadow | IMPLEMENTED/PARTIAL | Existing styling/render paths | parity tests needed | HARDEN |
| PATH geometry | IMPLEMENTED | points, segments, Beziers, subpaths | advanced editing gaps remain | REUSE |
| Corner/Smooth/Symmetric | IMPLEMENTED | Path node modes + toolbar controls | test/UX hardening | REUSE/HARDEN |
| Line ↔ Curve | IMPLEMENTED | Existing path editing controls | — | REUSE |
| Convert to Path | IMPLEMENTED/PARTIAL | Existing shape conversion | preserve all styles/bindings/undo needs tests | HARDEN |
| Explicit Open Path | MISSING/PARTIAL | Close path exists; complete open workflow not confirmed | — | NEW/HARDEN |
| Yellow adjustment handles | MISSING | no dedicated parametric adjustment overlay | — | NEW |
| Change Shape | MISSING | no general retain-properties shape swap | — | NEW |
| Shape text | IMPLEMENTED/PARTIAL | label/style/alignment/padding exist | shrink/autofit/fit modes absent | HARDEN |
| Align/distribute | IMPLEMENTED | Existing engine and toolbar | primary-relative and match-size missing | HARDEN |
| Same W/H/Size | MISSING | not in current alignment toolkit | — | NEW |
| Group/Ungroup | IMPLEMENTED | layers-groups engine/tests | nested groups/regroup absent | REUSE/HARDEN |
| Group transforms | IMPLEMENTED/PARTIAL | scale/rotate helpers exist | PATH-child scaling semantics need validation | HARDEN |
| Regroup | MISSING | no session regroup workflow | — | NEW |
| Union/Subtract/Intersect/Exclude | IMPLEMENTED | Paper.js Boolean engine | preconditions/primary ordering/tests weak | HARDEN |
| Boolean test coverage | PLACEHOLDER/PARTIAL | `phase709-boolean-path.test.ts` has empty test bodies | no meaningful assertions | NEW tests |
| Fragment | MISSING | divider Face Split is not general Boolean Fragment | multi-region planar topology required | NEW |
| Face Split | IMPLEMENTED | `faceSplit.ts`, LINE/FLEXIBLE_LINE/SPLIT integration | must not regress | REUSE |
| Dedicated SPLIT | IMPLEMENTED | Phase 7.11 source/tests/doc | preserve | REUSE |
| CAD point OSNAP | IMPLEMENTED | `resolvePointSnap()` live wiring in CardDesigner | high regression sensitivity | REUSE/HARDEN tests |
| Schema migration | MISSING | serializer requires exact schema version | future contract changes can break old templates | NEW |
| Undo/Redo | IMPLEMENTED | transaction/snapshot architecture | new commands need atomicity tests | REUSE/HARDEN |
| Clipboard | IMPLEMENTED/PARTIAL | productivity/style clipboard exists | PATH/advanced property coverage needs hardening | HARDEN |
| PDF/PNG/JPEG export | IMPLEMENTED | existing renderer/export packages | every new style/geometry contract needs parity | HARDEN |
| CardDesigner architecture | RISK | large shared pointer/orchestration file | new engine logic here raises regression risk | DECOMPOSE |

## Audit conclusion
Do not execute the old wishlist as a from-scratch build. Phase 8 should systematically **reuse and harden** the substantial existing designer while adding only the genuinely missing foundations/features.
