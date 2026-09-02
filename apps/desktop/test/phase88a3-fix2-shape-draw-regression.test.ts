import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Phase 8.8A3 Fix2 shape draw regression guard', () => {
  const source = fs.readFileSync(path.resolve(__dirname, '../src/pages/CardDesigner.tsx'), 'utf8');

  it('keeps CAD/XLINE tracking limited to line-like drawing tools', () => {
    expect(source).toContain("const isCadLineLikeTool=interactionMode==='PEN'");
    expect(source).toContain("(interactionMode==='DRAW_SHAPE'&&drawShapeType==='LINE')");
    expect(source).toContain("if(!isCadLineLikeTool){intersectionCaptureLockRef.current=null;return undefined;}acquireXLineReference(raw)");
  });

  it('bypasses CAD snap pipeline for ordinary shape drawing', () => {
    expect(source).toContain("const useCadSnap=interactionMode==='SPLIT'||activeShapeType==='LINE'");
    expect(source).toContain('const snap=useCadSnap?drawingSnap(');
  });

  it('does not create the CAD HUD for ordinary shape drafts', () => {
    expect(source).toContain("drawDraft&&(drawDraft.shapeType==='LINE'||interactionMode==='SPLIT'||interactionMode==='XLINE')");
  });
});
