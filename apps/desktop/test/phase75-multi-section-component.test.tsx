import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const source = readFileSync(resolve(process.cwd(),'apps/desktop/src/pages/CardDesigner.tsx'),'utf8');

describe('Phase 7.5 multi-section component UI integration',()=>{
  it('routes committed CAD lines through current-face discovery instead of same-element-only snapping',()=>{
    expect(source).toContain('splitComponentFaceByDivider');
    expect(source).not.toContain("draft.startSnap.elementId===endSnap.elementId");
  });


  it('does not require snap metadata before asking geometry to split a committed line',()=>{
    expect(source).toContain("if(draft.shapeType==='LINE')");
    expect(source).not.toContain("draft.shapeType==='LINE'&&draft.startSnap&&endSnap");
    expect(source).not.toContain("interactionMode!=='FLEXIBLE_LINE'||!snap");
  });

  it('allows auto-generated sections to be selected individually for independent fill editing',()=>{
    expect(source).toContain("e.metadata?.faceGeneration==='AUTO_SECTION'&&!ev.altKey?[e.id]");
    expect(source).toContain("layer.metadata?.faceGeneration==='AUTO_SECTION'&&!event.altKey?[layer.id]");
    expect(source).toContain('Alt+Click: select component');
  });

  it('keeps strict two-click CAD commit semantics',()=>{
    expect(source).toContain("if(existing&&!existing.pointerIsDown)");
    expect(source).toContain('commitDrawDraft(existing,p,snap)');
  });

  it('reveals the generated sections by selecting only one face after a successful split',()=>{
    expect(source).toContain("const firstFaceId=generatedFaceIds[0]!");
    expect(source).toContain("elementIds:[firstFaceId],primaryElementId:firstFaceId");
    expect(source).not.toContain("elementIds:generatedFaceIds,primaryElementId:generatedFaceIds[0]");
  });
});
