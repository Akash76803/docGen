/** VECTOR-UX2 Fix9 source-level regression markers.
 * Runtime UI verification remains part of MANUAL_SMOKE_TESTS.md.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(resolve(here, 'CardDesigner.tsx'), 'utf8');

const required = [
  'doubleClickIntersectionSnap',
  "detailId:'DOUBLE_CLICK_NEAREST_INTERSECTION'",
  "interactionMode==='FLEXIBLE_LINE'",
  "interactionMode==='DRAW_SHAPE'&&drawShapeType==='LINE'",
  'moveOpenLinearPathEndpointToWorld',
  'Nearest Intersection',
];
for (const marker of required) {
  if (!source.includes(marker)) throw new Error(`Missing Fix9 marker: ${marker}`);
}
console.log('VECTOR-UX2 Fix9 source markers PASS');
