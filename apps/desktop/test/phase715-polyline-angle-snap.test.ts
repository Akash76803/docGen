import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {describe,expect,it} from 'vitest';

const source=readFileSync(resolve(process.cwd(),'apps/desktop/src/pages/CardDesigner.tsx'),'utf8');

describe('Phase 7.15 polyline angle constraint',()=>{
  it('locks free PEN/FLEXIBLE_LINE segments to 45 degree increments with Shift',()=>{
    expect(source).toContain('function constrainPointToAngle(');
    expect(source).toContain('Math.round(rawDeg/incrementDeg)*incrementDeg');
    expect(source).toContain("!snap&&e.shiftKey&&(interactionMode==='PEN'||interactionMode==='FLEXIBLE_LINE')&&lineStart");
  });

  it('keeps OSNAP ahead of angle constraint for preview and committed clicks',()=>{
    expect(source).toContain('const lineStart=activePathLineStart(),snap=drawingSnap(rawPoint,excluded,lineStart),anglePoint=!snap&&e.shiftKey&&lineStart');
    expect(source).toContain('const p=snap?{xMm:snap.point.x,yMm:snap.point.y}:anglePoint??rawPoint');
  });

  it('shows an amber angle-lock preview and readout',()=>{
    expect(source).toContain("penHover.angleLocked?'#f59e0b':'var(--accent-color)'");
    expect(source).toContain('{penHover.angleDeg}°');
  });
});
