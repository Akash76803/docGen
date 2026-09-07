import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(__dirname, '..', 'src');
const panel = fs.readFileSync(path.join(root, 'components/designer/ElementLibraryPanel.tsx'), 'utf8');
const shortcuts = fs.readFileSync(path.join(root, 'components/designer/designerShortcutRegistry.ts'), 'utf8');
const designer = fs.readFileSync(path.join(root, 'pages/CardDesigner.tsx'), 'utf8');

describe('VECTOR-UX2 Fix12 Trim tool activation', () => {
  it('exposes a dedicated Trim tile that activates TRIMMER mode', () => {
    expect(panel).toContain("id: 'trimmer', label: 'Trim'");
    expect(panel).toContain("onSetInteractionMode?.('TRIMMER')");
    expect(panel).toContain("active: interactionMode === 'TRIMMER'");
    expect(panel).toContain('Shift+click starts manual A/B trim');
  });

  it('places Trim before Split in the Utility list', () => {
    expect(panel.indexOf("id: 'trimmer'")).toBeLessThan(panel.indexOf("id: 'split'"));
  });

  it('keeps T as the Trim shortcut and legacy search aliases', () => {
    expect(shortcuts).toContain("keys: ['T'], action: 'Trim'");
    expect(panel).toContain("search.toLowerCase() === 'trimmer'");
    expect(panel).toContain("search.toLowerCase() === 'erase segment'");
  });

  it('uses consistent Trim activation copy in the designer', () => {
    expect(designer).toContain("setStatus('Trim — hover a bounded segment and click to remove')");
    expect(designer).toContain('TRIM — Hover a bounded segment and click once');
  });
});
