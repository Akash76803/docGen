import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {describe,expect,it} from 'vitest';

const source=readFileSync(resolve(process.cwd(),'apps/desktop/src/pages/CardDesigner.tsx'),'utf8');

describe('Fill Bucket joined-boundary closure',()=>{
  it('recognizes an open path whose final endpoints meet within tolerance',()=>{
    expect(source).toContain('const FILL_BOUNDARY_CLOSE_EPS_MM=.1');
    expect(source).toContain('Math.hypot(start.x-end.x,start.y-end.y)<=FILL_BOUNDARY_CLOSE_EPS_MM');
    expect(source).toContain('closePathGeometry(element.geometry)');
  });

  it('uses canonical closed geometry for hit testing and persistence',()=>{
    expect(source).toContain('const geometry=fillableClosedGeometry(element)');
    expect(source).toContain('const closedGeometry=fillableClosedGeometry(element)');
    expect(source).toContain('geometry:closedGeometry,fill');
  });

  it('keeps genuinely open or separate paths rejected with actionable feedback',()=>{
    expect(source).toContain('join the segments and close the path first');
  });
});
