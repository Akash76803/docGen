import {describe,expect,it} from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {resolveDesignerUtilityShortcut} from '../src/components/designer/designerShortcutRegistry.js';

const root=process.cwd();
const designer=fs.readFileSync(path.join(root,'apps/desktop/src/pages/CardDesigner.tsx'),'utf8');
const panel=fs.readFileSync(path.join(root,'apps/desktop/src/components/designer/ElementLibraryPanel.tsx'),'utf8');

describe('Phase 8.8B1 CAD Arc UI',()=>{
 it('exposes an isolated three-point CAD Arc tool',()=>{
  expect(panel).toContain("id: 'cad-arc', label: 'CAD Arc'");
  expect(designer).toContain("if(interactionMode==='ARC')");
  expect(designer).toContain('data-cad-arc-preview');
  expect(designer).toContain("'ARC — Specify through point'");
  expect(designer).toContain("'ARC — Specify end point'");
  expect(designer).toContain("if(interactionMode==='ARC'){\n   e.preventDefault();e.stopPropagation();downCanvas(e);return;");
  expect(designer).toContain("interactionMode === 'ARC') ? 'crosshair'");
 });
 it('commits an editable printable PATH in one history transaction',()=>{
  expect(designer).toContain('createCadArcGeometry(arcDraft.start,arcDraft.through,p)');
  expect(designer).toContain("name:'CAD Arc'");
  expect(designer).toContain('beginHistoryTransaction();');
  expect(designer).toContain('endHistoryTransaction();');
  expect(designer).toContain('createCadArcMetadata');
 });
 it('uses Shift+A without conflicting with A Angle Line or Alt+A Arrow',()=>{
  const event=(options:Partial<KeyboardEvent>)=>({key:'a',altKey:false,ctrlKey:false,metaKey:false,shiftKey:false,...options}) as KeyboardEvent;
  expect(resolveDesignerUtilityShortcut(event({}))).toBe('ANGLE_LINE');
  expect(resolveDesignerUtilityShortcut(event({shiftKey:true}))).toBe('ARC');
  expect(resolveDesignerUtilityShortcut(event({altKey:true}))).toBeNull();
 });
});
