import {describe,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const designer=readFileSync(resolve(process.cwd(),'apps/desktop/src/pages/CardDesigner.tsx'),'utf8');

describe('Phase 7.4 CAD Trimmer addendum',()=>{
 it('acquires every eligible path without requiring preselection',()=>{expect(designer).toContain("const trimmerTarget = interactionMode === 'TRIMMER' ? trimmerTargets.get(e.id) : undefined");});
 it('disables Select movement while Trimmer owns the command',()=>{expect(designer).toContain("interactionMode==='DRAW_SHAPE' || interactionMode==='TRIMMER')return;capture");});
 it('renders only one contextual primary snap marker per hovered target',()=>{expect(designer).toContain('data-trim-snap-marker');expect(designer).toContain("p.id!==trimSnap?.nodeId)return null");});
 it('prioritizes nodes, then local intersections, then nearest path',()=>{const node=designer.indexOf("kind:'NODE' as const"),intersection=designer.indexOf("kind:'INTERSECTION'"),nearest=designer.indexOf("kind:'NEAREST' as const");expect(node).toBeGreaterThan(0);expect(node).toBeLessThan(intersection);expect(intersection).toBeLessThan(nearest);});
 it('uses zoom-aware screen tolerance and exact snapped t',()=>{expect(designer).toContain('8/(MM_TO_CSS_PX*(zoom/100))');expect(designer).toContain('selectTrimPointOnSegment(seg.id, snappedT)');});
 it('retains smart interval trim and exposes manual A/B even with intersections',()=>{expect(designer).toContain("ev.shiftKey||trimSnap?.kind==='NODE'||trimSnap?.kind==='INTERSECTION'");expect(designer).toContain('setSelectedInterval(hoveredInterval)');});
 it('deletes only selected geometry through the fragment-aware callback',()=>{expect(designer).toContain('onTrimGeometry(deletePathSegmentRange(activeGeometry, selectedTrimRoute))');expect(designer).toContain('onTrimGeometry(trimSegmentInterval(element.geometry, segmentId, tStart, tEnd))');expect(designer).toContain('splitGeometryIntoConnectedFragments(trimmedGeometry)');});
 it('keeps Trimmer active after deletion and stages Escape before exit',()=>{expect(designer).not.toContain("deleteManualTrimRange();setInteractionMode('SELECT')");expect(designer).toContain('if (trimStartNodeId || trimEndNodeId || trimGeometry)');expect(designer).toContain('clearManualTrim();');expect(designer).toMatch(/interactionMode==='EDIT_PATH'\|\|interactionMode==='SCISSORS'\|\|interactionMode==='TRIMMER'/);expect(designer).toContain("endHistoryTransaction();setInteractionMode('SELECT')");});
 it('keeps the Trimmer cursor above canvas, shell, path and node states',()=>{expect(designer.match(/TRIMMER_CURSOR/g)?.length).toBeGreaterThanOrEqual(5);});
 it('provides compact CAD command states and closed-route side switching',()=>{expect(designer).toContain('ERASE SEGMENT — Select interval or first point');expect(designer).toContain('ERASE SEGMENT — Select second point');expect(designer).toContain('ERASE SEGMENT — Press Delete to remove selected interval');expect(designer).toContain('Switch Side');});
});
