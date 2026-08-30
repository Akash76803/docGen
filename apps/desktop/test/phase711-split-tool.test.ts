import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {describe,expect,it} from 'vitest';

const designer=readFileSync(resolve(process.cwd(),'apps/desktop/src/pages/CardDesigner.tsx'),'utf8');
const library=readFileSync(resolve(process.cwd(),'apps/desktop/src/components/designer/ElementLibraryPanel.tsx'),'utf8');
const toolbar=readFileSync(resolve(process.cwd(),'apps/desktop/src/components/designer/DesignerContextToolbar.tsx'),'utf8');

describe('dedicated Divider / Split tool',()=>{
  it('is visible, selectable, and described independently from path tools',()=>{
    expect(library).toContain("id: 'divider', label: 'Divider'");
    expect(library).toContain("onSetInteractionMode?.('SPLIT')");
    expect(library).toContain('draw across a closed shape or filled section to create new independently fillable sections');
    expect(library).toContain("id: 'trimmer', label: 'Erase Segment'");
    expect(library).toContain("id: 'scissors', label: 'Scissors'");
  });

  it('reuses the live line draft and OSNAP resolver path',()=>{
    expect(designer).toContain("interactionMode==='SPLIT'||(interactionMode==='DRAW_SHAPE'&&drawShapeType==='LINE')");
    expect(designer).toContain("shapeType:interactionMode==='SPLIT'?'LINE':drawShapeType!");
    expect(designer).toContain("splitOnly:interactionMode==='SPLIT'");
    expect(designer).toContain('const snap=drawingSnap(raw,[],op?{x:op.startX,y:op.startY}:undefined)');
    expect(designer).toContain('onPointerMove={moveCanvasWithSplit}');
    expect(designer).toContain('onPointerUp={upCanvasWithLineCommit}');
  });

  it('uses the canonical face splitter and removes a failed attempted divider',()=>{
    expect(designer).toContain('const split=splitComponentFaceByDivider(nextArt.elements,divider');
    expect(designer).toContain('else if(draft.splitOnly){splitFailed=true;return t;}');
    expect(designer).toContain('Line must start and end on a shape boundary to split it');
    expect(designer).toContain('Split complete — parts are independently editable');
  });

  it('keeps boolean Subtract distinct and documented',()=>{
    expect(toolbar).toContain('Subtract — remove the top/cutter path area from the bottom/base path');
    expect(toolbar).toContain("doBooleanOperation('SUBTRACT')");
  });

  it('does not rename or replace internal Trimmer behavior',()=>{
    expect(designer).toContain("interactionMode === 'TRIMMER'");
    expect(designer).toContain('computeIntervals');
    expect(designer).toContain('deleteManualTrimRange');
  });
});
