import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Phase 8.8A3 Fix6 shortcuts help panel', () => {
  const header = fs.readFileSync(path.resolve(__dirname, '../src/components/designer/DesignerHeader.tsx'), 'utf8');
  const modal = fs.readFileSync(path.resolve(__dirname, '../src/components/designer/DesignerShortcutsModal.tsx'), 'utf8');
  const registry = fs.readFileSync(path.resolve(__dirname, '../src/components/designer/designerShortcutRegistry.ts'), 'utf8');
  const designer = fs.readFileSync(path.resolve(__dirname, '../src/pages/CardDesigner.tsx'), 'utf8');

  it('exposes a Shortcuts action in the top designer header', () => {
    expect(header).toContain('onShortcuts?: () => void');
    expect(header).toContain('aria-label="Shortcuts"');
    expect(header).toContain('Shortcuts');
    expect(designer).toContain('onShortcuts={() => setShortcutsOpen(true)}');
  });

  it('renders a searchable modal backed by the centralized enabled-shortcut registry', () => {
    expect(modal).toContain('Designer Shortcuts');
    expect(modal).toContain('Search shortcuts');
    expect(modal).toContain('DESIGNER_SHORTCUT_GROUPS');
    expect(registry).toContain("keys: ['F8']");
    expect(registry).toContain("keys: ['F10']");
    expect(registry).toContain("keys: ['Ctrl', 'G']");
    expect(registry).toContain("keys: ['Mouse wheel']");
    expect(registry).toContain("keys: ['Space', 'Drag']");
  });

  it('supports close button, backdrop close, and Escape close', () => {
    expect(modal).toContain('aria-label="Close shortcuts"');
    expect(modal).toContain('event.target === event.currentTarget');
    expect(modal).toContain("event.key === 'Escape'");
  });
});
