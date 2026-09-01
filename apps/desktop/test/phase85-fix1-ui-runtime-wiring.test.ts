import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(process.cwd());
const toolbar=fs.readFileSync(path.join(root,'apps/desktop/src/components/designer/DesignerContextToolbar.tsx'),'utf8');
const designer=fs.readFileSync(path.join(root,'apps/desktop/src/pages/CardDesigner.tsx'),'utf8');

describe('Phase 8.5 Fix1 UI/runtime wiring',()=>{
  it('offers explicit edit and exit path controls',()=>{
    expect(toolbar).toContain('>Edit Path</button>');
    expect(toolbar).toContain('>Exit Edit</button>');
  });
  it('closes history transactions after Bezier handle dragging',()=>{
    expect(designer.match(/endHistoryTransaction\(\);window\.removeEventListener\('pointermove',move\)/g)?.length).toBeGreaterThanOrEqual(2);
  });
});
