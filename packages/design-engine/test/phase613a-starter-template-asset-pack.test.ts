import { describe,expect,it } from 'vitest';
import { DECORATIVE_ASSETS,DESIGN_STARTER_TEMPLATES,validateDesignTemplate } from '../src/index.js';

describe('Phase 6.1.3A starter template and floral asset pack',()=>{
  it('ships eight editable starter templates',()=>{
    expect(DESIGN_STARTER_TEMPLATES).toHaveLength(8);
    expect(new Set(DESIGN_STARTER_TEMPLATES.map(t=>t.id)).size).toBe(8);
  });
  it('all starter templates satisfy the shared design contract',()=>{
    for(const starter of DESIGN_STARTER_TEMPLATES){
      const t=starter.create(prefix=>`${starter.id}-${prefix}`);
      const validation=validateDesignTemplate(t);
      expect(validation.errors,starter.name).toEqual([]);
      expect(t.artboards.length).toBeGreaterThan(0);
      expect(t.artboards.every(a=>a.elements.length>0)).toBe(true);
    }
  });
  it('includes front and back templates where appropriate',()=>{
    for(const id of ['corporate-employee-id-cr80','modern-business-card'] as const){
      const t=DESIGN_STARTER_TEMPLATES.find(x=>x.id===id)!.create(p=>`${id}-${p}`);
      expect(t.artboards.map(a=>a.name)).toEqual(['Front','Back']);
    }
  });
  it('ships ten embedded floral/decorative SVG assets',()=>{
    expect(DECORATIVE_ASSETS).toHaveLength(10);
    expect(new Set(DECORATIVE_ASSETS.map(a=>a.id)).size).toBe(10);
    expect(DECORATIVE_ASSETS.every(a=>a.source.startsWith('data:image/svg+xml'))).toBe(true);
  });
  it('floral templates reference only assets bundled into that template',()=>{
    for(const starter of DESIGN_STARTER_TEMPLATES){
      const t=starter.create(p=>`${starter.id}-${p}`);
      const assetIds=new Set(t.sharedAssets.map(a=>a.id));
      for(const artboard of t.artboards){
        for(const e of artboard.elements){
          if(e.type==='SVG')expect(assetIds.has(e.assetId),`${starter.name}: ${e.name}`).toBe(true);
        }
      }
    }
  });
});
