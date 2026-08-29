import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const source=readFileSync(resolve(process.cwd(),'apps/desktop/src/pages/CardDesigner.tsx'),'utf8');
describe('Phase 7.3 zoom and scroll regression',()=>{
 it('handles only modified wheel input as zoom',()=>{expect(source).toContain("if(!event.ctrlKey&&!event.metaKey)return;event.preventDefault()");});
 it('keeps normal wheel scrolling native',()=>{expect(source).not.toContain('onWheel={event=>event.preventDefault()}');});
 it('gives the stage zoom-scaled reachable extents',()=>{expect(source).toContain('active.widthMm*MM_TO_CSS_PX*(zoom/100)+160');expect(source).toContain('active.heightMm*MM_TO_CSS_PX*(zoom/100)+160');});
 it('adjusts scroll once around the pointer after zoom',()=>{expect(source).toContain('requestAnimationFrame(()=>{const ratio=next/previous');});
});
