# Implementation Instructions

This folder is the authoritative implementation baseline for future Document Generator work.

## Mandatory read order
1. `MEMORY.md`
2. `CURRENT_BASELINE.md`
3. `BASELINE_VERIFICATION.md`
4. `SHAPE_OPERATIONS_SCOPE.md`
5. `SHAPE_OPERATIONS_AUDIT.md`
6. `SHAPE_OPERATIONS_MASTER_PLAN.md`
7. `REGRESSION_MATRIX.md`
8. Latest `UPDATE_PHASE_*.md`
9. Requested phase instructions
10. Actual affected source files

## Core rule
Documentation never overrides actual source code. If source and docs disagree, record the mismatch before coding. Audit the affected implementation before every change and classify planned work as **REUSE**, **HARDEN**, **NEW**, **DEFER**, or **INVESTIGATE**.
