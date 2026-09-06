import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const source=fs.readFileSync(path.resolve(process.cwd(),'apps/desktop/src/pages/CardDesigner.tsx'),'utf8');

describe('VECTOR-UX1 path selection wiring',()=>{
  it('uses a generous zoom-aware segment hit target',()=>{
    expect(source).toContain('data-path-segment-hit-target');
    expect(source).toContain("interactionMode==='EDIT_PATH'?14:10");
    expect(source).toContain('vectorEffect="non-scaling-stroke"');
  });
  it('shows hover and selected segment feedback',()=>{
    expect(source).toContain('data-path-segment-hover');
    expect(source).toContain('data-path-segment-selected');
    expect(source).toContain("stroke=\"#f59e0b\"");
  });
  it('supports explicit path edit affordance and intersection topology refresh',()=>{
    expect(source).toContain('data-edit-path-affordance');
    expect(source).toContain('materializeStraightPathIntersections(a.elements,[e.id])');
  });
  it('renders persistent intersection nodes as first-class markers',()=>{
    expect(source).toContain('data-intersection-node');
    expect(source).toContain("?'#22c55e'");
  });
  it('keeps Shift+click insertion and Ctrl/Cmd segment multi-select semantics',()=>{
    expect(source).toContain("interactionMode === 'EDIT_PATH' && ev.shiftKey");
    expect(source).toContain('(ev.ctrlKey||ev.metaKey)');
  });
});
