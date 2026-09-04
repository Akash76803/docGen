import { describe,expect,it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('Phase 9.1 page format UI wiring',()=>{
 const source=readFileSync(new URL('../src/pages/CardDesigner.tsx',import.meta.url),'utf8');
 it('exposes search, category, orientation, apply and saved preset actions',()=>{for(const marker of ['Search page formats','Page format category','Apply Format','Save Current','Delete Saved','LocalStorageArtboardPresetRepository'])expect(source).toContain(marker);});
 it('shows a deterministic 300 DPI output dimension',()=>{expect(source).toContain('requiredPixels(artboard.widthMm,300)');expect(source).toContain('requiredPixels(artboard.heightMm,300)');});
 it('applies a format and orientation immediately when selected',()=>{expect(source).toContain('selectAndApplyPreset(e.target.value)');expect(source).toContain("changeOrientation('PORTRAIT')");expect(source).toContain("changeOrientation('LANDSCAPE')");});
});
