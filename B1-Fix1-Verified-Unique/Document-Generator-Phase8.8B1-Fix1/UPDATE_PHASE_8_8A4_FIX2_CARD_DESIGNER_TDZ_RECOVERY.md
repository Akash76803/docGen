# Phase 8.8A4 Fix2 — Card Designer TDZ Runtime Recovery

## Issue
Dashboard -> Card Designer rendered a blank page with runtime error:
`ReferenceError: Cannot access 'canEditPath' before initialization`.

## Root cause
The global keyboard `useEffect` dependency array read `canEditPath`, `canScissors`, `canTrim`, `canJoin`, and `canClose` before those `const` bindings were initialized later in the same component render. JavaScript's temporal dead zone caused CardDesigner to throw before mount completed.

## Fix
Moved selection-derived capability declarations (`selectedEls`, `selectedPaths`, `canEditPath`, `canScissors`, `canTrim`, `canJoin`, `canClose`) above the keyboard effect. No geometry, snapping, face-split, boolean, trimmer, or export logic was changed.

## Verification
- CardDesigner TSX transpile: PASS
- TDZ declaration-order regression check: PASS
- Manual Dashboard -> Card navigation: PENDING
