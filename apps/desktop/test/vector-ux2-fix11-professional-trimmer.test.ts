import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const designer = fs.readFileSync(path.resolve(__dirname, '../src/pages/CardDesigner.tsx'), 'utf8');

describe('VECTOR-UX2 Fix11 professional CAD trimmer wiring', () => {
  it('uses a snapshot cache so Paper.js trim interval discovery is not rebuilt on every pointer move', () => {
    expect(designer).toContain('const trimIntervalCache = useMemo(() => new Map<string, TrimInterval[]>()');
    expect(designer).toContain('const cached = trimIntervalCache.get(segmentId)');
    expect(designer).toContain('trimIntervalCache.set(segmentId, intervals)');
    expect(designer).toContain('const updateTrimCandidate=(segmentId:string,clickPoint:{x:number;y:number})=>');
  });

  it('trims the exact hovered interval immediately on normal click as one history transaction', () => {
    expect(designer).toContain('const candidate=hoveredInterval;');
    expect(designer).toContain('beginHistoryTransaction();');
    expect(designer).toContain('onTrimGeometry(trimSegmentInterval(element.geometry,candidate.segmentId,candidate.tStart,candidate.tEnd));');
    expect(designer).toContain('endHistoryTransaction();');
  });

  it('keeps manual A/B trim explicit behind Shift or an already-started range', () => {
    expect(designer).toContain("if ((trimStartNodeId && !trimEndNodeId) || ev.shiftKey)");
    expect(designer).toContain('Shift+click for manual A/B');
  });

  it('uses an exact cubic De Casteljau sub-curve preview and zoom-consistent trim highlight', () => {
    expect(designer).toContain('const [,section] = split(leftToB,relativeA);');
    expect(designer).toContain('data-trim-candidate');
    expect(designer).toContain('strokeWidth={3/MM_TO_CSS_PX/(zoom/100)}');
  });

  it('uses dedicated idle/active trim cursors and removes the misleading legacy blue fallback', () => {
    expect(designer).toContain('TRIMMER_ACTIVE_CURSOR');
    expect(designer).toContain("isHoveredInterval ? TRIMMER_ACTIVE_CURSOR : TRIMMER_CURSOR");
    expect(designer).not.toContain('Legacy full-segment hover (fallback / manual A/B)');
  });
});
