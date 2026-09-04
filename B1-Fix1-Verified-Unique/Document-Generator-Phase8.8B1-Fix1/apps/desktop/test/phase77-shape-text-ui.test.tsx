import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('Phase 7.7 shape text UI/export integration',()=>{
  const designer=readFileSync(resolve(process.cwd(),'apps/desktop/src/pages/CardDesigner.tsx'),'utf8');
  const exportCanvas=readFileSync(resolve(process.cwd(),'apps/desktop/src/pages/CardExportCanvas.tsx'),'utf8');
  it('exposes shape text controls and live canvas label',()=>{
    expect(designer).toContain('data-shape-text-controls');
    expect(designer).toContain('data-shape-label');
    expect(designer).toContain('Vertical');
  });
  it('exports shape labels',()=>{
    expect(exportCanvas).toContain('shapeLabel');
    expect(exportCanvas).toContain('shapeLabel.text');
  });
});
