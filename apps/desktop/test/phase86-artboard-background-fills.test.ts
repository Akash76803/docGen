import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { createBlankArtboard, normalizeDesignTemplate, resolveArtboardBindings, setArtboardBackground, setArtboardBackgroundImageSourceFieldBinding } from '@document-tool/design-engine';
import type { DesignTemplate } from '@document-tool/contracts';

function template(): DesignTemplate {
  const artboard = createBlankArtboard({ id: 'artboard-1', name: 'Front', order: 0, widthMm: 90, heightMm: 50 });
  return { kind:'CARD_DESIGN', schemaVersion:1, id:'template-1', name:'Background Test', version:1, status:'DRAFT', artboards:[artboard], sharedAssets:[] };
}

describe('Phase 8.6 rich artboard backgrounds', () => {
  it('persists and normalizes solid, gradients and pattern fills', () => {
    let value = setArtboardBackground(template(), 'artboard-1', { type:'SOLID', color:'#123456', opacity:.45 });
    expect(normalizeDesignTemplate(value).artboards[0]!.background).toMatchObject({ type:'SOLID', color:'#123456', opacity:.45 });

    value = setArtboardBackground(value, 'artboard-1', { type:'LINEAR_GRADIENT', gradient:{ type:'LINEAR', angleDeg:35, stops:[{offset:0,color:'#ff0000',opacity:1},{offset:50,color:'#00ff00',opacity:.7},{offset:100,color:'#0000ff',opacity:1}] } });
    expect(normalizeDesignTemplate(value).artboards[0]!.background.type).toBe('LINEAR_GRADIENT');

    value = setArtboardBackground(value, 'artboard-1', { type:'RADIAL_GRADIENT', gradient:{ type:'RADIAL', centerX:30, centerY:65, radius:80, stops:[{offset:0,color:'#ffffff',opacity:1},{offset:100,color:'#000000',opacity:.2}] } });
    expect(normalizeDesignTemplate(value).artboards[0]!.background).toMatchObject({ type:'RADIAL_GRADIENT', gradient:{centerX:30,centerY:65,radius:80} });

    value = setArtboardBackground(value, 'artboard-1', { type:'PATTERN', pattern:{ kind:'CHECKER', foreground:'#111111', background:'#eeeeee', scale:2, rotationDeg:25, opacity:.6 } });
    expect(normalizeDesignTemplate(value).artboards[0]!.background.type).toBe('PATTERN');
  });

  it('keeps image crop transform and resolves dynamic image source', () => {
    let value = setArtboardBackground(template(), 'artboard-1', { type:'IMAGE', assetId:'fallback', fit:'FILL', opacity:.8, transform:{scale:1.5,offsetX:12,offsetY:-8,rotationDeg:15} });
    const bound = setArtboardBackgroundImageSourceFieldBinding(value.artboards[0]!, 'Photo');
    value = { ...value, artboards:[bound] };
    const resolved = resolveArtboardBindings(value.artboards[0]!, { record:{ Photo:'data:image/png;base64,AAAA' } });
    expect(resolved.background).toMatchObject({ type:'IMAGE', fit:'FILL', opacity:.8, transform:{scale:1.5,offsetX:12,offsetY:-8,rotationDeg:15} });
    expect((resolved.background as any).source).toBe('data:image/png;base64,AAAA');
  });

  it('wires interactive and isolated export background rendering', () => {
    const designer = readFileSync(new URL('../src/pages/CardDesigner.tsx', import.meta.url), 'utf8');
    const exporter = readFileSync(new URL('../src/pages/CardExportCanvas.tsx', import.meta.url), 'utf8');
    expect(designer).toContain('data-phase86-artboard-background-controls');
    expect(designer).toContain('data-artboard-background');
    expect(designer).toContain('<VectorFillDefs fill={artboard.background}');
    expect(exporter).toContain('data-export-artboard-background');
    expect(exporter).toContain('<ExportVectorFillDefs fill={artboard.background}');
  });
});
