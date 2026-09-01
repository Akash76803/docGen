# Manual Smoke Tests

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
