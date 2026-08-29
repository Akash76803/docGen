import paper from 'paper';
import type { PathDesignElement, PathGeometry, PathPoint, PathSegment } from '@document-tool/contracts';
import { clonePathGeometry, localToWorld, worldToLocal } from './pathUtils.js';

export function transformGeometry(geometry: PathGeometry, transformFn: (pt: {x: number, y: number}) => {x: number, y: number}): PathGeometry {
  const cloned = clonePathGeometry(geometry);
  for (const pt of cloned.points) {
    const { x, y } = transformFn({ x: pt.x, y: pt.y });
    pt.x = x;
    pt.y = y;
    if (pt.inHandle) {
      const inH = transformFn({ x: pt.inHandle.x, y: pt.inHandle.y });
      pt.inHandle = { x: inH.x, y: inH.y };
    }
    if (pt.outHandle) {
      const outH = transformFn({ x: pt.outHandle.x, y: pt.outHandle.y });
      pt.outHandle = { x: outH.x, y: outH.y };
    }
  }
  return cloned;
}

/**
 * Initializes the paper environment if not already initialized.
 * Paper needs a project to work with paths.
 */
function ensurePaperProject() {
  if (!paper.project) {
    paper.setup(new paper.Size(1000, 1000));
  }
}

/**
 * Converts a PathGeometry to a paper.js Path or CompoundPath.
 */
export function geometryToPaperItem(geo: PathGeometry): paper.PathItem {
  ensurePaperProject();
  
  const compound = new paper.CompoundPath({});
  const pointMap = new Map<string, PathPoint>(geo.points.map(p => [p.id, p]));
  
  if (geo.subpaths && geo.subpaths.length > 0) {
    for (const sub of geo.subpaths) {
      const path = new paper.Path();
      buildPaperPath(path, sub.segmentIds.map(id => geo.segments.find(s => s.id === id)!), pointMap, sub.closed);
      compound.addChild(path);
    }
  } else {
    const path = new paper.Path();
    buildPaperPath(path, geo.segments, pointMap, geo.closed);
    compound.addChild(path);
  }
  
  // If it's a single path without holes, just return the Path, otherwise CompoundPath
  if (compound.children.length === 1) {
    const single = compound.children[0] as paper.Path;
    compound.removeChildren();
    return single;
  }
  return compound;
}

function buildPaperPath(path: paper.Path, segments: PathSegment[], pointMap: Map<string, PathPoint>, closed: boolean) {
  if (segments.length === 0) return;
  
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const fromPoint = pointMap.get(seg.fromPointId);
    const toPoint = pointMap.get(seg.toPointId);
    if (!fromPoint || !toPoint) continue;
    
    if (i === 0) {
      path.moveTo(new paper.Point(fromPoint.x, fromPoint.y));
    } else {
      const prevSeg = segments[i - 1];
      if (prevSeg.toPointId !== seg.fromPointId) {
        path.moveTo(new paper.Point(fromPoint.x, fromPoint.y));
      }
    }
    
    if (seg.type === 'LINE') {
      path.lineTo(new paper.Point(toPoint.x, toPoint.y));
    } else if (seg.type === 'CUBIC_BEZIER') {
      const cp1x = fromPoint.outHandle ? fromPoint.outHandle.x : fromPoint.x;
      const cp1y = fromPoint.outHandle ? fromPoint.outHandle.y : fromPoint.y;
      const cp2x = toPoint.inHandle ? toPoint.inHandle.x : toPoint.x;
      const cp2y = toPoint.inHandle ? toPoint.inHandle.y : toPoint.y;
      
      path.cubicCurveTo(
        new paper.Point(cp1x, cp1y),
        new paper.Point(cp2x, cp2y),
        new paper.Point(toPoint.x, toPoint.y)
      );
    }
  }
  
  if (closed) {
    path.closePath();
  }
}

/**
 * Converts a paper.js Path or CompoundPath back to PathGeometry.
 */
export function paperItemToGeometry(item: paper.PathItem): PathGeometry {
  const geo: PathGeometry = {
    points: [],
    segments: [],
    closed: false,
    subpaths: []
  };
  
  const paths: paper.Path[] = [];
  if (item instanceof paper.CompoundPath) {
    paths.push(...(item.children as paper.Path[]));
  } else if (item instanceof paper.Path) {
    paths.push(item);
  }
  
  for (const path of paths) {
    if (path.segments.length === 0) continue;
    
    const subpath = {
      closed: path.closed,
      segmentIds: [] as string[]
    };
    
    const startIdx = geo.points.length;
    for (const seg of path.segments) {
      const pt: PathPoint = {
        id: crypto.randomUUID(),
        x: seg.point.x,
        y: seg.point.y
      };
      if (seg.handleIn && !seg.handleIn.isZero()) {
        pt.inHandle = { x: seg.point.x + seg.handleIn.x, y: seg.point.y + seg.handleIn.y };
      }
      if (seg.handleOut && !seg.handleOut.isZero()) {
        pt.outHandle = { x: seg.point.x + seg.handleOut.x, y: seg.point.y + seg.handleOut.y };
      }
      geo.points.push(pt);
    }
    
    const curveCount = path.closed ? path.curves.length : path.curves.length;
    for (let i = 0; i < curveCount; i++) {
      const curve = path.curves[i];
      const fromPtIdx = startIdx + curve.segment1.index;
      const toPtIdx = startIdx + curve.segment2.index;
      
      const segId = crypto.randomUUID();
      subpath.segmentIds.push(segId);
      
      if (curve.hasHandles()) {
        geo.segments.push({
          id: segId,
          type: 'CUBIC_BEZIER',
          fromPointId: geo.points[fromPtIdx].id,
          toPointId: geo.points[toPtIdx].id
        });
      } else {
        geo.segments.push({
          id: segId,
          type: 'LINE',
          fromPointId: geo.points[fromPtIdx].id,
          toPointId: geo.points[toPtIdx].id
        });
      }
    }
    
    geo.subpaths!.push(subpath);
  }
  
  // For backwards compatibility, set the root closed flag to the first subpath's closed flag
  if (geo.subpaths!.length > 0) {
    geo.closed = geo.subpaths![0].closed;
  }
  
  return geo;
}

export function booleanUnion(geoA: PathGeometry, geoB: PathGeometry): PathGeometry {
  const itemA = geometryToPaperItem(geoA);
  const itemB = geometryToPaperItem(geoB);
  const result = itemA.unite(itemB, { insert: false }) as paper.PathItem;
  return paperItemToGeometry(result);
}

export function booleanSubtract(baseGeo: PathGeometry, cutterGeo: PathGeometry): PathGeometry {
  const itemA = geometryToPaperItem(baseGeo);
  const itemB = geometryToPaperItem(cutterGeo);
  const result = itemA.subtract(itemB, { insert: false }) as paper.PathItem;
  return paperItemToGeometry(result);
}

export function booleanIntersect(geoA: PathGeometry, geoB: PathGeometry): PathGeometry {
  const itemA = geometryToPaperItem(geoA);
  const itemB = geometryToPaperItem(geoB);
  const result = itemA.intersect(itemB, { insert: false }) as paper.PathItem;
  return paperItemToGeometry(result);
}

export function booleanExclude(geoA: PathGeometry, geoB: PathGeometry): PathGeometry {
  const itemA = geometryToPaperItem(geoA);
  const itemB = geometryToPaperItem(geoB);
  const result = itemA.exclude(itemB, { insert: false }) as paper.PathItem;
  return paperItemToGeometry(result);
}

export function performElementBooleanOperation(
  elA: PathDesignElement,
  elB: PathDesignElement,
  operation: 'UNION' | 'SUBTRACT' | 'INTERSECT' | 'EXCLUDE'
): PathDesignElement {
  const geoAWorld = transformGeometry(elA.geometry, pt => localToWorld(pt, elA));
  const geoBWorld = transformGeometry(elB.geometry, pt => localToWorld(pt, elB));
  
  let resultWorld: PathGeometry;
  if (operation === 'UNION') resultWorld = booleanUnion(geoAWorld, geoBWorld);
  else if (operation === 'SUBTRACT') resultWorld = booleanSubtract(geoAWorld, geoBWorld);
  else if (operation === 'INTERSECT') resultWorld = booleanIntersect(geoAWorld, geoBWorld);
  else resultWorld = booleanExclude(geoAWorld, geoBWorld);
  
  // Calculate bounding box of the world geometry
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const pt of resultWorld.points) {
    if (pt.x < minX) minX = pt.x;
    if (pt.y < minY) minY = pt.y;
    if (pt.x > maxX) maxX = pt.x;
    if (pt.y > maxY) maxY = pt.y;
  }
  
  if (minX === Infinity) {
    // Empty result
    return { ...elA, geometry: resultWorld, size: { widthMm: 0, heightMm: 0 } };
  }
  
  const widthMm = maxX - minX;
  const heightMm = maxY - minY;
  const position = { xMm: minX, yMm: minY };
  
  // Create a mock element to define the new local space (unrotated)
  const mockEl = { position, size: { widthMm, heightMm }, rotationDeg: 0 };
  
  const resultLocal = transformGeometry(resultWorld, pt => worldToLocal(pt, mockEl));
  
  return {
    ...elA,
    id: crypto.randomUUID(),
    geometry: resultLocal,
    position,
    size: { widthMm, heightMm },
    rotationDeg: 0
  };
}
