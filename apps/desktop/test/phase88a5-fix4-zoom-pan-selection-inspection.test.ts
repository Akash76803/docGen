import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const designer = fs.readFileSync(path.join(root, 'apps/desktop/src/pages/CardDesigner.tsx'), 'utf8');
const css = fs.readFileSync(path.join(root, 'apps/desktop/src/index.css'), 'utf8');

describe('Phase 8.8A5 Fix4 zoom pan and vector selection inspection', () => {
  it('reserves the scaled artboard footprint and anchors zoom at the top-left', () => {
    expect(designer).toContain('data-canvas-zoom-frame');
    expect(designer).toContain('width:active.widthMm*MM_TO_CSS_PX*(zoom/100)');
    expect(designer).toContain('height:active.heightMm*MM_TO_CSS_PX*(zoom/100)');
    expect(designer).toContain("transformOrigin:'top left'");
    expect(css).toContain('.card-canvas-zoom-frame{position:relative;flex:none}');
    expect(css).toContain('.card-canvas-zoom-frame>.card-artboard-canvas{transform-origin:top left}');
  });

  it('returns ordinary shape drawing to Select so the result is immediately editable', () => {
    expect(designer).toContain("else{setInteractionMode('SELECT');setStatus(`${draft.shapeType} created — selected for resize, rotation and point inspection`);}");
  });

  it('renders dimensions, angle, endpoints, midpoints and center for selected vectors', () => {
    expect(designer).toContain('data-vector-selection-inspection');
    expect(designer).toContain('data-vector-measurement');
    expect(designer).toContain('data-vector-endpoint');
    expect(designer).toContain('data-vector-midpoint');
    expect(designer).toContain('data-vector-center');
    expect(designer).toContain('normalizeDisplayValue(element.size.widthMm)');
    expect(designer).toContain('normalizeDisplayValue(element.size.heightMm)');
    expect(designer).toContain('{normalizeDisplayValue(element.rotationDeg)}°');
  });
});
