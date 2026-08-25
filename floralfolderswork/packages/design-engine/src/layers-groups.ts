import type { Artboard, DesignElement, DesignGroup, DesignPoint, DesignTemplate } from '@document-tool/contracts';
import { getSelectionBounds, normalizeRotationDeg } from './transform.js';

function updateArtboard(template:DesignTemplate,artboardId:string,fn:(a:Artboard)=>Artboard):DesignTemplate{
 return {...template,artboards:template.artboards.map(a=>a.id===artboardId?fn(a):a)};
}
function normalize(elements:DesignElement[]):DesignElement[]{
 return [...elements].sort((a,b)=>a.zIndex-b.zIndex||a.id.localeCompare(b.id)).map((e,i)=>({...e,zIndex:i}));
}
export function orderedLayers(artboard:Artboard):DesignElement[]{return [...artboard.elements].sort((a,b)=>b.zIndex-a.zIndex||a.id.localeCompare(b.id));}
export function renameElement(template:DesignTemplate,artboardId:string,elementId:string,name:string):DesignTemplate{
 const n=name.trim();if(!n)return template;return updateArtboard(template,artboardId,a=>({...a,elements:a.elements.map(e=>e.id===elementId?{...e,name:n}:e)}));
}
export function setElementVisibility(template:DesignTemplate,artboardId:string,elementId:string,visible:boolean):DesignTemplate{
 return updateArtboard(template,artboardId,a=>({...a,elements:a.elements.map(e=>e.id===elementId?{...e,visible}:e)}));
}
export function setElementLocked(template:DesignTemplate,artboardId:string,elementId:string,locked:boolean):DesignTemplate{
 return updateArtboard(template,artboardId,a=>({...a,elements:a.elements.map(e=>e.id===elementId?{...e,locked}:e)}));
}
export type LayerMove='FORWARD'|'BACKWARD'|'FRONT'|'BACK';
export function moveLayer(template:DesignTemplate,artboardId:string,elementId:string,move:LayerMove):DesignTemplate{
 return updateArtboard(template,artboardId,a=>{const asc=normalize(a.elements);const i=asc.findIndex(e=>e.id===elementId);if(i<0)return a;let target=i;if(move==='FORWARD')target=Math.min(asc.length-1,i+1);if(move==='BACKWARD')target=Math.max(0,i-1);if(move==='FRONT')target=asc.length-1;if(move==='BACK')target=0;if(target===i)return {...a,elements:asc};const next=[...asc], [item]=next.splice(i,1);next.splice(target,0,item!);return{...a,elements:next.map((e,zIndex)=>({...e,zIndex}))};});
}
export function duplicateDesignElements(template:DesignTemplate,artboardId:string,elementIds:readonly string[],idFactory:(sourceId:string)=>string,offset:DesignPoint={xMm:2,yMm:2}):{template:DesignTemplate;elementIds:string[]}{
 const art=template.artboards.find(a=>a.id===artboardId);if(!art)return{template,elementIds:[]};const ids=new Set(elementIds);const sources=art.elements.filter(e=>ids.has(e.id));if(!sources.length)return{template,elementIds:[]};const maxZ=art.elements.length?Math.max(...art.elements.map(e=>e.zIndex)): -1;const map=new Map<string,string>();sources.forEach(e=>map.set(e.id,idFactory(e.id)));const groupMap=new Map<string,string>();for(const g of art.groups){if(g.elementIds.some(x=>ids.has(x)))groupMap.set(g.id,idFactory(g.id));}
 const clones=sources.map((e,i)=>({...e,id:map.get(e.id)!,name:`${e.name} Copy`,position:{xMm:e.position.xMm+offset.xMm,yMm:e.position.yMm+offset.yMm},zIndex:maxZ+i+1,groupId:e.groupId&&groupMap.has(e.groupId)?groupMap.get(e.groupId):undefined}));
 const groups:DesignGroup[]=[];for(const g of art.groups){const gid=groupMap.get(g.id);if(!gid)continue;const members=g.elementIds.filter(x=>ids.has(x)).map(x=>map.get(x)!).filter(Boolean);if(members.length>1)groups.push({...g,id:gid,name:`${g.name} Copy`,elementIds:members,parentGroupId:undefined});}
 const next=updateArtboard(template,artboardId,a=>({...a,elements:normalize([...a.elements,...clones]),groups:[...a.groups,...groups]}));return{template:next,elementIds:clones.map(e=>e.id)};
}
export function groupElements(template:DesignTemplate,artboardId:string,elementIds:readonly string[],groupId:string,name='Group'):DesignTemplate{
 const ids=[...new Set(elementIds)];if(ids.length<2)return template;return updateArtboard(template,artboardId,a=>{const selectable=a.elements.filter(e=>ids.includes(e.id)&&!e.groupId);if(selectable.length<2)return a;const memberIds=selectable.map(e=>e.id);const group:DesignGroup={id:groupId,name,elementIds:memberIds,visible:true,locked:false};return{...a,groups:[...a.groups,group],elements:a.elements.map(e=>memberIds.includes(e.id)?{...e,groupId}:e)};});
}
export function ungroupElements(template:DesignTemplate,artboardId:string,groupId:string):DesignTemplate{
 return updateArtboard(template,artboardId,a=>({...a,groups:a.groups.filter(g=>g.id!==groupId),elements:a.elements.map(e=>e.groupId===groupId?{...e,groupId:undefined}:e)}));
}
export function groupForElement(artboard:Artboard,elementId:string):DesignGroup|undefined{const e=artboard.elements.find(x=>x.id===elementId);return e?.groupId?artboard.groups.find(g=>g.id===e.groupId):undefined;}
export function expandElementIdsToGroups(artboard:Artboard,elementIds:readonly string[]):string[]{const out=new Set(elementIds);for(const id of elementIds){const g=groupForElement(artboard,id);g?.elementIds.forEach(x=>out.add(x));}return [...out];}
export function setGroupLocked(template:DesignTemplate,artboardId:string,groupId:string,locked:boolean):DesignTemplate{return updateArtboard(template,artboardId,a=>{const g=a.groups.find(x=>x.id===groupId);if(!g)return a;const ids=new Set(g.elementIds);return{...a,groups:a.groups.map(x=>x.id===groupId?{...x,locked}:x),elements:a.elements.map(e=>ids.has(e.id)?{...e,locked}:e)};});}
export function setGroupVisibility(template:DesignTemplate,artboardId:string,groupId:string,visible:boolean):DesignTemplate{return updateArtboard(template,artboardId,a=>{const g=a.groups.find(x=>x.id===groupId);if(!g)return a;const ids=new Set(g.elementIds);return{...a,groups:a.groups.map(x=>x.id===groupId?{...x,visible}:x),elements:a.elements.map(e=>ids.has(e.id)?{...e,visible}:e)};});}
export function scaleElements(template:DesignTemplate,artboardId:string,elementIds:readonly string[],scaleX:number,scaleY=scaleX):DesignTemplate{
 if(!Number.isFinite(scaleX)||!Number.isFinite(scaleY)||scaleX<=0||scaleY<=0)return template;const art=template.artboards.find(a=>a.id===artboardId);if(!art)return template;const ids=new Set(elementIds);const members=art.elements.filter(e=>ids.has(e.id)&&!e.locked);const b=getSelectionBounds(members);if(!b)return template;return updateArtboard(template,artboardId,a=>({...a,elements:a.elements.map(e=>!ids.has(e.id)||e.locked?e:{...e,position:{xMm:b.xMm+(e.position.xMm-b.xMm)*scaleX,yMm:b.yMm+(e.position.yMm-b.yMm)*scaleY},size:{widthMm:Math.max(.5,e.size.widthMm*scaleX),heightMm:Math.max(.5,e.size.heightMm*scaleY)}})}));
}
export function rotateElementsAsGroup(template:DesignTemplate,artboardId:string,elementIds:readonly string[],deltaDeg:number):DesignTemplate{
 if(!Number.isFinite(deltaDeg))return template;const art=template.artboards.find(a=>a.id===artboardId);if(!art)return template;const ids=new Set(elementIds);const members=art.elements.filter(e=>ids.has(e.id)&&!e.locked);const b=getSelectionBounds(members);if(!b)return template;const cx=b.xMm+b.widthMm/2,cy=b.yMm+b.heightMm/2,rad=deltaDeg*Math.PI/180,cos=Math.cos(rad),sin=Math.sin(rad);return updateArtboard(template,artboardId,a=>({...a,elements:a.elements.map(e=>{if(!ids.has(e.id)||e.locked)return e;const ex=e.position.xMm+e.size.widthMm/2,ey=e.position.yMm+e.size.heightMm/2,dx=ex-cx,dy=ey-cy,nx=cx+dx*cos-dy*sin,ny=cy+dx*sin+dy*cos;return{...e,position:{xMm:nx-e.size.widthMm/2,yMm:ny-e.size.heightMm/2},rotationDeg:normalizeRotationDeg(e.rotationDeg+deltaDeg)};})}));
}
