import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(__dirname, '..');
const designer = fs.readFileSync(path.join(root, 'src/pages/CardDesigner.tsx'), 'utf8');
const toolbar = fs.readFileSync(path.join(root, 'src/components/designer/DesignerContextToolbar.tsx'), 'utf8');
const css = fs.readFileSync(path.join(root, 'src/index.css'), 'utf8');

describe('Phase 8.5 Fix4 smart guides and symmetry wiring', () => {
  it('renders larger red selected path nodes', () => {
    expect(designer).toContain("isSelected?'#ef4444':'white'");
    expect(designer).toContain("isSelected?12:9");
  });
  it('exposes path symmetry Off/H/V controls', () => {
    expect(toolbar).toContain('Symmetry');
    expect(toolbar).toContain("setPathSymmetryMode?.('H')");
    expect(toolbar).toContain("setPathSymmetryMode?.('V')");
  });
  it('renders shape and artboard center guides', () => {
    expect(designer).toContain('data-path-center-guides');
    expect(designer).toContain('data-artboard-center-guide');
    expect(css).toContain('.card-smart-center-guide');
  });
  it('supports mirrored node movement and artboard symmetry snapping', () => {
    expect(designer).toContain("findMirrorNode(el.geometry.points,id,symmetryMode)");
    expect(designer).toContain('artboardSymmetrySnap');
  });
  it('renders equal-distance node guides', () => {
    expect(designer).toContain('data-node-equidistance-guide');
    expect(css).toContain('.card-path-equal-guide');
  });
});
