import { describe,it,expect } from 'vitest';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../src/pages/CardDesigner.tsx',import.meta.url),'utf8');

describe('Phase 8.8A3 Fix1 XLINE reference + dynamic input wiring',()=>{
  it('acquires XLINE as a dedicated reference and offers parallel/perpendicular tracking',()=>{
    expect(source).toContain("['XLINE','RAY'].includes(String(el.metadata?.cadGeometryKind))");
    expect(source).toContain("label:`${base} Parallel`");
    expect(source).toContain("label:`${base} Perpendicular`");
  });
  it('renders editable length and angle inputs and exact commit',()=>{
    expect(source).toContain('data-cad-dynamic-input');
    expect(source).toContain('aria-label="CAD line length"');
    expect(source).toContain('aria-label="CAD line angle"');
    expect(source).toContain('resolveCadDynamicEndpoint');
    expect(source).toContain('commitDynamicCadLine');
  });
});
