import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Phase 8.8A5 Fix3 build cleanup guards', () => {
  const designer = fs.readFileSync(path.resolve(__dirname, '../src/pages/CardDesigner.tsx'), 'utf8');
  const toolbar = fs.readFileSync(path.resolve(__dirname, '../src/components/designer/DesignerContextToolbar.tsx'), 'utf8');
  const library = fs.readFileSync(path.resolve(__dirname, '../src/components/designer/ElementLibraryPanel.tsx'), 'utf8');
  const polyline = fs.readFileSync(path.resolve(__dirname, '../../../packages/design-engine/src/cadPolyline.ts'), 'utf8');

  it('removes the reported TS6133 / ES lib / stroke blockers', () => {
    expect(toolbar).not.toContain('getElementCapabilities,');
    expect(designer).not.toContain('.at(-1)');
    expect(designer).not.toContain("stroke:{type:'SOLID'");
    expect(designer).not.toContain('prioritySnap.label');
  });

  it('keeps interaction-mode unions and edge-align segment typing compatible', () => {
    expect(library).toContain("'MIRROR_LINE'");
    expect(designer).toContain('index:number;fromLocal');
    expect(designer).toContain('segment.index===targetSegmentIndex');
  });

  it('accepts caller-generated string ids for appended polyline vertices', () => {
    expect(polyline).toContain('pointId:string=crypto.randomUUID()');
  });
});
