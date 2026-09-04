# Manual Smoke Tests

## Phase 8.8B1 Fix8 — Smallest Planar Compartment Fill

1. Draw one circle and reproduce the supplied nested-diamond/fan pattern using Polyline or LINE.
2. Confirm top, bottom, left, right and internal junctions acquire exact Endpoint/Intersection snaps.
3. Select Fill Bucket, choose a visibly different color and click inside the center diamond. Confirm only the center diamond fills.
4. Click each adjacent triangular/diamond strip in turn. Confirm only the clicked smallest compartment becomes a persistent independent section.
5. Click the remaining area between the outer diamond and circle. Confirm that curved outer compartment fills without coloring the entire circle.
6. Change/remove fill on an already generated section. Confirm the same section is edited rather than another duplicate face being created.
7. Click an ordinary closed shape with no internal partitions. Confirm normal whole-shape fill still works.
8. Repeat at 200%, 400% and 800%; verify no neighboring face is selected through a junction.
9. Undo/Redo each created section, then Save/Reload and run PDF/PNG export.

**Status:** typecheck, 183 files / 938 tests and build PASS; Windows UI PENDING.

## Phase 8.8B1 Fix7 — Duplicate Intersection Cluster Consolidation

1. Recreate the supplied fan-junction image with three or more manually drawn LINE endpoints aimed at one declared intersection.
2. Hover the existing point before every click and confirm `Intersection` feedback appears.
3. Finish each LINE and inspect at 200%, 400% and 800% zoom. Confirm there is one junction only—no tiny triangle, fan, gap or overlapping nearby points.
4. Enter Edit Path on every participating LINE and verify each connected endpoint has the exact same displayed world coordinate.
5. Draw a branch ending up to 0.2 mm short of an existing segment. Confirm the gap closes, the endpoint projects to the segment and the target segment receives a persistent node.
6. Repeat with an already-declared intersection in the cluster; confirm its coordinate remains the master rather than being averaged or shifted.
7. Keep an unrelated endpoint more than 0.2 mm away and confirm it is not pulled into the junction.
8. Use the resulting network with Fill Bucket/automatic face split and confirm clean independent multi-sections.
9. Undo/Redo, Save/Reload and PDF/PNG export; inspect the junction after reload/export.

**Status:** typecheck, 183 files / 935 tests and build PASS; Windows UI PENDING.

## Phase 8.8B1 Fix6 — Persistent Intersection Nodes & Exact OSNAP

1. Draw a horizontal LINE and a vertical LINE crossing through its middle.
2. Finish the command, start another LINE and hover near the crossing. Confirm `Intersection` highlights before Endpoint/Vertex/Boundary feedback.
3. Click the highlighted intersection as the new LINE start; finish elsewhere. Enter Edit Path and confirm its start coordinate exactly matches the crossing—not a nearby projected value.
4. Start elsewhere and use the same declared intersection as the endpoint; confirm exact merge.
5. Create a T-junction by ending a new LINE at the middle of an existing LINE. Confirm the target LINE is split into two segments and both paths store one canonical junction.
6. Connect three, four and more lines to that point; every new start/end must lock to the same persistent intersection.
7. Recreate the Circle/Triangle reference: make the first crossing divider, then draw further lines between declared intersection points. Confirm closed regions become independent multi-sections.
8. Inspect at 200%, 400% and 800% zoom; confirm no micro-gap, overlap or approximate endpoint.
9. Move/trim a connected segment and verify topology remains valid or is recalculated on the next committed LINE operation.
10. Undo/Redo each LINE/intersection/face operation, Save/Reload and compare PDF/PNG export.

**Status:** typecheck, 183 files / 933 tests and build PASS; Windows UI PENDING.

## Phase 8.8B1 Fix5 — T-Junction Auto Multi-Section Topology

1. Draw a Triangle inside a Circle.
2. Draw one horizontal normal LINE completely across the Triangle, with its raw endpoints outside the Triangle boundary.
3. Confirm the engine clips the divider to the Triangle entry/exit intersections and converts the Triangle into two independently selectable sections; the outside line portions must not become section edges.
4. Draw another LINE from the Triangle top corner to the middle of the new shared horizontal divider.
5. Confirm endpoint/intersection feedback at both ends and verify the touched section splits again.
6. Confirm the Triangle component now contains exactly three independent closed sections; click each and apply a different fill.
7. Repeat from another corner/shared-divider point to produce four or more sections incrementally.
8. Draw a line that crosses the boundary only once and ends inside; confirm no invalid section is generated.
9. Undo once per divider and confirm each complete topology replacement reverses in one step; Redo restores it.
10. Save/Reload, inspect junctions at 400–800% zoom and run quick PDF/PNG export comparison.
11. Regress dedicated Split, Face Split/Multi-section, LINE chaining, Polyline, Trimmer, Fill Bucket, OSNAP and endpoint weld.

**Status:** typecheck, 181 files / 929 tests and build PASS; Windows UI PENDING.

## Phase 8.8B1 Fix4 — Post-Trim Multi-Point Endpoint Weld

1. Recreate the supplied case: make multiple lines meet near one central junction and use Trimmer/Erase Segment to remove the extra line portion.
2. Confirm the newly exposed endpoint lands exactly on the existing central node—no visible wedge, gap or short overlapping connector at 200%, 400% and 800% zoom.
3. Repeat with three and four segments meeting at the same point. Confirm every trimmed fragment shares the same displayed junction coordinate.
4. Enter Edit Path and inspect the involved endpoints; dragging one to the junction should show Endpoint/Vertex feedback and exact placement.
5. Keep a target endpoint more than 0.15 mm away and trim; confirm it is not pulled across the guarded tolerance.
6. Undo once and confirm the whole trim+weld operation reverses together; Redo restores it.
7. Use Fill Bucket inside the resulting joined boundary and confirm one clean independent section is created.
8. Save/Reload and compare the junction at deep zoom; then run quick PDF/PNG export comparison.
9. Regress LINE, Polyline, XLINE, Ray, Arc, Face Split/Multi-section and Extend-to-Boundary.

**Status:** typecheck, 180 files / 926 tests and build PASS; Windows UI PENDING.

## Phase 8.8B1 Fix3 — Joined-Line Independent Sections

1. Draw four separate LINE elements as a rectangle, using endpoint OSNAP so every corner highlights and joins accurately.
2. Press Enter to finish LINE chaining, choose Fill Bucket (`B`), select a visible solid color and click inside the loop.
3. Confirm `Joined Line Section` is created and immediately selected as an independent closed PATH.
4. Change its fill, move it, hide it and delete it; confirm the four source LINE elements remain unchanged.
5. Undo once after creation and confirm only the generated section disappears; Redo restores it.
6. Leave one corner open by more than 0.05 mm and click inside; confirm no section is created and `no closed boundary` feedback appears.
7. Close that corner using grip endpoint snap, then repeat Fill Bucket; confirm section creation succeeds.
8. Create a smaller closed loop inside a larger loop. Click inside the smaller loop and confirm the smallest enclosed section is generated.
9. Save/Reload and confirm section geometry, fill and independent selection persist.
10. Quick PDF/PNG export and inherited LINE/Polyline/Face Split/Multi-section/OSNAP regression.

**Status:** typecheck, 178 files / 923 tests and build PASS; Windows UI PENDING.

## Phase 8.8B1 Fix2 — CAD Grip Stretch & Angular OSNAP Feedback

1. Dashboard → Card; confirm no blank page and Rectangle/Circle/Star draw/select normally.
2. Draw two separate LINE/PATH elements. Select the first, enter Edit Path, grab its endpoint and stretch it near the second line's endpoint. Confirm a green `Endpoint` marker appears; release and verify exact point-to-point connection.
3. Repeat endpoint drag toward a PATH vertex and confirm `Vertex` feedback and exact merge.
4. Arrange two other straight elements so they intersect. Drag an open LINE endpoint along its fixed segment direction toward that crossing; confirm `Intersection` highlights and release commits exactly at the intersection.
5. Undo once and confirm the whole grip stretch reverts; Redo restores it.
6. Activate LINE, click the first point and move the cursor around it. Confirm labelled guides at 0°, 45°, 90°, 135°, 180°, 225°, 270° and 315° remain screen-readable at deep zoom.
7. Turn Polar on (`F10`) and keep Angle at 15° or set it to 45°. Approach 45°, 90° and 135°; confirm the active guide turns amber and the angle HUD reports the exact angle. `F8` must still constrain to horizontal/vertical.
8. Draw toward an existing endpoint, vertex and line crossing. Confirm the target highlights before the click and the committed endpoint lands exactly on it.
9. Repeat the angular guide and intersection checks with Angle Line; verify its Length/Angle fields remain clickable.
10. Quick regressions: Circle Radius; LINE chaining; Polyline; XLINE; Ray; Line Grip Angle Editing; Extend-to-Boundary; projected perpendicular intersection; Face Split/Multi-section; Shortcuts modal; duplicate shortcuts; Align Edge (Triangle→Ray, Rectangle→XLINE, Shape→LINE).
11. Save/Reload, Undo/Redo, and quick PDF/PNG export comparison.

**Status:** typecheck, 176 files / 919 tests and build PASS; Windows UI PENDING.

## Phase 8.8B1 — CAD Arc

1. Open Dashboard → Card and confirm no blank page/TDZ error.
2. Open Elements → Utility → CAD Arc, or press `Shift+A`.
3. Click Start, move and click Through, then move and click End. Confirm live line/arc preview and OSNAP markers at all stages.
   - Repeat with every click directly over an existing filled Rectangle/Circle/Star; Arc must own the click and the existing shape must not move/select.
   - Confirm the canvas cursor visibly changes to crosshair while CAD Arc is active.
4. Confirm a circular open arc is created through all three picked points and remains ready for the next arc.
5. Pick three nearly/fully collinear points; confirm no corrupt path is created and actionable feedback appears.
6. Press Esc, select the arc, verify size/angle/endpoints/midpoints/center, then resize and rotate it.
7. Enter Edit Path and move endpoints/through node/Bezier handles; confirm it stays an editable PATH.
8. Undo once immediately after creation and confirm the entire arc is removed; Redo restores it.
9. Verify `A` still opens Angle Line, `Shift+A` opens CAD Arc, and `Alt+A` draws Arrow.
10. Verify OSNAP, F8 Ortho, F10 Polar, LINE, Polyline, XLINE, Ray, Angle Line, Circle Radius, Extend-to-Boundary, Face Split and Align Edge quick regressions.
11. Save/Reload and compare arc geometry/metadata.
12. Export PDF and PNG and confirm the CAD Arc is printable and visually matches the canvas.

**Status:** typecheck, 175 files / 916 tests and build PASS; Windows UI PENDING.

## Phase 8.8A5 Fix4 — Zoom Pan & Vector Selection Inspection

1. Dashboard → Card; confirm the designer opens and no blank page/TDZ console error appears.
2. Draw Rectangle, Circle, Star and Half Circle. After each drag-release, confirm Select becomes active and the new shape can immediately be moved, resized and rotated.
3. Select each SHAPE/PATH. Confirm width × height, rotation angle, blue endpoint squares, amber segment midpoints and the center marker are visible and update during resize/rotation.
4. Double-click a PATH or choose Edit Path; move nodes/handles and confirm geometry is editable.
5. Set zoom to 200%, 400% and 800%. At every level use Pan tool, middle-mouse drag and Space+drag in all directions; confirm top, bottom, left and right artboard edges can all be brought into view without top freeze/clipping.
6. Circle Radius input; LINE Length/Angle; Angle Line; LINE Start/End/Center grip-angle editing; endpoint Extend-to-Boundary; Polyline; XLINE; Ray; projected perpendicular intersection.
7. Face Split, then split a generated face again and confirm independent multi-section selection.
8. Open Shortcuts; verify utility/shape/duplicate entries, `A` Angle Line vs `Alt+A` Arrow, `Ctrl+D` offset duplicate and `Ctrl+Shift+D` in-place duplicate.
9. Align Edge: Triangle edge → Ray, Rectangle edge → XLINE, Shape edge → normal LINE. Confirm reference is unchanged and target is not distorted.
10. Undo/Redo draw, transform and Align Edge operations; Save/Reload; quick PDF and PNG export comparison.

**Expected:** high-zoom navigation remains unconstrained, selection inspection remains screen-readable, and all inherited CAD/section/export behavior remains functional.

**Status:** automated gates PASS; Windows UI execution PENDING.

Each release phase should record these results instead of assuming automated coverage equals runtime behavior.

## Selection and Transform
**Setup:** add Rectangle and Circle.  
**Steps:** single-select, Ctrl/Shift multi-select, marquee, move, nudge, resize from all directions, rotate, undo/redo.  
**Expected:** deterministic selection, no jumps, one history step per gesture.  
**Failure indicators:** wrong primary, locked element mutation, resize inversion, multiple undo steps for one drag.

## LINE + OSNAP
**Setup:** closed rectangle/path.  
**Steps:** draw LINE near vertex, boundary, endpoint; zoom in/out and repeat.  
**Expected:** visible magnetic point snap with exact coincident endpoint.  
**Failure indicators:** snap tolerance changes unpredictably with zoom or normal shape drawing is hijacked.

## FLEXIBLE_LINE
Draw multi-segment line with snapping. Confirm each committed point follows intended point-snap behavior and ordinary selection remains functional afterward.

## SPLIT / Face Split
**Setup:** closed rectangle.  
**Steps:** choose Split; start/end on boundary; commit; select each generated face independently; move/delete one; undo. Repeat splitting one generated face to create 3+ regions.  
**Expected:** independent PATH faces and clean layer entries.  
**Failure indicators:** stray divider on failure, source remains duplicated, faces select as one unintentionally.

## Pen / Edit Path / Scissors / Erase Segment
Create open/closed path, edit nodes/handles, convert segment line↔curve, cut with Scissors, erase segment. Verify geometry remains valid and undo restores prior state.

## Fill Bucket
Fill a valid closed region and verify open paths are not treated as fillable closed faces.

## Groups / Layers
Group mixed elements, move/rotate/resize, lock/hide, reorder, duplicate, ungroup and undo. Verify child ordering and geometry.

## Data Binding
Import representative CSV/XLSX fixture. Bind text, Base64/dynamic image, shape image fill, QR and barcode. Switch records and verify resolved values.

## Save / Reload
Save a design containing shape/path/group/image binding/generated face, reload and visually compare geometry, styles, bindings and layer order.

## Export
Export representative design as PDF, PNG and JPEG. Compare text, fills, images, PATHs, rotations, generated faces and dynamic content with canvas preview.

## Phase 8.8A5 Fix3 — Windows UI Gate
1. Dashboard → Card opens without a blank page or TDZ console error.
2. Draw Rectangle, Circle and Star; confirm normal drag-release behavior.
3. Circle: click center, enter exact Radius, commit with Enter.
4. LINE: click start, edit Length/Angle, commit; draw a continuous chain and finish it.
5. Angle Line: press `A`, set start and exact Length/Angle; confirm it does not auto-chain. Confirm `Alt+A` still draws Arrow.
6. Line Grip Angle Editing: Edit Path on a CAD LINE; test Start, End and Center anchors with exact Length/Angle.
7. Double-click a LINE endpoint and verify Extend-to-Boundary reaches the nearest valid boundary.
8. Draw a multi-segment Polyline and finish with Enter/double-click.
9. Draw XLINE and Ray; confirm XLINE is bidirectional and Ray is forward-only.
10. Verify projected horizontal/vertical perpendicular intersection marker and exact endpoint capture.
11. Split a closed shape, then split one generated face again; verify independent multi-section faces.
12. Open Shortcuts; verify search plus Utility, Shape and Duplicate entries.
13. Verify `Ctrl+D` offset duplicate and `Ctrl+Shift+D` duplicate in place.
14. Align Edge: Triangle edge → Ray; Rectangle edge → XLINE; Shape edge → normal LINE. In each case verify collinearity, unchanged reference, and no target distortion.
15. Undo/Redo each geometry operation, especially Align Edge as one history step.
16. Save, reload, and compare geometry, layer order and CAD metadata.
17. Quick export regression: PDF and PNG (plus JPEG if available); compare visible printable geometry. Confirm Ray/XLINE remain editor-only where configured.


# Phase 8.2 Styling Smoke

## Radial Gradient
Setup: Add a rectangle.
Steps: Appearance → Fill → Radial Gradient; change center, radius, stop colors/opacity. Export PDF/PNG/JPEG.
Expected Result: Live canvas and exports show the same radial gradient.
Failure Indicators: solid fallback, missing stops, export differs from canvas.

## Pattern Fill
Setup: Add a rectangle or closed PATH.
Steps: Fill → Pattern; test Hatch/Dots/Checker; change foreground/background/scale/rotation/opacity.
Expected Result: Pattern remains clipped to vector geometry and exports match.
Failure Indicators: pattern leaks outside mask, rotation/scale lost, export becomes solid.

## Image Fill Crop
Setup: Add a shape and select an image fill.
Steps: change Zoom, Offset X/Y, Rotation; save/reload; repeat with a dynamic/Base64 image source.
Expected Result: crop transform persists and applies to both static and resolved dynamic source.
Failure Indicators: crop resets, image leaves mask, dynamic source ignores crop.

## Advanced Stroke
Setup: Add a PATH with visible border.
Steps: Custom Dash `2, 1, .5, 1`; change offset; Round/Square cap; Miter/Round/Bevel join; export.
Expected Result: editor/export vector stroke geometry agrees.
Failure Indicators: custom dash ignored, caps/joins reset, export renders solid stroke.

## Phase 8.2 Fix1 — Stroke UI / Custom Dash
**Setup:** Select a SHAPE or PATH and open **Stroke**.

**Steps:**
1. Set Style to **Custom Dash**.
2. Type `12, 3, 2, 3` continuously.
3. Press Enter or click outside the field.
4. Re-enter the field and type `12, abc`.
5. Inspect Stroke alignment.

**Expected Result:**
- Commas/spaces remain editable while typing.
- Valid pattern commits as `[12, 3, 2, 3]`.
- Invalid text shows validation and does not replace the last committed pattern.
- Section is named **Stroke**.
- Alignment displays disabled **Center** with an Inside/Outside deferred note.

**Failure Indicators:** Comma disappears during typing; pattern partially commits on each keystroke; invalid input corrupts the stroke; section still says Border; alignment looks like a missing control.


# Phase 8.3 — Multi-Selection UI Acceptance

## A. Primary reference alignment
Setup: create three shapes at different X/Y positions and sizes. Multi-select them; click one already-selected shape so its dashed primary outline/name becomes the reference.
Steps: Inspector > Transform > Reference = Primary element. Click Left, H Center, Right, Top, V Center, Bottom one at a time (Undo between tests).
Expected: the primary stays fixed; every unlocked selected element aligns the requested edge/center to the primary. Locked objects remain fixed.
Failure: primary moves, alignment uses overall selection bounds, or locked object moves.

## B. Switch primary
Steps: with the same multi-selection, click another selected object to make it primary; repeat Primary > Left.
Expected: alignment now uses the newly-primary object, proving operations do not depend on element array/z-order.

## C. Same Width
Steps: make primary 50 mm wide and another shape visibly narrower; multi-select; click Same Width.
Expected: other unlocked items become exactly primary width; heights, positions, rotation remain unchanged. Primary remains unchanged.

## D. Same Height
Expected: all unlocked target heights match primary; widths remain unchanged.

## E. Same Size
Expected: all unlocked targets match both primary width and height; positions/rotation stay unchanged.

## F. PATH size match
Setup: select a rectangle as primary plus an asymmetric closed PATH.
Steps: Same Size, then Edit Path.
Expected: PATH bounding size matches primary and its nodes/Bezier geometry scale with the box; topology is not corrupted.

## G. Mixed exact X/Y
Setup: select shapes at X=10, 30, 60. Inspector X should show blank with Mixed placeholder.
Steps: type 20 in X and leave field/press Enter.
Expected: every unlocked selected element X becomes exactly 20. Y/size/rotation are unchanged. This is absolute positioning, not delta movement.
Repeat for Y.

## H. Mixed exact Width/Height
Steps: select different-size objects; Width/Height show Mixed. Enter Width=35.
Expected: every unlocked selected element width becomes 35; height unchanged. PATH geometry scales with width. Repeat Height.

## I. Mixed exact Rotation
Steps: select objects with different rotations; enter 45 in Rotation.
Expected: all unlocked selected objects become exactly 45 degrees; position/size unchanged.

## J. Equal value state
Setup: after applying Width=35 to all, reselect.
Expected: Width field displays 35 rather than Mixed.

## K. Locked safety
Setup: lock one of three selected/alignment-related elements where selection permits it.
Steps: exact X, Same Size, Primary alignment.
Expected: locked element does not mutate; unlocked selected items do.

## L. Distribution regression
Steps: Reference=Selection bounds, select 3+ objects, Distribute H/V. Then Reference=Artboard and repeat.
Expected: existing distribution still works. With Reference=Primary, Distribute buttons are disabled because Primary distribution is intentionally undefined.

## M. Phase 8.1 regression
Test shared multi-selection resize, Alt resize, Shift resize, Alt+Shift, Flip H/V, Page Mirror, rotation.
Expected: unchanged and working.

## N. Critical geometry regression
Test LINE, FLEXIBLE_LINE, OSNAP, SPLIT, Face Split, Fill Bucket, Scissors, Erase Segment, Pen/Edit Path, Undo/Redo, Save/Reload.
Expected: no behavior regression.

# Phase 8.4 — Group Hardening Manual QA

## 1. Group + Atomic Selection
Setup: create a Rectangle and a Circle with visible spacing between them.
Steps: multi-select both, click **Group**, then click either child once.
Expected: both children select as one group/alignment unit; the shared selection frame covers both. No duplicate objects are created.
Failure: only one child selects, group button creates nested/duplicate group, or member positions change during grouping.

## 2. Group Move
Setup: use the group from test 1.
Steps: drag either grouped member by about 20 mm.
Expected: both members move by the same delta and preserve their spacing.
Failure: only one child moves or internal spacing changes.

## 3. Group Resize
Setup: group a Rectangle and Circle of different sizes.
Steps: drag the shared group resize corner; repeat with Shift, Alt, and Alt+Shift.
Expected: all children scale as one set; relative layout stays proportional. Shift keeps group aspect, Alt keeps group center, Alt+Shift combines both.
Failure: children tear apart or one element receives independent resize behavior.

## 4. PATH Child Scaling
Setup: create a Rectangle, create/convert another irregular shape to PATH, edit one node/curve so the PATH is visibly asymmetric, then Group them.
Steps: use **Scale +10%** several times and also resize the shared group box.
Expected: PATH outline/nodes/Bezier shape scale together with its bounding box; no old-size path remains inside a larger box.
Failure: PATH box grows but internal vector geometry stays at old size, curves collapse, or nodes jump.

## 5. Group Rotate
Setup: group two offset shapes.
Steps: use existing group/multi rotation and **Rotate +15°**.
Expected: both object centers orbit around the common group center and their own rotation increases consistently; spacing is preserved.
Failure: each object rotates only in place without group-layout rotation when using group rotation action, or members separate unexpectedly.

## 6. Atomic Group Flip H
Setup: group an Arrow on the left and an asymmetric PATH on the right.
Steps: select the group and click **Flip Group H** in Inspector, or **Flip H** in the top context toolbar.
Expected: left/right child placement swaps around the group center, and vector visuals are horizontally reflected. Group size/center stay the same. No duplicate is created.
Failure: each child flips only inside its own original position, group center moves, or layer count increases.

## 7. Atomic Group Flip V
Setup: put one child above another inside a group.
Steps: click **Flip Group V**.
Expected: top/bottom placement mirrors around the group center; vector visuals reflect vertically; group center remains fixed.
Failure: positions do not swap or a page-mirror copy is created.

## 8. Group-aware Same Size
Setup: create Group A with two children. Create one ungrouped Rectangle B with noticeably different overall size. Multi-select Group A plus B and make B the Primary.
Steps: click **Same Size**.
Expected: the *overall bounds of Group A* become equal to B's width/height; Group A children scale proportionally instead of every child individually becoming B's size.
Failure: both group children individually become B-sized or overlap each other.

## 9. Same Width / Same Height
Repeat test 8 using **Same Width** and **Same Height**.
Expected: only requested group-bound dimension matches Primary; the other group-bound dimension remains unchanged.
Failure: individual child dimensions are matched independently.

## 10. Group Rename
Setup: select one complete group.
Steps: Inspector → **Group name** → enter `Logo Lockup` → Enter/leave field.
Expected: group badge in Layers updates to `Logo Lockup`; element names/IDs/geometry do not change.
Failure: individual child is renamed instead or group membership changes.

## 11. Ungroup + Regroup
Setup: select `Logo Lockup` group.
Steps: click **Ungroup**. Confirm Regroup becomes enabled. Move one former member if desired. Click **Regroup**.
Expected: the exact former members become one group again under the old group name; their current world positions are preserved. Regroup is then consumed/disabled.
Failure: elements jump back to pre-ungroup positions, unrelated elements join, or Regroup persists after successful restore.

## 12. Regroup Invalidated Safely
Setup: Group → Ungroup.
Steps: delete one former member, then inspect Regroup.
Expected: Regroup is disabled / does nothing safely because all previous members no longer exist.
Failure: crash, ghost group, or group referring to deleted IDs.

## 13. Duplicate Group
Setup: select a group.
Steps: click **Duplicate** or Ctrl/Cmd+D.
Expected: a copied group appears with new child IDs and a new group ID/name; original and copy move independently; copied children remain grouped.
Failure: copy shares group identity with original or duplicates become ungrouped.

## 14. Lock Group
Setup: select group in Layers and lock it.
Steps: try move, resize, rotate, exact transform.
Expected: all members are locked and none mutate.
Failure: one child remains editable or group tears apart.

## 15. Hide / Show Group
Steps: hide one grouped layer via Layers eye button; show it again.
Expected: visibility applies consistently to the whole group and restores all members.
Failure: only one child hides.

## 16. Layer Order
Setup: group two objects and place an ungrouped object between/around them in z-order.
Steps: select group → Front / Up / Down / Back.
Expected: group members move as a stable selected block and preserve their internal relative z-order.
Failure: unrelated layer gets inserted between grouped members unexpectedly or group internal order changes.

## 17. Keyboard Shortcuts
Steps: select two ungrouped elements → Ctrl/Cmd+G. Then Ctrl/Cmd+Shift+G.
Expected: first command groups; second ungroups. Each is one history step.
Failure: browser action triggers or no group action occurs.

## 18. Undo / Redo Atomicity
Perform individually: Group, Ungroup, Regroup, group flip, group scale/rotate, group rename.
Expected: one Ctrl/Cmd+Z reverses one operation; Redo restores it.
Failure: operation requires many undos or partial group state remains.

## 19. Save / Reload
Setup: create two normal groups, rename one, resize/rotate/flip them, save template, reload/open it.
Expected: group membership, group names, child positions/sizes/rotations, lock/visibility and layers persist. Regroup history itself does NOT persist (intentional session-only policy).
Failure: saved group is lost or stale Regroup action appears after app reload.

## 20. Critical Regression
Verify: multi-select resize modifiers, Align-to-Primary, Same Size, Radial/Pattern/Image Crop/Stroke, LINE, FLEXIBLE_LINE, OSNAP, SPLIT, Face Split, Fill Bucket, Scissors, Erase Segment, Pen/Edit Path.
Expected: all previous phase behavior remains unchanged.


## Phase 8.4 Fix1 focused QA

### Group name visibility
Setup: create and select one complete group.
Steps: open Layers panel; edit `Group name`; press Enter.
Expected: control is visible in Layers, group badge updates, child names remain unchanged.

### Atomic layer order
Setup: overlap a grouped pair with at least two ungrouped shapes above/below it.
Steps: select the group; click Up, Down, Front, Back.
Expected: the entire group changes stacking as one block on canvas and in Layers; children keep their internal relative order.

### Group integrity / save
Setup: group two or more vector elements. Use Split/Trim/Boolean/delete on a grouped member where the UI permits it, or delete one unlocked member.
Steps: save the template.
Expected: no `Group ... references missing element ...` serialization error. Invalid one-member groups are automatically dissolved; surviving elements remain valid and independently editable.

## Phase 8.4 Fix2 — Hierarchical Layers / Z-order
1. Create Triangle, Square, Diamond. Put Triangle + Square in one group.
   - Expected: Layers shows one expandable `Group 1` container with Triangle and Square indented below it; Diamond is a separate top-level layer.
2. Edit the group row name to `Logo Group`, press Enter.
   - Expected: the group header immediately shows `Logo Group`; child names remain unchanged.
3. Overlap the whole group with Diamond. Select the Group row and click Front.
   - Expected: both grouped shapes render above Diamond while their internal order is preserved.
4. Click Back.
   - Expected: Diamond renders above both grouped shapes.
5. Click Up/Down one step.
   - Expected: the entire group moves exactly one top-level layer unit; members never split around Diamond.
6. Use an older/interleaved group if available, then click Up or Down.
   - Expected: group members become a contiguous z-order block and the canvas stacking matches the hierarchical Layers order.
7. Collapse/expand the group.
   - Expected: only child rows hide/show; canvas content is unaffected.
8. Save/reload.
   - Expected: group name, membership, and valid z-order persist; no missing-element serialization error.

## Phase 8.5 Geometry Editing Completion
1. Convert Rectangle to Path → Edit Path. Expected: editable nodes appear and original visual geometry is retained.
2. Shift-select 2+ nodes → drag one selected node. Expected: every selected node and its handles move by the same delta.
3. With 2+ nodes selected press Arrow key; Shift+Arrow. Expected: all selected nodes move together; Bezier handles remain attached.
4. Select a node → Smooth. Expected: handles become collinear and curve is tangent-continuous; handle size is proportional to adjacent segments.
5. Select a node → Symmetric. Expected: opposite handles are collinear and equal length.
6. Select a node → Corner. Expected: handles can be moved independently afterward.
7. Select a LINE segment → To Curve. Expected: cubic curve handles appear and visual line remains initially stable.
8. Select that curve → To Line. Expected: segment becomes straight and its directional handles disappear.
9. Select a LINE → To Arc → Flip Arc. Expected: arc bulges to the opposite side after Flip Arc.
10. Select all nodes of an open 3-node path → Delete Nodes. Expected: operation is safely rejected because it would invalidate the path.
11. Select the middle node of an open 3-node path → Delete Nodes. Expected: a valid 2-node connected path remains.
12. Open path with exactly two endpoints → Close Path. Expected: closing segment is created and fill/closed semantics work.
13. Undo/Redo each node-mode, drag, delete, segment-conversion operation. Expected: one user operation reverses cleanly.
14. Regression: LINE, FLEXIBLE_LINE, PEN, SCISSORS, TRIMMER, SPLIT, Face Split, OSNAP, group/layer actions still work.

## Phase 8.5 Fix4 — Smart Guides & Symmetric Node Editing
1. Convert a rectangle to PATH and enter Edit Path. Selected node(s) must render larger and RED.
2. Shift+click two or more existing nodes. Every selected node must remain visibly red.
3. Create opposite left/right nodes, select one, choose Symmetry H, drag it inward 5mm. Matching opposite node must move inward 5mm around the vertical shape centerline.
4. Switch Symmetry Off and drag one node. Only the dragged/multi-selected nodes should move; automatic opposite movement must stop.
5. Create/select top/bottom opposite nodes, choose Symmetry V, drag one toward center. Opposite node should mirror around horizontal shape centerline.
6. In Edit Path with Centers enabled, shape horizontal and vertical centerlines must be visible.
7. Select an opposite node pair. Equal-distance guides should show matching distances around the shape center.
8. Exit Edit Path. Artboard H/V center guides should remain visible while Centers is enabled; disabling Centers should hide them.
9. Place shape A left of artboard center. Drag shape B near the corresponding right-side mirrored position. With Snap enabled, B should snap symmetrically and equal-distance guides should appear.
10. Drag a third object between two existing objects. Existing equal-spacing guides should still show equal gaps.
11. Verify OSNAP, Split, Face Split, Trimmer, Scissors and Fill Bucket remain unchanged.

## Phase 8.5 Fix5 — Path Toolbar UX + Home
1. Enter Edit Path mode.
   Expected: controls stay in one compact horizontal toolbar, grouped as Nodes / Symmetry / Node Type / Segment / Tools as applicable.
2. Verify Symmetry Off/H/V.
   Expected: all three buttons are on one horizontal segmented control; active mode is visually highlighted.
3. Select one or more nodes.
   Expected: Node Type actions appear and selected-node count badge updates.
4. Select one segment.
   Expected: relevant Segment actions appear without breaking toolbar layout.
5. Reduce app window width.
   Expected: toolbar does not wrap into a broken second row; it remains horizontally scrollable and group labels may hide on narrower widths.
6. Exit Edit Path.
   Expected: page Mirror H/V controls become available again for normal PATH selection.
7. Check top-left designer header.
   Expected: Home house icon is visible.
8. Click Home.
   Expected: navigate back to Dashboard/Home screen.


## Phase 8.5 Fix6 — Auto Mirrored Node Insert
1. Rectangle → Convert to Path → Edit Path. Enable Centers and choose Symmetry H.
2. Shift+Click once on the left vertical edge, away from existing corner nodes.
   - Expected: one red node appears at the click and a second red node is automatically created on the right edge at the exact same Y. Both are equidistant from the vertical shape center. No second manual click is required.
3. Drag either member of that pair inward/outward while Symmetry H remains active.
   - Expected: the opposite node mirrors the movement, remains on the same Y, and maintains equal center distance.
4. Choose Symmetry V. Shift+Click once on the top horizontal edge.
   - Expected: a bottom counterpart is automatically created at the exact same X and equal distance from the horizontal shape center.
5. Choose Symmetry Off. Shift+Click another segment.
   - Expected: only one node is created; no automatic counterpart.
6. Repeat H/V insertion where a mirrored counterpart already exists.
   - Expected: the existing counterpart is selected/reused; no duplicate stacked node is created.
7. Try H/V insertion on an irregular path with no valid opposite boundary near the mirrored target.
   - Expected: only the clicked node is inserted; the engine must not guess a wrong segment.
8. Regression: Add Node, multi-node selection, red nodes, Smooth/Symmetric node type, To Line/Curve, Scissors, Trimmer, OSNAP, Split and Face Split remain working.

# Phase 8.6 — Rich Artboard Background UI Acceptance
1. No element selected -> Background section -> Fill dropdown shows Solid, Transparent, Linear Gradient, Radial Gradient, Pattern, Image.
2. Solid: change color + opacity -> canvas updates live.
3. Linear: use 3 stops + angle -> canvas updates and persists after save/reload.
4. Radial: change center X/Y/radius + stop opacity -> canvas updates.
5. Pattern: test Hatch, Dots, Checker; change colors, scale, rotation, opacity.
6. Image: choose shared asset or upload; test Fit, Fill/Crop, Stretch; zoom, rotation, offset X/Y, reset crop.
7. Dynamic image field: bind a string/Base64 image column -> record preview changes artboard background per row while fallback asset remains available.
8. Transparent: background becomes transparent; editor grid/rulers/guides remain usable.
9. Grid ON over gradient/image -> grid remains visible above background and below design interactions.
10. Save/reload -> authored background and binding persist.
11. PNG/JPEG/PDF export -> background visually matches interactive canvas. JPEG should flatten according to existing export delivery settings; PNG transparent mode remains controlled by export option.
12. Regression: Shape/PATH fills, OSNAP, Split, Face Split, Trimmer, Scissors, Group/Layer order unchanged.

## Phase 8.7 — Boolean Hardening + Fragment

1. SHAPE + SHAPE Union
   - Overlap Rectangle + Circle, select both.
   - Expected: Boolean toolbar visible without Convert to Path; Union yields one PATH.

2. Primary subtract semantics
   - Rectangle A overlaps Circle B.
   - Make A Primary, Subtract.
   - Expected: B cuts A.
   - Undo, make B Primary, Subtract.
   - Expected: A cuts B. Result changes deterministically with Primary.

3. Intersect
   - Expected: only shared overlap remains as PATH.

4. Combine
   - Expected: overlapping area is removed; non-overlapping regions remain in one compound PATH result.

5. Fragment
   - Two overlapping closed vectors -> Fragment.
   - Expected: normally 3 independent closed PATH regions for a simple two-shape overlap.
   - Each fragment must be separately selectable, movable, recolorable, and editable.

6. Fragment style
   - Give Primary red fill, secondary blue fill.
   - Expected: Primary-only + overlap inherit red; secondary-only inherits blue.

7. 3-shape Union/Subtract/Intersect/Combine
   - Expected: operations remain enabled for 3+ closed vectors.
   - Fragment must be disabled for 3+ operands.

8. Open-path safety
   - Select a closed shape + open PATH/LINE.
   - Expected: Boolean controls unavailable/disabled; no geometry mutation.

9. Locked safety
   - Lock one operand.
   - Expected: Boolean unavailable; locked object is not changed.

10. Empty intersection
   - Two non-overlapping shapes -> Intersect.
   - Expected: both selected sources are removed; no 0x0 ghost PATH.

11. Undo/Redo
   - Test each Boolean once.
   - Expected: one operation = one undo/redo action.

12. Save/Reload + Export
   - Save Boolean/Fragment results and reload.
   - Export PNG/JPEG/PDF.
   - Expected: compound paths/holes/fragments persist and render consistently.


## Phase 8.7 Fix1 — Boolean Styling & Opacity Parity
- PATH batch opacity + context-toolbar opacity enabled.
- Boolean/Fragment element-opacity inheritance explicit.
- Manual UI verification: PENDING.

## Phase 8.7 Add-on — CAD Reference-Line Mirror
1. Create/select an asymmetric shape. Click `Line Copy`.
   - Expected: status asks for first axis point; cursor becomes crosshair.
2. Click first point, move pointer.
   - Expected: dashed purple reference line previews from point 1 to pointer; status asks for second point.
3. Click second point on a 45-degree axis.
   - Expected: original remains and a mirrored copy appears across that exact axis.
4. Repeat using `Line Move`.
   - Expected: no duplicate; original element ID/selection target is mirrored in place.
5. Horizontal and vertical reference axes.
   - Expected: results match equivalent CAD reflection geometry.
6. OSNAP test: define the axis by two existing vertices / guide intersections / page center points.
   - Expected: axis endpoints visibly snap using existing point-snap feedback.
7. PATH test: use an irregular curved PATH, mirror by an angled line, then Edit Path.
   - Expected: nodes and Bezier handles are mirrored; topology remains editable.
8. Group test: mirror a group with internal spacing.
   - Expected: Copy creates a separate mirrored group; Move keeps the group intact.
9. Escape after choosing only the first axis point.
   - Expected: tool cancels, preview disappears, no geometry changes.
10. Undo/Redo after Copy and Move.
   - Expected: each completed mirror is one logical history action.
11. Save/reload + PNG/JPEG/PDF export.
   - Expected: mirrored geometry persists and exports exactly as shown on canvas.
12. Regression: Flip H/V and Page Mirror H/V remain unchanged.

## Phase 8.7 Add-on — CAD Drawing Guides & Polar Tracking
1. LINE: pick first point, move cursor. Expect live `angle° · length mm` HUD.
2. Ortho ON: arbitrary mouse movement must constrain preview to 0/90/180/270 degrees.
3. Polar ON, Angle=15: move near 30/45/60 degrees. Expect preview to snap when within tracking tolerance.
4. Change Angle to 30: expected tracked directions change to 0/30/60/90... degrees.
5. Par/Perp ON: draw near an existing rotated shape/PATH edge. Expect `Parallel` or `Perpendicular` snap/tracking.
6. FLEXIBLE_LINE/PEN: each new segment gets live HUD/tracking from previous endpoint.
7. SPLIT: divider reference follows tracking while boundary OSNAP remains authoritative.
8. Mirror Line: reference axis uses same tracking + OSNAP.
9. F8 toggles Ortho; F10 toggles Polar.
10. Regression: OSNAP vertex/boundary/intersection, Face Split, Trimmer, Smart Guides, existing Mirror Line remain working.


## Phase 8.7 CAD Projection / Intersection Tracking
- Full polar/perpendicular construction ray to artboard boundary.
- Nearest projected intersections visible on canvas.
- Near-marker endpoint snaps to exact projected intersection.
- Manual UI verification: PENDING.

## Phase 8.7 Add-on Fix2 — CAD Cardinal Hover Snap Points
Status: PENDING
1. Enter LINE draw mode and hover inside a closed rectangle. Expected: four cardinal markers appear at right/top/left/bottom boundary intersections.
2. Hover a circle, polygon, rotated shape and custom closed PATH. Expected: markers use actual rendered boundary, not bounding-box corners.
3. Move cursor near a cardinal marker. Expected: exact marker becomes green and line endpoint snaps exactly to it.
4. Click the green point. Expected: committed line endpoint remains exactly on that cardinal boundary point.
5. Move away from the shape or exit drawing mode. Expected: cardinal markers disappear.
6. Verify LINE, FLEXIBLE_LINE, PEN, SPLIT and Mirror Line workflows.
7. Place an explicit vertex/endpoint close to a cardinal point. Expected: existing endpoint/vertex/intersection OSNAP retains higher priority.


## Phase 8.7 Add-on Fix3 — CAD Intersection Capture + Draw Tool Exit
Status: PENDING
1. Draw a LINE toward an existing edge/shape intersection; stop the cursor slightly before the visible crossing (roughly within 18 screen px). Expected: green intersection snap activates and endpoint commits at the exact crossing.
2. Repeat with cursor slightly past the crossing. Expected: same exact intersection capture, not an approximate nearby boundary point.
3. Repeat at 25%, 100%, and 200% zoom. Expected: capture feel stays screen-space consistent.
4. Verify explicit Endpoint/Vertex/Intersection OSNAP still beats forgiving capture when both are candidates.
5. Verify Cardinal point snap still beats generic projected capture.
6. While LINE/PEN/FLEXIBLE_LINE/SPLIT/Mirror Line is active, press Escape once. Expected: crosshair disappears immediately and normal Select cursor becomes active.
7. After Escape, double-click the same tool in the Elements/Utility panel. Expected: same draw cursor/tool reopens.
8. Repeat for a shape draw tool and CAD Mirror Line toolbar button.
9. Regression: Polar/Ortho/Parallel/Perpendicular guides, projection markers, Cardinal Hover, Face Split and Trimmer remain working.


## Phase 8.7 Add-on Fix4 — Exact Intersection + Deep Zoom
1. Draw a line toward a circle/Bezier/shape intersection and stop the cursor slightly before or after the marker. Expected: green exact intersection remains locked and committed endpoint lands exactly on it.
2. Zoom to 800%, 1600%, then 3200%. Expected: no visible endpoint gap at the junction.
3. Place cursor over the junction and roll mouse wheel. Expected: zoom is centered around the pointer.
4. Middle-mouse drag or Space+drag. Expected: canvas pans without changing geometry.
5. Type 1600 into the zoom percentage input. Expected: exact 1600% zoom.

## Phase 8.8A1 — CAD LINE Hardening
1. Activate LINE. Click start, move, release mouse without second click: **no line should commit**.
2. Click second point: line commits exactly there.
3. Move to a third point and click: second independent LINE starts exactly at previous endpoint.
4. Snap a point to an intersection/cardinal marker and inspect at 1600–3200% zoom: no geometric gap expected.
5. Press Enter after a committed segment: chain ends and LINE says `Specify first point`.
6. Press Escape: LINE exits and Select cursor becomes active.
7. Draw a valid boundary-to-boundary line across a closed face: existing section split remains functional.

## Phase 8.8A2 — CAD Polyline + Canvas Pan
1. Select Polyline. Click A, B, C, D. Expected: one PATH/layer, four vertices, three connected segments.
2. Draw left/up after initial point. Expected: full geometry remains visible; no clipping.
3. Snap vertices to endpoint/intersection/cardinal points. Expected: exact green lock coordinates are committed.
4. Press Enter. Expected: current Polyline finishes, tool stays ready at `Specify first point`.
5. Draw another Polyline and double-click last point. Expected: finish with no duplicate zero-length segment.
6. Press Esc. Expected: Select cursor.
7. Turn Pan ON and left-drag anywhere over artboard. Expected: canvas moves, no geometry/selection drag occurs.
8. Middle-mouse drag with Pan OFF. Expected: canvas pans.
9. In Polyline mode hold Space + left-drag. Expected: canvas pans and no Polyline point is added.
10. Wheel zoom then pan at 800%+. Expected: pointer-centered zoom and smooth viewport navigation.

## Phase 8.8A3 — CAD Construction Line / XLINE
1. Select Construction Line. Click first point and second direction point. Expected: dashed reference line spans the artboard in both directions.
2. Enable Ortho/Polar and repeat. Expected: direction uses existing CAD tracking.
3. Draw normal LINE to XLINE crossing. Expected: crossing participates in intersection snap.
4. Save/reload. Expected: XLINE persists.
5. Export PNG/JPEG/PDF. Expected: XLINE is absent from output.
6. Press Esc while XLINE is active. Expected: Select cursor.


## Phase 8.8A3 Fix1 — XLINE Reference Tracking + Dynamic Input
- Dedicated XLINE hover/acquire for Parallel/Perpendicular tracking.
- On-canvas editable LINE Length/Angle dynamic input.
- Exact typed endpoint engine helper.
- Manual UI verification: PENDING.

## Phase 8.8A3 Fix2 — Shape Draw Regression
1. Draw Rectangle by drag — must create normally.
2. Draw Circle/Ellipse — must create normally.
3. Draw Triangle/Polygon/Star — must create normally.
4. Draw a shape while an XLINE exists and hover/cross that XLINE — ordinary shape drawing must not be captured by XLINE tracking.
5. Draw LINE — dynamic Length/Angle HUD must still appear after first point.
6. Hover XLINE while drawing LINE — XLINE Parallel/Perpendicular reference must still work.
7. Polyline and XLINE creation must remain functional.

## Phase 8.8A3 Fix3 focused smoke
- Rectangle drag-release creates one element.
- Circle/Ellipse drag-release creates one element.
- Triangle/Polygon/Star drag-release creates one element.
- LINE remains click-click and dynamic L/A input works.
- XLINE remains click-click and non-exporting.
- `npm run build` must complete without the Fix3 source errors.

## Phase 8.8A3 Fix4
- LINE: click first point, move cursor, click Length/Angle field; preview must not move/commit while editing. Type values and Enter to commit exact geometry.
- CIRCLE: click center, move for live radius; click radius field and enter 25; Enter must create a 25 mm radius circle. Second-point click must also commit live radius.
- Projected perpendicular: create/reference two vertices with useful X/Y projections, start a line from another endpoint, approach their virtual common X/Y point; green guides + green × must appear and endpoint must commit exactly there.
- Regression: Rectangle, Ellipse, Polygon, Star drag-release still work; LINE/Polyline/XLINE remain operational.


## Phase 8.8A3 Fix5
CAD LINE endpoint double-click Extend-to-Boundary and shape-drawing reference parity implemented. Manual verification: PENDING. See `UPDATE_PHASE_8_8A3_FIX5_LINE_EXTEND_SHAPE_REFERENCES.md`.

## Phase 8.8A3 Fix6 — Shortcuts Help Panel
1. Open Card Designer. Expected: top header contains a `Shortcuts` button near New / ID Card actions.
2. Click `Shortcuts`. Expected: centered modal opens without changing current selection/design geometry.
3. Verify categories: General, Selection & Clipboard, Groups, CAD Drawing, Path Editing, Canvas Navigation.
4. Search `polar`. Expected: F10 / Polar entry remains visible while unrelated entries filter out.
5. Search `pan`. Expected: middle mouse, Space+Drag, and Pan tool references are discoverable.
6. Click modal backdrop. Expected: modal closes.
7. Reopen and press Escape. Expected: modal closes without deleting/moving/editing geometry.
8. Reopen and use the X close button. Expected: modal closes.
9. Verify existing designer actions (Undo/Redo/New/ID Card/Save/Export) still work and header remains usable at normal desktop width.

## Phase 8.8A3 Fix7 — Shortcut Smoke
- V -> Select.
- L -> LINE. P -> Polyline. X -> XLINE.
- Alt+R -> Rectangle; Alt+C -> Circle; Alt+G -> Star; verify several additional Alt shape mappings.
- Ctrl+D -> duplicate with offset.
- Ctrl+Shift+D -> duplicate in exact same position.
- Focus any input/search field and press shortcut keys; tool must NOT change.
- E/K/J/Shift+C must show eligibility status instead of mutating when selection preconditions are not met.


## Phase 8.8A4 Fix2 — Card Designer TDZ Runtime Recovery
- Fixed CardDesigner blank-page crash caused by `canEditPath` and related capability constants being read in a hook dependency array before initialization.
- Source transpile and declaration-order regression check: PASS.
- Dashboard -> Card manual runtime verification: PENDING.

## Phase 8.8A4 Fix3 — CAD Ray Isolated Reimplementation
- [ ] Dashboard -> Card Designer opens without blank page or TDZ error.
- [ ] Press R: RAY tool activates.
- [ ] Click origin then rightward direction: ray extends only right to artboard boundary.
- [ ] Click origin then leftward direction: ray extends only left to artboard boundary.
- [ ] 30/45/90 degree Polar/Ortho ray behaves exactly.
- [ ] LINE near RAY can acquire Parallel/Perpendicular reference.
- [ ] Intersections with RAY are snap-able.
- [ ] Save/reload preserves RAY.
- [ ] PNG/JPEG/PDF export excludes RAY.
- [ ] Existing Rectangle/Circle/LINE/Polyline/XLINE/Split/Shortcuts still work.

## Phase 8.8A5 — CAD Angle Line
- [ ] Dashboard -> Card Designer opens without blank page.
- [ ] Press `A`; Angle Line activates.
- [ ] Click a snapped start point; Length/Angle HUD appears.
- [ ] Enter `40` mm and `30` degrees; Enter creates exact line.
- [ ] After commit, tool asks for a new start point instead of chaining from the old endpoint.
- [ ] `Tab` switches Length/Angle inputs.
- [ ] Second-click mouse commit works when typed input is not used.
- [ ] F8 Ortho / F10 Polar and shape/XLINE/RAY references remain available.
- [ ] `L` still activates normal chained LINE.
- [ ] `Alt+A` still activates Arrow shape.
- [ ] Save/reload preserves created Angle Line as normal LINE PATH.
- [ ] Edit Path + endpoint double-click Extend-to-Boundary still works on Angle Line-created geometry.

## Phase 8.8A5 Fix1 — CAD Line Grip Angle Editing
- [ ] Draw 40 mm @ 0 deg Angle Line from a circle center.
- [ ] Select line -> Edit Path -> select Start grip. Change angle to 30 deg and Apply. Start point must remain exactly on circle center and length must remain 40 mm.
- [ ] Select End anchor, change angle. End point must remain fixed.
- [ ] Select Center anchor, change angle. Midpoint must remain fixed and both endpoints move symmetrically.
- [ ] Change Length while Start anchor is active; start coordinate must remain fixed.
- [ ] Undo/Redo restores geometry.
- [ ] Double-click endpoint Extend-to-Boundary still works.
- [ ] Dashboard -> Card Designer opens without blank page / TDZ error.

## 8.8A5 Fix2 — Edge Align to Reference Geometry
- [ ] Dashboard -> Card opens without blank page.
- [ ] Select triangle -> `Align Edge` -> click triangle side -> click Ray: side becomes exactly collinear with Ray.
- [ ] Repeat with XLINE.
- [ ] Repeat with normal LINE / Angle Line.
- [ ] Repeat with Rectangle edge.
- [ ] Reference geometry does not move.
- [ ] Target size does not change.
- [ ] Undo restores original target position/rotation in one step.
- [ ] Save/reload preserves aligned result.

## Phase 9.4J-K Packaging Persistence + Export
1. Generate carton; focus Front; add text/image; orient Front to 90°.
2. Save, reload, and verify panel ownership and 90° orientation remain.
3. Undo/Redo an orientation change and verify the artwork returns/reapplies.
4. Export Artwork Only: artwork visible; CUT/CREASE absent.
5. Export Dieline Proof: artwork + CUT/CREASE visible; SAFE/BLEED/labels absent.
6. Export Technical View: CUT/CREASE + panel labels visible; artwork absent.
7. Compare PDF and PNG outputs for the selected mode.
