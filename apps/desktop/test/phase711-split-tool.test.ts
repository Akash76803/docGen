import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {describe,expect,it} from 'vitest';

const designer=readFileSync(resolve(process.cwd(),'apps/desktop/src/pages/CardDesigner.tsx'),'utf8');
const library=readFileSync(resolve(process.cwd(),'apps/desktop/src/components/designer/ElementLibraryPanel.tsx'),'utf8');
const toolbar=readFileSync(resolve(process.cwd(),'apps/desktop/src/components/designer/DesignerContextToolbar.tsx'),'utf8');

describe('dedicated Divider / Split tool',()=>{
  it('is visible, selectable, and described independently from path tools',()=>{
    expect(library).toContain("id: 'split', label: 'Split'");
    expect(library).toContain("onSetInteractionMode?.('SPLIT')");
    expect(library).toContain('create separate, independently editable parts');
    expect(library).toContain("id: 'trimmer', label: 'Erase Segment'");
    expect(library).toContain("id: 'scissors', label: 'Scissors'");
  });

  it('reuses the live line draft and OSNAP resolver path',()=>{
    expect(designer).toContain("const activeShapeType:DesignShapeKind=interactionMode==='SPLIT'?'LINE':drawShapeType!");
    expect(designer).toContain("intent:interactionMode==='SPLIT'?'SPLIT':'DRAW'");
    expect(designer).toContain("const splitOnly=draft.intent==='SPLIT'");
    expect(designer).toContain('const snap=useCadSnap?drawingSnap(raw,[],existing?{x:existing.startX,y:existing.startY}:undefined)');
    expect(designer).toContain("interactionMode==='SPLIT'||activeShapeType==='LINE'");
  });

  it('uses the canonical face splitter and removes a failed attempted divider',()=>{
    expect(designer).toContain('const split=splitComponentFaceByDivider([...artboard.elements,divider],divider');
    expect(designer).toContain('Split failed — line must start and end on a closed shape boundary');
    expect(designer).toContain('Split created ${faceIds.length} independent parts');
  });

  it('keeps boolean Subtract distinct and documented',()=>{
    expect(toolbar).toContain('Subtract — subtract every other selected vector from the Primary element.');
    expect(toolbar).toContain("doBooleanOperation('SUBTRACT')");
  });

  it('does not rename or replace internal Trimmer behavior',()=>{
    expect(designer).toContain("interactionMode==='TRIMMER'");
    expect(designer).toContain('computeIntervals');
    expect(designer).toContain('deleteManualTrimRange');
  });
});
