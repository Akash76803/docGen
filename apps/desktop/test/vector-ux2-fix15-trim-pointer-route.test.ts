import { describe, expect, it } from 'vitest';
import { findBoundedTrimRoute, type TrimInterval } from '@document-tool/design-engine';
import type { PathGeometry } from '@document-tool/contracts';

describe('VECTOR-UX2 Fix15 trim hover routing', () => {
  it('finds a bounded route spanning multiple canonical curve segments', () => {
    const geometry: PathGeometry = {
      closed: true,
      points: [
        {id:'p0',x:0,y:0},{id:'p1',x:10,y:0},{id:'p2',x:10,y:10},{id:'p3',x:0,y:10},
      ],
      segments: [
        {id:'s0',fromPointId:'p0',toPointId:'p1',type:'LINE'},
        {id:'s1',fromPointId:'p1',toPointId:'p2',type:'LINE'},
        {id:'s2',fromPointId:'p2',toPointId:'p3',type:'LINE'},
        {id:'s3',fromPointId:'p3',toPointId:'p0',type:'LINE'},
      ],
    };
    const cuts = new Map<string, TrimInterval[]>([
      ['s0',[{segmentId:'s0',tStart:0,tEnd:0.4},{segmentId:'s0',tStart:0.4,tEnd:1}]],
      ['s2',[{segmentId:'s2',tStart:0,tEnd:0.6},{segmentId:'s2',tStart:0.6,tEnd:1}]],
      ['s1',[{segmentId:'s1',tStart:0,tEnd:1}]],
      ['s3',[{segmentId:'s3',tStart:0,tEnd:1}]],
    ]);
    const route = findBoundedTrimRoute(geometry,cuts,'s1',0.5);
    expect(route.map(r=>r.segmentId)).toEqual(['s0','s1','s2']);
    expect(route[0]).toMatchObject({segmentId:'s0',tStart:0.4,tEnd:1});
    expect(route.at(-1)).toMatchObject({segmentId:'s2',tStart:0,tEnd:0.6});
  });

  it('does not treat an open-path tail as a direct bounded trim candidate', () => {
    const geometry: PathGeometry = {
      closed:false,
      points:[{id:'a',x:0,y:0},{id:'b',x:10,y:0},{id:'c',x:20,y:0}],
      segments:[
        {id:'s0',fromPointId:'a',toPointId:'b',type:'LINE'},
        {id:'s1',fromPointId:'b',toPointId:'c',type:'LINE'},
      ],
    };
    const cuts=new Map<string,TrimInterval[]>([
      ['s0',[{segmentId:'s0',tStart:0,tEnd:0.5},{segmentId:'s0',tStart:0.5,tEnd:1}]],
      ['s1',[{segmentId:'s1',tStart:0,tEnd:1}]],
    ]);
    expect(findBoundedTrimRoute(geometry,cuts,'s1',0.5)).toEqual([]);
  });
});
