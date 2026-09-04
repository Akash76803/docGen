import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const designer = readFileSync(resolve(__dirname, '../src/pages/CardDesigner.tsx'), 'utf8');
const library = readFileSync(resolve(__dirname, '../src/components/designer/ElementLibraryPanel.tsx'), 'utf8');

describe('Phase 8.7 CAD draw exit + forgiving intersection capture', () => {
  it('uses a larger controlled capture zone and prioritizes projected intersections before generic boundary snaps', () => {
    expect(designer).toContain('INTERSECTION_CAPTURE_SCREEN_TOLERANCE_PX=18');
    expect(designer).toContain("detailId:'PROJECTED_INTERSECTION_CAPTURE'");
    const projected = designer.indexOf("detailId:'PROJECTED_INTERSECTION_CAPTURE'");
    const generic = designer.indexOf('const pointSnap=snapEnabled?resolvePointSnap', projected);
    expect(projected).toBeGreaterThan(0);
    expect(generic).toBeGreaterThan(projected);
  });

  it('exits line-like draw tools to SELECT on the first Escape', () => {
    expect(designer).toContain("const drawMode=interactionMode==='FLEXIBLE_LINE'||interactionMode==='PEN'||interactionMode==='DRAW_SHAPE'||interactionMode==='SPLIT'||interactionMode==='MIRROR_LINE'");
    expect(designer).toContain("if(drawMode){endHistoryTransaction();setInteractionMode('SELECT')");
    expect(designer).toContain("setStatus('Select tool')");
  });

  it('allows drawing tools to be reactivated by double-clicking their library buttons', () => {
    expect((library.match(/onDoubleClick=\{el\.action\}/g) ?? []).length).toBeGreaterThanOrEqual(4);
  });
});
