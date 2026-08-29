import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('Phase 7.7 expanded shape library',()=>{
  const source=readFileSync(resolve(process.cwd(),'apps/desktop/src/pages/CardDesigner.tsx'),'utf8');
  it('contains the expanded canonical shape set',()=>{
    for(const shape of ['DIAMOND','PENTAGON','HEXAGON','OCTAGON','TRAPEZOID','PARALLELOGRAM','RIGHT_TRIANGLE','CHEVRON','DOUBLE_CHEVRON','HEART','CLOUD','SPEECH_BUBBLE','CALLOUT','DOCUMENT','CYLINDER','CROSS','PLUS','BANNER','SHIELD','ARC','CURVED_ARROW','DOUBLE_ARROW','BRACKET','CAPSULE','LABEL_TAG']){
      expect(source).toContain(`'${shape}'`);
    }
  });
});
