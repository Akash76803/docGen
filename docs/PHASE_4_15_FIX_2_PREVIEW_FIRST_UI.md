# Phase 4.15 Fix2 — Preview-First UI Polish

This pass is presentation-only. Document generation, Data Views, Calculated Fields, bindings, persistence, and PDF engines are unchanged.

## Goals
- Improve text contrast and readable font sizing.
- Give the live canvas the largest share of workspace width and height.
- Reduce tool and inspector chrome while keeping controls discoverable.
- Hide the empty Properties inspector when no block is selected; it returns automatically when a selection exists.
- Compress preview controls without removing any preview/PDF capability.
- Preserve responsive behavior and existing collapse/focus controls.

## UX changes
- Stronger primary/secondary text hierarchy; helper text alone uses muted treatment.
- Narrower tool and properties panels with a larger center canvas.
- Compact Record/Group + zoom/output toolbar.
- Shorter action labels (`Focus`, `Exact PDF`, `Engine PDF`) with existing actions unchanged.
- Increased minimum live-preview height and reduced whitespace above the document.
- More legible tool buttons, tabs, property labels, inputs, and accordion headings.
