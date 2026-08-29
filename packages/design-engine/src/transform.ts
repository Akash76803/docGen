import type { Artboard, DesignElement, DesignPoint, DesignSize, DesignTemplate, PathDesignElement } from '@document-tool/contracts';
import { scalePathGeometry } from './pathUtils.js';

export const DEFAULT_MIN_ELEMENT_SIZE_MM = 0.5;
export const DEFAULT_NUDGE_MM = 0.5;
export const DEFAULT_LARGE_NUDGE_MM = 5;

export interface DesignRectMm { xMm:number; yMm:number; widthMm:number; heightMm:number; }
export interface ResizeElementOptions {
  anchor?: 'NW'|'N'|'NE'|'E'|'SE'|'S'|'SW'|'W';
  maintainAspectRatio?: boolean;
  minSizeMm?: number;
}

function updateArtboard(template:DesignTemplate, artboardId:string, updater:(artboard:Artboard)=>Artboard):DesignTemplate {
  return {...template,artboards:template.artboards.map(a=>a.id===artboardId?updater(a):a)};
}

export function normalizeRotationDeg(value:number):number {
  if(!Number.isFinite(value)) return 0;
  const normalized=((value%360)+360)%360;
  return Math.abs(normalized-360)<1e-9?0:normalized;
}

export function getElementRect(element:DesignElement):DesignRectMm {
  return {xMm:element.position.xMm,yMm:element.position.yMm,widthMm:element.size.widthMm,heightMm:element.size.heightMm};
}

export function elementContainsPoint(element:DesignElement, point:DesignPoint):boolean {
  // Selection hit testing deliberately uses the unrotated layout box in 6.0.3.
  // Rotated polygon hit testing can be layered on later without changing transform contracts.
  const r=getElementRect(element);
  return point.xMm>=r.xMm&&point.xMm<=r.xMm+r.widthMm&&point.yMm>=r.yMm&&point.yMm<=r.yMm+r.heightMm;
}

export function rectIntersects(a:DesignRectMm,b:DesignRectMm):boolean {
  return a.xMm<=b.xMm+b.widthMm&&a.xMm+a.widthMm>=b.xMm&&a.yMm<=b.yMm+b.heightMm&&a.yMm+a.heightMm>=b.yMm;
}

export function getSelectionBounds(elements:DesignElement[]):DesignRectMm|null {
  const visible=elements.filter(e=>e.visible);
  if(!visible.length)return null;
  const minX=Math.min(...visible.map(e=>e.position.xMm));
  const minY=Math.min(...visible.map(e=>e.position.yMm));
  const maxX=Math.max(...visible.map(e=>e.position.xMm+e.size.widthMm));
  const maxY=Math.max(...visible.map(e=>e.position.yMm+e.size.heightMm));
  return {xMm:minX,yMm:minY,widthMm:maxX-minX,heightMm:maxY-minY};
}

export function moveElements(template:DesignTemplate,artboardId:string,elementIds:readonly string[],delta:DesignPoint):DesignTemplate {
  if(!Number.isFinite(delta.xMm)||!Number.isFinite(delta.yMm))return template;
  const ids=new Set(elementIds);
  return updateArtboard(template,artboardId,a=>({...a,elements:a.elements.map(e=>ids.has(e.id)&&!e.locked?{...e,position:{xMm:e.position.xMm+delta.xMm,yMm:e.position.yMm+delta.yMm}}:e)}));
}

export function setElementPosition(template:DesignTemplate,artboardId:string,elementId:string,position:DesignPoint):DesignTemplate {
  if(!Number.isFinite(position.xMm)||!Number.isFinite(position.yMm))return template;
  return updateArtboard(template,artboardId,a=>({...a,elements:a.elements.map(e=>e.id===elementId&&!e.locked?{...e,position:{...position}}:e)}));
}

export function resizeElement(template:DesignTemplate,artboardId:string,elementId:string,size:DesignSize,options:ResizeElementOptions={}):DesignTemplate {
  const min=Math.max(0.001,options.minSizeMm??DEFAULT_MIN_ELEMENT_SIZE_MM);
  if(!Number.isFinite(size.widthMm)||!Number.isFinite(size.heightMm))return template;
  return updateArtboard(template,artboardId,a=>({...a,elements:a.elements.map(e=>{
    if(e.id!==elementId||e.locked)return e;
    let width=Math.max(min,size.widthMm),height=Math.max(min,size.heightMm);
    const keep=options.maintainAspectRatio??(e.type==='IMAGE'&&e.maintainAspectRatio===true);
    if(keep&&e.size.widthMm>0&&e.size.heightMm>0){
      const ratio=e.size.widthMm/e.size.heightMm;
      const widthChange=Math.abs(width-e.size.widthMm)/Math.max(e.size.widthMm,1e-9);
      const heightChange=Math.abs(height-e.size.heightMm)/Math.max(e.size.heightMm,1e-9);
      if(widthChange>=heightChange)height=Math.max(min,width/ratio);else width=Math.max(min,height*ratio);
    }
    const anchor=options.anchor??'SE';
    let x=e.position.xMm,y=e.position.yMm;
    if(anchor.includes('W'))x=e.position.xMm+(e.size.widthMm-width);
    else if(anchor==='N'||anchor==='S')x=e.position.xMm+(e.size.widthMm-width)/2;
    if(anchor.includes('N'))y=e.position.yMm+(e.size.heightMm-height);
    else if(anchor==='E'||anchor==='W')y=e.position.yMm+(e.size.heightMm-height)/2;
    
    if (e.type === 'PATH' && e.size.widthMm > 0 && e.size.heightMm > 0) {
      const scaleX = width / e.size.widthMm;
      const scaleY = height / e.size.heightMm;
      return {...e, position:{xMm:x,yMm:y}, size:{widthMm:width,heightMm:height}, geometry: scalePathGeometry((e as PathDesignElement).geometry, scaleX, scaleY)};
    }
    
    return {...e,position:{xMm:x,yMm:y},size:{widthMm:width,heightMm:height}};
  })}));
}

export function rotateElement(template:DesignTemplate,artboardId:string,elementId:string,rotationDeg:number):DesignTemplate {
  return updateArtboard(template,artboardId,a=>({...a,elements:a.elements.map(e=>e.id===elementId&&!e.locked?{...e,rotationDeg:normalizeRotationDeg(rotationDeg)}:e)}));
}

export function nudgeElements(template:DesignTemplate,artboardId:string,elementIds:readonly string[],direction:'LEFT'|'RIGHT'|'UP'|'DOWN',large=false,stepMm=DEFAULT_NUDGE_MM,largeStepMm=DEFAULT_LARGE_NUDGE_MM):DesignTemplate {
  const amount=large?largeStepMm:stepMm;
  const delta:DesignPoint=direction==='LEFT'?{xMm:-amount,yMm:0}:direction==='RIGHT'?{xMm:amount,yMm:0}:direction==='UP'?{xMm:0,yMm:-amount}:{xMm:0,yMm:amount};
  return moveElements(template,artboardId,elementIds,delta);
}
