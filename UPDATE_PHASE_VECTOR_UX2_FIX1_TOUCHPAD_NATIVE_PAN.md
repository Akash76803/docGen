# VECTOR-UX2 Fix1 — Touchpad Native Pan

## Problem
Laptop touchpads emit two-finger scrolling as wheel events. The Card Designer previously treated wheel input as zoom, so two-finger touchpad navigation did not provide reliable canvas panning.

## Fix
- Plain wheel/two-finger scroll pans the canvas.
- Native deltaX supports horizontal two-finger pan.
- Shift + vertical wheel converts to horizontal pan.
- Ctrl/Cmd + wheel or trackpad pinch performs pointer-centered zoom.
- Wheel delta modes are normalized for pixel/line/page sources.
- Existing Space+drag, middle-mouse, Pan tool, and any-tool double-click+drag pan remain intact.

## Verification
- CardDesigner.tsx targeted TypeScript transpile: PASS.
- Touchpad pan wiring marker check: PASS.
- Full device-level touchpad behavior still requires manual validation on the target Windows laptop/trackpad driver.

## Deliverable
Document-Generator-Phase-VECTOR-UX2-Fix1-Touchpad-Native-Pan.zip
