import {describe,expect,it} from 'vitest';
import {createCorporateEmployeeIdTemplate,validateDesignTemplate} from '../src/index.js';

describe('default Corporate Employee ID Card starter template',()=>{
 it('creates a valid editable CR80 Front + Back template',()=>{
  let n=0;const t=createCorporateEmployeeIdTemplate(p=>`${p}-${++n}`);
  expect(t.name).toBe('Corporate Employee ID Card');
  expect(t.artboards).toHaveLength(2);
  expect(t.artboards.map(a=>a.name)).toEqual(['Front','Back']);
  for(const a of t.artboards){expect(a.widthMm).toBe(85.6);expect(a.heightMm).toBe(53.98);expect(a.print.bleed.topMm).toBe(3);expect(a.elements.length).toBeGreaterThan(10);}
  expect(t.artboards[0]!.elements.some(e=>e.type==='TEXT'&&e.binding?.path==='Employee.Name')).toBe(true);
  expect(t.artboards[1]!.elements.some(e=>e.type==='TEXT'&&e.binding?.path==='Employee.EmergencyContact')).toBe(true);
  expect(validateDesignTemplate(t).valid).toBe(true);
 });
 it('uses independent ids across repeated template creation',()=>{
  let n=0;const f=(p:string)=>`${p}-${++n}`;const a=createCorporateEmployeeIdTemplate(f),b=createCorporateEmployeeIdTemplate(f);expect(a.id).not.toBe(b.id);expect(a.artboards[0]!.id).not.toBe(b.artboards[0]!.id);
 });
});
