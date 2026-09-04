import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const source=readFileSync(resolve(process.cwd(),'apps/desktop/src/pages/CardDesigner.tsx'),'utf8');

describe('Phase 7.3 divider drawing integration',()=>{
  it('shows an editor-only boundary snap marker',()=>{
    expect(source).toContain('data-boundary-snap-marker');
  });

  it('commits exact snapped coordinates and routes the divider through the current canonical face splitter',()=>{
    expect(source).toContain('const p=snap?{xMm:snap.point.x,yMm:snap.point.y}:rawPoint');
    expect(source).toContain('splitComponentFaceByDivider');
    expect(source).toContain("if(draft.shapeType==='LINE')");
  });

  it('keeps drawable shape mode sticky after a completed draw',()=>{
    expect(source).not.toContain("primaryElementId:newId});setInteractionMode('SELECT')");
  });
});
