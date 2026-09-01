import {describe,expect,it} from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(process.cwd());
const designer=()=>fs.readFileSync(path.join(root,'apps/desktop/src/pages/CardDesigner.tsx'),'utf8');
const exporter=()=>fs.readFileSync(path.join(root,'apps/desktop/src/pages/CardExportCanvas.tsx'),'utf8');

describe('Phase 8.2 styling UI/export wiring',()=>{
 it('exposes radial, pattern and persistent image crop controls',()=>{
  const source=designer();
  expect(source).toContain('Radial Gradient');
  expect(source).toContain('data-phase82-fill-controls');
  expect(source).toContain('data-phase82-image-crop-controls');
  expect(source).toContain('Zoom (%)');
  expect(source).toContain('Offset X (%)');
  expect(source).toContain('Reset Crop');
 });
 it('exposes advanced stroke controls while keeping center alignment explicit',()=>{
  const source=designer();
  expect(source).toContain('Custom Dash');
  expect(source).toContain('Line cap');
  expect(source).toContain('Line join');
  expect(source).toContain('Stroke alignment: Center');
 });
 it('uses matching radial, pattern, crop and stroke properties in export renderer',()=>{
  const source=exporter();
  expect(source).toContain("fill.type==='RADIAL_GRADIENT'");
  expect(source).toContain("fill.type==='PATTERN'");
  expect(source).toContain('normalizeImageFillTransform(fill.transform)');
  expect(source).toContain('normalizeStrokeDashArray(stroke)');
  expect(source).toContain('strokeLinecap');
  expect(source).toContain('strokeLinejoin');
 });
});
