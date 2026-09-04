import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(process.cwd());
const designer=()=>fs.readFileSync(path.join(root,'apps/desktop/src/pages/CardDesigner.tsx'),'utf8');
const toolbar=()=>fs.readFileSync(path.join(root,'apps/desktop/src/components/designer/DesignerContextToolbar.tsx'),'utf8');

describe('Phase 8.1 transform UI wiring',()=>{
  it('uses rotation-aware local pointer deltas during resize',()=>{
    const source=designer();
    expect(source).toContain('worldDeltaToElementLocal(worldDelta,op.element.rotationDeg)');
    expect(source).toContain('centerBased:ev.altKey');
    expect(source).toContain('centerBased:op.centerBased');
  });

  it('supports live Shift aspect toggle and Shift+Rotate 15 degree snapping',()=>{
    const source=designer();
    expect(source).toContain('const keepAspect=e.shiftKey?!op.defaultKeepAspect:op.defaultKeepAspect');
    expect(source).toContain('e.shiftKey?snapRotationDeg(nextRotation,15):nextRotation');
  });

  it('exposes in-place flip separately from page mirror',()=>{
    const source=designer();
    expect(source).toContain('data-in-place-flip-inspector');
    expect(source).toContain("flipElementsInPlace(t,artboardId,[element.id],'VERTICAL')");
    expect(source).toContain('Page Mirror H');
    expect(source).toContain('Page Mirror V');
    const bar=toolbar();
    expect(bar).toContain("flipElementsInPlace(t, artboardId, ids, 'VERTICAL')");
    expect(bar).toContain("flipElementsInPlace(t, artboardId, ids, 'HORIZONTAL')");
  });

  it('renders one shared multi-selection resize frame and wires live Alt/Shift modifiers',()=>{
    const source=designer();
    expect(source).toContain('card-multi-selection-box');
    expect(source).toContain("mode:'MULTI_RESIZE'");
    expect(source).toContain('resizeSelectionBoundsFromDelta(op.bounds,op.anchor,delta,{maintainAspectRatio:e.shiftKey,centerBased:e.altKey})');
    expect(source).toContain('resizeElementsFromSnapshots(t,artboard.id,op.elements,op.bounds,targetBounds)');
    expect(source).toContain("selection.elementIds.length === 1 && isSelected");
  });

});
