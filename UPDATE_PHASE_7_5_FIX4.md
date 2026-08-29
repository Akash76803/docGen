# Phase 7.5 Fix4 — Section Visibility + Trimmer Encoding Repair

## Problems fixed

1. **Generated sections looked like one shape in the UI**
   - The geometry engine was already producing two closed faces for the screenshot-style diagonal divider.
   - The desktop integration immediately selected **both generated faces**, so the blue selection bounds covered the whole original component and visually looked like one element.
   - After a successful split, the editor now selects **only the first generated face**. The second face remains independent and can be clicked/colored separately.
   - The same behavior is applied to Line and Flexible Line face generation.

2. **Last remaining full-suite test failure**
   - `phase71-trimmer-ui.test.tsx` contained a mojibake expectation (`TRIM â€” ...`).
   - Repaired to UTF-8 `TRIM — Select second point` without changing production Trimmer behavior.

## Acceptance coverage added

- Added a screenshot-style diagonal rounded-rectangle regression:
  - rounded rectangle
  - diagonal boundary-to-boundary divider
  - exactly 2 closed PATH faces
  - source rounded rectangle removed
  - temporary divider removed
- Added UI-source regression that post-split selection contains only one generated face, not the whole face set.

## Verification performed in this environment

PASS:
- `npm run typecheck`
- `npm run typecheck -w @document-tool/desktop`
- `npm run build -w @document-tool/design-engine`
- Direct Node smoke: diagonal rounded rectangle divider => exactly 2 closed faces
- Direct Node smoke: replacement removes original source + temporary divider
- Direct Node smoke: generated faces are closed PATHs
- Direct Node smoke: post-split UI selection selects only `firstFaceId`
- Direct Node smoke: Trimmer UTF-8 expectation repaired

Vitest could not be executed in this Linux container because the uploaded Windows `node_modules` contains Windows Rollup binaries only and lacks `@rollup/rollup-linux-x64-gnu`. This is an environment/platform dependency issue, not a TypeScript error.

## Expected manual UI result

Rounded Rectangle -> Line -> Point A on one boundary -> Point B on opposite boundary -> commit:

- two actual closed faces are generated
- original rounded rectangle and temporary divider are replaced
- only Face 1 is auto-selected, so its selection bounds visibly show one section
- clicking the other section selects Face 2 independently
- each face can receive a different fill color
