# Phase 8.7 Fix1 — Boolean Styling & Opacity Parity

## Baseline
Phase 8.7 — Boolean Hardening + Fragment.

## Reported defect
After Combine/Boolean operations the result becomes a PATH. Opacity editing was inconsistent, especially for multi-selected Boolean/Fragment PATH results, because PATH was omitted from the batch-opacity compatibility set and the PATH contextual toolbar did not expose opacity.

## Changes
- Added `PATH` to multi-selection/batch opacity editing.
- Added a quick Opacity slider to the non-editing PATH contextual toolbar.
- Added numeric batch-opacity input with Mixed placeholder.
- Made Boolean result opacity inheritance from the Primary/base element explicit.
- Made Fragment region opacity inheritance from each region's style source explicit.
- Kept element opacity separate from fill/stroke opacity so Solid, Gradient, Pattern, and Image fills all receive uniform whole-element alpha.
- Confirmed interactive canvas and isolated export both apply `element.opacity` at the element shell.

## Expected behavior
- Combine/Union/Subtract/Intersect output PATH can be faded from 100% to 0%.
- Multiple Fragment PATHs can be selected and faded together.
- Image/Pattern/Gradient/Solid content and stroke/label inside the PATH fade uniformly with element opacity.
- Fill-specific opacity remains independently adjustable and multiplies with element opacity.
- Save/reload and PNG/JPEG/PDF use the same persisted `opacity` value.

## Manual verification status
PENDING user UI confirmation.
