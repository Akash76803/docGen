# Phase 6.0.3 — Selection & Transform Engine

Baseline: Phase 6.0.2 Fix1 (Vite design-engine alias).

## Added
- Shared selection state helpers: single, toggle, select-all, marquee, sanitization.
- Shared pure transform API: move, precise position, resize, rotation, keyboard nudge, bounds.
- Locked element transform protection.
- Minimum size and aspect-ratio resize behavior.
- Card Designer selection overlay and generic element shells.
- 8 resize handles + rotation handle.
- Multi-select drag movement.
- Ctrl/Cmd+A, Esc, Arrow and Shift+Arrow behavior.
- Single-element X/Y/W/H/Rotation inspector and multi-selection bounds.
- Dedicated Phase 6.0.3 tests + smoke script.

## Sandbox verification
- `npm run typecheck` — PASS.
- contracts build — PASS.
- design-engine build — PASS.
- `scripts/phase603-selection-transform-smoke.mjs` — PASS.
- Full workspace TypeScript package builds reached desktop Vite, then stopped because the uploaded Windows node_modules makes the Linux `vite` shim non-executable (`vite: Permission denied`). This is an environment/toolchain issue, not a TypeScript compile error.
- Vitest cannot run in this Linux sandbox because the uploaded Windows install contains Windows Rollup optional binaries, not `@rollup/rollup-linux-x64-gnu`.

## Windows release gate
From the authoritative project root run:

```powershell
npm run typecheck
npm run build
npm run test:card-transform
npm run test:card-canvas
npm test
npm run smoke:card-transform
```

Then manually test selection/transform once Phase 6.0.4 provides concrete elements, or with any existing Card Design template containing elements.
