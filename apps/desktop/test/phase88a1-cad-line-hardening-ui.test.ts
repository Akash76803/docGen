import {describe,expect,it} from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(__dirname,'..');
const designer=fs.readFileSync(path.join(root,'src/pages/CardDesigner.tsx'),'utf8');

describe('Phase 8.8A1 CAD LINE hardening UI wiring',()=>{
  it('uses exact CAD line geometry and section-ready metadata',()=>{
    expect(designer).toContain('createCadLineGeometry({xMm:sx,yMm:sy},{xMm:ex,yMm:ey}');
    expect(designer).toContain("createCadLineMetadata(draft.startSnap?.elementId,endSnap?.elementId)");
    expect(designer).toContain("cadIntent:'DRAW'");
  });
  it('keeps LINE as a strict click-click CAD command',()=>{
    expect(designer).toContain('CAD LINE is intentionally click-click');
    expect(designer).toContain('const upCanvasWithLineCommit=()=>{upCanvas();};');
    expect(designer).not.toContain("op.shapeType==='LINE'&&op.pointerIsDown&&op.movedDuringPress");
  });
  it('supports continuous chaining, Enter finish, and Escape to Select',()=>{
    expect(designer).toContain("const chained:DrawDraft={startX:ex,startY:ey,currentX:ex,currentY:ey,shapeType:'LINE'");
    expect(designer).toContain("event.key!=='Enter'||interactionMode!=='DRAW_SHAPE'||drawShapeType!=='LINE'");
    expect(designer).toContain("setStatus('LINE — Specify first point')");
    expect(designer).toContain("const drawMode=interactionMode==='FLEXIBLE_LINE'||interactionMode==='PEN'||interactionMode==='DRAW_SHAPE'");
    expect(designer).toContain("setInteractionMode('SELECT')");
  });
});
