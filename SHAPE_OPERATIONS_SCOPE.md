# Shape Operations Scope

> **TARGET REQUIREMENTS — NOT CURRENT IMPLEMENTATION STATUS.**

## Supported operation model
The long-term designer should provide consistent single-selection, multi-selection, styling, geometry editing, grouping, Boolean operations, persistence and export behavior across supported shapes. Open paths remain stroke/geometry objects and are not Boolean-compatible until closed/converted.

## A. Transform
Move by mouse/keyboard/exact position; resize with 8 handles and exact dimensions; aspect locking; rotation handle/exact degrees/15° snapping; horizontal/vertical flip; later skew/shear after transform architecture is safe. Group transforms must preserve child relationships.

## B. Styling
Solid/no fill, linear/radial gradients, patterns, image/texture fills with fit/crop/focal controls, opacity, stroke color/width/opacity/dash/caps/joins, and later shadow/glow/soft-edge effects. Canvas/export/save-load parity is mandatory.

## C. Geometry
Convert built-in shapes to freeform PATH while preserving appearance and bindings; edit/add/delete/break/join/open/close nodes; Corner/Smooth/Symmetric modes; line/Bezier segments; parametric adjustment handles; Change Shape while retaining compatible style/text/bindings.

## D. Shape Text
Inline editing, font/style/alignment/padding, wrapping and fit modes (overflow/clip/wrap/shrink/resize-shape), Excel/CSV bindings, fallback/missing behavior, and autofit after binding resolution.

## E. Arrange
Front/back/forward/back, duplicate/copy/cut/paste/delete/lock/hide/rename, default shape styles, image-filled shape crop/reset/fit/fill.

## F. Multi-selection
Shift/Ctrl click, marquee/select-all/layer multiselect, primary object, mixed inspector states, align to selection/primary/artboard, distribution/equal gaps, same width/height/size, group-aware set movement.

## G. Groups
Group/ungroup/regroup, atomic move/resize/rotate/flip/duplicate/lock/hide, future nested-group isolation and robust world/local transform handling.

## H. Boolean
Require compatible closed visible/unlocked vector shapes on one artboard. Support Union, Combine/XOR, Fragment (every overlap region becomes an independent PATH), Intersect and Subtract. Preserve holes/compound paths, deterministic target/style policy, sliver cleanup, history atomicity and export parity.

## I. UX
Context-aware Inspector and top toolbar groups such as `Arrange | Align | Group | Merge Shapes | Edit Shape`; unsupported operations remain visible/disabled with clear reason.

## J. Persistence / History / Clipboard
Backward-compatible schema normalization/migration, atomic history transactions, copy/paste with regenerated IDs and preserved group/assets/style/bindings, stable save/reload round trip.

## K. Tests / Definition of Done
Unit/UI/export/manual tests for all affected element types and permanent regression protection for LINE/FLEXIBLE_LINE/SPLIT/OSNAP/Face Split/Fill Bucket/Scissors/Erase Segment/guides/snapping/history/save-load/export.
