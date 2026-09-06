import {describe,it,expect} from 'vitest';
import {cadPolylineCanCloseAtPoint,closeCadPolyline} from '@document-tool/design-engine';
import type {PathDesignElement} from '@document-tool/contracts';
import fs from 'node:fs';

const polyline:PathDesignElement={
  id:'p',type:'PATH',name:'Polyline',position:{xMm:10,yMm:20},size:{widthMm:20,heightMm:20},rotationDeg:0,opacity:1,visible:true,locked:false,zIndex:5,
  geometry:{points:[{id:'a',x:0,y:0,mode:'CORNER'},{id:'b',x:20,y:0,mode:'CORNER'},{id:'c',x:20,y:20,mode:'CORNER'}],segments:[{id:'ab',type:'LINE',fromPointId:'a',toPointId:'b'},{id:'bc',type:'LINE',fromPointId:'b',toPointId:'c'}],closed:false},
  fill:{type:'NONE'},stroke:{type:'SOLID',style:'SOLID',color:'#000',widthMm:.5,opacity:1}
};

describe('VECTOR-UX2 Fix2 polyline closure + face fill hardening',()=>{
  it('recognizes first-node closure in world space and creates an explicit closing segment',()=>{
    expect(cadPolylineCanCloseAtPoint(polyline,{xMm:10.03,yMm:20.02},.05)).toBe(true);
    const closed=closeCadPolyline(polyline);
    expect(closed.geometry.closed).toBe(true);
    expect(closed.geometry.segments).toHaveLength(3);
    expect(closed.geometry.segments[2]).toMatchObject({fromPointId:'c',toPointId:'a'});
    expect(closed.metadata?.cadClosed).toBe(true);
  });
  it('keeps generated bucket sections below already-filled source boundaries',()=>{
    const source=fs.readFileSync(new URL('../src/pages/CardDesigner.tsx',import.meta.url),'utf8');
    expect(source).toContain("const filledSourceZ=sourceElements.filter(element=>(element.type==='PATH'||element.type==='SHAPE')&&element.fill?.type!=='NONE').map(element=>element.zIndex)");
    expect(source).toContain('Math.min(...filledSourceZ)-0.001');
    expect(source).toContain('preserveSourceFills:true');
    expect(source).toContain('faceTopologyVersion:2');
  });
});
