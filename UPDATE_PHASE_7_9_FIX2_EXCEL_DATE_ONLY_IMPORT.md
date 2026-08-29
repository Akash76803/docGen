# Phase 7.9 Fix2 - Excel Date-Only Import

## Problem
Excel cells formatted as a date (for example DOB) were read with `cellDates: true` and became JavaScript `Date` objects. Date/datetime inference then inspected timezone-sensitive clock components. A date-only Excel value could therefore appear as an ISO timestamp and be classified as `DATETIME` after import.

## Fix
- Excel workbooks are now read with raw serial values (`cellDates: false`) while retaining cell number formats (`cellNF: true`).
- Date semantics are resolved from the actual Excel number format instead of the runtime timezone.
- Date-only formatted cells normalize to `YYYY-MM-DD` and schema type `date`.
- Cells with time-bearing Excel formats remain `datetime` and normalize to stable ISO UTC strings.
- A hidden/fractional time in the underlying serial is intentionally ignored when the Excel cell format is date-only. This matches what the spreadsheet declares/displays and prevents DOB/date fields from becoming DATETIME.
- Non-date numbers, strings, booleans, CSV behavior, and existing schema merging are unchanged.

## Tests
Focused Excel adapter tests cover:
1. Date-only formatted cell with an underlying fractional time -> `DATE`, no timezone-derived time.
2. Actual date+time formatted cell -> `DATETIME` with the time preserved.
3. Existing Excel adapter regression tests remain in place.

## Verification note
The sandbox dependency install timed out before a complete runnable `node_modules` tree was produced, so the full Vitest suite could not be executed here. TypeScript source/test syntax transpilation passed. Run the normal Node 20 install + test/typecheck commands in the project environment for full verification.
