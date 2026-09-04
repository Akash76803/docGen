import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {describe,expect,it} from 'vitest';

const designer=readFileSync(resolve(process.cwd(),'apps/desktop/src/pages/CardDesigner.tsx'),'utf8');

describe('joined-line region Fill Bucket wiring',()=>{
  it('detects a closed graph across separate open paths and creates a persistent face',()=>{
    expect(designer).toContain('findJoinedLineRegionAtPoint(artboard.elements');
    expect(designer).toContain("faceGeneration:'AUTO_SECTION'");
    expect(designer).toContain("name:'Joined Line Section'");
    expect(designer).toContain('joined lines created an independent section');
    expect(designer).toContain('elements:[...current.elements,section]');
  });
});
