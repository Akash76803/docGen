import { describe, expect, it } from 'vitest';
import fs from 'node:fs';import path from 'node:path';
const source=fs.readFileSync(path.resolve(process.cwd(),'apps/desktop/src/pages/CardDesigner.tsx'),'utf8');
describe('Phase 9.4L-M dieline import UI wiring',()=>{
 it('exposes SVG import, technical assignment and manual panel mapping controls',()=>{
  expect(source).toContain('Import SVG Dieline');expect(source).toContain("assign('CUT')");expect(source).toContain("assign('CREASE')");expect(source).toContain('Map Selected Bounds as Panel');expect(source).toContain('Lock / Unlock CUT + CREASE');
 });
});
