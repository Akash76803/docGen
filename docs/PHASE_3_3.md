# Phase 3.3 — Advanced Grid/Cell Template Designer

## Scope implemented
- Renderer-ready page background and page border contract (enable, style, width, color, offset).
- New structured ROW grid mode: ROW -> columns/cells -> multiple child blocks.
- Blank row creation starts with a blank cell; additional columns can be added/removed.
- Each cell supports width %, min height, horizontal/vertical alignment, background, border and padding.
- Each cell can contain multiple TEXT, FIELD, IMAGE, DIVIDER and SPACER blocks.
- Existing Phase 3.2 `ROW.children` remains supported for saved-template backward compatibility.
- Preview renders page border and structured grid cells from RenderModel, not preview-only template interpretation.
- Basic Invoice demonstrates the new cell-based header.

## Deliberately deferred
- Free-positioning / x-y canvas
- Nested ROW inside cell
- TABLE inside cell
- PDF/DOCX generation and pagination

## Manual smoke
1. Add a Row in Header or Body.
2. Add 2–3 blank columns.
3. Set column widths, e.g. 30 / 40 / 30.
4. In cell 1 add Image; cell 2 add Text; cell 3 add Field(s).
5. Change cell background, border, padding and vertical alignment.
6. Enable Page Border and change border color/width/offset.
7. Confirm preview updates and Save/Reopen preserves the layout.

## Verification in implementation sandbox
- `@document-tool/contracts` typecheck: PASS
- `@document-tool/template-engine` typecheck: PASS
- Direct Phase 3.3 RenderModel runtime smoke: PASS (30/70 grid + live FIELD resolution)
- TSX syntax parse check: no TypeScript syntax diagnostics; full desktop typecheck requires workspace React/lucide dependencies
- Full `npm install` timed out in the sandbox; therefore root build/typecheck/test are intentionally not claimed as PASS here.
- Source currently contains 14 test files / 78 `it(...)` test cases. The actual Vitest PASS count should be confirmed after `npm install` on the target machine.
