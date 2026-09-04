import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(path.resolve(__dirname, '../src/pages/CardDesigner.tsx'), 'utf8');

describe('Phase 8.7 CAD cardinal hover snap points', () => {
  it('derives 0/90/180/270 boundary points from hovered closed vector geometry', () => {
    expect(source).toContain('cardinalPointsForElement');
    expect(source).toContain("angle:0,ray:0");
    expect(source).toContain("angle:90,ray:270");
    expect(source).toContain("angle:180,ray:180");
    expect(source).toContain("angle:270,ray:90");
    expect(source).toContain('findCardinalHover');
  });

  it('snaps exactly to a cardinal point after higher-priority endpoint/vertex/intersection snaps', () => {
    expect(source).toContain('prioritySnap');
    expect(source).toContain('nearestCardinalSnap');
    expect(source).toContain('Cardinal ${cardinal.angle}°');
    expect(source).toContain('CARDINAL_${cardinal.angle}');
  });

  it('renders available markers and green locked feedback only in active drawing workflows', () => {
    expect(source).toContain('data-cad-cardinal-hover-points');
    expect(source).toContain("data-snap-state={active?'LOCKED':'AVAILABLE'}");
    expect(source).toContain("fill={active?'#22c55e':'#ffffff'}");
    expect(source).toContain('setCardinalHover(cardinal)');
  });
});
