# Phase 8.8A4 Fix1 — Dashboard → Card Navigation Recovery

## Status
Recovery hotfix based on the last stable Phase 8.8A3 Fix7 baseline.

## Reason
The Phase 8.8A4 Ray integration introduced a runtime regression reported by manual UI testing: clicking Card from Dashboard opened a blank page.

## Recovery decision
- Restore the last stable Fix7 designer implementation.
- Temporarily remove/disable the new RAY feature from the runtime baseline.
- Preserve every manually working feature through Phase 8.8A3 Fix7.
- Re-introduce RAY only after isolated runtime verification.

## Preserved
- CAD LINE hardening
- Polyline + Canvas Pan
- XLINE
- XLINE reference tracking + dynamic input
- Circle radius input
- projected perpendicular intersections
- line extend-to-boundary
- shape reference parity
- shortcuts help panel
- utility/shape/duplicate shortcuts
- existing Face Split / multi-section
- Boolean / Fragment / OSNAP / Trimmer

## Manual acceptance
1. Launch app.
2. Dashboard must render.
3. Click Card / ID Card.
4. Card Designer must render, not a blank page.
5. Back/Home must return to Dashboard.
6. Re-open Card Designer a second time.
7. Verify Rectangle, Circle, LINE, Polyline, XLINE, Shortcuts panel.

RAY is intentionally not part of this recovery baseline.
