import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {describe,expect,it} from 'vitest';

const source=readFileSync(resolve(process.cwd(),'apps/desktop/src/pages/CardDesigner.tsx'),'utf8');

describe('Phase 7.14 polyline session lifecycle',()=>{
  it('uses an explicit active path instead of treating arbitrary selection as a draft',()=>{
    expect(source).toContain("const activePolylineSession=useRef<{tool:'PEN'|'FLEXIBLE_LINE';pathId:string}|null>(null)");
    expect(source).toContain('if (activeSession?.tool===interactionMode)');
    expect(source).toContain("selectedEl.type === 'PATH'&&!selectedEl.geometry.closed");
  });

  it('resets the session on completion, cancellation, mode exit, and successful split',()=>{
    expect(source).toContain("event.key==='Enter'||event.key==='Escape'");
    expect(source).toContain('interactionMode!==session.tool)resetPolylineSession()');
    expect(source).toContain('splitCommitted=true;resetPolylineSession()');
    expect(source).toContain('onDoubleClick={()=>{if(interactionMode===\'PEN\'||interactionMode===\'FLEXIBLE_LINE\')');
  });

  it('does not leave the removed divider in pointer interaction state after a split',()=>{
    expect(source).toContain('if(splitCommitted){endHistoryTransaction();return;}');
    expect(source).toContain("if(interaction.current?.mode==='PEN_DRAG')interaction.current=null");
  });
});
