# Phase 4.10 Fix 1 — RAW Table Cell Type Backward Compatibility

## Regression
Phase 4.10 display formatting converted ordinary SOURCE table values through `formatDisplayValue()` even when no display format was configured. This changed native numeric RenderModel cells such as `2` into display strings such as `"2"`, breaking legacy TemplateEngine contracts/tests.

## Permanent rule
- SOURCE column + no format => preserve original scalar type.
- SOURCE column + RAW format without prefix/suffix => preserve original scalar type.
- Explicit NUMBER / INTEGER / PERCENT / CURRENCY => produce formatted display value.
- RAW with prefix/suffix => produce decorated display text.
- IMAGE / QR / FORMULA / ROW_NUMBER retain their Phase 4.10 semantics.

This keeps Phase 4.10 formatting opt-in and preserves backward compatibility for existing templates and downstream renderers.

## Expected regression recovery
The following prior failures should return to PASS:
- Phase 3.2 `resolves live table rows`
- Phase 3.4 imported-header table binding fallback
- Base TemplateEngine renderer-independent table block test

Phase 4.10 percentage/custom-column tests should remain PASS.
