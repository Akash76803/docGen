import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Phase 8.8A3 Fix7 utility, shape and duplicate shortcuts', () => {
  const registry = fs.readFileSync(path.resolve(__dirname, '../src/components/designer/designerShortcutRegistry.ts'), 'utf8');
  const designer = fs.readFileSync(path.resolve(__dirname, '../src/pages/CardDesigner.tsx'), 'utf8');

  it('registers direct utility tool shortcuts and Alt shape shortcuts', () => {
    expect(registry).toContain("keys: ['V']");
    expect(registry).toContain("keys: ['L']");
    expect(registry).toContain("keys: ['P']");
    expect(registry).toContain("keys: ['X']");
    expect(registry).toContain("keys: ['Alt', 'R']");
    expect(registry).toContain("keys: ['Alt', 'C']");
    expect(registry).toContain("keys: ['Alt', 'G']");
    expect(registry).toContain("title: 'Shapes'");
    expect(registry).toContain("title: 'Utility Tools'");
  });

  it('wires registry resolution into the designer keydown handler', () => {
    expect(designer).toContain('resolveDesignerShapeShortcut(e)');
    expect(designer).toContain('resolveDesignerUtilityShortcut(e)');
    expect(designer).toContain("setDrawShapeType(shapeShortcut)");
    expect(designer).toContain("setInteractionMode('DRAW_SHAPE')");
  });

  it('supports normal duplicate and exact in-place duplicate', () => {
    expect(registry).toContain("keys: ['Ctrl', 'D']");
    expect(registry).toContain("keys: ['Ctrl', 'Shift', 'D']");
    expect(designer).toContain('duplicateSelectedInPlace()');
    expect(designer).toContain("{xMm:0,yMm:0}");
  });
});
