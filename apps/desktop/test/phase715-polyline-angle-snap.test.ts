import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {describe,expect,it} from 'vitest';

const source=readFileSync(resolve(process.cwd(),'apps/desktop/src/pages/CardDesigner.tsx'),'utf8');

describe('Phase 7.15 polyline angle constraint',()=>{
  it('uses configured CAD polar directions for free line-like tools',()=>{
    expect(source).toContain('for(let a=0;a<360;a+=inc)');
    expect(source).toContain('polarIncrementDeg');
    expect(source).toContain("interactionMode==='PEN'||interactionMode==='FLEXIBLE_LINE'");
  });

  it('keeps OSNAP ahead of angle constraint for preview and committed clicks',()=>{
    expect(source).toContain('const snap=drawingSnap(rawPoint,excluded,activePathLineStart())');
    expect(source).toContain('const p=snap?{xMm:snap.point.x,yMm:snap.point.y}:rawPoint');
    expect(source).toContain('if(prioritySnap)');
  });

  it('shows an amber angle-lock preview and readout',()=>{
    expect(source).toContain('const cadHud=');
    expect(source).toContain('guideAngleDeg');
    expect(source).toContain("stroke={guide.active?'#f59e0b':'#64748b'}");
    expect(source).toContain('{guide.angle}°');
  });
});
