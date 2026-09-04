import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const toolbar=fs.readFileSync(path.resolve(process.cwd(),'apps/desktop/src/components/designer/DesignerContextToolbar.tsx'),'utf8');
const designer=fs.readFileSync(path.resolve(process.cwd(),'apps/desktop/src/pages/CardDesigner.tsx'),'utf8');

describe('Phase 8.7 Boolean toolbar wiring',()=>{
  it('exposes primary-aware Boolean + Combine + Fragment actions',()=>{
    expect(toolbar).toContain('performBooleanSelection(sourceElements, primaryElementId, op)');
    expect(toolbar).toContain('performFragmentSelection(sourceElements, primaryElementId)');
    expect(toolbar).toContain('>Combine</button>');
    expect(toolbar).toContain('>Fragment</button>');
    expect(toolbar).toContain('canFragmentSelection(sourceElements)');
  });
  it('replaces source layers and selects the generated result(s)',()=>{
    expect(toolbar).toContain('replaceElementsAtLayer');
    expect(toolbar).toContain('onReplaceSelection?.([nextResult.id])');
    expect(toolbar).toContain('onReplaceSelection?.(nextFragments.map(fragment=>fragment.id))');
    expect(designer).toContain('onReplaceSelection={elementIds=>setSelection');
  });
});
