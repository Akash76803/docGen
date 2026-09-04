import {describe,expect,it} from 'vitest';import fs from 'node:fs';import path from 'node:path';
const source=fs.readFileSync(path.resolve(__dirname,'../src/pages/CardDesigner.tsx'),'utf8');
describe('post-trim multi-point weld wiring',()=>{it('canonicalizes every generated trim fragment endpoint in the same commit',()=>{expect(source).toContain('weldPathEndpointsToNearbyNodes(current.elements,fragmentIds)');expect(source).toContain('splitGeometryIntoConnectedFragments(trimmedGeometry)');expect(source).toContain('replaceElementsAtLayer(template,artboard.id,[sourceId],fragments)');});});
