/** VECTOR-UX2 Fix10 source-level regression markers.
 * Runtime UI verification remains part of MANUAL_SMOKE_TESTS.md.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(resolve(here, 'CardDesigner.tsx'), 'utf8');
const panel = readFileSync(resolve(here, '../../components/designer/ElementLibraryPanel.tsx'), 'utf8');

const required = [
  "interactionMode==='PARALLEL_LINE'",
  "interactionMode==='PERPENDICULAR_LINE'",
  'nearestRelationReference',
  'relationTargetAngle',
  'constrainRelationPoint',
  'data-cad-relation-reference',
  'data-right-angle-marker',
  'Offset ${pointToSegmentDistance',
  "setStatus('Parallel — hover a line or Polyline segment to choose reference')",
  "setStatus('Perpendicular — hover a line or Polyline segment to choose reference')",
];
for (const marker of required) if (!source.includes(marker)) throw new Error(`Missing Fix10 marker: ${marker}`);
for (const marker of ["label: 'Parallel Line'", "label: 'Perpendicular Line'"]) if (!panel.includes(marker)) throw new Error(`Missing Fix10 panel marker: ${marker}`);
console.log('VECTOR-UX2 Fix10 source markers PASS');
