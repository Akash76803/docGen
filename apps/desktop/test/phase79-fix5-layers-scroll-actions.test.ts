import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const designer = readFileSync(resolve(process.cwd(), 'apps/desktop/src/pages/CardDesigner.tsx'), 'utf8');
const panel = readFileSync(resolve(process.cwd(), 'apps/desktop/src/components/designer/DesignerLeftPanel.tsx'), 'utf8');
const css = readFileSync(resolve(process.cwd(), 'apps/desktop/src/styles/designer.css'), 'utf8');

describe('Phase 7.9 Fix 5 layers scroll and ordering UX', () => {
  it('marks the left panel with its active workspace mode', () => {
    expect(panel).toContain('dg-designer-left-panel--${activeMode.toLowerCase()}');
  });

  it('gives Layers a dedicated bounded list scroller instead of nested panel scrolling', () => {
    expect(css).toMatch(/\.dg-designer-left-panel--layers \.dg-designer-left-panel__content\s*\{[\s\S]*?overflow:\s*hidden;/);
    expect(css).toMatch(/\.dg-designer-left-panel--layers \.card-layer-list\s*\{[\s\S]*?flex:\s*1 1 auto;[\s\S]*?min-height:\s*0;[\s\S]*?overflow-y:\s*auto;/);
    expect(css).toContain('scrollbar-gutter: stable');
  });

  it('keeps the layer command toolbar visible while the layer list scrolls', () => {
    expect(css).toMatch(/\.dg-designer-left-panel--layers \.card-layer-toolbar\s*\{[\s\S]*?position:\s*sticky;[\s\S]*?top:\s*0;/);
  });

  it.each([
    ['Bring to front', "'FRONT'"],
    ['Move up', "'FORWARD'"],
    ['Move down', "'BACKWARD'"],
    ['Send to back', "'BACK'"],
  ])('restores the selected-layer %s command', (label, direction) => {
    expect(designer).toContain(`title="${label}"`);
    expect(designer).toContain(`selection.elementIds,${direction}`);
  });

  it('keeps the existing per-layer ordering controls for direct row actions', () => {
    expect(designer).toContain('title="Bring forward"');
    expect(designer).toContain('title="Send backward"');
  });
});
