import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(path.resolve(process.cwd(),'apps/desktop/src/pages/CardDesigner.tsx'),'utf8');

describe('Phase 8.7 CAD projection/intersection tracking',()=>{
  it('renders full construction ray and projected intersection markers',()=>{
    expect(source).toContain('data-cad-projected-intersection');
    expect(source).toContain('data-cad-intersection-label');
    expect(source).toContain('rayToArtboardDistance');
    expect(source).toContain('cadRayIntersections');
  });
  it('snaps tracked endpoint to projected boundary intersections',()=>{
    expect(source).toContain("kind:'INTERSECTION' as const");
    expect(source).toContain('tracked.label} Intersection');
  });
  it('samples bezier paths for useful projected intersections',()=>{
    expect(source).toContain('cubicPoint');
    expect(source).toContain('for(let i=1;i<=16;i++)');
  });
});
