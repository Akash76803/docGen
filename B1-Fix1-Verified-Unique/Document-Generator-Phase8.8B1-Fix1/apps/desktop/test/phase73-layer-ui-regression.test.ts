import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const designerSource=readFileSync(resolve(process.cwd(),'apps/desktop/src/pages/CardDesigner.tsx'),'utf8');
const exportSource=readFileSync(resolve(process.cwd(),'apps/desktop/src/pages/CardExportCanvas.tsx'),'utf8');

describe('Phase 7.3 layer UI regression',()=>{
 it.each(['Bring to front','Bring forward','Send backward','Send to back'])('exposes the %s layer action',label=>{expect(designerSource).toContain(`title="${label}"`);});
 it('routes layer actions through explicit stable element selections',()=>{expect(designerSource).toContain("moveLayers(t,artboard.id,[layer.id],'FRONT')");expect(designerSource).toContain("moveLayers(t,artboard.id,selection.elementIds,'FRONT')");});
 it('sorts editor and isolated export DOM by the same ascending z-order rule',()=>{const canonical="sort((a,b)=>a.zIndex-b.zIndex||a.id.localeCompare(b.id))";expect(designerSource).toContain(canonical);expect(exportSource).toContain(canonical);});
 it('does not assign newly drawn shapes to the legacy hard-coded layer',()=>{expect(designerSource).toContain('zIndex:nextElementZIndex(t,artboard.id)');expect(designerSource).not.toContain('opacity:1,zIndex:1,visible:true');});
});
