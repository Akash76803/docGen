import {describe,expect,it} from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const source=fs.readFileSync(path.resolve(__dirname,'../src/pages/CardDesigner.tsx'),'utf8');

describe('Phase 8.8B1 Fix2 CAD grip stretch and angular OSNAP feedback',()=>{
  it('resolves endpoint grip stretch against other-geometry intersections',()=>{
    expect(source).toContain('const stretchLineStart=');
    expect(source).toContain('lineStart:stretchLineStart');
    expect(source).toContain('snapToIntersections:Boolean(stretchLineStart)');
    expect(source).toContain('excludeIds:[element.id]');
  });

  it('shows the exact snap class while preserving exact snapped coordinates',()=>{
    expect(source).toContain('data-snap-label={label}');
    expect(source).toContain('const effectiveLocal=snap?worldToLocal(snap.point,element):rawLocal');
    expect(source).toContain('setNodeSnap(snap??null)');
  });

  it('renders labelled guides at every 45 degree direction for LINE and Angle Line',()=>{
    expect(source).toContain('[0,45,90,135,180,225,270,315]');
    expect(source).toContain('data-cad-angular-guides');
    expect(source).toContain('data-cad-angular-guide={guide.angle}');
    expect(source).toContain("drawShapeType==='LINE'");
    expect(source).toContain("interactionMode==='ANGLE_LINE'");
  });
});
