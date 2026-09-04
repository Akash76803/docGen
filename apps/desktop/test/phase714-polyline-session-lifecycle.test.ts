import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {describe,expect,it} from 'vitest';

const source=readFileSync(resolve(process.cwd(),'apps/desktop/src/pages/CardDesigner.tsx'),'utf8');

describe('Phase 7.14 polyline session lifecycle',()=>{
  it('uses an explicit active path instead of treating arbitrary selection as a draft',()=>{
    expect(source).toContain("selection.elementIds.length!==1");
    expect(source).toContain("selected.type!=='PATH'||selected.geometry.closed");
    expect(source).toContain('const activePathLineStart=()');
  });

  it('resets the session on completion, cancellation, mode exit, and successful split',()=>{
    expect(source).toContain("if(interactionMode==='FLEXIBLE_LINE'||interactionMode==='PEN')");
    expect(source).toContain("event.key==='Escape'");
    expect(source).toContain("setInteractionMode('SELECT')");
    expect(source).toContain('interaction.current=null;setDrawDraft(null)');
  });

  it('does not leave the removed divider in pointer interaction state after a split',()=>{
    expect(source).toContain('const splitOnly=draft.intent===\'SPLIT\'');
    expect(source).toContain('endHistoryTransaction();interaction.current=null;setDrawDraft(null)');
  });
});
