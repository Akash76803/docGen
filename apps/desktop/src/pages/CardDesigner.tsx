import { getArtboardRole, formatArtboardRole, getArtboardPairLabel, getArtboardSelectionState } from './artboard-ui-helpers.js';
import { buildCardRenderModel, validateExportMemory, type CardExportRequest } from '@document-tool/design-engine';
import { ExportCancellationSource, ExportCancelledError, ExportOrchestrator, RendererRegistry, ZipBundler, type ResolvedExportDocument } from '@document-tool/renderer-sdk';
import { IsolatedCardExportCanvas } from './CardExportCanvas';
import { deliverExportedFiles } from '../services/fileDelivery.js';
import { CardPdfExportRenderer } from '@document-tool/renderer-pdf';
import { registerPngRenderer, registerJpegRenderer, BrowserExactPageRasterizer } from '@document-tool/renderer-image';
import { useEffect,useMemo,useRef,useState } from 'react';
import { createPortal } from 'react-dom';
import type { Artboard,AssetReference,DesignElement,DesignShadow,DesignShapeKind,DesignTemplate,DesignUnit,ImageDesignElement,ShapeDesignElement,SvgDesignElement,TextDesignElement,ArtboardRole } from '@document-tool/contracts';
import {
  ARTBOARD_PRESETS,addArtboard,addAssetReference,addDesignElement,createBlankArtboard,createImageElement,createShapeElement,createTextElement,
  deleteArtboard,deleteDesignElements,duplicateArtboard,emptySelection,getSelectionBounds,mmToUnit,moveArtboard,moveElements,nextElementZIndex,
  normalizeDisplayValue,nudgeElements,renameArtboard,resizeArtboard,resizeElement,rotateElement,sanitizeSelection,selectAllSelectable,selectByMarquee,
  selectedElements,selectOnly,setArtboardBackground,setArtboardDisplayUnit,setElementPosition,toggleSelection,unitToMm,updateDesignElement,
  orderedLayers,renameElement,setElementVisibility,setElementLocked,moveLayer,duplicateDesignElements,groupElements,ungroupElements,
  expandElementIdsToGroups,groupForElement,setGroupLocked,setGroupVisibility,scaleElements,rotateElementsAsGroup,
  createDesignHistory,commitDesignHistory,undoDesignHistory,redoDesignHistory,resetDesignHistory,
  createDesignClipboardPayload,pasteDesignClipboard,createSvgElement,DESIGN_STARTER_TEMPLATES,DECORATIVE_ASSETS,decorativeAssetReference,
  alignElements,distributeElements,centerElementsOnArtboard,getAlignmentUnitCount,
  snapMoveDelta,snapResizeSize,addGuide,moveGuide,deleteGuide,setGuideLocked,setAllGuidesLocked,clearGuides,
  copyDesignElementStyle,pasteDesignElementStyle,resetDesignElementStyle,updateElementsOpacity,DEFAULT_DESIGN_SHADOW,
  prepareAssetImport,assetRenderKind,resolvePrintSettings,imagePrintQuality,validateArtboardPrint,requiredPixels,updateArtboardPrintSettings,
  setArtboardRole,pairArtboards,unpairArtboard,createBackSide,applyPrintSettingsToTargets
} from '@document-tool/design-engine';
import type { DesignAlignmentReference,DesignClipboardPayload,DesignHistoryState,DesignRectMm,DesignSelectionState,DesignStyleClipboard,SnapGuideIndicator } from '@document-tool/design-engine';
import { LocalStorageDesignTemplateRepository,LocalStorageUserAssetLibraryRepository,type UserAssetLibraryItem } from '@document-tool/persistence';
import { ArrowDown,ArrowUp,ClipboardPaste,Copy,FilePlus2,ImagePlus,Maximize2,Minus,MonitorUp,Plus,Redo2,RotateCcw,Save,Square,Trash2,Type,Undo2,Upload,PenLine } from 'lucide-react';

const MM_TO_CSS_PX=96/25.4,MIN_ZOOM=25,MAX_ZOOM=200;
const SHAPES:DesignShapeKind[]=['RECTANGLE','ROUNDED_RECTANGLE','CIRCLE','ELLIPSE','LINE','TRIANGLE','ARROW','STAR','POLYGON','RIBBON','BADGE'];
const id=(p:string)=>`${p}-${globalThis.crypto?.randomUUID?.()??`${Date.now()}-${Math.random().toString(16).slice(2)}`}`;
function fresh():DesignTemplate{const artboard=createBlankArtboard({id:id('artboard'),name:'Front',order:0,widthMm:90,heightMm:50});artboard.print=resolvePrintSettings();return{kind:'CARD_DESIGN',schemaVersion:1,id:id('card-template'),name:'Untitled Card Design',version:1,status:'DRAFT',artboards:[artboard],sharedAssets:[]};}

export function CardDesigner(){
 const repo=useMemo(()=>new LocalStorageDesignTemplateRepository(window.localStorage),[]);
 const assetRepo=useMemo(()=>new LocalStorageUserAssetLibraryRepository(window.localStorage),[]);
 const [template,setTemplate]=useState<DesignTemplate>(()=>fresh());
 const [activeId,setActiveId]=useState('');
 const [selectedArtboardIds,setSelectedArtboardIds]=useState<string[]>([]);
 const [zoom,setZoom]=useState(100);
 const [status,setStatus]=useState('Ready');
 const [dirty,setDirty]=useState(false);
 const [space,setSpace]=useState(false);
 const [snapEnabled,setSnapEnabled]=useState(true);
 const [gridSnapEnabled,setGridSnapEnabled]=useState(false);
 const [guideSnapEnabled,setGuideSnapEnabled]=useState(true);
 const [showRulers,setShowRulers]=useState(true);
 const [showGrid,setShowGrid]=useState(false);
 const [gridSizeMm,setGridSizeMm]=useState(5);
 const [userAssets,setUserAssets]=useState<UserAssetLibraryItem[]>([]);
 const [assetLibraryStatus,setAssetLibraryStatus]=useState('');
 const [decorativeQuery,setDecorativeQuery]=useState('');
 const [selection,setSelection]=useState<DesignSelectionState>(()=>emptySelection(''));
 const viewport=useRef<HTMLDivElement|null>(null);
 const pan=useRef<{x:number;y:number;left:number;top:number}|null>(null);
 const uploadRef=useRef<HTMLInputElement|null>(null);
 const assetLibraryUploadRef=useRef<HTMLInputElement|null>(null);
 const templateRef=useRef(template);
 const historyRef=useRef<DesignHistoryState>(createDesignHistory(template));
 const historyTransactionRef=useRef<DesignTemplate|null>(null);
 const clipboardRef=useRef<DesignClipboardPayload|null>(null);
 const styleClipboardRef=useRef<DesignStyleClipboard|null>(null);
 const pasteCountRef=useRef(0);
 const [historyVersion,setHistoryVersion]=useState(0);
 const artboards=useMemo(()=>[...template.artboards].sort((a,b)=>a.order-b.order),[template.artboards]);
 const active=artboards.find(a=>a.id===activeId)??artboards[0];
 const decorativeMatches=(asset:(typeof DECORATIVE_ASSETS)[number],query:string)=>{if(!query.trim())return true;const haystack=[asset.name,asset.category,decorativeFolderLabel(asset)].join(' ').toLowerCase();return haystack.includes(query.trim().toLowerCase());};
 const decorativeGroups=useMemo(()=>{
  const groups=[
   {key:'Corners & Florals',items:DECORATIVE_ASSETS.filter(asset=>decorativeFolderKey(asset)==='CORNERS')},
   {key:'Frames & Borders',items:DECORATIVE_ASSETS.filter(asset=>decorativeFolderKey(asset)==='FRAMES')},
   {key:'Dividers & Strips',items:DECORATIVE_ASSETS.filter(asset=>decorativeFolderKey(asset)==='DIVIDERS')},
   {key:'Wreaths & Roundels',items:DECORATIVE_ASSETS.filter(asset=>decorativeFolderKey(asset)==='WREATHS')},
   {key:'Branches & Leaves',items:DECORATIVE_ASSETS.filter(asset=>decorativeFolderKey(asset)==='BOTANICALS')},
   {key:'Ornaments',items:DECORATIVE_ASSETS.filter(asset=>decorativeFolderKey(asset)==='ORNAMENTS')},
   {key:'Watercolor Floral',items:DECORATIVE_ASSETS.filter(asset=>decorativeFolderKey(asset)==='WATERCOLOR')}
  ].map(group=>({...group,items:group.items.filter(asset=>decorativeMatches(asset,decorativeQuery))})).filter(group=>group.items.length>0);
  return groups;
 },[decorativeQuery]);
 const decorativeVisibleCount=useMemo(()=>decorativeGroups.reduce((total,group)=>total+group.items.length,0),[decorativeGroups]);
 templateRef.current=template;
 const refreshHistory=()=>setHistoryVersion(v=>v+1);
 const resetHistory=(next:DesignTemplate)=>{historyRef.current=resetDesignHistory(next);historyTransactionRef.current=null;refreshHistory();};
 const recordHistory=(before:DesignTemplate,after:DesignTemplate)=>{if(before===after)return;const seeded={...historyRef.current,present:before};historyRef.current=commitDesignHistory(seeded,after);refreshHistory();};
 const mutate=(fn:(t:DesignTemplate)=>DesignTemplate,record=true)=>{setTemplate(current=>{const next=fn(current);if(next===current)return current;if(record&&!historyTransactionRef.current)recordHistory(current,next);templateRef.current=next;return next;});setDirty(true);setStatus('Unsaved changes');};
 const mutateTransient=(fn:(t:DesignTemplate)=>DesignTemplate)=>mutate(fn,false);
 const beginHistoryTransaction=()=>{if(!historyTransactionRef.current)historyTransactionRef.current=templateRef.current;};
 const endHistoryTransaction=()=>{const before=historyTransactionRef.current;historyTransactionRef.current=null;if(before&&before!==templateRef.current)recordHistory(before,templateRef.current);};
 const undo=()=>{const current=templateRef.current;const seeded={...historyRef.current,present:current};const next=undoDesignHistory(seeded);if(next===seeded)return;historyRef.current=next;templateRef.current=next.present;setTemplate(next.present);setDirty(true);setStatus('Undo');refreshHistory();};
 const redo=()=>{const current=templateRef.current;const seeded={...historyRef.current,present:current};const next=redoDesignHistory(seeded);if(next===seeded)return;historyRef.current=next;templateRef.current=next.present;setTemplate(next.present);setDirty(true);setStatus('Redo');refreshHistory();};
 const copySelected=()=>{if(!active||!selection.elementIds.length)return;const ids=expandElementIdsToGroups(active,selection.elementIds);const payload=createDesignClipboardPayload(templateRef.current,active.id,ids);if(!payload)return;clipboardRef.current=payload;pasteCountRef.current=0;setStatus(`${payload.elements.length} element${payload.elements.length===1?'':'s'} copied`);refreshHistory();};
 const pasteClipboard=()=>{if(!active||!clipboardRef.current)return;pasteCountRef.current+=1;let pastedIds:string[]=[];const offset={xMm:2*pasteCountRef.current,yMm:2*pasteCountRef.current};mutate(t=>{const result=pasteDesignClipboard(t,active.id,clipboardRef.current!,()=>id('paste'),offset);pastedIds=result.elementIds;return result.template;});setSelection({artboardId:active.id,elementIds:pastedIds,primaryElementId:pastedIds.length?pastedIds[pastedIds.length-1]:undefined});setStatus(`Pasted ${pastedIds.length} element${pastedIds.length===1?'':'s'}`);};
 const copyStyle=()=>{if(!active)return;const element=active.elements.find(e=>e.id===(selection.primaryElementId??selection.elementIds[0]));if(!element)return;const copied=copyDesignElementStyle(element);if(!copied){setStatus('Style copy is unavailable for this element type');return;}styleClipboardRef.current=copied;setStatus(`${element.type} style copied`);refreshHistory();};
 const pasteStyle=()=>{if(!active||!styleClipboardRef.current||!selection.elementIds.length)return;const clipboard=styleClipboardRef.current;mutate(t=>({...t,artboards:t.artboards.map(a=>a.id===active.id?{...a,elements:a.elements.map(e=>selection.elementIds.includes(e.id)&&!e.locked?pasteDesignElementStyle(e,clipboard):e)}:a)}));setStatus('Style pasted');};
 const resetStyle=()=>{if(!active||!selection.elementIds.length)return;mutate(t=>({...t,artboards:t.artboards.map(a=>a.id===active.id?{...a,elements:a.elements.map(e=>selection.elementIds.includes(e.id)&&!e.locked?resetDesignElementStyle(e):e)}:a)}));setStatus('Style reset');};

 useEffect(()=>{let cancelled=false;(async()=>{try{const activeTemplateId=await repo.getActiveId();const stored=activeTemplateId?await repo.getById(activeTemplateId):(await repo.list())[0]??null;if(cancelled)return;if(stored){setTemplate(stored);templateRef.current=stored;resetHistory(stored);const aid=[...stored.artboards].sort((a,b)=>a.order-b.order)[0]?.id??'';setActiveId(aid);setSelection(emptySelection(aid));setStatus('Draft restored');}else{const f=fresh();setTemplate(f);templateRef.current=f;resetHistory(f);setActiveId(f.artboards[0]!.id);setSelection(emptySelection(f.artboards[0]!.id));}}catch(e){if(!cancelled)setStatus(e instanceof Error?e.message:'Unable to restore card draft.');}})();return()=>{cancelled=true};},[repo]);
 useEffect(()=>{let cancelled=false;(async()=>{try{const assets=await assetRepo.list();if(!cancelled)setUserAssets(assets);}catch(e){if(!cancelled)setAssetLibraryStatus(e instanceof Error?e.message:'Unable to load asset library.');}})();return()=>{cancelled=true};},[assetRepo]);
 useEffect(()=>{if(active)setSelection(s=>sanitizeSelection(s,active));},[active]);
 useEffect(()=>{const kd=(e:KeyboardEvent)=>{if(e.code==='Space'&&!isForm(e.target)){setSpace(true);e.preventDefault();return;}if(!active||isForm(e.target))return;const command=e.ctrlKey||e.metaKey;if(command&&e.key.toLowerCase()==='z'){e.preventDefault();if(e.shiftKey)redo();else undo();return;}if(command&&e.key.toLowerCase()==='y'){e.preventDefault();redo();return;}if(command&&e.key.toLowerCase()==='c'){e.preventDefault();copySelected();return;}if(command&&e.key.toLowerCase()==='v'){e.preventDefault();pasteClipboard();return;}if(command&&e.key.toLowerCase()==='d'&&selection.elementIds.length){e.preventDefault();duplicateSelected();return;}if(command&&e.key.toLowerCase()==='a'){e.preventDefault();setSelection(selectAllSelectable(active));return;}if(e.key==='Escape'){setSelection(emptySelection(active.id));return;}if((e.key==='Delete'||e.key==='Backspace')&&selection.elementIds.length){e.preventDefault();mutate(t=>deleteDesignElements(t,active.id,selection.elementIds));setSelection(emptySelection(active.id));setStatus('Element deleted');return;}const dir=e.key==='ArrowLeft'?'LEFT':e.key==='ArrowRight'?'RIGHT':e.key==='ArrowUp'?'UP':e.key==='ArrowDown'?'DOWN':null;if(dir&&selection.elementIds.length){e.preventDefault();mutate(t=>nudgeElements(t,active.id,selection.elementIds,dir,e.shiftKey));setStatus('Unsaved changes');}},ku=(e:KeyboardEvent)=>{if(e.code==='Space')setSpace(false)};window.addEventListener('keydown',kd);window.addEventListener('keyup',ku);return()=>{window.removeEventListener('keydown',kd);window.removeEventListener('keyup',ku)};},[active,selection.elementIds,historyVersion]);
 const save=async()=>{try{await repo.save(template);await repo.setActiveId(template.id);setDirty(false);setStatus('Saved locally');}catch(e){setStatus(e instanceof Error?e.message:'Save failed');}};
 const newDesign=()=>{if(dirty&&!window.confirm('Discard unsaved Card Designer changes?'))return;const f=fresh();setTemplate(f);templateRef.current=f;resetHistory(f);setActiveId(f.artboards[0]!.id);setSelection(emptySelection(f.artboards[0]!.id));setZoom(100);setDirty(true);setStatus('New card design');};
 const loadStarterTemplate=(starterId:(typeof DESIGN_STARTER_TEMPLATES)[number]['id'])=>{const starter=DESIGN_STARTER_TEMPLATES.find(x=>x.id===starterId);if(!starter)return;if(dirty&&!window.confirm(`Replace current unsaved design with ${starter.name}?`))return;const next=starter.create(id);setTemplate(next);templateRef.current=next;resetHistory(next);setActiveId(next.artboards[0]!.id);setSelection(emptySelection(next.artboards[0]!.id));setZoom(100);setDirty(true);setStatus(`${starter.name} template loaded`);};
 const loadCorporateIdTemplate=()=>loadStarterTemplate('corporate-employee-id-cr80');
 const insertDecoration=(assetId:(typeof DECORATIVE_ASSETS)[number]['id'])=>{if(!active)return;const def=DECORATIVE_ASSETS.find(a=>a.id===assetId);if(!def)return;const existing=template.sharedAssets.find(a=>a.metadata?.decorativeAssetId===def.id);const generated=decorativeAssetReference(def);const finalAsset=existing??{...generated,id:id(`asset-${def.id}`)};const element=def.assetKind==='IMAGE'?createImageElement(finalAsset.id,{id:id('image-decoration'),name:def.name,xMm:Math.max(2,(active.widthMm-def.defaultWidthMm)/2),yMm:Math.max(2,(active.heightMm-def.defaultHeightMm)/2),widthMm:def.defaultWidthMm,heightMm:def.defaultHeightMm,zIndex:nextElementZIndex(template,active.id)}):createSvgElement(finalAsset.id,{id:id('svg-decoration'),name:def.name,xMm:Math.max(2,(active.widthMm-def.defaultWidthMm)/2),yMm:Math.max(2,(active.heightMm-def.defaultHeightMm)/2),widthMm:def.defaultWidthMm,heightMm:def.defaultHeightMm,zIndex:nextElementZIndex(template,active.id)});mutate(t=>addDesignElement(existing?t:addAssetReference(t,finalAsset),active.id,element));setSelection(selectOnly(active.id,element.id));setStatus(`${def.name} added`);};
 const insertUserAsset=(libraryAsset:UserAssetLibraryItem)=>{if(!active)return;const existing=template.sharedAssets.find(a=>a.metadata?.userLibraryAssetId===libraryAsset.id);const finalAsset:AssetReference=existing??{...libraryAsset,id:id('asset-user'),metadata:{...libraryAsset.metadata,userLibraryAssetId:libraryAsset.id}};const ratio=(libraryAsset.widthPx??1)/(libraryAsset.heightPx??1);const defaultWidth=Math.min(45,Math.max(15,active.widthMm*.45));const defaultHeight=libraryAsset.kind==='SVG'?Math.min(35,defaultWidth):Math.min(active.heightMm*.6,defaultWidth/(ratio||1));const common={name:libraryAsset.name,xMm:Math.max(2,(active.widthMm-defaultWidth)/2),yMm:Math.max(2,(active.heightMm-defaultHeight)/2),widthMm:defaultWidth,heightMm:defaultHeight,zIndex:nextElementZIndex(template,active.id)};const element=libraryAsset.kind==='SVG'?createSvgElement(finalAsset.id,{id:id('svg-user-asset'),...common}):createImageElement(finalAsset.id,{id:id('image-user-asset'),...common});mutate(t=>addDesignElement(existing?t:addAssetReference(t,finalAsset),active.id,element));setSelection(selectOnly(active.id,element.id));setStatus(`${libraryAsset.name} added from My Assets`);};
 const addFilesToAssetLibrary=async(files:FileList|File[])=>{const list=Array.from(files);if(!list.length)return;let added=0,duplicates=0;for(const file of list){try{const isSvg=file.type==='image/svg+xml'||file.name.toLowerCase().endsWith('.svg'),supported=isSvg||['image/png','image/jpeg','image/webp','image/gif'].includes(file.type);if(!supported){setAssetLibraryStatus(`${file.name}: unsupported type.`);continue;}const source=isSvg?`data:image/svg+xml;charset=utf-8,${encodeURIComponent(await file.text())}`:await readAsDataUrl(file),dims=isSvg?{widthPx:0,heightPx:0}:await readImageDimensions(source),prepared=prepareAssetImport({id:id('library-asset'),name:file.name.replace(/\.[^.]+$/,''),fileName:file.name,mimeType:isSvg?'image/svg+xml':file.type,source,sizeBytes:file.size,widthPx:dims.widthPx||undefined,heightPx:dims.heightPx||undefined,existing:userAssets});if(prepared.duplicate){duplicates++;continue;}const now=new Date().toISOString(),item:UserAssetLibraryItem={...prepared.asset,metadata:{...prepared.asset.metadata,userLibrary:true,createdAt:now,updatedAt:now,fileSize:file.size}};await assetRepo.save(item);added++;}catch(e){setAssetLibraryStatus(e instanceof Error?`${file.name}: ${e.message}`:`${file.name}: unable to add asset.`);}}if(added)setUserAssets(await assetRepo.list());setAssetLibraryStatus(`${added} asset${added===1?'':'s'} added${duplicates?` · ${duplicates} duplicate${duplicates===1?'':'s'} reused`:''}`);};
 const renameUserAsset=async(asset:UserAssetLibraryItem)=>{const next=window.prompt('Rename asset',asset.name)?.trim();if(!next||next===asset.name)return;try{await assetRepo.rename(asset.id,next);setUserAssets(await assetRepo.list());setAssetLibraryStatus('Asset renamed');}catch(e){setAssetLibraryStatus(e instanceof Error?e.message:'Rename failed');}};
 const deleteUserAsset=async(asset:UserAssetLibraryItem)=>{if(!window.confirm(`Delete “${asset.name}” from My Assets? Existing designs using it will not be changed.`))return;try{await assetRepo.delete(asset.id);setUserAssets(await assetRepo.list());setAssetLibraryStatus('Asset removed from library');}catch(e){setAssetLibraryStatus(e instanceof Error?e.message:'Delete failed');}};
 const chooseArtboard=(aid:string,toggle=false)=>{
  if(toggle){
    setSelectedArtboardIds(prev=>prev.includes(aid)?prev.filter(id=>id!==aid):[...prev,aid]);
  } else {
    setActiveId(aid);
    setSelectedArtboardIds([aid]);
    setSelection(emptySelection(aid));
  }
 };
 const add=()=>{if(!active)return;const a=createBlankArtboard({id:id('artboard'),name:`Artboard ${template.artboards.length+1}`,order:template.artboards.length,widthMm:active.widthMm,heightMm:active.heightMm,displayUnit:active.displayUnit});a.print=resolvePrintSettings(active.print);mutate(t=>addArtboard(t,a));chooseArtboard(a.id);};
 const duplicate=()=>{
  if(!selectedArtboardIds.length)return;
  const nextId=id('artboard');
  // For simplicity, duplicate active if multiple selected, or we could duplicate all. Let's just duplicate active.
  mutate(t=>duplicateArtboard(t,active.id,nextId));
  chooseArtboard(nextId);
 };
 const remove=()=>{
  const targets = selectedArtboardIds.length > 0 ? selectedArtboardIds : [active.id];
  if(template.artboards.length - targets.length < 1){setStatus('A design must keep at least one artboard.');return;}
  if(!window.confirm(`Delete ${targets.length} artboard(s)?`))return;
  mutate(t=>targets.reduce((acc,id)=>deleteArtboard(acc,id),t));
  const remaining = artboards.filter(a=>!targets.includes(a.id));
  const next = remaining[0];
  if(next) chooseArtboard(next.id);
 };
 const fit=()=>{const v=viewport.current;if(!v||!active)return;const z=Math.floor(Math.min(Math.max(100,v.clientWidth-96)/(active.widthMm*MM_TO_CSS_PX),Math.max(100,v.clientHeight-96)/(active.heightMm*MM_TO_CSS_PX))*100);setZoom(clamp(z,MIN_ZOOM,MAX_ZOOM));};
 const selectInserted=(elementId:string)=>{if(!active)return;setSelection(selectOnly(active.id,elementId));setStatus('Element added');};
 const insertText=()=>{if(!active)return;const eid=id('text');mutate(t=>addDesignElement(t,active.id,createTextElement({id:eid,name:'Text',xMm:Math.max(2,(active.widthMm-45)/2),yMm:Math.max(2,(active.heightMm-12)/2),zIndex:nextElementZIndex(t,active.id)})));selectInserted(eid);};
 const insertShape=(shape:DesignShapeKind='RECTANGLE')=>{if(!active)return;const eid=id('shape');mutate(t=>addDesignElement(t,active.id,createShapeElement(shape,{id:eid,xMm:Math.max(2,(active.widthMm-28)/2),yMm:Math.max(2,(active.heightMm-18)/2),zIndex:nextElementZIndex(t,active.id)})));selectInserted(eid);};
 const groupSelected=()=>{if(!active||selection.elementIds.length<2)return;const gid=id('group');mutate(t=>groupElements(t,active.id,selection.elementIds,gid,`Group ${active.groups.length+1}`));setSelection({...selection,elementIds:expandElementIdsToGroups({...active,groups:[...active.groups,{id:gid,name:`Group ${active.groups.length+1}`,elementIds:selection.elementIds}],elements:active.elements.map(e=>selection.elementIds.includes(e.id)?{...e,groupId:gid}:e)},selection.elementIds)});setStatus('Elements grouped');};
 const ungroupSelected=()=>{if(!active)return;const gids=[...new Set(selection.elementIds.map(eid=>groupForElement(active,eid)?.id).filter(Boolean) as string[])];if(!gids.length)return;mutate(t=>gids.reduce((acc,gid)=>ungroupElements(acc,active.id,gid),t));setStatus('Group removed');};
 const duplicateSelected=()=>{if(!active||!selection.elementIds.length)return;let newIds:string[]=[];mutate(t=>{const r=duplicateDesignElements(t,active.id,expandElementIdsToGroups(active,selection.elementIds),()=>id('element-copy'));newIds=r.elementIds;return r.template;});setSelection({artboardId:active.id,elementIds:newIds,primaryElementId:newIds.length > 0 ? newIds[newIds.length - 1] : undefined});setStatus('Selection duplicated');};
 const uploadImage=async(file:File)=>{if(!active)return;if(!file.type.startsWith('image/')){setStatus('Select a supported image file.');return;}try{const dataUrl=await readAsDataUrl(file);const dims=await readImageDimensions(dataUrl);const assetId=id('asset'),elementId=id('image');const ratio=dims.widthPx>0&&dims.heightPx>0?dims.widthPx/dims.heightPx:1.4;const width=Math.min(40,Math.max(15,active.widthMm*.45)),height=Math.min(active.heightMm*.6,width/ratio);mutate(t=>{let next=addAssetReference(t,{id:assetId,name:file.name,kind:'IMAGE',sourceType:'DATA_URL',source:dataUrl,mimeType:file.type,widthPx:dims.widthPx,heightPx:dims.heightPx});next=addDesignElement(next,active.id,createImageElement(assetId,{id:elementId,name:file.name,xMm:Math.max(2,(active.widthMm-width)/2),yMm:Math.max(2,(active.heightMm-height)/2),widthMm:width,heightMm:height,zIndex:nextElementZIndex(next,active.id)}));return next;});selectInserted(elementId);}catch(e){setStatus(e instanceof Error?e.message:'Image upload failed');}};

  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'PDF'|'PNG'|'JPEG'>('PDF');
  const [exportTargetMode, setExportTargetMode] = useState<'CURRENT'|'SELECTED'|'ALL'>('ALL');
  const [exportIncludeBleed, setExportIncludeBleed] = useState(false);
  const [exportIncludeCropMarks, setExportIncludeCropMarks] = useState(false);
  const [exportDpi, setExportDpi] = useState(300);
  const [exportTransparent, setExportTransparent] = useState(false);
  const [exportJpegQuality, setExportJpegQuality] = useState(90);

  const [exportRasterTargets, setExportRasterTargets] = useState<Artboard[]>([]);
  const pendingRasterExportRef = useRef<{ targets: Artboard[], request: CardExportRequest, format: string, fileName: string, exportReq: any } | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const cancelExportRef = useRef<ExportCancellationSource | null>(null);
  const [exportHost, setExportHost] = useState<HTMLElement | null>(null);

  const runOrchestrator = async (targets: Artboard[], request: CardExportRequest, exportReq: any) => {
    const cancelToken = new ExportCancellationSource();
    cancelExportRef.current = cancelToken;
    try {
      const registry = new RendererRegistry();
        const rasterizer = new BrowserExactPageRasterizer(
          async (resolved) => {
            const root = (exportHost || document).querySelector(`.raster-export-root [data-document-id="${resolved.documentGroupId}"]`);
            if (!root) throw new Error(`Isolated export page root for ${resolved.documentGroupId} is unavailable.`);
            return Array.from(root.querySelectorAll<HTMLElement>('[data-document-export-page]'));
          },
          () => exportReq.format === 'PNG' && (exportReq.options?.png as { backgroundMode?: string } | undefined)?.backgroundMode === 'TRANSPARENT',
          exportHost || document
        );
      registry.register('PDF', new CardPdfExportRenderer((docId, dpi) => rasterizer.rasterizePageAsJpeg(docId, dpi)));
      registerPngRenderer(registry, rasterizer);
      registerJpegRenderer(registry, rasterizer);

      const byId = new Map(targets.map(t => [t.id, t]));
      
      const orchestrator = new ExportOrchestrator({
        registry,
        resolveDocument: async (_templateId, documentGroupId) => {
          const artboard = byId.get(documentGroupId);
          if (!artboard) throw new Error(`Artboard ${documentGroupId} missing`);
          return {
            documentGroupId,
            template,
            model: buildCardRenderModel(artboard, request) as any,
            namingValues: { DocumentGroupKey: artboard.name || documentGroupId }
          } as unknown as ResolvedExportDocument;
        }
      });

      const result = await orchestrator.export(exportReq, { cancellationToken: cancelToken.token });
      
      const downloadable = result.files.length > 1 && exportReq.format !== 'PDF'
        ? [new ZipBundler().bundle(result.files, { fileName: exportReq.fileName })]
        : result.files;

      setStatus('Waiting for save location...');
      const delivered = await deliverExportedFiles(downloadable);

      if (delivered.status === 'CANCELLED') throw new ExportCancelledError('Save cancelled.');
      if (delivered.status === 'FAILED') throw new Error(`Generated successfully but could not be saved. ${delivered.error ?? ''}`);

      setStatus(`Export completed successfully (${downloadable.length} file(s) saved)`);
      setExportDialogOpen(false);
    } catch (e) {
      if (e instanceof ExportCancelledError) {
        setStatus('Export cancelled.');
        setExportDialogOpen(false);
      } else {
        setStatus(`Export failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
      }
    } finally {
      try {
        setIsExporting(false);
        setExportRasterTargets([]);
        pendingRasterExportRef.current = null;
        cancelExportRef.current = null;
        if (exportHost?.isConnected) {
          exportHost.remove();
        }
        setExportHost(null);
      } catch (cleanupError) {
        console.error('Export cleanup failed safely:', cleanupError);
      }
    }
  };

  useEffect(() => {
    if (exportRasterTargets.length > 0 && pendingRasterExportRef.current) {
      const { targets, request, exportReq } = pendingRasterExportRef.current;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          void runOrchestrator(targets, request, exportReq);
        });
      });
    }
  }, [exportRasterTargets]);

  const performExport = async () => {
    try {
      setIsExporting(true);
      setStatus('Preparing export...');

      const request: CardExportRequest = {
        format: exportFormat,
        targetMode: exportTargetMode,
        selectedArtboardIds: exportTargetMode === 'SELECTED' ? selectedArtboardIds : undefined,
        currentArtboardId: active.id,
        includeBleed: exportIncludeBleed,
        includeCropMarks: exportIncludeCropMarks,
        usePrintSettings: true,
        rasterDpi: exportDpi,
        jpegQuality: exportJpegQuality,
        transparentBackground: exportTransparent
      };

      let targets: Artboard[] = [];
      if (exportTargetMode === 'CURRENT') targets = [active];
      else if (exportTargetMode === 'SELECTED') targets = template.artboards.filter(a => selectedArtboardIds.includes(a.id));
      else targets = [...template.artboards];

      if (targets.length === 0) {
        setStatus('Export cancelled: No artboards targeted.');
        setIsExporting(false);
        return;
      }

      if (exportFormat === 'PNG' || exportFormat === 'JPEG') {
        for (const target of targets) {
          const memError = validateExportMemory(request, target.widthMm, target.heightMm);
          if (memError) {
            setStatus(`Export failed: ${memError}`);
            setIsExporting(false);
            return;
          }
        }
      }

      setStatus(`Exporting ${targets.length} artboard(s)...`);

      const exportReq = {
        format: exportFormat,
        templateId: template.id,
        documentGroupIds: targets.map(t => t.id),
        fileName: `${template.name.replace(/[^a-z0-9-_]/gi, '_')}${targets.length === 1 ? `-${targets[0]!.name.replace(/[^a-z0-9-_]/gi, '_')}` : ''}`,
        options: {
          png: { dpi: exportDpi, pages: 'ALL', backgroundMode: exportTransparent ? 'TRANSPARENT' : 'SOLID' },
          jpeg: { dpi: exportDpi, quality: exportJpegQuality, backgroundColor: '#FFFFFF' }
        }
      };

      pendingRasterExportRef.current = { targets, request, format: exportFormat, fileName: exportReq.fileName, exportReq };
      
      // 1. Create stable host explicitly
      const host = document.createElement('div');
      host.className = 'raster-export-root';
      document.body.appendChild(host);
      
      // 2. Set state to trigger portal render
      setExportHost(host);
      setExportRasterTargets(targets);
    } catch (e) {
      setStatus(`Export failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
      setIsExporting(false);
    }
  };

  const handleCancelExport = () => {
    if (isExporting && cancelExportRef.current) {
      cancelExportRef.current.cancel();
      setStatus('Cancellation requested...');
    } else {
      setExportDialogOpen(false);
    }
  };

 if(!active)return <div className="card-designer-loading">Preparing Card Designer…</div>;
 const selected=selectedElements(active,selection),primary=selected.find(e=>e.id===selection.primaryElementId)??selected[0];
 return <div className="card-designer-page animated-fade-in">
  <header className="card-designer-commandbar"><div className="card-designer-title"><span className="designer-eyebrow">Visual Design Studio</span><input aria-label="Template name" value={template.name} onChange={e=>mutate(t=>({...t,name:e.target.value}))}/><span className="card-draft-badge">Draft</span></div><div className="card-designer-actions"><button title="Undo (Ctrl+Z)" onClick={undo} disabled={!historyRef.current.past.length}><Undo2 size={15}/>Undo</button><button title="Redo (Ctrl+Y)" onClick={redo} disabled={!historyRef.current.future.length}><Redo2 size={15}/>Redo</button><button title="Copy (Ctrl+C)" onClick={copySelected} disabled={!selection.elementIds.length}><Copy size={15}/>Copy</button><button title="Paste (Ctrl+V)" onClick={pasteClipboard} disabled={!clipboardRef.current}><ClipboardPaste size={15}/>Paste</button><button onClick={newDesign}><FilePlus2 size={15}/>New</button><button onClick={loadCorporateIdTemplate} title="Load editable CR80 Front + Back starter template">ID Card Template</button><button className="primary" onClick={()=>setExportDialogOpen(true)} disabled={isExporting}>{isExporting ? 'Exporting...' : 'Export'}</button><button className="primary" onClick={save}><Save size={15}/>Save</button></div></header>
  <div className="card-designer-shell">
   <aside className="card-artboard-panel">
    <div className="card-elements-toolbox card-elements-primary"><div className="card-toolbox-title"><strong>Elements</strong><small>Quick tools</small></div><div className="card-tool-grid"><button onClick={insertText}><Type size={17}/><span>Text</span></button><button onClick={()=>insertShape('RECTANGLE')}><Square size={17}/><span>Shape</span></button><button onClick={()=>uploadRef.current?.click()}><ImagePlus size={17}/><span>Image</span></button></div><select aria-label="Quick shape" defaultValue="" onChange={e=>{if(e.target.value){insertShape(e.target.value as DesignShapeKind);e.currentTarget.value='';}}}><option value="">More shapes…</option>{SHAPES.map(s=><option key={s} value={s}>{shapeLabel(s)}</option>)}</select><input ref={uploadRef} hidden type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={e=>{const f=e.target.files?.[0];if(f)void uploadImage(f);e.currentTarget.value='';}}/></div>
    <details className="card-library-section card-user-asset-library" open><summary><span>My Assets</span><small>{userAssets.length} saved</small></summary><div className="card-library-body"><div className="card-user-assets-toolbar"><button className="primary" onClick={()=>assetLibraryUploadRef.current?.click()}><Upload size={14}/>Add Asset</button><small>PNG, JPG, WebP, GIF, SVG · max 2 MB</small></div><input ref={assetLibraryUploadRef} hidden type="file" multiple accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,.svg" onChange={e=>{if(e.target.files)void addFilesToAssetLibrary(e.target.files);e.currentTarget.value='';}}/>{assetLibraryStatus&&<div className="card-asset-library-status">{assetLibraryStatus}</div>}{userAssets.length?<div className="card-decorative-grid card-user-assets-grid">{userAssets.map(asset=><div key={asset.id} className="card-user-asset-card"><button className="card-user-asset-insert" title={`Insert ${asset.name}`} onClick={()=>insertUserAsset(asset)}><span className="card-decorative-thumb"><img src={asset.source} alt=""/></span><span>{asset.name}</span></button><div className="card-user-asset-actions"><button title="Rename asset" onClick={()=>void renameUserAsset(asset)}><PenLine size={12}/></button><button className="danger" title="Delete from library" onClick={()=>void deleteUserAsset(asset)}><Trash2 size={12}/></button></div></div>)}</div>:<div className="card-empty-library"><strong>Your reusable asset library is empty.</strong><span>Add logos, florals, icons or SVG artwork once and reuse them across designs.</span></div>}</div></details>
    <details className="card-library-section" open><summary><span>Starter Templates</span><small>{DESIGN_STARTER_TEMPLATES.length} designs</small></summary><div className="card-library-body"><div className="card-starter-template-list">{DESIGN_STARTER_TEMPLATES.map(starter=><button key={starter.id} className="card-starter-template-button" onClick={()=>loadStarterTemplate(starter.id)}><strong>{starter.name}</strong><span>{starter.category} · {starter.description}</span></button>)}</div></div></details>
    <details className="card-library-section" open><summary><span>Floral & Decorative</span><small>{decorativeVisibleCount}/{DECORATIVE_ASSETS.length} assets · folder wise</small></summary><div className="card-library-body"><div className="card-library-toolbar"><input className="card-library-search" placeholder="Search floral assets" value={decorativeQuery} onChange={e=>setDecorativeQuery(e.target.value)}/><small className="card-library-hint">Organized into folders for faster finding and reuse.</small></div>{decorativeGroups.length?<div className="card-library-folders">{decorativeGroups.map(group=><details key={group.key} className="card-library-folder" open><summary><span>{group.key}</span><small>{group.items.length}</small></summary><div className="card-decorative-grid card-library-folder-grid">{group.items.map(asset=><button key={asset.id} title={asset.name} onClick={()=>insertDecoration(asset.id)}><span className="card-decorative-thumb"><img src={asset.source} alt=""/></span><span>{asset.name}</span></button>)}</div></details>)}</div>:<div className="card-empty-library"><strong>No floral assets found.</strong><span>Try another keyword or clear the search.</span></div>}</div></details>
    <details className="card-library-section card-artboards-section" open>
      <summary><span>Artboards</span><small>{artboards.length} surface{artboards.length===1?'':'s'}</small></summary>
      <div className="card-library-body">
        <div className="card-artboard-batch-panel">
          <button onClick={add} title="Add new artboard"><Plus size={14}/> Add</button>
          <button onClick={duplicate} disabled={!selectedArtboardIds.length} title="Duplicate selected"><Copy size={14}/> Duplicate</button>
          <div className="spacer"/>
          <button onClick={()=>mutate(t=>moveArtboard(t,active.id,-1))} disabled={active.order===0||selectedArtboardIds.length>1} title="Move Up"><ArrowUp size={14}/></button>
          <button onClick={()=>mutate(t=>moveArtboard(t,active.id,1))} disabled={active.order===artboards.length-1||selectedArtboardIds.length>1} title="Move Down"><ArrowDown size={14}/></button>
          <button className="danger" onClick={remove} disabled={!selectedArtboardIds.length} title="Delete selected"><Trash2 size={14}/></button>
        </div>
        <div className="card-artboard-list">
          {artboards.map((a,i)=>{
            const { isActive, isSelected } = getArtboardSelectionState(a.id, active.id, selectedArtboardIds);
            const role = getArtboardRole(a.role);
            const roleStr = formatArtboardRole(a.role);
            const pairInfo = getArtboardPairLabel(a.role, a.pairId);
            return (
              <div key={a.id} className={`card-artboard-item ${isActive?'active':''} ${isSelected?'selected':''}`} onClick={()=>chooseArtboard(a.id, false)}>
                <label className="card-artboard-checkbox" onClick={e=>e.stopPropagation()} title="Select for batch actions">
                  <input type="checkbox" aria-label={`Select ${a.name}`} checked={isSelected} onChange={()=>chooseArtboard(a.id, true)}/>
                </label>
                <div className="card-artboard-info">
                  <div className="card-artboard-name-row">
                    <span className="card-artboard-index">{i+1}</span>
                    <strong className="card-artboard-name" title={a.name}>{a.name}</strong>
                  </div>
                  <div className="card-artboard-meta">
                    <span className={`card-artboard-role role-${role.toLowerCase()}`}>{roleStr}</span>
                    <span className="card-artboard-dims" aria-label={`Size ${sizeText(a)}`}>{sizeText(a)}</span>
                  </div>
                  {pairInfo && <div className="card-artboard-pair" aria-label={pairInfo}><span>↔</span> {pairInfo}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </details>
    <LayerPanel artboard={active} selection={selection} setSelection={setSelection} mutate={mutate} duplicateSelected={duplicateSelected} groupSelected={groupSelected} ungroupSelected={ungroupSelected}/>
   </aside>
   <section className="card-canvas-column"><div className="card-canvas-toolbar"><div className="canvas-artboard-name"><MonitorUp size={15}/><strong>{active.name}</strong><span>{active.widthMm} × {active.heightMm} mm</span></div><div className="canvas-zoom-controls"><button className={snapEnabled?'active':''} title="Smart snapping. Hold Alt while dragging to temporarily bypass." onClick={()=>setSnapEnabled(v=>!v)}>Snap {snapEnabled?'On':'Off'}</button><label className="card-toolbar-check" title="Show measurement rulers around the artboard."><input type="checkbox" checked={showRulers} onChange={e=>setShowRulers(e.target.checked)}/>Rulers</label><label className="card-toolbar-check" title="Show editor-only grid."><input type="checkbox" checked={showGrid} onChange={e=>setShowGrid(e.target.checked)}/>Grid</label><label className="card-toolbar-check" title="Snap elements to the configured grid."><input type="checkbox" checked={gridSnapEnabled} onChange={e=>setGridSnapEnabled(e.target.checked)}/>Snap Grid</label><label className="card-toolbar-check" title="Snap elements to custom guides."><input type="checkbox" checked={guideSnapEnabled} onChange={e=>setGuideSnapEnabled(e.target.checked)}/>Snap Guides</label><label className="card-grid-size-control" title="Grid spacing"><span>Grid</span><input type="number" min="0.5" step="0.5" value={normalizeDisplayValue(mmToUnit(gridSizeMm,active.displayUnit))} onChange={e=>{const next=unitToMm(Number(e.target.value),active.displayUnit);if(Number.isFinite(next)&&next>=0.5)setGridSizeMm(next);}}/><small>{active.displayUnit==='MM'?'mm':'in'}</small></label><button title="Lock or unlock all guides" className={active.guides.length&&active.guides.every(g=>g.locked)?'active':''} onClick={()=>mutate(t=>setAllGuidesLocked(t,active.id,!active.guides.every(g=>g.locked)))} disabled={!active.guides.length}>{active.guides.length&&active.guides.every(g=>g.locked)?'Unlock Guides':'Lock Guides'}</button><button title="Clear unlocked guides" onClick={()=>mutate(t=>clearGuides(t,active.id))} disabled={!active.guides.some(g=>!g.locked)}>Clear Guides</button><button onClick={()=>setZoom(z=>clamp(z-10,MIN_ZOOM,MAX_ZOOM))}><Minus size={15}/></button><span>{zoom}%</span><button onClick={()=>setZoom(z=>clamp(z+10,MIN_ZOOM,MAX_ZOOM))}><Plus size={15}/></button><button onClick={()=>setZoom(100)}><RotateCcw size={14}/>Actual</button><button onClick={fit}><Maximize2 size={14}/>Fit</button></div></div>
    <div ref={viewport} className={`card-canvas-viewport ${space?'pan-ready':''}`} onPointerDown={e=>{if(!space&&e.button!==1)return;const v=viewport.current;if(!v)return;e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);pan.current={x:e.clientX,y:e.clientY,left:v.scrollLeft,top:v.scrollTop};}} onPointerMove={e=>{const v=viewport.current,p=pan.current;if(!v||!p)return;v.scrollLeft=p.left-(e.clientX-p.x);v.scrollTop=p.top-(e.clientY-p.y);}} onPointerUp={()=>pan.current=null} onPointerCancel={()=>pan.current=null}><div className="card-canvas-stage"><CardArtboardCanvas artboard={active} assets={template.sharedAssets} zoom={zoom} selection={selection} setSelection={setSelection} mutate={mutateTransient} commitMutate={mutate} beginHistoryTransaction={beginHistoryTransaction} endHistoryTransaction={endHistoryTransaction} snapEnabled={snapEnabled} gridSnapEnabled={gridSnapEnabled} guideSnapEnabled={guideSnapEnabled} showRulers={showRulers} showGrid={showGrid} gridSizeMm={gridSizeMm}/></div></div>
    <footer className="card-canvas-status"><span>{status}</span><span>{selection.elementIds.length?`${selection.elementIds.length} selected · Delete removes · Arrow nudge · Shift+Arrow 5 mm`:'Ctrl+Z/Y undo/redo · Ctrl+C/V copy/paste · Ctrl+D duplicate · Hold Space + drag to pan'}</span></footer>
   </section>
    <aside className="card-properties-panel"><div className="card-panel-heading"><div><strong>{primary?'Element Properties':selectedArtboardIds.length>1?'Batch Artboard Properties':'Artboard Properties'}</strong><small>{primary?'Content, style & transform':'Physical canvas settings'}</small></div></div>{primary&&<div className="card-style-actions"><button onClick={copyStyle}>Copy Style</button><button onClick={pasteStyle} disabled={!styleClipboardRef.current}>Paste Style</button><button onClick={resetStyle}>Reset Style</button></div>}{selected.length>1?<><BatchOpacityProperties elements={selected} artboard={active} mutate={mutate}/><MultiSelectionProperties elements={selected} artboard={active} mutate={mutate} groupSelected={groupSelected} ungroupSelected={ungroupSelected}/></>:primary?<ElementProperties element={primary} asset={primary.type==='IMAGE'||primary.type==='SVG'?template.sharedAssets.find(asset=>asset.id===primary.assetId):undefined} artboard={active} mutate={mutate}/>:selectedArtboardIds.length>1?<MultiArtboardProperties artboards={template.artboards.filter(a=>selectedArtboardIds.includes(a.id))} mutate={mutate}/>:<><Properties artboard={active} template={template} mutate={mutate}/><PrintProperties artboard={active} assets={template.sharedAssets} mutate={mutate}/></>}</aside>
   </div>
  {exportDialogOpen && (
    <div className="export-dialog-overlay" style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:999,display:'grid',placeItems:'center'}}>
      <div className="export-dialog" style={{background:'var(--bg-primary)',padding:'20px',borderRadius:'8px',width:'400px',display:'flex',flexDirection:'column',gap:'15px'}}>
        <h3 style={{margin:0}}>Export</h3>
        <label>Format: <select value={exportFormat} onChange={e=>setExportFormat(e.target.value as any)}><option>PDF</option><option>PNG</option><option>JPEG</option></select></label>
        <label>Target: <select value={exportTargetMode} onChange={e=>setExportTargetMode(e.target.value as any)}><option value="CURRENT">Current Artboard</option><option value="SELECTED" disabled={!selectedArtboardIds.length}>Selected Artboards ({selectedArtboardIds.length})</option><option value="ALL">All Artboards ({artboards.length})</option></select></label>
        <label><input type="checkbox" checked={exportIncludeBleed} onChange={e=>setExportIncludeBleed(e.target.checked)}/> Include Bleed</label>
        <label><input type="checkbox" checked={exportIncludeCropMarks} onChange={e=>setExportIncludeCropMarks(e.target.checked)}/> Include Crop Marks</label>
        {(exportFormat === 'PNG' || exportFormat === 'JPEG') && (
          <label>Raster Quality: <select value={exportDpi} onChange={e=>setExportDpi(Number(e.target.value))}><option value={96}>96 DPI</option><option value={150}>150 DPI</option><option value={300}>300 DPI</option><option value={600}>600 DPI</option></select></label>
        )}
        {exportFormat === 'PNG' && <label><input type="checkbox" checked={exportTransparent} onChange={e=>setExportTransparent(e.target.checked)}/> Transparent Background</label>}
        {exportFormat === 'JPEG' && <label>JPEG Quality: <input type="number" min={1} max={100} value={exportJpegQuality} onChange={e=>setExportJpegQuality(Number(e.target.value))}/></label>}
        <div style={{display:'flex',justifyContent:'flex-end',gap:'10px',marginTop:'10px'}}>
          <button type="button" onClick={handleCancelExport}>Cancel</button>
          <button type="button" className="primary" onClick={performExport} disabled={isExporting}>{isExporting ? 'Exporting...' : 'Export'}</button>
        </div>
      </div>
    </div>
  )}
  {exportRasterTargets.length > 0 && exportHost && createPortal(
    <div className="card-export-raster-root raster-export-root" aria-hidden="true" style={{ position: 'fixed', top: '-9999px', left: '-9999px', opacity: 0, pointerEvents: 'none' }}>
      {exportRasterTargets.map(a => {
        const outputWidthMm = a.widthMm + (exportIncludeBleed ? 6 : 0);
        const outputHeightMm = a.heightMm + (exportIncludeBleed ? 6 : 0);
        return (
        <div key={a.id} data-document-id={a.id}>
          <div data-document-export-page style={{ width: `${outputWidthMm * (96/25.4)}px`, height: `${outputHeightMm * (96/25.4)}px`, position: 'relative', overflow: 'hidden' }}>
            <IsolatedCardExportCanvas artboard={a} assets={template.sharedAssets} />
          </div>
        </div>
      )})}
    </div>,
    exportHost
  )}
 </div>;
}

type Op={mode:'MOVE';lastX:number;lastY:number;ids:string[]}|{mode:'RESIZE';element:DesignElement;anchor:'NW'|'N'|'NE'|'E'|'SE'|'S'|'SW'|'W';startX:number;startY:number;keepAspect:boolean}|{mode:'ROTATE';element:DesignElement;startAngle:number;startRotation:number};
function CardArtboardCanvas({artboard,assets,zoom,selection,setSelection,mutate,commitMutate,beginHistoryTransaction,endHistoryTransaction,snapEnabled,gridSnapEnabled,guideSnapEnabled,showRulers,showGrid,gridSizeMm}:{artboard:Artboard;assets:DesignTemplate['sharedAssets'];zoom:number;selection:DesignSelectionState;setSelection:(s:DesignSelectionState)=>void;mutate:(f:(t:DesignTemplate)=>DesignTemplate)=>void;commitMutate:(f:(t:DesignTemplate)=>DesignTemplate)=>void;beginHistoryTransaction:()=>void;endHistoryTransaction:()=>void;snapEnabled:boolean;gridSnapEnabled:boolean;guideSnapEnabled:boolean;showRulers:boolean;showGrid:boolean;gridSizeMm:number}){
 const canvas=useRef<HTMLDivElement|null>(null);const interaction=useRef<Op|null>(null);const marquee=useRef<{startX:number;startY:number;add:boolean}|null>(null);const guideDrag=useRef<{id:string;orientation:'VERTICAL'|'HORIZONTAL';creating:boolean}|null>(null);const [guidePreview,setGuidePreview]=useState<{orientation:'VERTICAL'|'HORIZONTAL';positionMm:number}|null>(null);const [marqueeRect,setMarqueeRect]=useState<DesignRectMm|null>(null);const [snapGuides,setSnapGuides]=useState<SnapGuideIndicator[]>([]);
 const point=(e:React.PointerEvent)=>{const r=canvas.current!.getBoundingClientRect();return{xMm:(e.clientX-r.left)/r.width*artboard.widthMm,yMm:(e.clientY-r.top)/r.height*artboard.heightMm};};
 const downCanvas=(e:React.PointerEvent<HTMLDivElement>)=>{if(e.target!==e.currentTarget&&!(e.target as HTMLElement).classList.contains('card-artboard-empty-state'))return;if(e.button!==0)return;const p=point(e);e.currentTarget.setPointerCapture(e.pointerId);marquee.current={startX:p.xMm,startY:p.yMm,add:e.shiftKey};setMarqueeRect({xMm:p.xMm,yMm:p.yMm,widthMm:0,heightMm:0});if(!e.shiftKey)setSelection(emptySelection(artboard.id));};
 const moveCanvas=(e:React.PointerEvent<HTMLDivElement>)=>{const p=point(e),guide=guideDrag.current;if(guide){const raw=guide.orientation==='VERTICAL'?p.xMm:p.yMm;const max=guide.orientation==='VERTICAL'?artboard.widthMm:artboard.heightMm;const positionMm=clamp(raw,0,max);setGuidePreview({orientation:guide.orientation,positionMm});if(!guide.creating)mutate(t=>moveGuide(t,artboard.id,guide.id,positionMm));return;}const op=interaction.current;const snapOptions={enabled:snapEnabled&&!e.altKey,toleranceMm:1.5,snapToArtboard:true,snapToElements:true,snapToGuides:guideSnapEnabled,snapToGrid:gridSnapEnabled,gridSizeMm};if(op?.mode==='MOVE'){const dx=p.xMm-op.lastX,dy=p.yMm-op.lastY;interaction.current={...op,lastX:p.xMm,lastY:p.yMm};const snapped=snapMoveDelta(artboard,op.ids,{xMm:dx,yMm:dy},snapOptions);setSnapGuides(snapped.guides);mutate(t=>moveElements(t,artboard.id,op.ids,snapped.delta));return;}if(op?.mode==='RESIZE'){const dx=p.xMm-op.startX,dy=p.yMm-op.startY,base=op.element.size;let w=base.widthMm,h=base.heightMm;if(op.anchor.includes('E'))w+=dx;if(op.anchor.includes('W'))w-=dx;if(op.anchor.includes('S'))h+=dy;if(op.anchor.includes('N'))h-=dy;const snapped=snapResizeSize(artboard,op.element,op.anchor,{widthMm:w,heightMm:h},snapOptions);setSnapGuides(snapped.guides);mutate(t=>resizeElement(t,artboard.id,op.element.id,snapped.size,{anchor:op.anchor,maintainAspectRatio:op.keepAspect}));return;}if(op?.mode==='ROTATE'){setSnapGuides([]);const c={xMm:op.element.position.xMm+op.element.size.widthMm/2,yMm:op.element.position.yMm+op.element.size.heightMm/2},angle=Math.atan2(p.yMm-c.yMm,p.xMm-c.xMm);mutate(t=>rotateElement(t,artboard.id,op.element.id,op.startRotation+(angle-op.startAngle)*180/Math.PI));return;}if(marquee.current){const m=marquee.current;setMarqueeRect({xMm:Math.min(m.startX,p.xMm),yMm:Math.min(m.startY,p.yMm),widthMm:Math.abs(p.xMm-m.startX),heightMm:Math.abs(p.yMm-m.startY)});}};
 const upCanvas=()=>{if(guideDrag.current){const drag=guideDrag.current;if(drag.creating&&guidePreview)commitMutate(t=>addGuide(t,artboard.id,{id:drag.id,orientation:drag.orientation,positionMm:guidePreview.positionMm,locked:false}));else endHistoryTransaction();guideDrag.current=null;setGuidePreview(null);return;}if(marquee.current&&marqueeRect)setSelection(selectByMarquee(artboard,marqueeRect,marquee.current.add?'ADD':'REPLACE',selection));if(interaction.current)endHistoryTransaction();interaction.current=null;marquee.current=null;setMarqueeRect(null);setSnapGuides([]);};
 const capture=(ev:React.PointerEvent)=>{ev.stopPropagation();(ev.currentTarget.closest('.card-artboard-canvas') as HTMLElement)?.setPointerCapture?.(ev.pointerId);};
 const ticks=rulerTicks(artboard,zoom),print=resolvePrintSettings(artboard.print),gridPx=gridSizeMm*MM_TO_CSS_PX;const canvasStyle:React.CSSProperties={width:`${artboard.widthMm*MM_TO_CSS_PX}px`,height:`${artboard.heightMm*MM_TO_CSS_PX}px`,transform:`scale(${zoom/100})`,backgroundColor:bg(artboard),backgroundImage:showGrid?`linear-gradient(to right, rgba(100,116,139,.16) 1px, transparent 1px),linear-gradient(to bottom, rgba(100,116,139,.16) 1px, transparent 1px)`:undefined,backgroundSize:showGrid?`${gridPx}px ${gridPx}px`:undefined};
 return <div ref={canvas} className={`card-artboard-canvas ${showRulers?'with-rulers':''}`} data-artboard-id={artboard.id} style={canvasStyle} onPointerDown={downCanvas} onPointerMove={moveCanvas} onPointerUp={upCanvas} onPointerCancel={upCanvas}>
  {showRulers&&<><div className="card-ruler-corner"/><div className="card-ruler card-ruler-top" onPointerDown={ev=>{if(ev.button!==0)return;capture(ev);const p=point(ev);guideDrag.current={id:id('guide'),orientation:'VERTICAL',creating:true};setGuidePreview({orientation:'VERTICAL',positionMm:p.xMm});}}>{ticks.x.map(t=><i key={t.key} className={t.major?'major':''} style={{left:t.positionMm*MM_TO_CSS_PX}}><span>{t.label}</span></i>)}</div><div className="card-ruler card-ruler-left" onPointerDown={ev=>{if(ev.button!==0)return;capture(ev);const p=point(ev);guideDrag.current={id:id('guide'),orientation:'HORIZONTAL',creating:true};setGuidePreview({orientation:'HORIZONTAL',positionMm:p.yMm});}}>{ticks.y.map(t=><i key={t.key} className={t.major?'major':''} style={{top:t.positionMm*MM_TO_CSS_PX}}><span>{t.label}</span></i>)}</div></>}
  {print.showBleedInEditor&&<div className="card-print-bleed-boundary" style={{left:-print.bleed.leftMm*MM_TO_CSS_PX,top:-print.bleed.topMm*MM_TO_CSS_PX,right:-print.bleed.rightMm*MM_TO_CSS_PX,bottom:-print.bleed.bottomMm*MM_TO_CSS_PX}}/>}
  <div className="card-print-trim-boundary"/>
  {print.showSafeAreaInEditor&&<div className="card-print-safe-boundary" style={{left:print.safeArea.leftMm*MM_TO_CSS_PX,top:print.safeArea.topMm*MM_TO_CSS_PX,right:print.safeArea.rightMm*MM_TO_CSS_PX,bottom:print.safeArea.bottomMm*MM_TO_CSS_PX}}/>}
  {print.showCropMarksInEditor&&<div className="card-print-crop-marks"><i className="tl"/><i className="tr"/><i className="bl"/><i className="br"/></div>}
  {artboard.guides.map(guide=><div key={guide.id} className={`card-user-guide ${guide.orientation==='VERTICAL'?'vertical':'horizontal'} ${guide.locked?'locked':''}`} style={guide.orientation==='VERTICAL'?{left:guide.positionMm*MM_TO_CSS_PX}:{top:guide.positionMm*MM_TO_CSS_PX}} title={`${guide.locked?'Locked ':''}${guide.orientation.toLowerCase()} guide · ${normalizeDisplayValue(mmToUnit(guide.positionMm,artboard.displayUnit))} ${artboard.displayUnit==='MM'?'mm':'in'} · double click to delete`} onDoubleClick={ev=>{ev.stopPropagation();if(!guide.locked)commitMutate(t=>deleteGuide(t,artboard.id,guide.id));}} onPointerDown={ev=>{if(ev.button!==0||guide.locked)return;capture(ev);beginHistoryTransaction();guideDrag.current={id:guide.id,orientation:guide.orientation,creating:false};}}/>)}
  {guidePreview&&<div className={`card-user-guide preview ${guidePreview.orientation==='VERTICAL'?'vertical':'horizontal'}`} style={guidePreview.orientation==='VERTICAL'?{left:guidePreview.positionMm*MM_TO_CSS_PX}:{top:guidePreview.positionMm*MM_TO_CSS_PX}}/>}
  {artboard.elements.length===0&&<div className="card-artboard-empty-state"><strong>{artboard.name}</strong><span>Add text, shapes or images from the left panel</span><small>Every element uses the shared Selection & Transform Engine.</small></div>}
  {artboard.elements.filter(e=>e.visible).map(e=>{const isSelected=selection.elementIds.includes(e.id);return <div key={e.id} data-element-id={e.id} className={`card-design-element-shell has-visual type-${e.type.toLowerCase()} ${isSelected?'selected':''} ${e.locked?'locked':''}`} style={{left:e.position.xMm*MM_TO_CSS_PX,top:e.position.yMm*MM_TO_CSS_PX,width:e.size.widthMm*MM_TO_CSS_PX,height:e.size.heightMm*MM_TO_CSS_PX,transform:`rotate(${e.rotationDeg}deg)`,opacity:e.opacity,zIndex:e.zIndex}} onPointerDown={ev=>{if(ev.button!==0)return;capture(ev);const p=point(ev),groupIds=expandElementIdsToGroups(artboard,[e.id]),toggle=ev.ctrlKey||ev.metaKey||ev.shiftKey;let next:DesignSelectionState;if(toggle){const remove=groupIds.every(gid=>selection.elementIds.includes(gid));next=selection;for(const gid of groupIds)if(remove===next.elementIds.includes(gid))next=toggleSelection(next,gid);if(!remove)next={...next,primaryElementId:e.id};}else next=isSelected?selection:{artboardId:artboard.id,elementIds:groupIds,primaryElementId:e.id};setSelection(next);if(!toggle&&!e.locked&&next.elementIds.includes(e.id)){beginHistoryTransaction();interaction.current={mode:'MOVE',lastX:p.xMm,lastY:p.yMm,ids:expandElementIdsToGroups(artboard,next.elementIds)};}}}>
    <ElementVisual element={e} assets={assets} mutate={commitMutate} artboardId={artboard.id}/>
    {isSelected&&!e.locked&&<><i className="card-rotation-stem"/><i className="card-rotation-handle" onPointerDown={ev=>{capture(ev);const p=point(ev),c={xMm:e.position.xMm+e.size.widthMm/2,yMm:e.position.yMm+e.size.heightMm/2};beginHistoryTransaction();interaction.current={mode:'ROTATE',element:e,startAngle:Math.atan2(p.yMm-c.yMm,p.xMm-c.xMm),startRotation:e.rotationDeg};}}/>{(['nw','n','ne','e','se','s','sw','w'] as const).map(h=><i key={h} className={`card-transform-handle ${h}`} onPointerDown={ev=>{capture(ev);const p=point(ev);beginHistoryTransaction();interaction.current={mode:'RESIZE',element:e,anchor:h.toUpperCase() as Op extends {mode:'RESIZE';anchor:infer A}?A:never,startX:p.xMm,startY:p.yMm,keepAspect:ev.shiftKey||(e.type==='IMAGE'&&e.maintainAspectRatio===true)};}}/>)}</>}
   </div>})}
  {snapGuides.map((guide,index)=>guide.axis==='X'?<div key={`snap-x-${index}`} className={`card-smart-guide vertical source-${guide.source.toLowerCase()}`} style={{left:guide.positionMm*MM_TO_CSS_PX}}/>:<div key={`snap-y-${index}`} className={`card-smart-guide horizontal source-${guide.source.toLowerCase()}`} style={{top:guide.positionMm*MM_TO_CSS_PX}}/>)}
  {marqueeRect&&<div className="card-selection-marquee" style={{left:marqueeRect.xMm*MM_TO_CSS_PX,top:marqueeRect.yMm*MM_TO_CSS_PX,width:marqueeRect.widthMm*MM_TO_CSS_PX,height:marqueeRect.heightMm*MM_TO_CSS_PX}}/>}
 </div>;
}

function LayerPanel({artboard,selection,setSelection,mutate,duplicateSelected,groupSelected,ungroupSelected}:{artboard:Artboard;selection:DesignSelectionState;setSelection:(s:DesignSelectionState)=>void;mutate:(f:(t:DesignTemplate)=>DesignTemplate)=>void;duplicateSelected:()=>void;groupSelected:()=>void;ungroupSelected:()=>void}){
 const layers=orderedLayers(artboard);const selectedSet=new Set(selection.elementIds);const selectedGroups=[...new Set(selection.elementIds.map(id=>groupForElement(artboard,id)?.id).filter(Boolean) as string[])];
 return <div className="card-layers-panel"><div className="card-panel-heading"><div><strong>Layers</strong><small>{layers.length} element{layers.length===1?'':'s'}</small></div></div><div className="card-layer-actions"><button onClick={duplicateSelected} disabled={!selection.elementIds.length}>Duplicate</button><button onClick={groupSelected} disabled={selection.elementIds.length<2||selectedGroups.length>0}>Group</button><button onClick={ungroupSelected} disabled={!selectedGroups.length}>Ungroup</button></div><div className="card-layer-list">{layers.length?layers.map(layer=>{const group=groupForElement(artboard,layer.id);return <div key={layer.id} className={`card-layer-row ${selectedSet.has(layer.id)?'active':''}`}><button className="card-layer-main" onClick={()=>setSelection({artboardId:artboard.id,elementIds:expandElementIdsToGroups(artboard,[layer.id]),primaryElementId:layer.id})}><span>{layer.type}</span><input aria-label={`Rename ${layer.name}`} value={layer.name} onClick={e=>e.stopPropagation()} onChange={e=>mutate(t=>renameElement(t,artboard.id,layer.id,e.target.value))}/>{group&&<small>{group.name}</small>}</button><div className="card-layer-mini"><button title={layer.visible?'Hide':'Show'} onClick={()=>mutate(t=>group?setGroupVisibility(t,artboard.id,group.id,!layer.visible):setElementVisibility(t,artboard.id,layer.id,!layer.visible))}>{layer.visible?'◉':'○'}</button><button title={layer.locked?'Unlock':'Lock'} onClick={()=>mutate(t=>group?setGroupLocked(t,artboard.id,group.id,!layer.locked):setElementLocked(t,artboard.id,layer.id,!layer.locked))}>{layer.locked?'🔒':'🔓'}</button><button title="Bring forward" onClick={()=>mutate(t=>moveLayer(t,artboard.id,layer.id,'FORWARD'))}>↑</button><button title="Send backward" onClick={()=>mutate(t=>moveLayer(t,artboard.id,layer.id,'BACKWARD'))}>↓</button><button title="Bring to front" onClick={()=>mutate(t=>moveLayer(t,artboard.id,layer.id,'FRONT'))}>⇈</button><button title="Send to back" onClick={()=>mutate(t=>moveLayer(t,artboard.id,layer.id,'BACK'))}>⇊</button></div></div>}):<div className="card-layer-empty">Add an element to create the first layer.</div>}</div></div>;
}

function ElementVisual({element,assets,mutate,artboardId}:{element:DesignElement;assets:DesignTemplate['sharedAssets'];mutate:(f:(t:DesignTemplate)=>DesignTemplate)=>void;artboardId:string}){
 if(element.type==='TEXT')return <div className="card-text-visual" style={{fontFamily:element.style.fontFamily,fontSize:`${element.style.fontSizePt}pt`,fontWeight:element.style.fontWeight,fontStyle:element.style.italic?'italic':'normal',textDecoration:element.style.underline?'underline':'none',color:element.style.color,textAlign:element.style.alignment.toLowerCase() as 'left'|'center'|'right',lineHeight:element.style.lineHeight,letterSpacing:`${element.style.letterSpacingPt}pt`,textShadow:textShadowCss(element.shadow)}} onDoubleClick={ev=>{ev.stopPropagation();const value=window.prompt('Edit text',element.text);if(value!==null)mutate(t=>updateDesignElement(t,artboardId,element.id,e=>e.type==='TEXT'?{...e,text:value}:e));}}>{element.text}</div>;
 if(element.type==='SHAPE')return <ShapeVisual element={element}/>;
 if(element.type==='IMAGE'){const asset=assets.find(a=>a.id===element.assetId),kind=assetRenderKind(asset);return <div className="card-image-visual" style={{borderRadius:`${element.cornerRadiusMm??0}mm`,border:strokeCss(element.stroke),boxShadow:boxShadowCss(element.shadow)}}>{kind==='RASTER_IMAGE'&&asset?<img src={asset.source} alt={element.name} draggable={false} style={{objectFit:element.fit==='FIT'?'contain':element.fit==='FILL'?'cover':'fill',transform:`scale(${element.flipX?-1:1},${element.flipY?-1:1})`}}/>:<div className="card-missing-asset">{kind==='MISSING'?'Missing Asset':'Unsupported Asset'}</div>}</div>;}
 if(element.type==='SVG'){const asset=assets.find(a=>a.id===element.assetId),kind=assetRenderKind(asset),tinted=kind==='VECTOR_SVG'&&asset&&asset.metadata?.recolorable===true&&element.tintColor;return <div className="card-svg-visual" style={{border:strokeCss(element.stroke),filter:dropShadowCss(element.shadow)}}>{kind==='VECTOR_SVG'&&asset?(tinted?<div className="card-svg-tint" style={{backgroundColor:element.tintColor,maskImage:`url("${asset.source}")`,WebkitMaskImage:`url("${asset.source}")`}}/>:<img src={asset.source} alt={element.name} draggable={false}/>):<div className="card-missing-asset">{kind==='MISSING'?'Missing Asset':'Unsupported Asset'}</div>}</div>;}
 return <div className="card-unsupported-element">{element.type}</div>;
}

function ShapeVisual({element}:{element:ShapeDesignElement}){const gradientId=`gradient-${element.id.replace(/[^a-zA-Z0-9_-]/g,'')}`,fill=element.fill.type==='SOLID'?element.fill.color:element.fill.type==='LINEAR_GRADIENT'?`url(#${gradientId})`:'transparent',fillOpacity=element.fill.type==='SOLID'?(element.fill.opacity??1):1,stroke=element.stroke.style==='NONE'?'none':colorWithOpacity(element.stroke.color,element.stroke.opacity??1),sw=Math.max(.4,element.stroke.widthMm*MM_TO_CSS_PX),dash=element.stroke.style==='DASHED'?'6 4':element.stroke.style==='DOTTED'?'2 3':undefined;const common={fill,fillOpacity,stroke,strokeWidth:sw,strokeDasharray:dash,vectorEffect:'non-scaling-stroke' as const};return <svg className="card-shape-visual" style={{filter:dropShadowCss(element.shadow)}} viewBox="0 0 100 100" preserveAspectRatio="none">{element.fill.type==='LINEAR_GRADIENT'&&<defs><linearGradient id={gradientId} gradientTransform={`rotate(${element.fill.gradient.angleDeg} .5 .5)`}>{element.fill.gradient.stops.map((stop,index)=><stop key={index} offset={`${stop.offset}%`} stopColor={stop.color} stopOpacity={stop.opacity??1}/>)}</linearGradient></defs>}{shapeNode(element,common)}</svg>;}
function shapeNode(element:ShapeDesignElement,common:Record<string,unknown>){switch(element.shape){case'RECTANGLE':return <rect x="1" y="1" width="98" height="98" {...common}/>;case'ROUNDED_RECTANGLE':return <rect x="1" y="1" width="98" height="98" rx={Math.min(48,(element.cornerRadiusMm??3)*4)} ry={Math.min(48,(element.cornerRadiusMm??3)*4)} {...common}/>;case'CIRCLE':case'ELLIPSE':return <ellipse cx="50" cy="50" rx="48" ry="48" {...common}/>;case'LINE':return <line x1="2" y1="50" x2="98" y2="50" {...common} fill="none"/>;case'TRIANGLE':return <polygon points="50,2 98,98 2,98" {...common}/>;case'ARROW':return <polygon points="2,35 62,35 62,15 98,50 62,85 62,65 2,65" {...common}/>;case'STAR':return <polygon points="50,2 61,36 97,36 68,57 79,92 50,71 21,92 32,57 3,36 39,36" {...common}/>;case'POLYGON':return <polygon points="25,3 75,3 98,50 75,97 25,97 2,50" {...common}/>;case'RIBBON':return <polygon points="2,20 20,20 20,8 80,8 80,20 98,20 88,50 98,80 80,80 80,92 20,92 20,80 2,80 12,50" {...common}/>;case'BADGE':return <polygon points="50,2 62,14 79,9 86,25 97,37 88,52 92,69 76,77 67,94 50,87 33,94 24,77 8,69 12,52 3,37 14,25 21,9 38,14" {...common}/>;default:return null;}}

function ElementProperties({element,asset,artboard,mutate}:{element:DesignElement;asset?:AssetReference;artboard:Artboard;mutate:(f:(t:DesignTemplate)=>DesignTemplate)=>void}){
 const artboardId=artboard.id;
 const num=(label:string,value:number,onChange:(v:number)=>void,step='0.1')=><label>{label}<input type="number" step={step} value={normalizeDisplayValue(value)} disabled={element.locked} onChange={e=>{const v=Number(e.target.value);if(Number.isFinite(v))onChange(v);}}/></label>;
 const update=(fn:(e:DesignElement)=>DesignElement)=>mutate(t=>updateDesignElement(t,artboardId,element.id,fn));
 return <div className="card-property-sections"><div className="card-property-note"><strong>{element.name}</strong><span>{element.type}{element.locked?' · Locked':''}</span></div>
  {element.type==='TEXT'&&<AdvancedTextProperties element={element} update={update}/>} {element.type==='SHAPE'&&<AdvancedShapeProperties element={element} update={update}/>} {element.type==='IMAGE'&&<AdvancedImageProperties element={element} update={update}/>} {element.type==='SVG'&&<SvgProperties element={element} asset={asset} update={update}/>} 
  {(element.type==='IMAGE'||element.type==='SVG')&&<ElementPrintQuality element={element} asset={asset} print={artboard.print}/>} 
  <details className="card-property-details"><summary>Transform</summary><div className="card-property-grid">{num('X (mm)',element.position.xMm,v=>mutate(t=>setElementPosition(t,artboardId,element.id,{xMm:v,yMm:element.position.yMm})))}{num('Y (mm)',element.position.yMm,v=>mutate(t=>setElementPosition(t,artboardId,element.id,{xMm:element.position.xMm,yMm:v})))}{num('Width (mm)',element.size.widthMm,v=>mutate(t=>resizeElement(t,artboardId,element.id,{widthMm:v,heightMm:element.size.heightMm})))}{num('Height (mm)',element.size.heightMm,v=>mutate(t=>resizeElement(t,artboardId,element.id,{widthMm:element.size.widthMm,heightMm:v})))}</div>{num('Rotation (°)',element.rotationDeg,v=>mutate(t=>rotateElement(t,artboardId,element.id,v)))}</details>
  <details className="card-property-details"><summary>Align to Artboard</summary><div className="card-layer-action-grid card-align-grid"><button disabled={element.locked} onClick={()=>mutate(t=>alignElements(t,artboardId,[element.id],'LEFT','ARTBOARD'))}>Left</button><button disabled={element.locked} onClick={()=>mutate(t=>alignElements(t,artboardId,[element.id],'HCENTER','ARTBOARD'))}>H Center</button><button disabled={element.locked} onClick={()=>mutate(t=>alignElements(t,artboardId,[element.id],'RIGHT','ARTBOARD'))}>Right</button><button disabled={element.locked} onClick={()=>mutate(t=>alignElements(t,artboardId,[element.id],'TOP','ARTBOARD'))}>Top</button><button disabled={element.locked} onClick={()=>mutate(t=>alignElements(t,artboardId,[element.id],'VCENTER','ARTBOARD'))}>V Center</button><button disabled={element.locked} onClick={()=>mutate(t=>alignElements(t,artboardId,[element.id],'BOTTOM','ARTBOARD'))}>Bottom</button><button disabled={element.locked} onClick={()=>mutate(t=>centerElementsOnArtboard(t,artboardId,[element.id],'BOTH'))}>Center Both</button></div></details>
  <button className="card-delete-element" disabled={element.locked} onClick={()=>mutate(t=>deleteDesignElements(t,artboardId,[element.id]))}><Trash2 size={14}/>Delete Element</button>
 </div>;
}
function OpacityControl({value,onChange}:{value:number;onChange:(value:number)=>void}){const percent=Math.round(clamp(value,0,1)*100);return <label>Opacity<div className="card-range-row"><input type="range" min="0" max="100" value={percent} onChange={e=>onChange(Number(e.target.value)/100)}/><input type="number" min="0" max="100" value={percent} onChange={e=>onChange(clamp(Number(e.target.value)||0,0,100)/100)}/><span>%</span></div></label>}
function ShadowControls({shadow,onChange}:{shadow?:DesignShadow;onChange:(shadow:DesignShadow)=>void}){const s=shadow??DEFAULT_DESIGN_SHADOW,patch=(p:Partial<DesignShadow>)=>onChange({...s,...p});return <details className="card-property-details"><summary>Shadow</summary><label className="card-check-row"><input type="checkbox" checked={s.enabled} onChange={e=>patch({enabled:e.target.checked})}/>Enabled</label>{s.enabled&&<><label>Color<div className="card-color-row"><input type="color" value={s.color} onChange={e=>patch({color:e.target.value})}/><input value={s.color} onChange={e=>patch({color:e.target.value})}/></div></label><div className="card-property-grid"><label>Opacity (%)<input type="number" min="0" max="100" value={Math.round(s.opacity*100)} onChange={e=>patch({opacity:clamp(Number(e.target.value)||0,0,100)/100})}/></label><label>Blur (mm)<input type="number" min="0" step=".1" value={s.blurMm} onChange={e=>patch({blurMm:Math.max(0,Number(e.target.value)||0)})}/></label><label>Offset X (mm)<input type="number" step=".1" value={s.offsetXmm} onChange={e=>patch({offsetXmm:Number(e.target.value)||0})}/></label><label>Offset Y (mm)<input type="number" step=".1" value={s.offsetYmm} onChange={e=>patch({offsetYmm:Number(e.target.value)||0})}/></label></div></>}</details>}
function BorderControls({stroke,onChange}:{stroke?:ShapeDesignElement['stroke'];onChange:(stroke:ShapeDesignElement['stroke'])=>void}){const s=stroke??{color:'#000000',widthMm:0,style:'NONE',opacity:1},patch=(p:Partial<typeof s>)=>onChange({...s,...p});return <details className="card-property-details"><summary>Border</summary><label>Style<select value={s.style} onChange={e=>patch({style:e.target.value as typeof s.style})}><option value="NONE">None</option><option value="SOLID">Solid</option><option value="DASHED">Dashed</option><option value="DOTTED">Dotted</option></select></label>{s.style!=='NONE'&&<><label>Color<div className="card-color-row"><input type="color" value={s.color} onChange={e=>patch({color:e.target.value})}/><input value={s.color} onChange={e=>patch({color:e.target.value})}/></div></label><div className="card-property-grid"><label>Width (mm)<input type="number" min="0" step=".1" value={s.widthMm} onChange={e=>patch({widthMm:Math.max(0,Number(e.target.value)||0)})}/></label><label>Opacity (%)<input type="number" min="0" max="100" value={Math.round((s.opacity??1)*100)} onChange={e=>patch({opacity:clamp(Number(e.target.value)||0,0,100)/100})}/></label></div></>}</details>}
function AdvancedTextProperties({element,update}:{element:TextDesignElement;update:(f:(e:DesignElement)=>DesignElement)=>void}){const patch=(p:Partial<TextDesignElement>)=>update(e=>e.type==='TEXT'?{...e,...p}:e),style=(p:Partial<TextDesignElement['style']>)=>patch({style:{...element.style,...p}});return <><details className="card-property-details" open><summary>Typography</summary><label>Content<textarea value={element.text} onChange={e=>patch({text:e.target.value})}/></label><label>Font<select value={element.style.fontFamily} onChange={e=>style({fontFamily:e.target.value})}>{['Arial','Helvetica','Georgia','Times New Roman','Verdana','Trebuchet MS','Courier New'].map(f=><option key={f}>{f}</option>)}</select></label><div className="card-property-grid"><label>Size (pt)<input type="number" min="1" value={element.style.fontSizePt} onChange={e=>style({fontSizePt:Math.max(1,Number(e.target.value)||1)})}/></label><label>Weight<select value={element.style.fontWeight} onChange={e=>style({fontWeight:Number(e.target.value)})}>{[300,400,500,600,700,800].map(w=><option key={w} value={w}>{w}</option>)}</select></label></div><div className="card-segmented-control triple"><button className={element.style.italic?'active':''} onClick={()=>style({italic:!element.style.italic})}>Italic</button><button className={element.style.underline?'active':''} onClick={()=>style({underline:!element.style.underline})}>Underline</button><button className={element.style.fontWeight>=700?'active':''} onClick={()=>style({fontWeight:element.style.fontWeight>=700?400:700})}>Bold</button></div><label>Alignment<select value={element.style.alignment} onChange={e=>style({alignment:e.target.value as TextDesignElement['style']['alignment']})}><option value="LEFT">Left</option><option value="CENTER">Center</option><option value="RIGHT">Right</option></select></label><div className="card-property-grid"><label>Line height<input type="number" min=".5" step=".1" value={element.style.lineHeight} onChange={e=>style({lineHeight:Math.max(.5,Number(e.target.value)||1.2)})}/></label><label>Letter spacing<input type="number" step=".1" value={element.style.letterSpacingPt} onChange={e=>style({letterSpacingPt:Number(e.target.value)||0})}/></label></div></details><details className="card-property-details" open><summary>Appearance</summary><label>Text color<div className="card-color-row"><input type="color" value={element.style.color} onChange={e=>style({color:e.target.value})}/><input value={element.style.color} onChange={e=>style({color:e.target.value})}/></div></label><OpacityControl value={element.opacity} onChange={opacity=>patch({opacity})}/></details><ShadowControls shadow={element.shadow} onChange={shadow=>patch({shadow})}/></>}
function AdvancedShapeProperties({element,update}:{element:ShapeDesignElement;update:(f:(e:DesignElement)=>DesignElement)=>void}){const patch=(p:Partial<ShapeDesignElement>)=>update(e=>e.type==='SHAPE'?{...e,...p}:e),mode=element.fill.type==='NONE'?'NONE':element.fill.type==='LINEAR_GRADIENT'?'LINEAR_GRADIENT':'SOLID',solid=element.fill.type==='SOLID'?element.fill:{type:'SOLID' as const,color:'#dbeafe',opacity:1},gradient=element.fill.type==='LINEAR_GRADIENT'?element.fill.gradient:{type:'LINEAR' as const,angleDeg:0,stops:[{offset:0,color:'#2563eb'},{offset:100,color:'#dbeafe'}]},setGradient=(p:Partial<typeof gradient>)=>patch({fill:{type:'LINEAR_GRADIENT',gradient:{...gradient,...p}}}),setStop=(index:number,p:Partial<(typeof gradient.stops)[number]>)=>setGradient({stops:gradient.stops.map((s,i)=>i===index?{...s,...p}:s)});return <><details className="card-property-details" open><summary>Appearance</summary><label>Shape<select value={element.shape} onChange={e=>patch({shape:e.target.value as DesignShapeKind})}>{SHAPES.map(s=><option key={s} value={s}>{shapeLabel(s)}</option>)}</select></label><label>Fill<select value={mode} onChange={e=>patch({fill:e.target.value==='NONE'?{type:'NONE'}:e.target.value==='LINEAR_GRADIENT'?{type:'LINEAR_GRADIENT',gradient}:solid})}><option value="SOLID">Solid</option><option value="NONE">Transparent</option><option value="LINEAR_GRADIENT">Linear Gradient</option></select></label>{mode==='SOLID'&&<label>Fill color<div className="card-color-row"><input type="color" value={solid.color} onChange={e=>patch({fill:{...solid,color:e.target.value}})}/><input value={solid.color} readOnly/></div></label>}{mode==='LINEAR_GRADIENT'&&<div className="card-gradient-editor"><label>Angle (°)<input type="number" min="0" max="360" value={gradient.angleDeg} onChange={e=>setGradient({angleDeg:clamp(Number(e.target.value)||0,0,360)})}/></label>{gradient.stops.map((stop,index)=><div className="card-gradient-stop" key={index}><input type="color" value={stop.color} onChange={e=>setStop(index,{color:e.target.value})}/><input aria-label="Stop position" type="number" min="0" max="100" value={stop.offset} onChange={e=>setStop(index,{offset:clamp(Number(e.target.value)||0,0,100)})}/><button disabled={index===0} onClick={()=>setGradient({stops:moveItem(gradient.stops,index,index-1)})}>↑</button><button disabled={index===gradient.stops.length-1} onClick={()=>setGradient({stops:moveItem(gradient.stops,index,index+1)})}>↓</button><button disabled={gradient.stops.length<=2} onClick={()=>setGradient({stops:gradient.stops.filter((_,i)=>i!==index)})}>×</button></div>)}<button onClick={()=>setGradient({stops:[...gradient.stops,{offset:100,color:'#ffffff'}]})}>Add Stop</button></div>}<OpacityControl value={element.opacity} onChange={opacity=>patch({opacity})}/>{(element.shape==='RECTANGLE'||element.shape==='ROUNDED_RECTANGLE')&&<label>Corner radius (mm)<input type="number" min="0" step=".5" value={element.cornerRadiusMm??0} onChange={e=>patch({cornerRadiusMm:Math.max(0,Number(e.target.value)||0)})}/></label>}</details><BorderControls stroke={element.stroke} onChange={stroke=>patch({stroke})}/><ShadowControls shadow={element.shadow} onChange={shadow=>patch({shadow})}/></>}
function AdvancedImageProperties({element,update}:{element:ImageDesignElement;update:(f:(e:DesignElement)=>DesignElement)=>void}){const patch=(p:Partial<ImageDesignElement>)=>update(e=>e.type==='IMAGE'?{...e,...p}:e);return <><details className="card-property-details" open><summary>Image</summary><label>Fit<select value={element.fit} onChange={e=>patch({fit:e.target.value as ImageDesignElement['fit']})}><option value="FIT">Fit</option><option value="FILL">Fill</option><option value="STRETCH">Stretch</option></select></label><div className="card-segmented-control"><button className={element.flipX?'active':''} onClick={()=>patch({flipX:!element.flipX})}>Flip X</button><button className={element.flipY?'active':''} onClick={()=>patch({flipY:!element.flipY})}>Flip Y</button></div><label className="card-check-row"><input type="checkbox" checked={element.maintainAspectRatio??true} onChange={e=>patch({maintainAspectRatio:e.target.checked})}/>Lock aspect ratio</label></details><details className="card-property-details" open><summary>Appearance</summary><OpacityControl value={element.opacity} onChange={opacity=>patch({opacity})}/><label>Corner radius (mm)<input type="number" min="0" step=".5" value={element.cornerRadiusMm??0} onChange={e=>patch({cornerRadiusMm:Math.max(0,Number(e.target.value)||0)})}/></label></details><BorderControls stroke={element.stroke} onChange={stroke=>patch({stroke})}/><ShadowControls shadow={element.shadow} onChange={shadow=>patch({shadow})}/></>}
function SvgProperties({element,asset,update}:{element:SvgDesignElement;asset?:AssetReference;update:(f:(e:DesignElement)=>DesignElement)=>void}){const patch=(p:Partial<SvgDesignElement>)=>update(e=>e.type==='SVG'?{...e,...p}:e),canTint=asset?.metadata?.recolorable===true;return <><details className="card-property-details" open><summary>Appearance</summary><OpacityControl value={element.opacity} onChange={opacity=>patch({opacity})}/>{canTint&&<label>SVG Color / Tint<div className="card-color-row"><input type="color" value={element.tintColor??'#111827'} onChange={e=>patch({tintColor:e.target.value})}/><input value={element.tintColor??''} placeholder="Original" onChange={e=>patch({tintColor:e.target.value||undefined})}/></div></label>}</details><BorderControls stroke={element.stroke} onChange={stroke=>patch({stroke})}/><ShadowControls shadow={element.shadow} onChange={shadow=>patch({shadow})}/></>}
function BatchOpacityProperties({elements,artboard,mutate}:{elements:DesignElement[];artboard:Artboard;mutate:(f:(t:DesignTemplate)=>DesignTemplate)=>void}){const compatible=elements.filter(e=>['TEXT','SHAPE','IMAGE','SVG'].includes(e.type)),first=compatible[0]?.opacity,mixed=compatible.some(e=>Math.abs(e.opacity-(first??e.opacity))>.0001),percent=Math.round((first??1)*100);if(!compatible.length)return null;return <details className="card-property-details" open><summary>Appearance</summary><label>Opacity {mixed?'(Mixed)':''}<div className="card-range-row"><input type="range" min="0" max="100" value={mixed?100:percent} onChange={e=>mutate(t=>updateElementsOpacity(t,artboard.id,compatible.map(x=>x.id),Number(e.target.value)/100))}/><span>{mixed?'Mixed':`${percent}%`}</span></div></label></details>}
function ElementPrintQuality({element,asset,print}:{element:ImageDesignElement|SvgDesignElement;asset?:AssetReference;print:Artboard['print']}){if(element.type==='SVG')return <details className="card-property-details" open><summary>Print Quality</summary><div className={`card-print-quality ${assetRenderKind(asset)==='VECTOR_SVG'?'good':'error'}`}><strong>{assetRenderKind(asset)==='VECTOR_SVG'?'Vector — resolution independent':asset?'Unsupported Asset':'Missing Asset'}</strong></div></details>;const quality=imagePrintQuality(element,asset,print);return <details className="card-property-details" open><summary>Print Quality</summary><div className={`card-print-quality ${quality.status.toLowerCase()}`}><strong>{quality.message}</strong><span>Source: {asset?.widthPx&&asset?.heightPx?`${asset.widthPx} × ${asset.heightPx} px`:'Dimensions unavailable'}</span><span>Placed: {normalizeDisplayValue(element.size.widthMm)} × {normalizeDisplayValue(element.size.heightMm)} mm</span><span>Effective: {quality.effectiveDpi?`${Math.round(quality.effectiveDpi)} DPI`:'Unknown'}</span></div></details>}
function MultiSelectionProperties({elements,artboard,mutate,groupSelected,ungroupSelected}:{elements:DesignElement[];artboard:Artboard;mutate:(f:(t:DesignTemplate)=>DesignTemplate)=>void;groupSelected:()=>void;ungroupSelected:()=>void}){
 const [reference,setReference]=useState<DesignAlignmentReference>('SELECTION');
 const b=getSelectionBounds(elements),ids=elements.map(e=>e.id),grouped=elements.some(e=>e.groupId),unitCount=getAlignmentUnitCount(artboard,ids);
 const align=(mode:'LEFT'|'HCENTER'|'RIGHT'|'TOP'|'VCENTER'|'BOTTOM')=>mutate(t=>alignElements(t,artboard.id,ids,mode,reference));
 const distribute=(axis:'HORIZONTAL'|'VERTICAL')=>mutate(t=>distributeElements(t,artboard.id,ids,axis,reference));
 return <div className="card-property-sections"><div className="card-property-note"><strong>{elements.length} elements selected</strong><span>{unitCount} alignment unit{unitCount===1?'':'s'} · groups stay atomic · locked units stay fixed.</span></div><div className="card-layer-action-grid"><button onClick={groupSelected} disabled={grouped}>Group</button><button onClick={ungroupSelected} disabled={!grouped}>Ungroup</button><button onClick={()=>mutate(t=>scaleElements(t,artboard.id,ids,1.1))}>Scale +10%</button><button onClick={()=>mutate(t=>rotateElementsAsGroup(t,artboard.id,ids,15))}>Rotate +15°</button></div><details className="card-property-details" open><summary>Align & Distribute</summary><label>Reference<select value={reference} onChange={e=>setReference(e.target.value as DesignAlignmentReference)}><option value="SELECTION">Selection bounds</option><option value="ARTBOARD">Artboard</option></select></label><div className="card-layer-action-grid card-align-grid"><button onClick={()=>align('LEFT')}>Left</button><button onClick={()=>align('HCENTER')}>H Center</button><button onClick={()=>align('RIGHT')}>Right</button><button onClick={()=>align('TOP')}>Top</button><button onClick={()=>align('VCENTER')}>V Center</button><button onClick={()=>align('BOTTOM')}>Bottom</button><button onClick={()=>distribute('HORIZONTAL')} disabled={unitCount<3}>Distribute H</button><button onClick={()=>distribute('VERTICAL')} disabled={unitCount<3}>Distribute V</button><button onClick={()=>mutate(t=>centerElementsOnArtboard(t,artboard.id,ids,'BOTH'))}>Center Artboard</button></div></details>{b&&<div className="card-property-grid"><label>X (mm)<input readOnly value={normalizeDisplayValue(b.xMm)}/></label><label>Y (mm)<input readOnly value={normalizeDisplayValue(b.yMm)}/></label><label>Width (mm)<input readOnly value={normalizeDisplayValue(b.widthMm)}/></label><label>Height (mm)<input readOnly value={normalizeDisplayValue(b.heightMm)}/></label></div>}</div>}
function MultiArtboardProperties({artboards,mutate}:{artboards:Artboard[];mutate:(f:(t:DesignTemplate)=>DesignTemplate)=>void}){
  if(!artboards.length) return null;
  const ids=artboards.map(a=>a.id);
  const commonPrint=artboards[0]!.print;
  return <div className="card-property-sections">
    <div className="card-property-note"><strong>{artboards.length} Artboards Selected</strong><span>Batch operations</span></div>
    <div className="card-layer-action-grid">
      <button onClick={()=>mutate(t=>applyPrintSettingsToTargets(t,commonPrint,'SELECTED',artboards[0]!.id,ids))}>Sync Print Settings</button>
    </div>
  </div>;
}
function Properties({artboard,template,mutate}:{artboard:Artboard;template:DesignTemplate;mutate:(f:(t:DesignTemplate)=>DesignTemplate)=>void}){const unit=artboard.displayUnit,w=normalizeDisplayValue(mmToUnit(artboard.widthMm,unit)),h=normalizeDisplayValue(mmToUnit(artboard.heightMm,unit)),preset=ARTBOARD_PRESETS.find(p=>near(p.widthMm,artboard.widthMm)&&near(p.heightMm,artboard.heightMm));const dimensions=(nw:number,nh:number)=>{const wm=unitToMm(nw,unit),hm=unitToMm(nh,unit);if(wm>0&&hm>0&&Number.isFinite(wm)&&Number.isFinite(hm))mutate(t=>resizeArtboard(t,artboard.id,wm,hm));};
const availableToPair=template.artboards.filter(a=>a.id!==artboard.id&&!a.pairId);
return <div className="card-property-sections"><label>Name<input value={artboard.name} onChange={e=>{if(e.target.value.trim())mutate(t=>renameArtboard(t,artboard.id,e.target.value));}}/></label>
<details className="card-property-details" open><summary>Artboard Role</summary>
  <label>Role<select value={artboard.role} onChange={e=>mutate(t=>setArtboardRole(t,artboard.id,e.target.value as ArtboardRole))}>
    <option value="GENERIC">Generic</option>
    <option value="FRONT">Front Side</option>
    <option value="BACK">Back Side</option>
  </select></label>
  {artboard.pairId ? (
    <div className="card-layer-action-grid"><button onClick={()=>mutate(t=>unpairArtboard(t,artboard.id))}>Unpair</button></div>
  ) : (
    <div className="card-layer-action-grid">
      <button onClick={()=>mutate(t=>createBackSide(t,artboard.id,id('artboard'),id('pair')))}>Create Back Side</button>
      {availableToPair.length > 0 && <select aria-label="Pair with" value="" onChange={e=>{if(e.target.value)mutate(t=>pairArtboards(t,artboard.id,e.target.value,id('pair')));}}>
        <option value="">Pair with...</option>
        {availableToPair.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
      </select>}
    </div>
  )}
</details>
<label>Preset<select value={preset?.id??'custom'} onChange={e=>{const p=ARTBOARD_PRESETS.find(x=>x.id===e.target.value);if(p)mutate(t=>resizeArtboard(t,artboard.id,p.widthMm,p.heightMm));}}><option value="custom">Custom</option>{ARTBOARD_PRESETS.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}</select></label><div className="card-property-grid"><label>Width ({unit==='MM'?'mm':'in'})<input type="number" min="0.001" step="0.1" value={w} onChange={e=>dimensions(Number(e.target.value),h)}/></label><label>Height ({unit==='MM'?'mm':'in'})<input type="number" min="0.001" step="0.1" value={h} onChange={e=>dimensions(w,Number(e.target.value))}/></label></div><label>Display unit<select value={unit} onChange={e=>mutate(t=>setArtboardDisplayUnit(t,artboard.id,e.target.value as DesignUnit))}><option value="MM">Millimetres (mm)</option><option value="IN">Inches (in)</option></select></label><label>Orientation<div className="card-segmented-control"><button className={artboard.widthMm>=artboard.heightMm?'active':''} onClick={()=>{if(artboard.widthMm<artboard.heightMm)mutate(t=>resizeArtboard(t,artboard.id,artboard.heightMm,artboard.widthMm));}}>Landscape</button><button className={artboard.heightMm>artboard.widthMm?'active':''} onClick={()=>{if(artboard.heightMm<=artboard.widthMm)mutate(t=>resizeArtboard(t,artboard.id,artboard.heightMm,artboard.widthMm));}}>Portrait</button></div></label><label>Background<div className="card-color-row"><input type="color" value={color(artboard)} onChange={e=>mutate(t=>setArtboardBackground(t,artboard.id,{type:'SOLID',color:e.target.value,opacity:1}))}/><input value={color(artboard)} readOnly/></div></label><details className="card-property-details" open><summary>Guides ({artboard.guides.length})</summary>{artboard.guides.length?<div className="card-guide-list">{artboard.guides.map(guide=><div key={guide.id} className="card-guide-row"><span>{guide.orientation==='VERTICAL'?'V':'H'}</span><input type="number" step="0.1" value={normalizeDisplayValue(mmToUnit(guide.positionMm,unit))} disabled={guide.locked} onChange={e=>mutate(t=>moveGuide(t,artboard.id,guide.id,unitToMm(Number(e.target.value),unit)))}/><small>{unit==='MM'?'mm':'in'}</small><button title={guide.locked?'Unlock guide':'Lock guide'} onClick={()=>mutate(t=>setGuideLocked(t,artboard.id,guide.id,!guide.locked))}>{guide.locked?'🔒':'🔓'}</button><button title="Delete guide" disabled={guide.locked} onClick={()=>mutate(t=>deleteGuide(t,artboard.id,guide.id))}>×</button></div>)}</div>:<div className="card-property-note"><span>Drag from the top or left ruler to create a guide.</span></div>}</details><div className="card-property-note"><strong>Phase 6.1.3</strong><span>Rulers, configurable editor grid and persistent artboard guides are active. Guides remain editor-only and feed the shared smart-snapping engine.</span></div></div>}

function PrintProperties({artboard,assets,mutate}:{artboard:Artboard;assets:AssetReference[];mutate:(f:(t:DesignTemplate)=>DesignTemplate)=>void}){const settings=resolvePrintSettings(artboard.print),preflight=useMemo(()=>validateArtboardPrint(artboard,assets),[artboard,assets]),patch=(value:Partial<Artboard['print']>)=>mutate(template=>updateArtboardPrintSettings(template,artboard.id,value)),insets=(key:'bleed'|'safeArea',label:string)=>{const current=settings[key],change=(side:keyof typeof current,value:number)=>patch({[key]:{...current,[side]:Math.max(0,value)}});return <details className="card-property-details"><summary>{label}</summary><div className="card-property-grid"><label>Top (mm)<input type="number" min="0" step=".5" value={current.topMm} onChange={e=>change('topMm',Number(e.target.value)||0)}/></label><label>Right (mm)<input type="number" min="0" step=".5" value={current.rightMm} onChange={e=>change('rightMm',Number(e.target.value)||0)}/></label><label>Bottom (mm)<input type="number" min="0" step=".5" value={current.bottomMm} onChange={e=>change('bottomMm',Number(e.target.value)||0)}/></label><label>Left (mm)<input type="number" min="0" step=".5" value={current.leftMm} onChange={e=>change('leftMm',Number(e.target.value)||0)}/></label></div></details>};return <div className="card-property-sections"><details className="card-property-details" open><summary>Print Settings</summary><label className="card-check-row"><input type="checkbox" checked={settings.showBleedInEditor} onChange={e=>patch({showBleedInEditor:e.target.checked})}/>Show Bleed</label><label className="card-check-row"><input type="checkbox" checked={settings.showSafeAreaInEditor} onChange={e=>patch({showSafeAreaInEditor:e.target.checked})}/>Show Safe Area</label><label className="card-check-row"><input type="checkbox" checked={settings.showCropMarksInEditor} onChange={e=>patch({showCropMarksInEditor:e.target.checked})}/>Show Crop Marks</label><label className="card-check-row"><input type="checkbox" checked={settings.cropMarksEnabledForExport} onChange={e=>patch({cropMarksEnabledForExport:e.target.checked})}/>Export Crop Marks</label><div className="card-property-grid"><label>Minimum DPI<input type="number" min="1" value={settings.minimumRasterDpi} onChange={e=>patch({minimumRasterDpi:Math.max(1,Number(e.target.value)||150)})}/></label><label>Preferred DPI<input type="number" min="1" value={settings.preferredRasterDpi} onChange={e=>patch({preferredRasterDpi:Math.max(1,Number(e.target.value)||300)})}/></label></div><div className="card-property-note"><span>{artboard.widthMm} × {artboard.heightMm} mm @ {settings.preferredRasterDpi} DPI</span><strong>{requiredPixels(artboard.widthMm,settings.preferredRasterDpi)} × {requiredPixels(artboard.heightMm,settings.preferredRasterDpi)} px recommended</strong></div></details>{insets('bleed','Bleed — outside trim')}{insets('safeArea','Safe Area — inside trim')}<details className="card-property-details" open><summary>Print Preflight</summary><div className="card-preflight-summary"><span className={preflight.errors?'error':'good'}>{preflight.errors} errors</span><span className={preflight.warnings?'warning':'good'}>{preflight.warnings} warnings</span></div>{preflight.issues.slice(0,6).map(issue=><div key={issue.id} className={`card-preflight-issue ${issue.severity.toLowerCase()}`}>{issue.message}</div>)}{!preflight.issues.length&&<div className="card-print-quality good"><strong>Print Ready</strong><span>Trim size and placed assets passed preflight.</span></div>}</details></div>}

type RulerTick={key:string;positionMm:number;major:boolean;label:string};
function rulerTicks(artboard:Artboard,zoom:number):{x:RulerTick[];y:RulerTick[]}{const unit=artboard.displayUnit;const pxPerMm=MM_TO_CSS_PX*zoom/100;const majorMm=unit==='MM'?(pxPerMm*10>=34?10:20):25.4;const minorMm=unit==='MM'?(pxPerMm*5>=12?5:10):6.35;const axis=(lengthMm:number,prefix:string)=>{const result:RulerTick[]=[];for(let positionMm=0;positionMm<=lengthMm+1e-6;positionMm+=minorMm){const major=Math.abs(positionMm/majorMm-Math.round(positionMm/majorMm))<1e-6;result.push({key:`${prefix}-${positionMm.toFixed(3)}`,positionMm,major,label:major?String(normalizeDisplayValue(mmToUnit(positionMm,unit))):''});}return result;};return{x:axis(artboard.widthMm,'x'),y:axis(artboard.heightMm,'y')};}

function moveItem<T>(items:T[],from:number,to:number):T[]{const next=[...items],item=next.splice(from,1)[0];if(item!==undefined)next.splice(to,0,item);return next}
function colorWithOpacity(colorValue:string,opacity:number):string{const value=colorValue.replace('#','');if(/^[0-9a-f]{6}$/i.test(value)){const n=parseInt(value,16);return `rgba(${n>>16},${n>>8&255},${n&255},${clamp(opacity,0,1)})`}return colorValue}
function shadowParts(shadow?:DesignShadow){return shadow?.enabled?`${shadow.offsetXmm}mm ${shadow.offsetYmm}mm ${Math.max(0,shadow.blurMm)}mm ${colorWithOpacity(shadow.color,shadow.opacity)}`:undefined}
function textShadowCss(shadow?:DesignShadow){return shadowParts(shadow)}
function boxShadowCss(shadow?:DesignShadow){return shadowParts(shadow)}
function dropShadowCss(shadow?:DesignShadow){const value=shadowParts(shadow);return value?`drop-shadow(${value})`:undefined}
function strokeCss(stroke?:ShapeDesignElement['stroke']){return stroke&&stroke.style!=='NONE'?`${Math.max(1,stroke.widthMm*MM_TO_CSS_PX)}px ${strokeStyle(stroke.style)} ${colorWithOpacity(stroke.color,stroke.opacity??1)}`:'none'}

type DecorativeFolderKey='CORNERS'|'FRAMES'|'DIVIDERS'|'WREATHS'|'BOTANICALS'|'ORNAMENTS'|'WATERCOLOR';
function decorativeFolderKey(asset:(typeof DECORATIVE_ASSETS)[number]):DecorativeFolderKey{
 if(asset.category==='Watercolor Floral'||asset.assetKind==='IMAGE')return 'WATERCOLOR';
 if(asset.category==='Frame'||/frame/i.test(asset.name))return 'FRAMES';
 if(/divider|vine|strip/i.test(asset.name))return 'DIVIDERS';
 if(/wreath|roundel/i.test(asset.name))return 'WREATHS';
 if(/branch|leaf|botanical/i.test(asset.name))return 'BOTANICALS';
 if(asset.category==='Ornament'||/ornamental|mandala|premium/i.test(asset.name))return 'ORNAMENTS';
 return 'CORNERS';
}
function decorativeFolderLabel(asset:(typeof DECORATIVE_ASSETS)[number]):string{
 switch(decorativeFolderKey(asset)){
  case 'CORNERS': return 'Corners & Florals';
  case 'FRAMES': return 'Frames & Borders';
  case 'DIVIDERS': return 'Dividers & Strips';
  case 'WREATHS': return 'Wreaths & Roundels';
  case 'BOTANICALS': return 'Branches & Leaves';
  case 'ORNAMENTS': return 'Ornaments';
  case 'WATERCOLOR': return 'Watercolor Floral';
 }
}

const color=(a:Artboard)=>a.background.type==='SOLID'?a.background.color:'#ffffff';const bg=(a:Artboard)=>a.background.type==='SOLID'?a.background.color:'#ffffff';const near=(a:number,b:number)=>Math.abs(a-b)<.001;const clamp=(v:number,min:number,max:number)=>Math.min(max,Math.max(min,v));const sizeText=(a:Artboard)=>a.displayUnit==='IN'?`${normalizeDisplayValue(mmToUnit(a.widthMm,'IN'))} × ${normalizeDisplayValue(mmToUnit(a.heightMm,'IN'))} in`:`${normalizeDisplayValue(a.widthMm)} × ${normalizeDisplayValue(a.heightMm)} mm`;const isForm=(t:EventTarget|null)=>t instanceof HTMLInputElement||t instanceof HTMLTextAreaElement||t instanceof HTMLSelectElement||t instanceof HTMLButtonElement;const shapeLabel=(s:DesignShapeKind)=>s.toLowerCase().split('_').map(p=>p.charAt(0).toUpperCase()+p.slice(1)).join(' ');const strokeStyle=(s:'SOLID'|'DASHED'|'DOTTED'|'NONE')=>s==='DASHED'?'dashed':s==='DOTTED'?'dotted':'solid';
function readAsDataUrl(file:File):Promise<string>{return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>typeof r.result==='string'?resolve(r.result):reject(new Error('Unable to read image.'));r.onerror=()=>reject(r.error??new Error('Unable to read image.'));r.readAsDataURL(file);});}
function readImageDimensions(src:string):Promise<{widthPx:number;heightPx:number}>{return new Promise(resolve=>{const image=new Image();image.onload=()=>resolve({widthPx:image.naturalWidth,heightPx:image.naturalHeight});image.onerror=()=>resolve({widthPx:0,heightPx:0});image.src=src;});}
