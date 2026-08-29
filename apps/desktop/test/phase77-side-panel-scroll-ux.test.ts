import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const css = readFileSync(resolve(process.cwd(), 'apps/desktop/src/styles/designer.css'), 'utf8');

describe('Phase 7.7 side panel scroll UX', () => {
  it('keeps both left library and inspector as bounded scroll containers', () => {
    expect(css).toContain('.dg-designer-left-panel__content');
    expect(css).toMatch(/\.dg-designer-left-panel__content\s*\{[\s\S]*?min-height:\s*0;[\s\S]*?overflow-y:\s*auto;/);
    expect(css).toMatch(/\.dg-designer-inspector__content\s*\{[\s\S]*?min-height:\s*0;[\s\S]*?overflow-y:\s*auto;/);
    expect(css).toContain('scrollbar-gutter: stable');
  });

  it('prevents inspector controls from overflowing horizontally', () => {
    expect(css).toContain('.dg-designer-inspector__content textarea');
    expect(css).toContain('grid-template-columns: repeat(2, minmax(0, 1fr))');
    expect(css).toContain('max-width: 100%');
  });

  it('uses a denser element palette on constrained heights', () => {
    expect(css).toContain('.dg-element-library__item');
    expect(css).toContain('@media (max-height: 760px)');
  });
});
