import {describe,expect,it} from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(__dirname,'..');
const designer=fs.readFileSync(path.join(root,'src/pages/CardDesigner.tsx'),'utf8');
const cadGeometry=fs.readFileSync(path.resolve(root,'../../../packages/design-engine/src/cadGeometry.ts'),'utf8');

describe('Phase 8.7 Add-on Fix4 CAD exact intersection + deep zoom',()=>{
  it('uses exact vector ray intersections instead of sampled CAD ray hits',()=>{
    expect(designer).toContain('findCadRayIntersections(artboard.elements,start,angleDeg,excludeIds)');
    expect(cadGeometry).toContain('ray.getIntersections(item)');
    expect(cadGeometry).toContain("cross>0.002");
  });
  it('keeps an acquired intersection locked through small pointer overshoot',()=>{
    expect(designer).toContain('INTERSECTION_LOCK_RELEASE_SCREEN_TOLERANCE_PX=30');
    expect(designer).toContain('intersectionCaptureLockRef');
    expect(designer).toContain("label:`${tracked.label?`${tracked.label} `:''}Exact Intersection`");
  });
  it('provides CAD style deep pointer centered zoom',()=>{
    expect(designer).toContain('MIN_ZOOM=5,MAX_ZOOM=3200');
    expect(designer).toContain('factor=event.deltaY<0?1.14:1/1.14');
    expect(designer).toContain('view.scrollLeft=contentX*ratio-x');
    expect(designer).toContain('aria-label="Canvas zoom percent"');
  });
});
