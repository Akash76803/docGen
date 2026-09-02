import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Phase 8.8A5 CAD Angle Line', () => {
  const designer = fs.readFileSync(path.resolve(__dirname, '../src/pages/CardDesigner.tsx'), 'utf8');
  const registry = fs.readFileSync(path.resolve(__dirname, '../src/components/designer/designerShortcutRegistry.ts'), 'utf8');
  const library = fs.readFileSync(path.resolve(__dirname, '../src/components/designer/ElementLibraryPanel.tsx'), 'utf8');

  it('registers a dedicated A shortcut and utility entry', () => {
    expect(registry).toContain("| 'ANGLE_LINE'");
    expect(registry).toContain("key: 'a', action: 'ANGLE_LINE'");
    expect(registry).toContain("keys: ['A']");
    expect(library).toContain("label: 'Angle Line'");
    expect(library).toContain("onSetInteractionMode?.('ANGLE_LINE')");
  });

  it('uses exact dynamic Length/Angle input without changing the normal LINE shortcut', () => {
    expect(registry).toContain("key: 'l', action: 'LINE'");
    expect(designer).toContain("interactionMode==='ANGLE_LINE'");
    expect(designer).toContain('resolveCadDynamicEndpoint');
    expect(designer).toContain("interactionMode!=='ANGLE_LINE'");
    expect(designer).toContain("ANGLE LINE — Specify next start point");
  });

  it('keeps the TDZ recovery ordering intact', () => {
    const canEditPath = designer.indexOf('const canEditPath =');
    const keyboardEffect = designer.indexOf('const kd=(e:KeyboardEvent)=>');
    expect(canEditPath).toBeGreaterThan(-1);
    expect(keyboardEffect).toBeGreaterThan(-1);
    expect(canEditPath).toBeLessThan(keyboardEffect);
  });
});
