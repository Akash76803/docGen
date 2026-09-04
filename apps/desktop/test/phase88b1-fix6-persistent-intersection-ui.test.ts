import {describe,expect,it} from 'vitest';import fs from 'node:fs';import path from 'node:path';
const source=fs.readFileSync(path.resolve(__dirname,'../src/pages/CardDesigner.tsx'),'utf8');
describe('persistent intersection UI wiring',()=>{it('materializes intersections before automatic face splitting',()=>{const materialize=source.indexOf('materializeStraightPathIntersections(a.elements,[newId])'),split=source.indexOf('splitComponentFaceByDivider(nextArt.elements,divider');expect(materialize).toBeGreaterThan(0);expect(split).toBeGreaterThan(materialize);});});
