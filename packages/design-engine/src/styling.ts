import type { DesignElement,DesignFill,DesignGradientStop,DesignLinearGradient,DesignShadow,DesignStroke,DesignTemplate } from '@document-tool/contracts';

export type StyleClipboardKind='TEXT'|'SHAPE'|'IMAGE'|'SVG';
export interface DesignStyleClipboard { kind:StyleClipboardKind; opacity:number; visual:Record<string,unknown>; }

export const DEFAULT_DESIGN_SHADOW:DesignShadow={enabled:false,color:'#000000',opacity:.25,offsetXmm:1,offsetYmm:1,blurMm:2};
export const DEFAULT_DESIGN_STROKE:DesignStroke={color:'#000000',widthMm:0,style:'NONE',opacity:1};
export const DEFAULT_SHAPE_FILL:DesignFill={type:'SOLID',color:'#dbeafe',opacity:1};

const supported=(element:DesignElement):element is Extract<DesignElement,{type:StyleClipboardKind}>=>['TEXT','SHAPE','IMAGE','SVG'].includes(element.type);
const clone=<T>(value:T):T=>JSON.parse(JSON.stringify(value)) as T;
export const normalizeStyleOpacity=(value:number)=>Number.isFinite(value)?Math.min(1,Math.max(0,value)):1;
export const normalizeGradientAngle=(value:number)=>Number.isFinite(value)?Math.min(360,Math.max(0,value)):0;
export const normalizeGradientStopPosition=(value:number)=>Number.isFinite(value)?Math.min(100,Math.max(0,value)):0;

export function normalizeLinearGradient(gradient:Partial<DesignLinearGradient>={}):DesignLinearGradient {
  const supplied=Array.isArray(gradient.stops)?gradient.stops:[];
  const fallback:DesignGradientStop[]=[{offset:0,color:'#2563eb'},{offset:100,color:'#dbeafe'}];
  const stops=(supplied.length>=2?supplied:fallback).map(stop=>({...stop,offset:normalizeGradientStopPosition(stop.offset),opacity:stop.opacity===undefined?undefined:normalizeStyleOpacity(stop.opacity)}));
  return {type:'LINEAR',angleDeg:normalizeGradientAngle(gradient.angleDeg??0),stops};
}

export function createLinearGradientFill(angleDeg=0,stops?:DesignGradientStop[]):DesignFill {
  return {type:'LINEAR_GRADIENT',gradient:normalizeLinearGradient({type:'LINEAR',angleDeg,stops})};
}

export function copyDesignElementStyle(element:DesignElement):DesignStyleClipboard|null {
  if(!supported(element))return null;
  switch(element.type){
    case 'TEXT': return {kind:'TEXT',opacity:normalizeStyleOpacity(element.opacity),visual:clone({style:element.style,shadow:element.shadow})};
    case 'SHAPE': return {kind:'SHAPE',opacity:normalizeStyleOpacity(element.opacity),visual:clone({fill:element.fill,stroke:element.stroke,cornerRadiusMm:element.cornerRadiusMm,shadow:element.shadow})};
    case 'IMAGE': return {kind:'IMAGE',opacity:normalizeStyleOpacity(element.opacity),visual:clone({fit:element.fit,flipX:element.flipX,flipY:element.flipY,maintainAspectRatio:element.maintainAspectRatio,cornerRadiusMm:element.cornerRadiusMm,stroke:element.stroke,shadow:element.shadow})};
    case 'SVG': return {kind:'SVG',opacity:normalizeStyleOpacity(element.opacity),visual:clone({preserveVector:element.preserveVector,tintColor:element.tintColor,stroke:element.stroke,shadow:element.shadow})};
  }
}

export function pasteDesignElementStyle(element:DesignElement,clipboard:DesignStyleClipboard):DesignElement {
  if(!supported(element))return element;
  const opacity=normalizeStyleOpacity(clipboard.opacity);
  if(element.type!==clipboard.kind)return {...element,opacity};
  const visual=clone(clipboard.visual);
  switch(element.type){
    case 'TEXT': return {...element,opacity,...visual} as typeof element;
    case 'SHAPE': return {...element,opacity,...visual} as typeof element;
    case 'IMAGE': return {...element,opacity,...visual} as typeof element;
    case 'SVG': return {...element,opacity,...visual} as typeof element;
  }
}

export function resetDesignElementStyle(element:DesignElement):DesignElement {
  switch(element.type){
    case 'TEXT': return {...element,opacity:1,style:{fontFamily:'Arial',fontSizePt:18,fontWeight:400,italic:false,underline:false,color:'#111827',alignment:'LEFT',lineHeight:1.2,letterSpacingPt:0},shadow:clone(DEFAULT_DESIGN_SHADOW)};
    case 'SHAPE': return {...element,opacity:1,fill:clone(DEFAULT_SHAPE_FILL),stroke:{color:'#2563eb',widthMm:.35,style:'SOLID',opacity:1},cornerRadiusMm:element.shape==='ROUNDED_RECTANGLE'?3:0,shadow:clone(DEFAULT_DESIGN_SHADOW)};
    case 'IMAGE': return {...element,opacity:1,fit:'FIT',flipX:false,flipY:false,maintainAspectRatio:true,cornerRadiusMm:0,stroke:clone(DEFAULT_DESIGN_STROKE),shadow:clone(DEFAULT_DESIGN_SHADOW),hyperlink:undefined};
    case 'SVG': return {...element,opacity:1,preserveVector:true,tintColor:undefined,stroke:clone(DEFAULT_DESIGN_STROKE),shadow:clone(DEFAULT_DESIGN_SHADOW)};
    default:return element;
  }
}

export function updateElementsOpacity(template:DesignTemplate,artboardId:string,elementIds:readonly string[],opacity:number):DesignTemplate {
  const ids=new Set(elementIds),normalized=normalizeStyleOpacity(opacity);
  return {...template,artboards:template.artboards.map(a=>a.id===artboardId?{...a,elements:a.elements.map(e=>ids.has(e.id)&&!e.locked&&supported(e)?{...e,opacity:normalized}:e)}:a)};
}
