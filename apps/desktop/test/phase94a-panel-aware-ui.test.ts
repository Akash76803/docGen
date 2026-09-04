import { describe,expect,it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('Phase 9.4A-C packaging panel UI',()=>{
 const source=readFileSync(new URL('../src/pages/CardDesigner.tsx',import.meta.url),'utf8');
 it('wires packaging panel mode, selection and focus mode',()=>{
  expect(source).toContain('packagingPanelsFromArtboard');
  expect(source).toContain('data-packaging-panel-overlay');
  expect(source).toContain('data-packaging-focus-mask');
  expect(source).toContain('Focus Panel');
  expect(source).toContain('Exit Panel');
 });
});
