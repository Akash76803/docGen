import {describe,it,expect} from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(__dirname,'..','..','..');
const designer=fs.readFileSync(path.join(root,'apps/desktop/src/pages/CardDesigner.tsx'),'utf8');
const snapping=fs.readFileSync(path.join(root,'packages/design-engine/src/pointSnapping.ts'),'utf8');
const regions=fs.readFileSync(path.join(root,'packages/design-engine/src/joinedLineRegion.ts'),'utf8');
describe('VECTOR-UX2 Fix4 page border topology',()=>{
 it('uses enabled page border as snap boundary with corners and intersections',()=>{
  expect(snapping).toContain("label:'Page corner'");
  expect(snapping).toContain("label:'Page border intersection'");
  expect(snapping).toContain("label:'Page border'");
  expect(snapping).toContain("detailId:'PAGE_TOP'");
 });
 it('injects virtual page edges into planar face detection without treating them as source elements',()=>{
  expect(regions).toContain("elementId:'__PAGE_BORDER__'");
  expect(regions).toContain("if(sourceId!=='__PAGE_BORDER__')");
  expect(regions).toContain('boundary?:JoinedLineRegionBoundary');
 });
 it('passes current artboard size and page-border visibility into Fill Bucket face detection',()=>{
  expect(designer).toContain("findJoinedLineRegionAtPoint(artboard.elements,{x:p.xMm,y:p.yMm},{widthMm:artboard.widthMm,heightMm:artboard.heightMm,enabled:pageBorderSettings(artboard).enabled})");
 });
});
