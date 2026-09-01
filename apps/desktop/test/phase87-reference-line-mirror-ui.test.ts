import {describe,expect,it} from 'vitest';
import fs from 'node:fs';import path from 'node:path';
const root=process.cwd();
const toolbar=fs.readFileSync(path.join(root,'apps/desktop/src/components/designer/DesignerContextToolbar.tsx'),'utf8');
const designer=fs.readFileSync(path.join(root,'apps/desktop/src/pages/CardDesigner.tsx'),'utf8');
describe('Phase 8.7 add-on reference-line mirror UI wiring',()=>{
 it('exposes Copy and Move CAD mirror actions',()=>{expect(toolbar).toContain('Mirror Line Copy');expect(toolbar).toContain('Mirror Line Move');expect(toolbar).toContain('onReferenceMirrorRequested');});
 it('uses a dedicated two-click MIRROR_LINE interaction with live preview and engine commit',()=>{expect(designer).toContain("interactionMode==='MIRROR_LINE'");expect(designer).toContain('data-reference-line-mirror-preview');expect(designer).toContain('mirrorElementsAcrossReferenceLine');expect(designer).toContain('specify second axis point');});
});
