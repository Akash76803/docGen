import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(path.resolve(__dirname, '../src/pages/CardDesigner.tsx'), 'utf8');

describe('VECTOR-UX2 Fix13 trim X cursor and bounded hover-delete UX', () => {
  it('uses a simple X cursor with centered hotspot', () => {
    expect(source).toContain('width=%2220%22 height=%2220%22');
    expect(source).toContain('M4 4L16 16M16 4L4 16');
    expect(source).toContain('") 10 10, crosshair');
  });

  it('only exposes direct smart trim for intervals bounded by two intersections', () => {
    expect(source).toContain('if(intervals.length>2)');
    expect(source).toContain('candidate.tStart>0.001 && candidate.tEnd<0.999');
  });

  it('renders a thick solid hover preview and trims it on one click', () => {
    expect(source).toContain('data-trim-candidate');
    expect(source).toContain('strokeWidth={6/MM_TO_CSS_PX/(zoom/100)}');
    expect(source).toContain('strokeLinecap="round"');
    expect(source).not.toContain('data-trim-candidate d={renderPartialSegment(seg, hoveredInterval.tStart, hoveredInterval.tEnd)} fill="none" stroke="rgba(239,68,68,0.82)"');
    expect(source).toContain('onTrimGeometry(trimSegmentInterval(element.geometry,candidate.segmentId,candidate.tStart,candidate.tEnd))');
  });
});
