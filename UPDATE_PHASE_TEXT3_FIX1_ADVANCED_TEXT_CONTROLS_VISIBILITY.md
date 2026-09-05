# TEXT3 Fix1 — Advanced Text Controls Visibility

## Fix
The TEXT3 advanced text features were implemented, but several items were conditional or were implementation capabilities rather than obvious UI controls. This update makes the advanced controls explicit inside the Text Styling inspector.

### Visible UI changes
- Renamed section to **Advanced Text Layout**.
- **Circle Placement** now has explicit `Outside` and `Inside` buttons when Circular Text is selected.
- **Auto Fit** is a dedicated subsection.
- **Shrink text to fit box** is always visible.
- **Minimum font size (pt)** is always visible and disabled until Auto Fit is enabled.
- Added a **Compatibility** status block showing:
  - Canvas rendering — Supported
  - PNG / PDF / JPEG export — Supported
  - Gradient text fill — Supported
  - Text outline — Supported

## Verification
Targeted TypeScript/TSX transpile syntax checks passed for:
- `apps/desktop/src/pages/CardDesigner.tsx`
- `apps/desktop/src/pages/CardExportCanvas.tsx`

## Manual test
1. Select a TEXT element.
2. Open the right inspector `Text Styling` / `T` section.
3. Scroll to **Advanced Text Layout**.
4. Set `Text Layout = Circular Text` and verify Circle Placement shows `Outside | Inside`.
5. Verify `Shrink text to fit box` is visible.
6. Verify `Minimum font size (pt)` is visible but disabled until shrink is enabled.
7. Verify the Compatibility block is visible.
