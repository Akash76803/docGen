# Phase 7.9 Fix4 — Shape Image Fill Binding Serialization

## Issue
Saving a PATH/SHAPE with dynamic image-fill binding failed with:

`Cannot serialize invalid card design template: Unsupported target property 'fillImageSource' for element type PATH.`

## Root cause
Phase 7.9 Fix3 added the runtime/editor binding target `fillImageSource`, but the central design-template validator still allowed only `visible` for SHAPE and PATH elements. Serialization calls this validator before writing JSON, so otherwise-valid templates were rejected.

## Fix
- Added `fillImageSource` to the supported binding target whitelist for `SHAPE` and `PATH` only.
- Kept all unrelated element target-property validation unchanged.
- Added focused serialize/deserialize coverage for both standard SHAPE and custom PATH image fills.
- Added a guard test proving TEXT elements still reject `fillImageSource`.

## Persistence behavior
Only binding metadata (`targetProperty`, `sourceType`, `fieldPath`) and the existing manual fallback asset reference are persisted. Resolved runtime Base64 remains runtime-only.
