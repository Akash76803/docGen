import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const source=readFileSync(resolve(process.cwd(),'apps/desktop/src/pages/CardDesigner.tsx'),'utf8');

describe('Phase 7.4.1 CAD drawing and connection feedback',()=>{
  it('keeps a state-backed live preview so pointer movement rerenders before commit',()=>{
    expect(source).toContain('const [drawDraft,setDrawDraft]');
    expect(source).toContain('data-cad-live-preview');
  });

  it('requires an explicit second click before CAD geometry commits',()=>{
    expect(source).toMatch(/existing\s*&&\s*!existing\.pointerIsDown/);
    const upCanvas=source.match(/const upCanvas=\(\)=>\{[\s\S]*?const capture=/);
    expect(upCanvas).toBeTruthy();
    expect(upCanvas?.[0]).not.toContain('commitDrawDraft(op');
    expect(upCanvas?.[0]).toMatch(/pointer-up only arms the first point/i);
  });

  it('renders one contextual snap marker and target-boundary feedback',()=>{
    expect(source).toContain('data-boundary-snap-marker');
    expect(source).toContain('data-snap-target-boundary');
    expect(source).toContain("'#22c55e'");
  });

  it('exposes compact CAD command hints',()=>{
    expect(source).toContain('data-cad-command-hint');
    expect(source).toContain('LINE — Specify next point');
  });

  it('feeds committed line geometry into the current multi-section face splitter without requiring both snap metadata objects',()=>{
    expect(source).toMatch(/if\s*\(draft\.shapeType\s*===\s*'LINE'\)/);
    expect(source).toContain('splitComponentFaceByDivider');
    expect(source).not.toMatch(/draft\.shapeType\s*===\s*'LINE'\s*&&\s*draft\.startSnap\s*&&\s*endSnap/);
  });
});
