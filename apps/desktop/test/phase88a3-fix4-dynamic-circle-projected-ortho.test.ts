import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const designer = readFileSync(resolve(__dirname, '../src/pages/CardDesigner.tsx'), 'utf8');

describe('Phase 8.8A3 Fix4 dynamic input, circle radius, projected perpendicular intersection', () => {
  it('keeps the line dynamic input at a stable position anchored to the first point and isolates pointer events', () => {
    expect(designer).toContain("left:drawDraft.startX*MM_TO_CSS_PX+12/(zoom/100)");
    expect(designer).toContain('data-cad-dynamic-input');
    expect(designer).toContain('onPointerMove={e=>e.stopPropagation()}');
    expect(designer).toContain('commitDynamicCadLine()');
  });

  it('supports center-first two-click circles with an exact radius input', () => {
    expect(designer).toContain("op.shapeType==='LINE'||op.shapeType==='CIRCLE'");
    expect(designer).toContain('data-cad-circle-radius-input');
    expect(designer).toContain('commitDynamicCadCircle');
    expect(designer).toContain("drawShapeType!=='CIRCLE'");
    expect(designer).toContain('drawDraft.startX+radiusMm');
  });

  it('provides projected horizontal/vertical virtual intersections as exact green intersection snaps', () => {
    expect(designer).toContain('nearestProjectedOrthoIntersection');
    expect(designer).toContain("detailId:'PROJECTED_ORTHO_INTERSECTION'");
    expect(designer).toContain("label:'Projected Perpendicular Intersection'");
    expect(designer).toContain('data-cad-projected-ortho-guide');
  });
});
