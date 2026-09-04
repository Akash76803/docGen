import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {describe,expect,it} from 'vitest';

const designer=readFileSync(resolve(process.cwd(),'apps/desktop/src/pages/CardDesigner.tsx'),'utf8');
const library=readFileSync(resolve(process.cwd(),'apps/desktop/src/components/designer/ElementLibraryPanel.tsx'),'utf8');
const contextToolbar=readFileSync(resolve(process.cwd(),'apps/desktop/src/components/designer/DesignerContextToolbar.tsx'),'utf8');

describe('Phase 7.11 dedicated Split tool wiring',()=>{
  it('exposes Split as a dedicated interaction mode and utility entry',()=>{
    expect(designer).toContain("'TRIMMER' | 'SPLIT' | 'ERASER'");
    expect(library).toContain("id: 'split', label: 'Split'");
    expect(library).toContain("onSetInteractionMode?.('SPLIT')");
    expect(library).toContain('draw a snapped divider across a closed shape');
  });

  it('shares the existing point-OSNAP line drawing pipeline',()=>{
    expect(designer).toContain("interactionMode==='SPLIT'||interactionMode==='MIRROR_LINE'");
    expect(designer).toContain("(interactionMode==='DRAW_SHAPE'&&drawShapeType==='LINE')");
    expect(designer).toContain("const activeShapeType:DesignShapeKind=interactionMode==='SPLIT'?'LINE':drawShapeType!");
    expect(designer).toContain("intent:interactionMode==='SPLIT'?'SPLIT':'DRAW'");
    expect(designer).toContain('resolvePointSnap(artboard');
  });

  it('calls the existing face-split engine and never persists a failed divider',()=>{
    expect(designer).toContain('splitComponentFaceByDivider([...artboard.elements,divider],divider');
    expect(designer).toContain("Split failed — line must start and end on a closed shape boundary");
    const splitOnlyBlock=designer.slice(designer.indexOf('if(splitOnly){'),designer.indexOf('commitMutate(t=>{',designer.indexOf('if(splitOnly){')));
    expect(splitOnlyBlock).toContain('if(!split)');
    expect(splitOnlyBlock).not.toContain('elements:[...a.elements,divider]');
  });

  it('keeps normal LINE and FLEXIBLE_LINE split behavior in place',()=>{
    expect(designer).toContain("if(draft.shapeType==='LINE'){");
    expect(designer).toContain('splitComponentFaceByDivider(nextArt.elements,divider');
    expect(designer).toContain("if(draft.shapeType==='LINE'&&!splitOnly&&interactionMode!=='ANGLE_LINE')");
    expect(designer).toContain("interactionMode!=='FLEXIBLE_LINE'||selectedEl.metadata?.cadGeometryKind==='POLYLINE'");
  });

  it('relabels Trimmer only in the UI and clarifies destructive tool help',()=>{
    expect(library).toContain("id: 'trimmer', label: 'Erase Segment'");
    expect(library).toContain('remove a path interval between intersections or chosen points');
    expect(library).toContain("id: 'scissors', label: 'Scissors'");
    expect(library).toContain('cut an existing path at a point');
    expect(contextToolbar).toContain('Subtract — subtract every other selected vector from the Primary element.');
    expect(designer).toContain("interactionMode==='TRIMMER'?'ERASE SEGMENT — Select interval or first point'");
  });
});
