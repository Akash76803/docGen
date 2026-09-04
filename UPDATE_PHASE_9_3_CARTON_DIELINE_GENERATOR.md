# Phase 9.3 — Parameterized Folding-Carton Dieline Generator

## Scope and standards position

This phase implements configurable **ECMA-style folding-carton families**. It
does not assign an unverified official ECMA design code and does not claim that
a generated blank is manufacturing-certified. FEFCO is reserved for the later
corrugated-box expansion. Every result carries an explicit converter-approval
requirement.

References:

- ECMA: https://www.ecma.org/
- FEFCO internationally applied corrugated packaging code:
  https://www.fefco.org/technical-information/fefco-code

## Delivered structures

1. Straight Tuck End
2. Reverse Tuck End
3. Straight Tuck End with slit lock
4. Reverse Tuck End with slit lock
5. Simple Sleeve

## Inputs and generated model

- Finished Width × Depth × Height in millimetres.
- Internal or external measurement basis.
- Material thickness/caliper compensation.
- Glue flap, tuck depth and dust flap.
- Bleed, safe margin and manufacturing tolerance.
- Flat blank and cut dimensions calculated deterministically.
- Front, Right, Back, Left and Glue panel coordinate mapping.
- Closed continuous outer CUT PATH.
- Independent vertical and horizontal CREASE PATH elements.
- Dedicated CUT, CREASE, BLEED, SAFE and ANNOTATION groups.
- Technical ink/meaning/export-policy metadata.
- Dieline input and measurements persisted in artboard metadata.
- Regeneration restores inputs and replaces geometry after confirmation.
- Generation uses normal design history, so Undo/Redo remains available.

## Export policy

- Visible CUT and CREASE elements are retained for dieline proof output.
- BLEED, SAFE and ANNOTATION are marked editor-only and excluded automatically.
- Technical layer visibility can be changed from the generator panel.
- Native spot inks, CMYK, overprint, PDF/X and separations are not claimed in
  this phase; they remain part of the professional print-output phase.

## Manual acceptance scenarios

1. Open Box Dieline Generator and verify five structures are listed.
2. Generate Straight Tuck End at 70 × 30 × 110 mm, 0.45 mm board.
3. Verify one closed CUT contour and separate dashed CREASE paths.
4. Verify Front/Right/Back/Left/Glue labels and technical groups.
5. Toggle CUT, CREASE, BLEED, SAFE and ANNOTATION visibility independently.
6. Generate Reverse Tuck End and verify the opposite closure arrangement.
7. Generate both slit-lock variants and verify the slit-lock cut feature.
8. Generate Sleeve and verify no top/bottom flap crease paths exist.
9. Switch Internal ↔ External measurement basis and compare compensated size.
10. Enter zero/negative/oversized flap/caliper values and verify generation blocks.
11. Generate over an existing design and verify replacement confirmation.
12. Change dimensions and Regenerate; verify confirmation and deterministic result.
13. Undo regeneration, then Redo; verify the complete dieline restores.
14. Save/reload and verify inputs, technical metadata and geometry persist.
15. Export PDF/PNG: verify SAFE/BLEED/ANNOTATION do not print.
16. Hide CUT or CREASE before proof export and verify only intended lines remain.
17. Measure the exported sheet and panel dimensions in a vector/PDF tool.
18. Print at 100%, cut and fold a paper mock-up; document flap/closure observations.
19. Send a proof to the intended converter/printer for material-specific approval.
20. Re-test Page Formats, templates, CAD tools, bindings and normal card exports.

## Mandatory production limitation

Carton performance depends on substrate, grain direction, crease matrix, die
allowances, printing process, glue system and converter equipment. A generated
dieline is a design starting point and proof asset; final production requires
review and approval by the packaging converter/printer.

## Automated verification

- Typecheck: PASS — 0 errors
- Tests: PASS — 198/198 files, 983/983 tests
- Build: PASS — all 17 workspaces; desktop Vite bundle 1700 modules
- Diff whitespace check: PASS
- Existing Vite large-chunk advisory remains non-blocking; build exit code is 0.
- Windows UI, physical fold test and converter approval: PENDING
