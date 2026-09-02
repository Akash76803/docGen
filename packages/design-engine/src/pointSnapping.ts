import paper from 'paper';
import type {Artboard,DesignElement,PathDesignElement,PathGeometry,ShapeDesignElement} from '@document-tool/contracts';
import {ensurePaperProject,geometryToPaperItem,transformGeometry} from './booleanUtils.js';
import {localToWorld,shapeToPathGeometry} from './pathUtils.js';

export type PointSnapKind=
  | 'LINE_ENDPOINT'
  | 'VERTEX'
  | 'INTERSECTION'
  | 'BOUNDARY'
  | 'GUIDE'
  | 'OBJECT_CENTER'
  | 'ARTBOARD_CENTER'
  | 'GRID';

export interface PointSnapResult {
  point:{x:number;y:number};
  kind:PointSnapKind;
  distanceMm:number;
  elementId?:string;
  guideId?:string;
  detailId?:string;
  label?:string;
}

export interface PointSnapOptions {
  enabled?:boolean;
  toleranceMm:number;
  excludeIds?:readonly string[];
  lineStart?:{x:number;y:number};
  snapToBoundaries?:boolean;
  snapToVertices?:boolean;
  snapToIntersections?:boolean;
  snapToGuides?:boolean;
  snapToGrid?:boolean;
  snapToObjectCenters?:boolean;
  snapToArtboardCenter?:boolean;
  gridSizeMm?:number;
}

/**
 * CAD point-snap priority. Lower wins before distance is considered.
 * Endpoint > vertex > intersection > exact boundary projection > guide >
 * object center > artboard center > grid.
 */
export const POINT_SNAP_PRIORITY:Readonly<Record<PointSnapKind,number>>={
  LINE_ENDPOINT:0,
  VERTEX:1,
  INTERSECTION:2,
  BOUNDARY:3,
  GUIDE:4,
  OBJECT_CENTER:5,
  ARTBOARD_CENTER:6,
  GRID:7,
};

function sourceGeometry(element:DesignElement):PathGeometry|undefined{
  if(element.type==='PATH')return (element as PathDesignElement).geometry;
  if(element.type==='SHAPE')return shapeToPathGeometry((element as ShapeDesignElement).shape,element.size);
  return undefined;
}

function worldGeometry(element:DesignElement):PathGeometry|undefined{
  const geometry=sourceGeometry(element);
  return geometry?transformGeometry(geometry,p=>localToWorld(p,element)):undefined;
}

function vectorPath(element:DesignElement):paper.Path|undefined{
  const geometry=worldGeometry(element);
  if(!geometry)return undefined;
  const item=geometryToPaperItem(geometry);
  return item instanceof paper.Path?item:undefined;
}

function isLineLikePath(element:DesignElement,geometry:PathGeometry):boolean{
  return element.type==='PATH'&&!geometry.closed&&geometry.segments.length>0;
}

function better(best:PointSnapResult|undefined,candidate:PointSnapResult|undefined):PointSnapResult|undefined{
  if(!candidate)return best;
  if(!best)return candidate;
  const candidateRank=POINT_SNAP_PRIORITY[candidate.kind];
  const bestRank=POINT_SNAP_PRIORITY[best.kind];
  if(candidateRank!==bestRank)return candidateRank<bestRank?candidate:best;
  return candidate.distanceMm<best.distanceMm?candidate:best;
}

function within(point:{x:number;y:number},candidate:{x:number;y:number},toleranceMm:number):number|undefined{
  const distance=Math.hypot(point.x-candidate.x,point.y-candidate.y);
  return distance<=toleranceMm?distance:undefined;
}

/**
 * Resolves one exact point snap for drawing/path-node editing only.
 * Callers must convert their desired screen-pixel radius into mm using the
 * current rendered canvas/editor bounds. This function deliberately does not
 * participate in the existing move/resize snapping pipeline.
 */
export function resolvePointSnap(artboard:Artboard,point:{x:number;y:number},options:PointSnapOptions):PointSnapResult|undefined{
  if(options.enabled===false||options.toleranceMm<=0)return undefined;
  ensurePaperProject();
  const toleranceMm=options.toleranceMm;
  const excluded=new Set(options.excludeIds??[]);
  const snapToBoundaries=options.snapToBoundaries??true;
  const snapToVertices=options.snapToVertices??true;
  const snapToIntersections=options.snapToIntersections??true;
  const snapToGuides=options.snapToGuides??true;
  const snapToGrid=options.snapToGrid??false;
  const snapToObjectCenters=options.snapToObjectCenters??true;
  const snapToArtboardCenter=options.snapToArtboardCenter??true;
  const gridSizeMm=Math.max(.1,options.gridSizeMm??5);
  const candidates=artboard.elements.filter(element=>!excluded.has(element.id)&&element.visible&&!element.locked&&!element.runtimeHidden);
  const vectorElements=candidates.filter(element=>element.type==='PATH'||element.type==='SHAPE');
  const paths=new Map<string,paper.Path>();
  const geometries=new Map<string,PathGeometry>();
  for(const element of vectorElements){
    const geometry=worldGeometry(element);
    const path=geometry?vectorPath(element):undefined;
    if(geometry)geometries.set(element.id,geometry);
    if(path)paths.set(element.id,path);
  }

  let best:PointSnapResult|undefined;

  if(snapToVertices){
    for(const element of vectorElements){
      const geometry=geometries.get(element.id);if(!geometry)continue;
      const endpointIds=isLineLikePath(element,geometry)?new Set([geometry.segments[0]?.fromPointId,geometry.segments.at(-1)?.toPointId]):new Set<string|undefined>();
      for(const node of geometry.points){
        const distance=within(point,node,toleranceMm);if(distance===undefined)continue;
        const endpoint=endpointIds.has(node.id);
        best=better(best,{point:{x:node.x,y:node.y},kind:endpoint?'LINE_ENDPOINT':'VERTEX',distanceMm:distance,elementId:element.id,detailId:node.id});
      }
    }
  }

  if(snapToIntersections&&options.lineStart&&Math.hypot(point.x-options.lineStart.x,point.y-options.lineStart.y)>1e-6){
    const probe=new paper.Path.Line(new paper.Point(options.lineStart.x,options.lineStart.y),new paper.Point(point.x,point.y));
    for(const element of vectorElements){
      const path=paths.get(element.id);if(!path)continue;
      for(const intersection of probe.getIntersections(path)){
        const hit={x:intersection.point.x,y:intersection.point.y};
        const distance=within(point,hit,toleranceMm);if(distance===undefined)continue;
        best=better(best,{point:hit,kind:'INTERSECTION',distanceMm:distance,elementId:element.id});
      }
    }
    probe.remove();
  }

  if(snapToBoundaries){
    const pointer=new paper.Point(point.x,point.y);
    for(const element of vectorElements){
      const path=paths.get(element.id);if(!path)continue;
      const location=path.getNearestLocation(pointer);if(!location)continue;
      const hit={x:location.point.x,y:location.point.y};
      const distance=within(point,hit,toleranceMm);if(distance===undefined)continue;
      best=better(best,{point:hit,kind:'BOUNDARY',distanceMm:distance,elementId:element.id,detailId:String(location.offset)});
    }
  }

  if(snapToGuides){
    for(const guide of artboard.guides){
      const snapped=guide.orientation==='VERTICAL'?{x:guide.positionMm,y:point.y}:{x:point.x,y:guide.positionMm};
      const distance=within(point,snapped,toleranceMm);if(distance===undefined)continue;
      best=better(best,{point:snapped,kind:'GUIDE',distanceMm:distance,guideId:guide.id});
    }
  }

  if(snapToObjectCenters){
    for(const element of candidates){
      const center=localToWorld({x:element.size.widthMm/2,y:element.size.heightMm/2},element);
      const distance=within(point,center,toleranceMm);if(distance===undefined)continue;
      best=better(best,{point:center,kind:'OBJECT_CENTER',distanceMm:distance,elementId:element.id});
    }
  }

  if(snapToArtboardCenter){
    const vertical={x:artboard.widthMm/2,y:point.y};
    const horizontal={x:point.x,y:artboard.heightMm/2};
    const dv=within(point,vertical,toleranceMm);
    if(dv!==undefined)best=better(best,{point:vertical,kind:'ARTBOARD_CENTER',distanceMm:dv});
    const dh=within(point,horizontal,toleranceMm);
    if(dh!==undefined)best=better(best,{point:horizontal,kind:'ARTBOARD_CENTER',distanceMm:dh});
  }

  if(snapToGrid){
    const grid={x:Math.round(point.x/gridSizeMm)*gridSizeMm,y:Math.round(point.y/gridSizeMm)*gridSizeMm};
    const distance=within(point,grid,toleranceMm);
    if(distance!==undefined)best=better(best,{point:grid,kind:'GRID',distanceMm:distance});
  }

  return best;
}
