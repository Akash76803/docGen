import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {describe,expect,it} from 'vitest';

const designer=readFileSync(resolve(process.cwd(),'apps/desktop/src/pages/CardDesigner.tsx'),'utf8');

describe('joined-line region Fill Bucket wiring',()=>{
  it('detects a closed graph across separate open paths and creates a persistent face',()=>{
    expect(designer).toContain('function joinedLineRegionAtPoint');
    expect(designer).toContain("faceGeneration:'JOINED_LINE_REGION'");
    expect(designer).toContain("name:'Joined Line Section'");
    expect(designer).toContain('joined line boundary converted to an independently fillable section');
  });
});
