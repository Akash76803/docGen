# Manual Smoke Tests

Use this document to run interactive smoke tests inside the Card Designer application environment.

---

## 1. Selection
* **Setup**: Create a blank draft Artboard (`53.98 x 85.6 mm`). Add a Rectangle and a Circle.
* **Steps**:
  1. Click the Rectangle: check if selection handles appear.
  2. Hold `Shift` and click the Circle: check if both are highlighted in the layers list.
* **Expected Result**: Selected items show bounding outlines. Multiple selected items appear active simultaneously.
* **Failure Indicators**: Elements are click-unresponsive or cannot be selected together.

---

## 2. Move/Resize/Rotate
* **Setup**: Insert a Rectangle element on the canvas.
* **Steps**:
  1. Drag the Rectangle to shift its coordinates.
  2. Drag the bottom-right corner handle to scale the width/height.
  3. Drag the top circular rotate handle to adjust the element angle.
* **Expected Result**: Coordinates, sizes, and angle values update reactively inside the property rail.
* **Failure Indicators**: Dragging does not shift the element or scaling causes the shape to warp.

---

## 3. LINE
* **Setup**: Select the **Line** tool from the toolbar.
* **Steps**:
  1. Click once to set the starting node.
  2. Move the cursor and click again to set the ending node.
* **Expected Result**: A straight divider line element is added to the canvas.
* **Failure Indicators**: Cursor movement does not show the in-progress line preview, or click fails to place the divider.

---

## 4. FLEXIBLE_LINE
* **Setup**: Select the **Flexible Line** (Polyline) tool.
* **Steps**:
  1. Click consecutively across the canvas to draw multiple points.
  2. Double-click to finish.
* **Expected Result**: An open vector path containing multiple segments is created.
* **Failure Indicators**: Multi-clicking does not place segments, or double-click fails to commit the line.

---

## 5. OSNAP
* **Setup**: Place a Rectangle on the canvas. Select the **Line** tool.
* **Steps**:
  1. Move the cursor near any corner vertex of the rectangle.
  2. Observe the snap behavior and green target marker.
* **Expected Result**: The cursor locks onto the exact vertex node, boundary edge, or guide lines with high precision.
* **Failure Indicators**: Snapping feels loose, inaccurate, or fails to lock coincident coordinates.

---

## 6. SPLIT
* **Setup**: Draw a Rectangle.
* **Steps**:
  1. Draw a Line divider completely crossing the rectangle from edge-to-edge.
  2. Click to split.
* **Expected Result**: The rectangle splits into two distinct editable faces.
* **Failure Indicators**: Drawing the divider does not split the shape.

---

## 7. Face Split
* **Setup**: Create a split shape from the steps above.
* **Steps**:
  1. Draw a horizontal divider line across the left face.
* **Expected Result**: The shape subdivides incrementally into 3 independent regions.
* **Failure Indicators**: The second split operation fails or merges previous regions.

---

## 8. Independent Face Editing
* **Setup**: Create a split shape layout.
* **Steps**:
  1. Select the Pointer tool.
  2. Drag one of the subdivided regions away from the rest.
  3. Set a red color fill on the separated region.
* **Expected Result**: The selected subdivided face scales, moves, and styles independently without modifying neighboring regions.
* **Failure Indicators**: Modifying one face affects all other faces.

---

## 9. Pen
* **Setup**: Select the **Pen** drawing tool.
* **Steps**:
  1. Click and drag to create Bezier curve segments.
* **Expected Result**: A custom curved path is created.
* **Failure Indicators**: Handles are not generated, or lines are restricted to straight segments.

---

## 10. Edit Path
* **Setup**: Select a custom path and double-click to enter edit mode.
* **Steps**:
  1. Click and drag individual nodes to adjust the shape.
* **Expected Result**: Vertices are moved individually. Dragging snaps to targets via OSNAP.
* **Failure Indicators**: Nodes cannot be selected or dragging shifts the entire element instead of individual points.

---

## 11. Scissors
* **Setup**: Place a closed custom path, enter Edit Path.
* **Steps**:
  1. Select a node vertex.
  2. Click the **Scissors** tool.
* **Expected Result**: The path is split at the selected vertex, breaking it into two endpoints.
* **Failure Indicators**: The path remains closed, or the element is deleted.

---

## 12. Erase Segment
* **Setup**: Draw intersecting lines. Select the **Trimmer/Eraser** tool.
* **Steps**:
  1. Drag the eraser brush across a line segment between two intersections.
* **Expected Result**: Only the segment bounded by the intersections is deleted.
* **Failure Indicators**: The entire path is deleted instead of the segment.

---

## 13. Fill Bucket
* **Setup**: Create a subdivided vector shape. Select the **Fill Bucket** tool.
* **Steps**:
  1. Choose a fill color and hover over a region.
  2. Click inside the highlighted region.
* **Expected Result**: The solid color fill is applied only to the targeted region.
* **Failure Indicators**: Neighboring regions are filled or the color overlay is offset.

---

## 14. Group/Ungroup
* **Setup**: Multi-select three elements.
* **Steps**:
  1. Press `Ctrl+G` to group.
  2. Move the group container.
  3. Press `Ctrl+Shift+G` to ungroup.
* **Expected Result**: The group acts as a single bounding element. Ungrouping separates them back to legacy layers.
* **Failure Indicators**: Elements detach from the group or lose their z-index positions on ungroup.

---

## 15. Undo/Redo
* **Setup**: Insert a shape, move it, and delete it.
* **Steps**:
  1. Press `Ctrl+Z` (Undo).
  2. Press `Ctrl+Y` (Redo).
* **Expected Result**: Undo restores the element coordinates. Redo re-deletes it.
* **Failure Indicators**: Command history gets corrupted or ignores coordinates change.

---

## 16. CSV/Excel
* **Setup**: Import a dataset containing columns `Name` and `Status`.
* **Steps**:
  1. Bind a Text field to the `Name` column.
  2. Scroll records.
* **Expected Result**: Card text maps to dataset entries on each record change.
* **Failure Indicators**: Text field remains empty or doesn't update on record scroll.

---

## 17. Base64 Image
* **Setup**: Import a CSV containing base64 data URLs.
* **Steps**:
  1. Bind an Image element to the base64 column.
* **Expected Result**: The base64 URL parses and renders the raster image.
* **Failure Indicators**: Canvas displays broken image icon.

---

## 18. Shape Image Fill
* **Setup**: Add a Rectangle.
* **Steps**:
  1. Set fill type to `IMAGE` and upload a background picture.
  2. Select image fit modes (`Fill`, `Fit`, `Stretch`).
* **Expected Result**: The image masks inside the shape boundary.
* **Failure Indicators**: The image overflows the shape bounds.

---

## 19. QR/Barcode
* **Setup**: Insert a Barcode element.
* **Steps**:
  1. Bind it to a dynamic dataset column containing numeric serials.
* **Expected Result**: Barcode lines render and update dynamically on scroll.
* **Failure Indicators**: Code fails to generate or shows incorrect bars.

---

## 20. Hyperlink
* **Setup**: Select an image element.
* **Steps**:
  1. Under the Data Binding tab, set Hyperlink field to: `https://www.linkedin.com/in/akash-g-96865a149`.
  2. Check the canvas view.
* **Expected Result**: A Link indicator badge appears in the top-right corner of the image.
* **Failure Indicators**: The badge does not show.

---

## 21. PDF
* **Setup**: Configure an element with a hyperlink. Export to **PDF**.
* **Steps**:
  1. Open the PDF in Acrobat/Chrome.
  2. Click the image.
* **Expected Result**: Clicking opens the hyperlink in a new browser tab.
* **Failure Indicators**: The cursor does not change to a pointer finger.

---

## 22. PNG
* **Setup**: Export canvas to **PNG** format.
* **Steps**:
  1. Open the generated file.
* **Expected Result**: Renders with clean transparent or solid background.
* **Failure Indicators**: Output image is blurry or clipped.

---

## 23. JPEG
* **Setup**: Export canvas to **JPEG** format.
* **Steps**:
  1. Open the generated file.
* **Expected Result**: Renders with correct color profiles and resolution.
* **Failure Indicators**: Artifacts or missing elements.

---

## 24. Save/Reload
* **Setup**: Draw a custom design with paths, guides, and text.
* **Steps**:
  1. Save the draft template.
  2. Close the designer, reopen it, and load the draft.
* **Expected Result**: All elements, coordinates, guide marks, and database bindings reload.
* **Failure Indicators**: Elements shift position or are missing.
