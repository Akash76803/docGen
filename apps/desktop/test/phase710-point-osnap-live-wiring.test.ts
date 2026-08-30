import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {describe,expect,it} from 'vitest';

const source=readFileSync(resolve(process.cwd(),'apps/desktop/src/pages/CardDesigner.tsx'),'utf8');

describe('Phase 7.10 point OSNAP live interaction wiring',()=>{
  it('limits enhanced point snapping to line/connect/split tools',()=>{
    expect(source).toContain("interactionMode==='PEN'||interactionMode==='FLEXIBLE_LINE'||interactionMode==='SPLIT'||(interactionMode==='DRAW_SHAPE'&&drawShapeType==='LINE')");
  });

  it('resolves a fresh screen-space tolerance on the live canvas pointer path',()=>{
    expect(source).toContain('const pointSnapToleranceMm=(screenPx:number)=>');
    expect(source).toContain('toleranceMm:pointSnapToleranceMm(POINT_SNAP_SCREEN_TOLERANCE_PX)');
    expect(source).toContain('const snap=activeConnectTool?drawingSnap(raw,excluded,lineStart):undefined');
  });

  it('uses the snapped point for both line preview and drag-release commit',()=>{
    expect(source).toContain('const p=snap?{xMm:snap.point.x,yMm:snap.point.y}:anglePoint??raw');
    expect(source).toContain('currentX:p.xMm,currentY:p.yMm');
    expect(source).toContain('const effectiveEnd={xMm:op.currentX,yMm:op.currentY}');
    expect(source).toContain('commitDrawDraft(op,effectiveEnd,op.currentSnap)');
    expect(source).toContain('onPointerUp={upCanvasWithLineCommit}');
  });

  it('commits a distinct second click even when the first pointer-up was missed',()=>{
    expect(source).toContain('const isDistinctSecondPoint=existing?Math.hypot(p.xMm-existing.startX,p.yMm-existing.startY)>=.5:false');
    expect(source).toContain('if(existing&&(!existing.pointerIsDown||isDistinctSecondPoint))');
  });

  it('applies snapped world coordinates in the live path-node pointermove handler',()=>{
    expect(source).toContain('const snap=snapEnabled?resolvePointSnap(artboard,rawWorld');
    expect(source).toContain('const effectiveLocal=snap?worldToLocal(snap.point,element):rawLocal');
    expect(source).toContain('return { ...pt, x: lx, y: ly, inHandle: inH, outHandle: outH }');
  });

  it('mounts canvas and path-node snap markers in the interactive render trees',()=>{
    expect(source).toContain('data-boundary-snap-marker');
    expect(source).toContain('data-node-snap-marker');
    expect(source).toContain('{boundarySnap&&');
    expect(source).toContain("interactionMode==='EDIT_PATH'&&nodeSnap");
  });
});
