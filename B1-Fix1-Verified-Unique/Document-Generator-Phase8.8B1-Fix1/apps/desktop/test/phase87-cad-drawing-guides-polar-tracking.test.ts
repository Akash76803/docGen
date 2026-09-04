import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(path.resolve(__dirname, '../src/pages/CardDesigner.tsx'), 'utf8');

describe('Phase 8.7 CAD drawing guides and polar tracking', () => {
  it('exposes Polar, Ortho, Parallel/Perpendicular and angle increment controls', () => {
    expect(source).toContain('polarTrackingEnabled');
    expect(source).toContain('orthoTrackingEnabled');
    expect(source).toContain('parallelTrackingEnabled');
    expect(source).toContain('polarIncrementDeg');
    expect(source).toContain('>Polar</label>');
    expect(source).toContain('>Ortho</label>');
    expect(source).toContain('>Par/Perp</label>');
  });

  it('renders a live angle and length HUD', () => {
    expect(source).toContain('data-cad-angle-hud');
    expect(source).toContain("cadHud.angleDeg.toFixed(1)");
    expect(source).toContain("cadHud.lengthMm.toFixed(2)");
    expect(source).toContain('data-cad-tracking-guide');
  });

  it('supports CAD-style F8/F10 toggles', () => {
    expect(source).toContain("e.key==='F8'");
    expect(source).toContain("e.key==='F10'");
  });

  it('tracks directions from PATH segment geometry', () => {
    expect(source).toContain("if(el.type==='PATH')");
    expect(source).toContain("label:'Parallel'");
    expect(source).toContain("label:'Perpendicular'");
  });
});
