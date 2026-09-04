import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/pages/CardDesigner.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../src/styles/designer.css', import.meta.url), 'utf8');

describe('Phase 9.4 UX1 professional canvas workspace', () => {
  it('starts with side panels collapsed and exposes a canvas workspace toggle', () => {
    expect(source).toContain('useState(true);');
    expect(source).toContain('Toggle workspace panels (Tab)');
    expect(source).toContain("e.key==='Tab'");
  });

  it('supports any-tool double-click drag temporary panning without stealing element/panel gestures', () => {
    expect(source).toContain("const anyToolDoubleDragPan=e.button===0&&e.detail>=2");
    expect(source).toContain("e.detail>=2");
    expect(source).toContain("[data-element-id],[data-packaging-panel-id]");
    expect(source).toContain("Temporary pan — ${interactionMode} tool preserved");
  });

  it('keeps the local canvas toolbar to one compact horizontally scrollable row', () => {
    expect(css).toContain('Phase 9.4 UX1');
    expect(css).toContain('flex-wrap:nowrap!important');
    expect(css).toContain('overflow-x:auto!important');
    expect(css).toContain('.card-canvas-stage{padding:48px!important}');
  });
});
