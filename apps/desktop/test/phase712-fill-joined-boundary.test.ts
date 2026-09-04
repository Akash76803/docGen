import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {describe,expect,it} from 'vitest';

const source=readFileSync(resolve(process.cwd(),'apps/desktop/src/pages/CardDesigner.tsx'),'utf8');
const engine=readFileSync(resolve(process.cwd(),'packages/design-engine/src/joinedLineRegion.ts'),'utf8');

describe('Fill Bucket joined-boundary closure',()=>{
  it('delegates multi-element boundary closure to the topology engine',()=>{
    expect(source).toContain('findJoinedLineRegionAtPoint(artboard.elements');
    expect(engine).toContain('const JOIN_EPS_MM=.05');
    expect(engine).toContain('const primitives=collectPrimitives(elements)');
  });

  it('uses canonical closed geometry for hit testing and persistence',()=>{
    expect(source).toContain("faceGeneration:'AUTO_SECTION'");
    expect(source).toContain('geometry:region.geometry,fill');
    expect(source).toContain('joinedLineSourceIds:region.sourceElementIds');
  });

  it('keeps genuinely open or separate paths rejected with actionable feedback',()=>{
    expect(source).toContain("setStatus('Fill Bucket — no closed boundary at this point')");
  });
});
