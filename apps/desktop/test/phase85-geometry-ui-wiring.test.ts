import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(process.cwd());
const toolbar=fs.readFileSync(path.join(root,'apps/desktop/src/components/designer/DesignerContextToolbar.tsx'),'utf8');
const designer=fs.readFileSync(path.join(root,'apps/desktop/src/pages/CardDesigner.tsx'),'utf8');

describe('Phase 8.5 geometry UI wiring',()=>{
  it('exposes node selection and safe delete actions',()=>{
    expect(toolbar).toContain('Select All Nodes');
    expect(toolbar).toContain('Clear Nodes');
    expect(toolbar).toContain('Delete Nodes');
    expect(toolbar).toContain('deletePathPointsSafely');
  });
  it('uses hardened curve-to-line conversion',()=>{
    expect(toolbar).toContain('convertPathSegmentToLine');
  });
  it('moves every selected node by the same drag delta including handles',()=>{
    expect(designer).toContain("if (!nextIds.includes(pt.id)) return pt");
    expect(designer).toContain('inHandle: pt.inHandle ? {x:pt.inHandle.x+dx, y:pt.inHandle.y+dy}');
    expect(designer).toContain('outHandle: pt.outHandle ? {x:pt.outHandle.x+dx, y:pt.outHandle.y+dy}');
  });
});
