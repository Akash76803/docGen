# TEXT1–TEXT2 Fix1 — Text Styling Panel Visibility

## Issue
TEXT1/TEXT2 controls existed in code but **Fill & Outline** was routed to the `APPEARANCE` inspector tab and **Effects** was routed to the `ADVANCED` tab. As a result, users opening the Text/Typography inspector did not see the full text styling workflow in one place.

## Fix
For selected TEXT elements, the `TYPOGRAPHY` inspector section is now the single Text Styling workspace and displays:
- Typography
- Paragraph
- Fill & Outline
- Effects

The inspector rail label for the `TYPOGRAPHY` section is now **Text Styling**.

## Controls now visible inside Text Styling
### Fill & Outline
- Solid text color
- Linear gradient
- Radial gradient
- Gradient start/end colors
- Linear gradient angle
- Text outline toggle
- Outline color
- Outline width
- Element opacity

### Effects
- Drop Shadow enable/disable
- Shadow color
- Shadow opacity
- Shadow blur
- Shadow X/Y offset
- Glow enable/disable
- Glow color
- Glow blur
- Glow opacity

## Verification
PASS:
- `CardDesigner.tsx` TypeScript/JSX transpile syntax check
- `DesignerInspectorRail.tsx` transpile syntax check
- source wiring confirms all four Text Styling sections use `sectionKey="TYPOGRAPHY"`
- inspector rail label is `Text Styling`
