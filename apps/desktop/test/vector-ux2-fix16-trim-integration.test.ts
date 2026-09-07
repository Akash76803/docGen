import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { findBoundedTrimRoute, trimSegmentIntervals, type TrimInterval } from '@document-tool/design-engine';
import type { PathGeometry } from '@document-tool/contracts';

const cardDesigner = fs.readFileSync(path.resolve(process.cwd(),'apps/desktop/src/pages/CardDesigner.tsx'),'utf8');

describe('VECTOR-UX2 Fix16 complete trim integration', () => {
  it('wires the whole multi-segment route into CardDesigner and removes legacy single-interval smart state', () => {
    expect(cardDesigner).toContain('findBoundedTrimRoute');
    expect(cardDesigner).toContain('trimSegmentIntervals');
    expect(cardDesigner).toContain('setHoveredTrimRoute(findBoundedTrimRoute');
    expect(cardDesigner).toContain("interactionMode==='TRIMMER'?20:interactionMode==='EDIT_PATH'?14:10");
    expect(cardDesigner).toContain("pointerEvents:interactionMode==='TRIMMER'?'none':undefined");
    expect(cardDesigner).toContain('width=%2212%22 height=%2212%22');
    expect(cardDesigner).toContain('data-trim-candidate');
    expect(cardDesigner).toContain('strokeWidth={6/MM_TO_CSS_PX/(zoom/100)}');
    expect(cardDesigner).not.toContain('const [selectedInterval');
    expect(cardDesigner).not.toContain('const [hoveredInterval');
    expect(cardDesigner).not.toContain('findTrimInterval(');
  });

  it('returns a bounded route across three canonical segments and deletes it', () => {
    const geometry: PathGeometry = {
      closed: false,
      points: [
        {id:'p0',x:0,y:0},{id:'p1',x:10,y:0},{id:'p2',x:20,y:0},{id:'p3',x:30,y:0},
      ],
      segments: [
        {id:'s0',fromPointId:'p0',toPointId:'p1',type:'LINE'},
        {id:'s1',fromPointId:'p1',toPointId:'p2',type:'LINE'},
        {id:'s2',fromPointId:'p2',toPointId:'p3',type:'LINE'},
      ],
    };
    const cuts = new Map<string, readonly TrimInterval[]>([
      ['s0',[{segmentId:'s0',tStart:0,tEnd:0.6},{segmentId:'s0',tStart:0.6,tEnd:1}]],
      ['s1',[{segmentId:'s1',tStart:0,tEnd:1}]],
      ['s2',[{segmentId:'s2',tStart:0,tEnd:0.4},{segmentId:'s2',tStart:0.4,tEnd:1}]],
    ]);
    const route=findBoundedTrimRoute(geometry,cuts,'s1',0.5);
    expect(route).toEqual([
      {segmentId:'s0',tStart:0.6,tEnd:1},
      {segmentId:'s1',tStart:0,tEnd:1},
      {segmentId:'s2',tStart:0,tEnd:0.4},
    ]);
    const trimmed=trimSegmentIntervals(geometry,route);
    expect(trimmed.closed).toBe(false);
    expect(trimmed.segments.length).toBe(2);
  });

  it('does not smart-trim an unbounded open-path tail', () => {
    const geometry: PathGeometry = {
      closed:false,
      points:[{id:'p0',x:0,y:0},{id:'p1',x:10,y:0},{id:'p2',x:20,y:0}],
      segments:[
        {id:'s0',fromPointId:'p0',toPointId:'p1',type:'LINE'},
        {id:'s1',fromPointId:'p1',toPointId:'p2',type:'LINE'},
      ],
    };
    const cuts=new Map<string,readonly TrimInterval[]>([
      ['s0',[{segmentId:'s0',tStart:0,tEnd:0.5},{segmentId:'s0',tStart:0.5,tEnd:1}]],
      ['s1',[{segmentId:'s1',tStart:0,tEnd:1}]],
    ]);
    expect(findBoundedTrimRoute(geometry,cuts,'s0',0.25)).toEqual([]);
  });
});
