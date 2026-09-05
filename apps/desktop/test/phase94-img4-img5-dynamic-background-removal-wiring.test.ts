import { describe,it,expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(__dirname,'..');
const designer=fs.readFileSync(path.join(root,'src/pages/CardDesigner.tsx'),'utf8');
const helper=fs.readFileSync(path.join(root,'src/lib/imageBackgroundRemovalBrowser.ts'),'utf8');

describe('Phase 9.4 IMG4/IMG5 dynamic background-removal wiring',()=>{
  it('processes resolved dynamic artboards for live preview, normal export, and bulk export',()=>{
    expect(designer).toContain('processDynamicBackgroundRemovalArtboard(resolvedActive,template.sharedAssets');
    expect(designer).toContain('processDynamicBackgroundRemovalArtboard(resolved,template.sharedAssets)');
    expect(designer).toContain('processDynamicBackgroundRemovalArtboard(resolved,template.sharedAssets);');
  });

  it('exposes per-record controls for image and shape/path bindings',()=>{
    expect(designer).toContain('Enable Per-Record Removal');
    expect(designer).toContain('DYNAMIC_BG_REMOVAL_METADATA_KEY');
    expect(designer).toContain('DYNAMIC_FILL_BG_REMOVAL_METADATA_KEY');
  });

  it('includes cache, cancellation, and a safe pixel limit',()=>{
    expect(helper).toContain('PROCESS_CACHE_MAX=24');
    expect(helper).toContain('PROCESS_MAX_PIXELS=32_000_000');
    expect(helper).toContain("signal?.aborted");
    expect(helper).toContain('clearImageBackgroundRemovalCache');
  });
});
