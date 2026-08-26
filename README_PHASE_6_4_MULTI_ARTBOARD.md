# Phase 6.4: Multi-Artboard / Front-Back Completion

This phase extends the design engine and desktop editor to officially support multi-artboard documents, focusing on robust structural integrity, UI tools for batch operations, and foundational support for multi-surface prints (e.g., CR80 Front & Back).

## Key Features

1. **Role and Pairing Model**
   - Added `role` (`GENERIC`, `FRONT`, `BACK`) and `pairId` fields to the `Artboard` interface.
   - Strict validation ensures pairs always consist of exactly two artboards sharing a valid `pairId`.

2. **Design Engine Refinements**
   - New logic for target resolution (`CURRENT`, `SELECTED`, `ALL`).
   - Pairing functions: `pairArtboards`, `unpairArtboard`, and a convenience `createBackSide`.
   - Operations like `applyPrintSettingsToTargets` use the resolved targets for bulk configurations.
   - Deleting one half of a pair safely cleans up the other half’s paired state (orphaning logic).

3. **UI Enhancements in CardDesigner**
   - **Multi-Selection**: Use Ctrl/Cmd/Shift in the left artboard list to select multiple artboards.
   - **Batch Properties Panel**: Selecting multiple artboards reveals a batch property view for synchronizing settings, such as print properties.
   - **Role and Pairing Controls**: The standard artboard properties view now exposes role dropdowns and pairing controls (Create Back Side / Unpair).
   - **Visual State**: Selected artboards now appear highlighted, showing role tags (`FRONT`/`BACK`) and `(Paired)` hints.

## Limitations / Rules enforced
- An active editing context always corresponds to exactly *one* artboard (the `activeId`).
- Multi-artboard selection is restricted to the left-panel artboard list and only applies to batch deletion, duplication, and property management.
- If a user triggers a canvas interaction, it acts only on the active artboard.

## Tests
- Added unit tests checking the target resolution logic, pairing integrity, and new validation checks in `phase640-multi-artboard.test.ts`.
- Added persistence tests in `phase640-multi-artboard-persistence.test.ts` to ensure backward and forward compatibility of new fields.
- Added a standalone smoke test script `phase640-multi-artboard-smoke.mjs`.

## Future Work
- Final integration into the PDF Export orchestration (Phase 6.5+) will utilize these multi-artboard roles and targets to combine sides correctly for imposition or single-page spreads.

## Artboard Manager UX
- **Redesigned Panel**: The Artboards section in the left panel is now collapsible and gives enough vertical space for list navigation, resolving previous cramped UI issues.
- **Active vs. Selected**: Visual separation is established. The active artboard features a bold accent marker, while batch-selected artboards use a subtler background highlight and checkbox state.
- **Role Badges**: Immediate visibility of "Front", "Back", and "Generic" roles through colored pill badges. "Generic" resolves seamlessly for legacy documents without showing "undefined".
- **Front/Back Pairing UI**: Paired status (? Paired with: Back) is clearly shown within the artboard row.
- **Batch Selection**: Added explicit checkboxes in each row for easier multi-selection without solely relying on modifier keys.
- **Compact Action Menu**: Refactored bulky duplicate/up/down/delete actions into a clean, compact toolbar avoiding dead space.
- **Responsive Behavior**: Information wraps correctly without layout breakage on narrow sidebars.

