import paper from 'paper';
import type { DesignElement, PathDesignElement, PathGeometry } from '@document-tool/contracts';
import { geometryToPaperItem, transformGeometry } from './booleanUtils.js';
import { localToWorld, worldToLocal, splitPathSegment, clonePathGeometry, removeOrphanPathPoints, shapeToPathGeometry } from './pathUtils.js';

/**
 * Initializes the paper environment if not already initialized.
 */
function ensurePaperProject() {
  if (!paper.project) {
    paper.setup(new paper.Size(1000, 1000));
  }
}

export interface TrimInterval {
  segmentId: string;
  tStart: number;
  tEnd: number;
}

/**
 * Gets valid intersection-based trim intervals for a target segment.
 */
export function getSmartTrimIntervals(
  targetElement: PathDesignElement,
  segmentId: string,
  allElements: DesignElement[]
): TrimInterval[] {
  ensurePaperProject();
  
  const targetSegment = targetElement.geometry.segments.find(segment => segment.id === segmentId);
  if (!targetSegment) return [];
  const targetPointIds = new Set([targetSegment.fromPointId, targetSegment.toPointId]);
  const targetGeometry: PathGeometry = {
    points: targetElement.geometry.points.filter(point => targetPointIds.has(point.id)),
    segments: [targetSegment],
    closed: false
  };
  // Isolating the target segment prevents intersections on a neighbouring curve
  // from being incorrectly projected onto this segment.
  const worldGeo = transformGeometry(targetGeometry, pt => localToWorld(pt, targetElement));
  const worldPaper = geometryToPaperItem(worldGeo);
  
  // Collect all other visible valid vector elements and convert to world paper items
  const otherPaperItems: paper.PathItem[] = [];
  for (const el of allElements) {
    if (el.id === targetElement.id) continue;
    if (el.runtimeHidden || !el.visible) continue;
    if (el.type === 'PATH') {
      const pWorldGeo = transformGeometry(el.geometry, pt => localToWorld(pt, el));
      otherPaperItems.push(geometryToPaperItem(pWorldGeo));
    } else if (el.type === 'SHAPE') {
      const shapeGeometry = shapeToPathGeometry(el.shape, el.size);
      const pWorldGeo = transformGeometry(shapeGeometry, pt => localToWorld(pt, el));
      otherPaperItems.push(geometryToPaperItem(pWorldGeo));
    }
  }
  
  // Extract the specific paper.Curve or sub-path corresponding to segmentId
  // In paper.js, we can find intersections of worldPaper with otherPaperItems.
  const tValues: number[] = [0, 1];
  
  // Find intersections
  for (const other of otherPaperItems) {
    const intersections = worldPaper.getIntersections(other);
    for (const ix of intersections) {
      const pt = { x: ix.point.x, y: ix.point.y };
      const localPt = worldToLocal(pt, targetElement);
      
      // Calculate parameter t for the local point on the segment
      const t = getParameterOnSegment(targetElement.geometry, segmentId, localPt);
      if (t !== null) tValues.push(Math.max(0, Math.min(1, t)));
    }
  }
  
  // Clean up paper items
  worldPaper.remove();
  for (const other of otherPaperItems) other.remove();
  
  // Sort and deduplicate t values
  tValues.sort((a, b) => a - b);
  const dedupT: number[] = [];
  for (const t of tValues) {
    if (dedupT.length === 0 || t - dedupT[dedupT.length - 1] > 0.001) {
      dedupT.push(t);
    }
  }
  
  // Create intervals
  const intervals: TrimInterval[] = [];
  for (let i = 0; i < dedupT.length - 1; i++) {
    intervals.push({
      segmentId,
      tStart: dedupT[i],
      tEnd: dedupT[i + 1]
    });
  }
  
  return intervals;
}

export function findTrimInterval(intervals: TrimInterval[], t: number): TrimInterval | null {
  const clampedT = Math.max(0, Math.min(1, t));
  return intervals.find(interval => clampedT >= interval.tStart - 0.000001 && clampedT <= interval.tEnd + 0.000001) ?? null;
}

/**
 * Finds the parameter t on a specific segment for a given local point.
 * We evaluate distances to find the closest t.
 */
function getParameterOnSegment(geometry: PathGeometry, segmentId: string, pt: {x: number, y: number}): number | null {
  const seg = geometry.segments.find(s => s.id === segmentId);
  if (!seg) return null;
  const p1 = geometry.points.find(p => p.id === seg.fromPointId);
  const p2 = geometry.points.find(p => p.id === seg.toPointId);
  if (!p1 || !p2) return null;
  
  const STEPS = 100;
  let minD = Infinity;
  let bestT = 0;
  
  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS;
    let evalPt = {x:0,y:0};
    if (seg.type === 'LINE') {
      evalPt = { x: p1.x + (p2.x - p1.x)*t, y: p1.y + (p2.y - p1.y)*t };
    } else {
      const h1 = p1.outHandle || p1;
      const h2 = p2.inHandle || p2;
      const q0 = { x: p1.x + (h1.x - p1.x)*t, y: p1.y + (h1.y - p1.y)*t };
      const q1 = { x: h1.x + (h2.x - h1.x)*t, y: h1.y + (h2.y - h1.y)*t };
      const q2 = { x: h2.x + (p2.x - h2.x)*t, y: h2.y + (p2.y - h2.y)*t };
      const r0 = { x: q0.x + (q1.x - q0.x)*t, y: q0.y + (q1.y - q0.y)*t };
      const r1 = { x: q1.x + (q2.x - q1.x)*t, y: q1.y + (q2.y - q1.y)*t };
      evalPt = { x: r0.x + (r1.x - r0.x)*t, y: r0.y + (r1.y - r0.y)*t };
    }
    const d = Math.hypot(evalPt.x - pt.x, evalPt.y - pt.y);
    if (d < minD) {
      minD = d;
      bestT = t;
    }
  }
  
  if (minD < 0.5) { // Match tolerance
    return bestT;
  }
  return null;
}

/**
 * Trims (deletes) the specified interval from the segment.
 */
export function trimSegmentInterval(
  geometry: PathGeometry,
  segmentId: string,
  tStart: number,
  tEnd: number
): PathGeometry {
  if (tStart > tEnd) {
    const temp = tStart;
    tStart = tEnd;
    tEnd = temp;
  }
  
  // If we are deleting the whole segment, just delete it.
  if (tStart <= 0.001 && tEnd >= 0.999) {
    return deleteSegmentFromGeometry(geometry, segmentId);
  }
  
  let currentGeo = clonePathGeometry(geometry);
  
  const originalSegment = currentGeo.segments.find(segment => segment.id === segmentId);
  if (!originalSegment) return currentGeo;

  // If we only trim from start
  if (tStart <= 0.001) {
    currentGeo = splitPathSegment(currentGeo, segmentId, tEnd);
    const firstChild = currentGeo.segments.find(segment => segment.fromPointId === originalSegment.fromPointId);
    return firstChild ? deleteSegmentFromGeometry(currentGeo, firstChild.id) : clonePathGeometry(geometry);
  }
  
  // If we only trim from end
  if (tEnd >= 0.999) {
    currentGeo = splitPathSegment(currentGeo, segmentId, tStart);
    const lastChild = currentGeo.segments.find(segment => segment.toPointId === originalSegment.toPointId);
    return lastChild ? deleteSegmentFromGeometry(currentGeo, lastChild.id) : clonePathGeometry(geometry);
  }
  
  // Split at the start, then remap the original end parameter onto the right child.
  currentGeo = splitPathSegment(currentGeo, segmentId, tStart);
  const rightChild = currentGeo.segments.find(segment => segment.toPointId === originalSegment.toPointId);
  if (!rightChild) return clonePathGeometry(geometry);
  const mappedEnd = (tEnd - tStart) / (1 - tStart);
  const rightChildStartId = rightChild.fromPointId;
  currentGeo = splitPathSegment(currentGeo, rightChild.id, mappedEnd);
  const middleSegment = currentGeo.segments.find(segment => segment.fromPointId === rightChildStartId);
  return middleSegment ? deleteSegmentFromGeometry(currentGeo, middleSegment.id) : clonePathGeometry(geometry);
}

function deleteSegmentFromGeometry(geometry: PathGeometry, segmentId: string): PathGeometry {
  const cloned = clonePathGeometry(geometry);
  const removed = cloned.segments.some(s => s.id === segmentId);
  cloned.segments = cloned.segments.filter(s => s.id !== segmentId);
  if (!removed) return cloned;
  cloned.closed = false;
  if (cloned.subpaths) {
    cloned.subpaths = cloned.subpaths
      .map(subpath => ({ ...subpath, closed: subpath.segmentIds.includes(segmentId) ? false : subpath.closed, segmentIds: subpath.segmentIds.filter(id => id !== segmentId) }))
      .filter(subpath => subpath.segmentIds.length > 0);
  }
  return removeOrphanPathPoints(cloned);
}
