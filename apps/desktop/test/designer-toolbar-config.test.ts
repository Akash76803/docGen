import { describe, it, expect } from 'vitest';
import { getDesignerToolbarMode } from '../src/components/designer/designerToolbarConfig.js';

describe('Designer Toolbar Config', () => {
  it('returns ARTBOARD when nothing is selected', () => {
    expect(getDesignerToolbarMode([], 0)).toBe('ARTBOARD');
  });

  it('returns MULTI when multiple elements are selected', () => {
    expect(getDesignerToolbarMode(['TEXT', 'IMAGE'], 2)).toBe('MULTI');
  });

  it('returns TEXT for a single text element', () => {
    expect(getDesignerToolbarMode(['TEXT'], 1)).toBe('TEXT');
  });

  it('returns IMAGE for a single image element', () => {
    expect(getDesignerToolbarMode(['IMAGE'], 1)).toBe('IMAGE');
  });

  it('returns SVG for a single svg element', () => {
    expect(getDesignerToolbarMode(['SVG'], 1)).toBe('SVG');
  });

  it('returns SHAPE for a single shape element', () => {
    expect(getDesignerToolbarMode(['SHAPE'], 1)).toBe('SHAPE');
  });

  it('returns NONE for unknown element type', () => {
    expect(getDesignerToolbarMode(['UNKNOWN'], 1)).toBe('NONE');
  });
});
