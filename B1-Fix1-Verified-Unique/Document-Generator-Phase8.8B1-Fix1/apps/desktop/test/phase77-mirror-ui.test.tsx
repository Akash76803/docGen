import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('Phase 7.7 mirror UI',()=>{
  const toolbar=readFileSync(resolve(process.cwd(),'apps/desktop/src/components/designer/DesignerContextToolbar.tsx'),'utf8');
  it('exposes page-center horizontal and vertical mirror commands',()=>{
    expect(toolbar).toContain('Mirror Across Page Horizontal Center');
    expect(toolbar).toContain('Mirror Across Page Vertical Center');
    expect(toolbar).toContain("mirrorElementsAcrossArtboard");
  });
});
