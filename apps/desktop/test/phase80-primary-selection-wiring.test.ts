import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(process.cwd());
const read=(file:string)=>fs.readFileSync(path.join(root,file),'utf8');

describe('Phase 8.0 primary selection wiring',()=>{
  it('passes primaryElementId into the context toolbar and resolves primary by id',()=>{
    const designer=read('apps/desktop/src/pages/CardDesigner.tsx');
    const toolbar=read('apps/desktop/src/components/designer/DesignerContextToolbar.tsx');
    expect(designer).toContain('primaryElementId={selection.primaryElementId}');
    expect(toolbar).toContain('sourceElements.find(element => element.id === primaryElementId) ?? sourceElements[0]');
  });

  it('marks only the primary member of a multi-selection with an editor-only class',()=>{
    const designer=read('apps/desktop/src/pages/CardDesigner.tsx');
    const css=read('apps/desktop/src/index.css');
    expect(designer).toContain("selection.elementIds.length>1&&selection.primaryElementId===e.id");
    expect(designer).toContain("isPrimarySelection?'primary-selected':''");
    expect(css).toContain('.card-design-element-shell.has-visual.primary-selected');
  });
});
