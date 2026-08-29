import { DesignerShell } from '../components/designer/DesignerShell.tsx';
import { DesignerHeader } from '../components/designer/DesignerHeader.tsx';
import { DesignerStatusBar } from '../components/designer/DesignerStatusBar.tsx';
import { DesignerContextToolbar } from '../components/designer/DesignerContextToolbar.tsx';
import { getDesignerToolbarMode } from '../components/designer/designerToolbarConfig.js';
import { DesignerToolRail, type DesignerRailMode } from '../components/designer/DesignerToolRail.tsx';
import { DesignerLeftPanel } from '../components/designer/DesignerLeftPanel.tsx';
import { ElementLibraryPanel } from '../components/designer/ElementLibraryPanel.tsx';
import { DesignerInspectorRail, type InspectorSectionKey } from '../components/designer/DesignerInspectorRail.tsx';
import { DesignerInspector } from '../components/designer/DesignerInspector.tsx';
import { InspectorSection } from '../components/designer/InspectorSection.tsx';
import { getInspectorSections } from '../components/designer/designerInspectorConfig.ts';
import { getArtboardRole, formatArtboardRole, getArtboardPairLabel, getArtboardSelectionState } from './artboard-ui-helpers.js';
import { filterAvailableFields } from './field-picker-helpers.js';
import { buildCardRenderModel, validateExportMemory, geometryToSvgPath, deletePathPoint, splitPathSegment, hitTestSegment, getPathEndpoints, getPathRangeBetweenNodes, deletePathSegmentRange, joinPathGeometries, closePathGeometry, worldToLocal, shapeToPathGeometry, getSmartTrimIntervals, findTrimInterval, trimSegmentInterval, splitGeometryIntoConnectedFragments, normalizePathFragment, findBoundarySnap, splitComponentFaceByDivider, type BoundarySnap, type TrimInterval, type CardExportRequest } from '@document-tool/design-engine';
import { ExportCancellationSource, ExportCancelledError, ExportOrchestrator, RendererRegistry, ZipBundler, type ResolvedExportDocument } from '@document-tool/renderer-sdk';
import { IsolatedCardExportCanvas } from './CardExportCanvas';
import { deliverExportedFiles } from '../services/fileDelivery.js';
import { CardPdfExportRenderer } from '@document-tool/renderer-pdf';
import { registerPngRenderer, registerJpegRenderer, BrowserExactPageRasterizer } from '@document-tool/renderer-image';
import { createCombinedPdfAccumulator, type CombinedPdfAccumulator } from '../services/cardCombinedPdf.js';
import { useCallback, useEffect,useMemo,useRef,useState,createContext,useContext } from 'react';
import { createPortal } from 'react-dom';
import QRCode from 'react-qr-code';
import type { Artboard,AssetReference,DesignElement,DesignShadow,DesignShapeKind,DesignTemplate,DesignUnit,ImageDesignElement,ShapeDesignElement,SvgDesignElement,TextDesignElement,QrDesignElement,BarcodeDesignElement,PathDesignElement,ArtboardRole,DesignDataContext } from '@document-tool/contracts';
import {
  ARTBOARD_PRESETS,addArtboard,addAssetReference,addDesignElement,createBlankArtboard,createImageElement,createShapeElement,createTextElement,createQrElement,createBarcodeElement,
  deleteArtboard,deleteDesignElements,duplicateArtboard,emptySelection,getSelectionBounds,mmToUnit,moveArtboard,moveElements,nextElementZIndex,
  normalizeDisplayValue,nudgeElements,renameArtboard,resizeArtboard,resizeElement,rotateElement,sanitizeSelection,selectAllSelectable,selectByMarquee,
  selectedElements,selectOnly,setArtboardBackground,setArtboardDisplayUnit,setElementPosition,toggleSelection,unitToMm,updateDesignElement,
  orderedLayers,renameElement,setElementVisibility,setElementLocked,moveLayers,replaceElementsAtLayer,duplicateDesignElements,groupElements,ungroupElements,
  expandElementIdsToGroups,groupForElement,setGroupLocked,setGroupVisibility,scaleElements,rotateElementsAsGroup,
  createDesignHistory,commitDesignHistory,undoDesignHistory,redoDesignHistory,resetDesignHistory,
  createDesignClipboardPayload,pasteDesignClipboard,createSvgElement,DESIGN_STARTER_TEMPLATES,DECORATIVE_ASSETS,decorativeAssetReference,
  alignElements,distributeElements,centerElementsOnArtboard,getAlignmentUnitCount,
  snapMoveDelta,snapResizeSize,addGuide,moveGuide,deleteGuide,setGuideLocked,setAllGuidesLocked,clearGuides,
  copyDesignElementStyle,pasteDesignElementStyle,resetDesignElementStyle,updateElementsOpacity,DEFAULT_DESIGN_SHADOW,
  prepareAssetImport,assetRenderKind,resolveRasterImageElementSource,resolveRasterImageFillSource,resolvePrintSettings,imagePrintQuality,validateArtboardPrint,requiredPixels,updateArtboardPrintSettings,
  setArtboardRole,pairArtboards,unpairArtboard,createBackSide,applyPrintSettingsToTargets,resolveArtboardBindings,
  getTextBinding,setTextFieldBinding,removeTextBinding,resolveDataContextSeeding,
  getSourceBinding,setSourceFieldBinding,removeSourceBinding,
  getFillImageSourceBinding,setFillImageSourceFieldBinding,removeFillImageSourceBinding,
  getValueBinding,setValueFieldBinding,removeValueBinding,mirrorElementsAcrossArtboard
} from '@document-tool/design-engine';
import type { DesignAlignmentReference,DesignClipboardPayload,DesignHistoryState,DesignRectMm,DesignSelectionState,DesignStyleClipboard,SnapGuideIndicator } from '@document-tool/design-engine';
import { LocalStorageDesignTemplateRepository,LocalStorageUserAssetLibraryRepository,type UserAssetLibraryItem } from '@document-tool/persistence';
import { ArrowDown,ArrowUp,Copy,Maximize2,Minus,MonitorUp,Plus,RotateCcw,Trash2,Upload,PenLine, Type, Image as ImageIcon, Box, Shapes, Eye, EyeOff, Lock, Unlock, Scissors, MousePointer2, BetweenHorizontalStart } from 'lucide-react';
import { loadImportWorkspace } from '../services/workspaceStore.js';
import { clampPreviewRecordIndex, getPreviewRecord, createRecordDesignDataContext, getRecordDisplayLabel } from '../services/previewRecordHelpers.js';
import { createBulkGenerationPlan, BulkCancellationToken, resolveItemArtboard, type BulkCardGenerationRequest, type BulkArtboardTarget, type BulkRecordTarget, type BulkGenerationResult } from '../services/cardBulkGeneration.js';

const MM_TO_CSS_PX=96/25.4,MIN_ZOOM=25,MAX_ZOOM=200;
const TRIMMER_CURSOR = 'url("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2224%22 height=%2224%22 viewBox=%220 0 24 24%22%3E%3Ccircle cx=%2212%22 cy=%2212%22 r=%228%22 fill=%22white%22 stroke=%22%23ef4444%22 stroke-width=%222%22/%3E%3Cpath d=%22M12 5v14M5 12h14%22 stroke=%22%23ef4444%22 stroke-width=%222%22/%3E%3C/svg%3E") 12 12, crosshair';
const SHAPES:DesignShapeKind[]=['RECTANGLE','SQUARE','ROUNDED_RECTANGLE','CAPSULE','CIRCLE','ELLIPSE','LINE','TRIANGLE','RIGHT_TRIANGLE','DIAMOND','PENTAGON','HEXAGON','OCTAGON','TRAPEZOID','PARALLELOGRAM','ARROW','DOUBLE_ARROW','CURVED_ARROW','CHEVRON','DOUBLE_CHEVRON','STAR','POLYGON','HEART','CLOUD','SPEECH_BUBBLE','CALLOUT','DOCUMENT','CYLINDER','CROSS','PLUS','BANNER','SHIELD','RIBBON','BADGE','HALF_CIRCLE','ARC','BRACKET','LABEL_TAG'];
const id=(p:string)=>`${p}-${globalThis.crypto?.randomUUID?.()??`${Date.now()}-${Math.random().toString(16).slice(2)}`}`;
function fresh():DesignTemplate{const artboard=createBlankArtboard({id:id('artboard'),name:'Front',order:0,widthMm:90,heightMm:50});artboard.print=resolvePrintSettings();return{kind:'CARD_DESIGN',schemaVersion:1,id:id('card-template'),name:'Untitled Card Design',version:1,status:'DRAFT',artboards:[artboard],sharedAssets:[]};}

export function CardDesigner(){
 const repo=useMemo(()=>new LocalStorageDesignTemplateRepository(window.localStorage),[]);
 const assetRepo=useMemo(()=>new LocalStorageUserAssetLibraryRepository(window.localStorage),[]);
 const [template,setTemplate]=useState<DesignTemplate>(()=>fresh());
  const [dataContext,setDataContext]=useState<DesignDataContext>({ record: {} });
  const [availableFields,setAvailableFields]=useState<import('@document-tool/contracts').FieldDefinition[]>([]);
  const [datasourceStatus,setDatasourceStatus]=useState<string>('No imported datasource available.');
  // Canonical datasource rows — single source of truth for all record-based preview and export
  const [importedRows,setImportedRows]=useState<Record<string,unknown>[]>([]);
  // Legacy single record for backward-compat w/ PreviewDataPanel (derived from importedRows)
  const importedRecord = importedRows[0] ?? {};
  const [previewRecordIndex,setPreviewRecordIndex]=useState(0);
  const [previewContextSource,setPreviewContextSource]=useState<'IMPORTED'|'MANUAL'>('IMPORTED');
  const previewContextSourceRef=useRef(previewContextSource);
  previewContextSourceRef.current=previewContextSource;
  // Clamp index whenever rows change
  const safePreviewIndex = clampPreviewRecordIndex(previewRecordIndex, importedRows.length);
  const currentPreviewRecord = previewContextSource === 'MANUAL'
    ? (dataContext.record as Record<string,unknown>)
    : getPreviewRecord(importedRows as Record<string,unknown>[], safePreviewIndex);
  const recordCount = importedRows.length;
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
 const [showHiddenElements,setShowHiddenElements]=useState(false);
 const [gridSizeMm,setGridSizeMm]=useState(5);
 const [mirrorGuideAxis,setMirrorGuideAxis]=useState<'HORIZONTAL'|'VERTICAL'|null>(null);
 const mirrorGuideTimerRef=useRef<number|null>(null);
 const [userAssets,setUserAssets]=useState<UserAssetLibraryItem[]>([]);
 const [savedTemplates,setSavedTemplates]=useState<DesignTemplate[]>([]);
 const [templateLibraryStatus,setTemplateLibraryStatus]=useState('');
 const [assetLibraryStatus,setAssetLibraryStatus]=useState('');
 const [decorativeQuery,setDecorativeQuery]=useState('');
 const [selection,setSelection]=useState<DesignSelectionState>(()=>emptySelection(''));
 const [interactionMode, setInteractionModeRaw] = useState<'SELECT' | 'EDIT_PATH' | 'SCISSORS' | 'PEN' | 'TRIMMER' | 'ERASER' | 'DRAW_SHAPE' | 'FLEXIBLE_LINE'>('SELECT');
  const [drawShapeType, setDrawShapeType] = useState<DesignShapeKind | null>(null);
  const [pathSelectedNodeIds, setPathSelectedNodeIds] = useState<string[]>([]);
  const [pathSelectedSegmentIds, setPathSelectedSegmentIds] = useState<string[]>([]);
  
  const setInteractionMode = (newMode: 'SELECT' | 'EDIT_PATH' | 'SCISSORS' | 'PEN' | 'TRIMMER' | 'ERASER' | 'DRAW_SHAPE' | 'FLEXIBLE_LINE') => {
    if (interactionMode === newMode) return;
    setInteractionModeRaw(newMode);
    if (newMode === 'EDIT_PATH') {
      setPathSelectedNodeIds([]);
      setPathSelectedSegmentIds([]);
    } else if (newMode === 'SCISSORS' || newMode === 'TRIMMER') {
      setPathSelectedSegmentIds([]);
    } else {
      setPathSelectedNodeIds([]);
      setPathSelectedSegmentIds([]);
    }
  };
 const [leftMode, setLeftMode] = useState<DesignerRailMode>('ELEMENTS');
 const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [inspectorCollapsed, setInspectorCollapsed] = useState(false);
  const [activeInspectorSection, setActiveInspectorSection] = useState<InspectorSectionKey>('GENERAL');
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
 const activeSource=artboards.find(a=>a.id===activeId)??artboards[0];
 const active=useMemo(()=>activeSource ? resolveArtboardBindings(activeSource, dataContext) : undefined, [activeSource, dataContext]);
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

 useEffect(()=>{let cancelled=false;(async()=>{try{const list=await repo.list();if(cancelled)return;setSavedTemplates(list);const activeTemplateId=await repo.getActiveId();const stored=activeTemplateId?list.find(item=>item.id===activeTemplateId)??null:list[0]??null;if(cancelled)return;if(stored){setTemplate(stored);templateRef.current=stored;resetHistory(stored);const aid=[...stored.artboards].sort((a,b)=>a.order-b.order)[0]?.id??'';setActiveId(aid);setSelection(emptySelection(aid));setStatus('Draft restored');}else{const f=fresh();setTemplate(f);templateRef.current=f;resetHistory(f);setActiveId(f.artboards[0]!.id);setSelection(emptySelection(f.artboards[0]!.id));}}catch(e){if(!cancelled){setTemplateLibraryStatus(e instanceof Error?e.message:'Unable to load saved templates.');setStatus(e instanceof Error?e.message:'Unable to restore card draft.');}}})();return()=>{cancelled=true};},[repo]);
  useEffect(()=>{let cancelled=false;(async()=>{try{const assets=await assetRepo.list();if(!cancelled)setUserAssets(assets);}catch(e){if(!cancelled)setAssetLibraryStatus(e instanceof Error?e.message:'Unable to load asset library.');}})();return()=>{cancelled=true};},[assetRepo]);
  useEffect(()=>{
    let cancelled=false;
    (async()=>{
      try{
        const ws = await loadImportWorkspace();
        if(cancelled) return;
        if(ws && ws.dataPreview) {
          const fields = ws.dataPreview.schema.fields || [];
          const rows = (ws.dataPreview.records || []) as Record<string,unknown>[];
          setAvailableFields(fields);
          setImportedRows(rows);
          setPreviewRecordIndex(0);
          const firstRec = rows[0] ?? {};
          setDataContext(prev => resolveDataContextSeeding(prev, firstRec, previewContextSourceRef.current));
          setDatasourceStatus(`${rows.length} record${rows.length===1?'':'s'}`);
        } else {
          setAvailableFields([]);
          setImportedRows([]);
          setDatasourceStatus('No imported datasource available.');
        }
      }catch(e){
        if(!cancelled) setDatasourceStatus('Failed to load datasource.');
      }
    })();
    return ()=>{cancelled=true};
  }, []);

  // Keep canonical dataContext in sync with the current preview record
  useEffect(()=>{
    if (previewContextSource === 'IMPORTED') {
      setDataContext(createRecordDesignDataContext(currentPreviewRecord));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewRecordIndex, importedRows, previewContextSource]);

  const navigatePreviewRecord = (delta: number) => {
    if (!recordCount) return;
    setPreviewRecordIndex(i => clampPreviewRecordIndex(i + delta, recordCount));
    if (previewContextSource === 'MANUAL') setPreviewContextSource('IMPORTED');
  };
  useEffect(()=>{if(active)setSelection(s=>sanitizeSelection(s,active));},[active]);
  useEffect(()=>{const kd=(e:KeyboardEvent)=>{if(e.code==='Space'&&!isForm(e.target)){setSpace(true);e.preventDefault();return;}if(!active||isForm(e.target))return;const command=e.ctrlKey||e.metaKey;if(command&&e.key.toLowerCase()==='z'){e.preventDefault();if(e.shiftKey)redo();else undo();return;}if(command&&e.key.toLowerCase()==='y'){e.preventDefault();redo();return;}if(command&&e.key.toLowerCase()==='c'){e.preventDefault();copySelected();return;}if(command&&e.key.toLowerCase()==='v'){e.preventDefault();pasteClipboard();return;}if(command&&e.key.toLowerCase()==='d'&&selection.elementIds.length){e.preventDefault();duplicateSelected();return;}if(command&&e.key.toLowerCase()==='a'){e.preventDefault();setSelection(selectAllSelectable(active));return;}if(e.key==='Enter'){if(interactionMode==='FLEXIBLE_LINE'||interactionMode==='PEN'){endHistoryTransaction();setSelection(emptySelection(active.id));setPathSelectedNodeIds([]);setStatus(`${interactionMode==='PEN'?'Pen':'Polyline'} — Specify first point`);return;}if(interactionMode==='EDIT_PATH'){endHistoryTransaction();setInteractionMode('SELECT');setPathSelectedNodeIds([]);return;}}if(e.key==='Escape'){if(interactionMode==='FLEXIBLE_LINE'||interactionMode==='PEN'){if(selection.elementIds.length){endHistoryTransaction();setSelection(emptySelection(active.id));setPathSelectedNodeIds([]);}else setInteractionMode('SELECT');}else if(interactionMode==='EDIT_PATH'||interactionMode==='SCISSORS'||interactionMode==='TRIMMER'||interactionMode==='ERASER'){endHistoryTransaction();setInteractionMode('SELECT');setPathSelectedNodeIds([]);}else{setSelection(emptySelection(active.id));}return;}if((e.key==='Delete'||e.key==='Backspace')&&selection.elementIds.length){e.preventDefault();if(interactionMode==='TRIMMER')return;if(interactionMode==='EDIT_PATH'&&pathSelectedNodeIds.length>0){mutate(t=>{const art=t.artboards.find(a=>a.id===active.id);if(!art)return t;const el=art.elements.find(el=>el.id===selection.primaryElementId) as PathDesignElement;if(!el||el.type!=='PATH')return t;let nextGeo=el.geometry;for(const nid of pathSelectedNodeIds)nextGeo=deletePathPoint(nextGeo,nid);return {...t,artboards:t.artboards.map(a=>a.id===active.id?{...a,elements:a.elements.map(e=>e.id===el.id?{...e,geometry:nextGeo}:e)}:a)};});setPathSelectedNodeIds([]);setStatus('Node deleted');}else{mutate(t=>deleteDesignElements(t,active.id,selection.elementIds));setSelection(emptySelection(active.id));setStatus('Element deleted');}return;}const dir=e.key==='ArrowLeft'?'LEFT':e.key==='ArrowRight'?'RIGHT':e.key==='ArrowUp'?'UP':e.key==='ArrowDown'?'DOWN':null;if(dir&&selection.elementIds.length){e.preventDefault();if(interactionMode==='EDIT_PATH'&&pathSelectedNodeIds.length>0){mutate(t=>{const art=t.artboards.find(a=>a.id===active.id);if(!art)return t;const el=art.elements.find(el=>el.id===selection.primaryElementId) as PathDesignElement;if(!el||el.type!=='PATH')return t;const amt=e.shiftKey?5:1;const dx=dir==='LEFT'?-amt:dir==='RIGHT'?amt:0,dy=dir==='UP'?-amt:dir==='DOWN'?amt:0;const nextGeo={...el.geometry,points:el.geometry.points.map(p=>pathSelectedNodeIds.includes(p.id)?{...p,x:p.x+dx,y:p.y+dy}:p)};return {...t,artboards:t.artboards.map(a=>a.id===active.id?{...a,elements:a.elements.map(e=>e.id===el.id?{...e,geometry:nextGeo}:e)}:a)};});setStatus('Nodes nudged');}else{mutate(t=>nudgeElements(t,active.id,selection.elementIds,dir,e.shiftKey));setStatus('Unsaved changes');}}},ku=(e:KeyboardEvent)=>{if(e.code==='Space')setSpace(false)};window.addEventListener('keydown',kd);window.addEventListener('keyup',ku);return()=>{window.removeEventListener('keydown',kd);window.removeEventListener('keyup',ku)};},[active,selection.elementIds,historyVersion,interactionMode,pathSelectedNodeIds]);
 const refreshSavedTemplates=async()=>{try{const list=await repo.list();setSavedTemplates(list);setTemplateLibraryStatus('');return list;}catch(e){setTemplateLibraryStatus(e instanceof Error?e.message:'Unable to load saved templates.');return[];}};
 const save=async()=>{try{await repo.save(template);await repo.setActiveId(template.id);await refreshSavedTemplates();setDirty(false);setStatus('Saved locally');setTemplateLibraryStatus('Template saved locally.');}catch(e){setStatus(e instanceof Error?e.message:'Save failed');}};
 const newDesign=()=>{if(dirty&&!window.confirm('Discard unsaved Card Designer changes?'))return;const f=fresh();setTemplate(f);templateRef.current=f;resetHistory(f);setActiveId(f.artboards[0]!.id);setSelection(emptySelection(f.artboards[0]!.id));setZoom(100);setDirty(true);setStatus('New card design');};
 const openSavedTemplate=async(templateId:string)=>{if(templateId===template.id)return;if(dirty&&!window.confirm('Discard unsaved Card Designer changes and open this saved template?'))return;try{const stored=await repo.getById(templateId);if(!stored){await refreshSavedTemplates();setTemplateLibraryStatus('Saved template was not found.');return;}await repo.setActiveId(stored.id);setTemplate(stored);templateRef.current=stored;resetHistory(stored);const aid=[...stored.artboards].sort((a,b)=>a.order-b.order)[0]?.id??'';setActiveId(aid);setSelectedArtboardIds([]);setSelection(emptySelection(aid));setZoom(100);setDirty(false);setStatus(`Opened ${stored.name}`);setTemplateLibraryStatus('');}catch(e){setTemplateLibraryStatus(e instanceof Error?e.message:'Unable to open saved template.');}};
 const deleteSavedTemplate=async(saved:DesignTemplate)=>{if(!window.confirm(`Delete “${saved.name}” from saved templates?`))return;try{await repo.delete(saved.id);const list=await refreshSavedTemplates();if(saved.id===template.id){const next=list[0]??fresh();if(list[0])await repo.setActiveId(next.id);else await repo.setActiveId(null);setTemplate(next);templateRef.current=next;resetHistory(next);const aid=[...next.artboards].sort((a,b)=>a.order-b.order)[0]?.id??'';setActiveId(aid);setSelectedArtboardIds([]);setSelection(emptySelection(aid));setDirty(!list[0]);}setTemplateLibraryStatus('Saved template deleted.');}catch(e){setTemplateLibraryStatus(e instanceof Error?e.message:'Unable to delete saved template.');}};
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
  if(!selectedArtboardIds.length||!activeSource)return;
  const nextId=id('artboard');
  // For simplicity, duplicate active if multiple selected, or we could duplicate all. Let's just duplicate active.
  mutate(t=>duplicateArtboard(t,activeSource.id,nextId));
  chooseArtboard(nextId);
 };
 const remove=()=>{
  if(!activeSource)return;
  const targets = selectedArtboardIds.length > 0 ? selectedArtboardIds : [activeSource.id];
  if(template.artboards.length - targets.length < 1){setStatus('A design must keep at least one artboard.');return;}
  if(!window.confirm(`Delete ${targets.length} artboard(s)?`))return;
  mutate(t=>targets.reduce((acc,id)=>deleteArtboard(acc,id),t));
  const remaining = artboards.filter(a=>!targets.includes(a.id));
  const next = remaining[0];
  if(next) chooseArtboard(next.id);
 };
 const fit=()=>{const v=viewport.current;if(!v||!active)return;const z=Math.floor(Math.min(Math.max(100,v.clientWidth-96)/(active.widthMm*MM_TO_CSS_PX),Math.max(100,v.clientHeight-96)/(active.heightMm*MM_TO_CSS_PX))*100);setZoom(clamp(z,MIN_ZOOM,MAX_ZOOM));};
 const zoomAtPointer=(event:React.WheelEvent<HTMLDivElement>)=>{if(!event.ctrlKey&&!event.metaKey)return;event.preventDefault();const view=viewport.current;if(!view)return;const rect=view.getBoundingClientRect(),x=event.clientX-rect.left,y=event.clientY-rect.top,previous=zoom,next=clamp(previous+(event.deltaY<0?10:-10),MIN_ZOOM,MAX_ZOOM);if(next===previous)return;const contentX=view.scrollLeft+x,contentY=view.scrollTop+y;setZoom(next);requestAnimationFrame(()=>{const ratio=next/previous;view.scrollLeft=contentX*ratio-x;view.scrollTop=contentY*ratio-y;});};
 const selectInserted=(elementId:string)=>{if(!active)return;setSelection(selectOnly(active.id,elementId));setStatus('Element added');};

 const selectedEls = active ? active.elements.filter(e => selection.elementIds.includes(e.id)) : [];
 const selectedPaths = selectedEls.filter(e => e.type === 'PATH') as PathDesignElement[];
 
 const canEditPath = selectedPaths.length === 1 && selectedEls.length === 1;
 const canScissors = canEditPath;
 const canTrim = active?.elements.some(element => element.visible && !element.locked && !element.runtimeHidden && (element.type === 'PATH' || element.type === 'SHAPE')) ?? false;
 const canJoin = selectedPaths.length === 2 && selectedEls.length === 2 && !selectedPaths[0]!.geometry.closed && !selectedPaths[1]!.geometry.closed;
 const canClose = selectedPaths.length === 1 && selectedEls.length === 1 && !selectedPaths[0]!.geometry.closed && getPathEndpoints(selectedPaths[0]!.geometry).length === 2;

 const onJoinPaths = () => {
   if (!active || !canJoin) return;
   const p1 = selectedPaths[0]!;
   const p2 = selectedPaths[1]!;
   mutate(t => {
     return {
       ...t,
       artboards: t.artboards.map(a => a.id === active.id ? {
         ...a,
         elements: [
           ...a.elements.filter(e => e.id !== p1.id && e.id !== p2.id),
           {
             ...p1,
             ...joinPathGeometries(p1.geometry, p2.geometry, p1, p2).boundingBox,
             geometry: joinPathGeometries(p1.geometry, p2.geometry, p1, p2).geometry
           }
         ]
       } : a)
     };
   });
   setSelection(selectOnly(active.id, p1.id));
 };

 const onClosePath = () => {
   if (!active || !canClose) return;
   const p1 = selectedPaths[0]!;
   mutate(t => {
     return {
       ...t,
       artboards: t.artboards.map(a => a.id === active.id ? {
         ...a,
         elements: a.elements.map(e => e.id === p1.id ? { ...e, geometry: closePathGeometry(p1.geometry) } : e)
       } : a)
     };
   });
 };

 const insertText=()=>{if(!active)return;const eid=id('text');mutate(t=>addDesignElement(t,active.id,createTextElement({id:eid,name:'Text',xMm:Math.max(2,(active.widthMm-45)/2),yMm:Math.max(2,(active.heightMm-12)/2),zIndex:nextElementZIndex(t,active.id)})));selectInserted(eid);};
 const insertShape=(shape:DesignShapeKind='RECTANGLE')=>{if(!active)return;const eid=id('shape');mutate(t=>addDesignElement(t,active.id,createShapeElement(shape,{id:eid,xMm:Math.max(2,(active.widthMm-28)/2),yMm:Math.max(2,(active.heightMm-18)/2),zIndex:nextElementZIndex(t,active.id)})));selectInserted(eid);};
 const insertQr=()=>{if(!active)return;const eid=id('qr');mutate(t=>addDesignElement(t,active.id,createQrElement({id:eid,name:'QR Code',xMm:Math.max(2,(active.widthMm-20)/2),yMm:Math.max(2,(active.heightMm-20)/2),zIndex:nextElementZIndex(t,active.id)})));selectInserted(eid);};
 const insertBarcode=()=>{if(!active)return;const eid=id('barcode');mutate(t=>addDesignElement(t,active.id,createBarcodeElement({id:eid,name:'Barcode',xMm:Math.max(2,(active.widthMm-35)/2),yMm:Math.max(2,(active.heightMm-15)/2),zIndex:nextElementZIndex(t,active.id)})));selectInserted(eid);};
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

  // ── Bulk generation state ────────────────────────────────────────────────
  const [bulkRecordTarget, setBulkRecordTarget] = useState<BulkRecordTarget>('CURRENT_RECORD');
  const [bulkArtboardTarget, setBulkArtboardTarget] = useState<BulkArtboardTarget>('ALL');
  const [bulkFilenameTemplate, setBulkFilenameTemplate] = useState('{{recordIndex}}-{{artboardName}}');
  const [bulkCombinePdf, setBulkCombinePdf] = useState(true);
  const [bulkSelectedRecordIndexes, setBulkSelectedRecordIndexes] = useState<number[]>([]);
  const [bulkProgress, setBulkProgress] = useState<{current:number;total:number;label:string}|null>(null);
  const [bulkResult, setBulkResult] = useState<BulkGenerationResult|null>(null);
  const [bulkSelectDialogOpen, setBulkSelectDialogOpen] = useState(false);
  const [bulkSelectPage, setBulkSelectPage] = useState(0);
  const bulkCancelRef = useRef<BulkCancellationToken|null>(null);


  const [exportRasterTargets, setExportRasterTargets] = useState<Artboard[]>([]);
  const pendingRasterExportRef = useRef<{ targets: Artboard[], request: CardExportRequest, format: string, fileName: string, exportReq: any } | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const cancelExportRef = useRef<ExportCancellationSource | null>(null);
  const [exportHost, setExportHost] = useState<HTMLElement | null>(null);

  const generateExportFiles = async (targets: Artboard[], request: CardExportRequest, exportReq: any, host: HTMLElement | null, token: any) => {
    const registry = new RendererRegistry();
    const rasterizer = new BrowserExactPageRasterizer(
      async (resolved) => {
        const root = (host || document).querySelector(`.raster-export-root [data-document-id="${resolved.documentGroupId}"]`);
        if (!root) throw new Error(`Isolated export page root for ${resolved.documentGroupId} is unavailable.`);
        return Array.from(root.querySelectorAll<HTMLElement>('[data-document-export-page]'));
      },
      () => exportReq.format === 'PNG' && (exportReq.options?.png as { backgroundMode?: string } | undefined)?.backgroundMode === 'TRANSPARENT',
      host || document
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

    const result = await orchestrator.export(exportReq, { cancellationToken: token });
    return result.files;
  };

  const runOrchestrator = async (targets: Artboard[], request: CardExportRequest, exportReq: any) => {
    const cancelToken = new ExportCancellationSource();
    cancelExportRef.current = cancelToken;
    try {
      const files = await generateExportFiles(targets, request, exportReq, exportHost, cancelToken.token);
      
      const downloadable = files.length > 1 && exportReq.format !== 'PDF'
        ? [new ZipBundler().bundle(files, { fileName: exportReq.fileName })]
        : files;

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

  /**
   * Bulk personalized generation pipeline (Phase 6.7).
   * Sequential per-record processing — memory-safe, failure-isolated.
   */
  const performBulkExport = async () => {
    if (!activeSource || !importedRows.length) {
      setStatus('Bulk generation cancelled: No datasource records available.');
      return;
    }
    if (bulkRecordTarget === 'SELECTED_RECORDS' && !bulkSelectedRecordIndexes.length) {
      setStatus('Bulk generation cancelled: No records selected.');
      return;
    }

    const bulkRequest: BulkCardGenerationRequest = {
      recordTarget: bulkRecordTarget,
      currentRecordIndex: safePreviewIndex,
      selectedRecordIndexes: bulkSelectedRecordIndexes,
      artboardTarget: bulkArtboardTarget,
      currentArtboardId: activeSource.id,
      selectedArtboardIds: selectedArtboardIds,
      format: exportFormat,
      filenameTemplate: bulkFilenameTemplate || '{{recordIndex}}-{{artboardName}}',
      combinePdf: bulkCombinePdf,
      dpi: exportDpi,
      jpegQuality: exportJpegQuality,
      transparentBackground: exportTransparent,
      includeBleed: exportIncludeBleed,
      includeCropMarks: exportIncludeCropMarks,
    };

    const plan = createBulkGenerationPlan(template, importedRows as Record<string, unknown>[], bulkRequest);

    if (!plan.items.length) {
      setStatus('Bulk generation cancelled: Nothing to generate.');
      return;
    }

    const cancelToken = new BulkCancellationToken();
    bulkCancelRef.current = cancelToken;
    setBulkProgress({ current: 0, total: plan.items.length, label: 'Preparing...' });
    setBulkResult(null);
    setIsExporting(true);
    setExportDialogOpen(false);

    const failures: import('../services/cardBulkGeneration.js').BulkGenerationFailure[] = [];
    let succeeded = 0;
    const allExportedFiles: import('@document-tool/renderer-sdk').ExportedFile[] = [];
    let pdfAccumulator: CombinedPdfAccumulator | null = null;
    
    // 1. Create stable host explicitly for bulk
    const host = document.createElement('div');
    host.className = 'raster-export-root';
    document.body.appendChild(host);
    setExportHost(host);
    
    const isCombinedPdf = exportFormat === 'PDF' && bulkCombinePdf;
    if (isCombinedPdf) {
      pdfAccumulator = createCombinedPdfAccumulator();
    }
    
    // 2. Setup the exact rasterizer if combined PDF is used
    const rasterizer = isCombinedPdf ? new BrowserExactPageRasterizer(
      async (resolved) => {
        const root = host.querySelector(`.raster-export-root [data-document-id="${resolved.documentGroupId}"]`);
        if (!root) throw new Error(`Isolated export page root for ${resolved.documentGroupId} is unavailable.`);
        return Array.from(root.querySelectorAll<HTMLElement>('[data-document-export-page]'));
      },
      () => false, // transparency unsupported in PDF
      host
    ) : null;

    try {
      for (let i = 0; i < plan.items.length; i++) {
        if (cancelToken.cancelled) break;
        const item = plan.items[i]!;
        setBulkProgress({ current: i + 1, total: plan.items.length, label: item.label });

        try {
          // Resolve per-item artboard fresh every time — template never mutated
          const resolved = resolveItemArtboard(item);

          // Memory validation before render
          const memError = validateExportMemory({ format: exportFormat, targetMode: 'CURRENT', rasterDpi: exportDpi, jpegQuality: exportJpegQuality, transparentBackground: exportTransparent } as any, resolved.widthMm, resolved.heightMm);
          if (memError) throw new Error(memError);

          // Render via orchestrator (reuse existing infrastructure)
          setExportRasterTargets([resolved]);
          await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); // Wait for portal render
          
          if (isCombinedPdf && pdfAccumulator && rasterizer) {
            const reqDpi = exportDpi || 300;
            const rasterResult = await rasterizer.rasterizePageAsJpeg(resolved.id, reqDpi);
            const wMm = resolved.widthMm + (exportIncludeBleed ? 6 : 0);
            const hMm = resolved.heightMm + (exportIncludeBleed ? 6 : 0);
            pdfAccumulator.addPage(rasterResult, wMm, hMm, i);
            succeeded++;
          } else {
            const cardRequest: CardExportRequest = {
              format: exportFormat,
              targetMode: 'CURRENT',
              currentArtboardId: resolved.id,
              includeBleed: exportIncludeBleed,
              includeCropMarks: exportIncludeCropMarks,
              usePrintSettings: true,
              rasterDpi: exportDpi,
              jpegQuality: exportJpegQuality,
              transparentBackground: exportTransparent,
            };

            const exportReq = {
              format: exportFormat,
              templateId: template.id,
              documentGroupIds: [resolved.id],
              fileName: item.filename.replace(/\.[^.]+$/, ''), // strip ext
              options: {
                png: { dpi: exportDpi, pages: 'ALL', backgroundMode: exportTransparent ? 'TRANSPARENT' : 'SOLID' },
                jpeg: { dpi: exportDpi, quality: exportJpegQuality, backgroundColor: '#FFFFFF' }
              }
            };

            const files = await generateExportFiles([resolved], cardRequest, exportReq, host, cancelToken);
            allExportedFiles.push(...files);
            succeeded++;
          }
        } catch (itemErr) {
          failures.push({
            recordIndex: item.recordIndex,
            artboardId: item.artboard.id,
            message: itemErr instanceof Error ? itemErr.message : 'Unknown error',
          });
        }

        // Release any heavy data after each item
        await new Promise(r => setTimeout(r, 0));
      }

      if (isCombinedPdf && pdfAccumulator && !cancelToken.cancelled) {
         setBulkProgress({ current: plan.items.length, total: plan.items.length, label: 'Assembling PDF...' });
         const finalPdf = pdfAccumulator.build(bulkFilenameTemplate || 'Combined_Bulk_Export');
         if (finalPdf) allExportedFiles.push(finalPdf);
         await new Promise(r => setTimeout(r, 0));
      }

      if (allExportedFiles.length > 0 && !cancelToken.cancelled) {
        setStatus('Waiting for save location...');
        const downloadable = (allExportedFiles.length > 1 && !isCombinedPdf)
          ? [new ZipBundler().bundle(allExportedFiles, { fileName: template.name ? `${template.name.replace(/[^a-z0-9-_]/gi, '_')}-bulk` : 'Bulk_Export' })]
          : allExportedFiles;
          
        const delivered = await deliverExportedFiles(downloadable);
        if (delivered.status === 'CANCELLED') throw new ExportCancelledError('Save cancelled.');
        if (delivered.status === 'FAILED') throw new Error(`Generated successfully but could not be saved. ${delivered.error ?? ''}`);
      }

      const result: BulkGenerationResult = {
        totalItems: plan.items.length,
        succeededItems: succeeded,
        failedItems: failures.length,
        cancelled: cancelToken.cancelled,
        failures,
      };
      setBulkResult(result);
      setStatus(`Bulk generation complete: ${succeeded} succeeded, ${failures.length} failed${cancelToken.cancelled ? ', cancelled' : ''}.`);
    } catch (e) {
      if (e instanceof ExportCancelledError) {
        setStatus('Bulk generation cancelled.');
      } else {
        setStatus(`Bulk generation failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
      }
    } finally {
      setIsExporting(false);
      setBulkProgress(null);
      bulkCancelRef.current = null;
      setExportRasterTargets([]);
      if (host.isConnected) {
        host.remove();
      }
      setExportHost(null);
    }
  };

  const performExport = async () => {
    try {
      if (!activeSource) {
        setStatus('Export cancelled: No active artboard.');
        setIsExporting(false);
        return;
      }
      setIsExporting(true);
      setStatus('Preparing export...');

      const request: CardExportRequest = {
        format: exportFormat,
        targetMode: exportTargetMode,
        selectedArtboardIds: exportTargetMode === 'SELECTED' ? selectedArtboardIds : undefined,
        currentArtboardId: activeSource.id,
        includeBleed: exportIncludeBleed,
        includeCropMarks: exportIncludeCropMarks,
        usePrintSettings: true,
        rasterDpi: exportDpi,
        jpegQuality: exportJpegQuality,
        transparentBackground: exportTransparent
      };

      let sourceTargets: Artboard[] = [];
      if (exportTargetMode === 'CURRENT') sourceTargets = [activeSource];
      else if (exportTargetMode === 'SELECTED') sourceTargets = template.artboards.filter(a => selectedArtboardIds.includes(a.id));
      else sourceTargets = [...template.artboards];

      if (sourceTargets.length === 0) {
        setStatus('Export cancelled: No artboards targeted.');
        setIsExporting(false);
        return;
      }

      const targets = sourceTargets.map(t => resolveArtboardBindings(t, dataContext));

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
  useEffect(()=>{if(primary?.type==='PATH'&&primary.metadata?.faceGeneration==='AUTO_SECTION'){setActiveInspectorSection('APPEARANCE');setInspectorCollapsed(false);}},[primary?.id]);
  const toolbarMode = getDesignerToolbarMode(selected.map(e => e.type), selected.length);
  const showMirrorGuide=(axis:'HORIZONTAL'|'VERTICAL')=>{setMirrorGuideAxis(axis);if(mirrorGuideTimerRef.current!==null)window.clearTimeout(mirrorGuideTimerRef.current);mirrorGuideTimerRef.current=window.setTimeout(()=>setMirrorGuideAxis(null),1100);};
  return (
    <DesignerShell
      header={
        <DesignerHeader
          title={template.name}
          onTitleChange={newTitle => mutate(t => ({ ...t, name: newTitle }))}
          statusLabel="Draft"
          canUndo={historyRef.current.past.length > 0}
          canRedo={historyRef.current.future.length > 0}
          canCopy={selection.elementIds.length > 0}
          canPaste={!!clipboardRef.current}
          onUndo={undo}
          onRedo={redo}
          onCopy={copySelected}
          onPaste={pasteClipboard}
          onNew={newDesign}
          onTemplateAction={loadCorporateIdTemplate}
          onSave={save}
          onExport={() => setExportDialogOpen(true)}
        />
      }
      toolbar={
        <DesignerContextToolbar
          mode={toolbarMode}
          sourceArtboard={activeSource || active}
          sourceElements={selected.map(e => (activeSource?.elements || []).find(se => se.id === e.id) || e)}
          mutate={mutate}
          onGroupSelected={groupSelected}
          onUngroupSelected={ungroupSelected}
          pathEditMode={{active: interactionMode === 'EDIT_PATH', selectedNodeIds: pathSelectedNodeIds}}
          interactionMode={interactionMode}
          setInteractionMode={setInteractionMode}
          pathSelectedSegmentIds={pathSelectedSegmentIds}
          onMirrorInvoked={showMirrorGuide}
        />
      }
      statusBar={
        <DesignerStatusBar
          artboardLabel={`${active.name} (${active.widthMm}×${active.heightMm}mm)`}
          selectionLabel={selection.elementIds.length ? `${selection.elementIds.length} selected` : undefined}
          zoomPercent={zoom}
        />
      }
    >
      <div className="card-designer-page animated-fade-in" style={{ height: '100%', width: '100%', minHeight: 0, position: 'relative', display: 'flex', flexDirection: 'column' }}>

    <div className="dg-designer-main">
      <DesignerToolRail activeMode={leftMode} onModeChange={m => { setLeftMode(m); setLeftPanelCollapsed(false); }} />
      <DesignerLeftPanel title={leftMode === 'ELEMENTS' ? 'Elements' : leftMode === 'ASSETS' ? 'Assets & Templates' : leftMode === 'DATA' ? 'Data' : leftMode === 'LAYERS' ? 'Layers' : 'Artboards'} collapsed={leftPanelCollapsed} onCollapse={() => setLeftPanelCollapsed(true)} activeMode={leftMode}>
        {leftMode === 'ELEMENTS' && (
          <ElementLibraryPanel
            onInsertText={insertText}
            onInsertShape={(shape) => insertShape(shape)}
            onUploadImage={() => uploadRef.current?.click()}
            drawShapeType={drawShapeType}
            onSetDrawShapeType={setDrawShapeType}
            onAddQr={insertQr}
            onAddBarcode={insertBarcode}
            availableShapes={SHAPES}
            interactionMode={interactionMode}
            onSetInteractionMode={setInteractionMode}
            canEditPath={canEditPath}
            canScissors={canScissors}
            canTrim={canTrim}
            canJoin={canJoin}
            onJoin={onJoinPaths}
            canClose={canClose}
            onClose={onClosePath}
          />
        )}
        {leftMode === 'ASSETS' && (
          <>
            <details className="card-library-section card-saved-template-library" open><summary><span>My Templates</span><small>{savedTemplates.length} saved</small></summary><div className="card-library-body">{templateLibraryStatus&&<div className="card-asset-library-status">{templateLibraryStatus}</div>}{savedTemplates.length?<div className="card-starter-template-list">{savedTemplates.map(saved=><div key={saved.id} className={`card-user-asset-card ${saved.id===template.id?'active':''}`}><button className="card-starter-template-button" title={`Open ${saved.name}`} onClick={()=>void openSavedTemplate(saved.id)}><strong>{saved.name}</strong><span>{saved.artboards.length} artboard{saved.artboards.length===1?'':'s'} · v{saved.version}{saved.id===template.id?' · Current':''}</span></button><div className="card-user-asset-actions"><button className="danger" title="Delete saved template" onClick={()=>void deleteSavedTemplate(saved)}><Trash2 size={12}/></button></div></div>)}</div>:<div className="card-empty-library"><strong>No saved templates yet.</strong><span>Create a design and click Save. It will appear here automatically.</span></div>}</div></details>
            <details className="card-library-section card-user-asset-library" open><summary><span>My Assets</span><small>{userAssets.length} saved</small></summary><div className="card-library-body"><div className="card-user-assets-toolbar"><button className="primary" onClick={()=>assetLibraryUploadRef.current?.click()}><Upload size={14}/>Add Asset</button><small>PNG, JPG, WebP, GIF, SVG · max 2 MB</small></div><input ref={assetLibraryUploadRef} hidden type="file" multiple accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,.svg" onChange={e=>{if(e.target.files)void addFilesToAssetLibrary(e.target.files);e.currentTarget.value='';}}/>{assetLibraryStatus&&<div className="card-asset-library-status">{assetLibraryStatus}</div>}{userAssets.length?<div className="card-decorative-grid card-user-assets-grid">{userAssets.map(asset=><div key={asset.id} className="card-user-asset-card"><button className="card-user-asset-insert" title={`Insert ${asset.name}`} onClick={()=>insertUserAsset(asset)}><span className="card-decorative-thumb"><img src={asset.source} alt=""/></span><span>{asset.name}</span></button><div className="card-user-asset-actions"><button title="Rename asset" onClick={()=>void renameUserAsset(asset)}><PenLine size={12}/></button><button className="danger" title="Delete from library" onClick={()=>void deleteUserAsset(asset)}><Trash2 size={12}/></button></div></div>)}</div>:<div className="card-empty-library"><strong>Your reusable asset library is empty.</strong><span>Add logos, florals, icons or SVG artwork once and reuse them across designs.</span></div>}</div></details>
            <details className="card-library-section" open><summary><span>Starter Templates</span><small>{DESIGN_STARTER_TEMPLATES.length} designs</small></summary><div className="card-library-body"><div className="card-starter-template-list">{DESIGN_STARTER_TEMPLATES.map(starter=><button key={starter.id} className="card-starter-template-button" onClick={()=>loadStarterTemplate(starter.id)}><strong>{starter.name}</strong><span>{starter.category} · {starter.description}</span></button>)}</div></div></details>
            <details className="card-library-section" open><summary><span>Floral & Decorative</span><small>{decorativeVisibleCount}/{DECORATIVE_ASSETS.length} assets · folder wise</small></summary><div className="card-library-body"><div className="card-library-toolbar"><input className="card-library-search" placeholder="Search floral assets" value={decorativeQuery} onChange={e=>setDecorativeQuery(e.target.value)}/><small className="card-library-hint">Organized into folders for faster finding and reuse.</small></div>{decorativeGroups.length?<div className="card-library-folders">{decorativeGroups.map(group=><details key={group.key} className="card-library-folder" open><summary><span>{group.key}</span><small>{group.items.length}</small></summary><div className="card-decorative-grid card-library-folder-grid">{group.items.map(asset=><button key={asset.id} title={asset.name} onClick={()=>insertDecoration(asset.id)}><span className="card-decorative-thumb"><img src={asset.source} alt=""/></span><span>{asset.name}</span></button>)}</div></details>)}</div>:<div className="card-empty-library"><strong>No floral assets found.</strong><span>Try another keyword or clear the search.</span></div>}</div></details>
          </>
        )}
        {leftMode === 'DATA' && (
          <div className="card-library-section">
            <div className="card-library-body">
              <strong>Datasource</strong>
              <p style={{color:'var(--text-secondary)',fontSize:'13px',margin:'4px 0'}}>{datasourceStatus}</p>
              {recordCount > 0 && <>
                <p style={{fontSize:'12px',margin:'4px 0'}}>{availableFields.length} fields · {recordCount} record{recordCount===1?'':'s'}</p>
                <p style={{fontSize:'12px',margin:'4px 0',color:'var(--text-secondary)'}}>Previewing: {getRecordDisplayLabel(currentPreviewRecord as Record<string,unknown>, safePreviewIndex)} ({safePreviewIndex+1}/{recordCount})</p>
                <div style={{display:'flex',gap:'6px',marginTop:'8px'}}>
                  <button style={{flex:1}} disabled={safePreviewIndex<=0||previewContextSource==='MANUAL'} onClick={()=>navigatePreviewRecord(-1)}>‹ Prev</button>
                  <button style={{flex:1}} disabled={safePreviewIndex>=recordCount-1||previewContextSource==='MANUAL'} onClick={()=>navigatePreviewRecord(1)}>Next ›</button>
                </div>
              </>}
              {recordCount === 0 && <p style={{fontSize:'12px',color:'var(--text-secondary)'}}>Import a CSV or Excel file to enable dynamic binding and bulk generation.</p>}
            </div>
          </div>
        )}
        {leftMode === 'LAYERS' && (
          <LayerPanel artboard={active} selection={selection} interactionMode={interactionMode} setSelection={setSelection} mutate={mutate} duplicateSelected={duplicateSelected} groupSelected={groupSelected} ungroupSelected={ungroupSelected}/>
        )}
        {leftMode === 'ARTBOARDS' && (
          <div className="card-library-section card-artboards-section">
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
          </div>
        )}
      </DesignerLeftPanel>
      <div className="dg-designer-legacy-workspace">
        <input ref={uploadRef} hidden type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={e=>{const f=e.target.files?.[0];if(f)void uploadImage(f);e.currentTarget.value='';}}/>
   <section className="card-canvas-column"><div className="card-canvas-toolbar"><div className="canvas-artboard-name"><MonitorUp size={15}/><strong>{active.name}</strong><span>{active.widthMm} × {active.heightMm} mm</span></div><div className="canvas-zoom-controls"><button className={interactionMode === 'PEN' ? 'active' : ''} title="Pen Tool (Draw Paths)" style={{color: interactionMode === 'PEN' ? 'var(--accent-color)' : 'inherit', fontWeight: interactionMode === 'PEN' ? 'bold' : 'normal'}} onClick={() => setInteractionMode(interactionMode === 'PEN' ? 'SELECT' : 'PEN')}>Pen Tool</button><button className={snapEnabled?'active':''} title="Smart snapping. Hold Alt while dragging to temporarily bypass." onClick={()=>setSnapEnabled(v=>!v)}>Snap {snapEnabled?'On':'Off'}</button><label className="card-toolbar-check" title="Show measurement rulers around the artboard."><input type="checkbox" checked={showRulers} onChange={e=>setShowRulers(e.target.checked)}/>Rulers</label><label className="card-toolbar-check" title="Show editor-only grid."><input type="checkbox" checked={showGrid} onChange={e=>setShowGrid(e.target.checked)}/>Grid</label><label className="card-toolbar-check" title="Show conditionally hidden elements as ghosted."><input type="checkbox" checked={showHiddenElements} onChange={e=>setShowHiddenElements(e.target.checked)}/>Hidden</label><label className="card-toolbar-check" title="Snap elements to the configured grid."><input type="checkbox" checked={gridSnapEnabled} onChange={e=>setGridSnapEnabled(e.target.checked)}/>Snap Grid</label><label className="card-toolbar-check" title="Snap elements to custom guides."><input type="checkbox" checked={guideSnapEnabled} onChange={e=>setGuideSnapEnabled(e.target.checked)}/>Snap Guides</label><label className="card-grid-size-control" title="Grid spacing"><span>Grid</span><input type="number" min="0.5" step="0.5" value={normalizeDisplayValue(mmToUnit(gridSizeMm,active.displayUnit))} onChange={e=>{const next=unitToMm(Number(e.target.value),active.displayUnit);if(Number.isFinite(next)&&next>=0.5)setGridSizeMm(next);}}/><small>{active.displayUnit==='MM'?'mm':'in'}</small></label><button title="Lock or unlock all guides" className={active.guides.length&&active.guides.every(g=>g.locked)?'active':''} onClick={()=>mutate(t=>setAllGuidesLocked(t,active.id,!active.guides.every(g=>g.locked)))} disabled={!active.guides.length}>{active.guides.length&&active.guides.every(g=>g.locked)?'Unlock Guides':'Lock Guides'}</button><button title="Clear unlocked guides" onClick={()=>mutate(t=>clearGuides(t,active.id))} disabled={!active.guides.some(g=>!g.locked)}>Clear Guides</button><button onClick={()=>setZoom(z=>clamp(z-10,MIN_ZOOM,MAX_ZOOM))}><Minus size={15}/></button><span>{zoom}%</span><button onClick={()=>setZoom(z=>clamp(z+10,MIN_ZOOM,MAX_ZOOM))}><Plus size={15}/></button><button onClick={()=>setZoom(100)}><RotateCcw size={14}/>Actual</button><button onClick={fit}><Maximize2 size={14}/>Fit</button></div></div>
    {recordCount > 0 && <div className="card-record-navigator" role="navigation" aria-label="Record preview navigation" style={{display:'flex',alignItems:'center',gap:'8px',padding:'4px 12px',background:'var(--bg-secondary)',borderBottom:'1px solid var(--border-color)',fontSize:'12px',minHeight:'30px'}}><span style={{color:'var(--text-secondary)',fontWeight:600}}>Preview:</span><button aria-label="Previous record" title="Previous record" disabled={safePreviewIndex<=0||previewContextSource==='MANUAL'} onClick={()=>navigatePreviewRecord(-1)} style={{padding:'2px 8px',minWidth:'28px'}}>‹</button><select aria-label="Jump to record" value={safePreviewIndex} disabled={previewContextSource==='MANUAL'} onChange={e=>setPreviewRecordIndex(Number(e.target.value))} style={{fontSize:'12px',padding:'1px 4px',maxWidth:'140px'}} title="Jump to record"><option value={safePreviewIndex}>{getRecordDisplayLabel(currentPreviewRecord as Record<string,unknown>, safePreviewIndex)}</option>{importedRows.map((_,i)=>i!==safePreviewIndex&&<option key={i} value={i}>{getRecordDisplayLabel(importedRows[i] as Record<string,unknown>,i)}</option>)}</select><span style={{color:'var(--text-secondary)'}}>{safePreviewIndex+1} of {recordCount}</span><button aria-label="Next record" title="Next record" disabled={safePreviewIndex>=recordCount-1||previewContextSource==='MANUAL'} onClick={()=>navigatePreviewRecord(1)} style={{padding:'2px 8px',minWidth:'28px'}}>›</button>{previewContextSource==='MANUAL'&&<span style={{color:'var(--accent-color)',fontSize:'11px'}}>Manual override active</span>}</div>}
    <div ref={viewport} className={`card-canvas-viewport ${space?'pan-ready':''}`} onWheel={zoomAtPointer} onPointerDown={e=>{if(!space&&e.button!==1)return;const v=viewport.current;if(!v)return;e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);pan.current={x:e.clientX,y:e.clientY,left:v.scrollLeft,top:v.scrollTop};}} onPointerMove={e=>{const v=viewport.current,p=pan.current;if(!v||!p)return;v.scrollLeft=p.left-(e.clientX-p.x);v.scrollTop=p.top-(e.clientY-p.y);}} onPointerUp={()=>pan.current=null} onPointerCancel={()=>pan.current=null}>
      <div className="card-canvas-stage" style={{minWidth:`max(100%, ${active.widthMm*MM_TO_CSS_PX*(zoom/100)+160}px)`,minHeight:`max(100%, ${active.heightMm*MM_TO_CSS_PX*(zoom/100)+160}px)`}}>
        <CardArtboardCanvas artboard={active} assets={template.sharedAssets} zoom={zoom} selection={selection} setSelection={setSelection} interactionMode={interactionMode} setInteractionMode={setInteractionMode} drawShapeType={drawShapeType} pathSelectedNodeIds={pathSelectedNodeIds} setPathSelectedNodeIds={setPathSelectedNodeIds} pathSelectedSegmentIds={pathSelectedSegmentIds} setPathSelectedSegmentIds={setPathSelectedSegmentIds} mutate={mutateTransient} commitMutate={mutate} beginHistoryTransaction={beginHistoryTransaction} endHistoryTransaction={endHistoryTransaction} snapEnabled={snapEnabled} gridSnapEnabled={gridSnapEnabled} guideSnapEnabled={guideSnapEnabled} showRulers={showRulers} showGrid={showGrid} showHiddenElements={showHiddenElements} gridSizeMm={gridSizeMm} setStatus={setStatus} mirrorGuideAxis={mirrorGuideAxis}/>
      </div>
      {interactionMode === 'PEN' && <div className="card-micro-hint" style={{position:'absolute',top:'20px',left:'50%',transform:'translateX(-50%)',background:'var(--accent-color)',color:'white',padding:'6px 12px',borderRadius:'16px',fontSize:'12px',display:'flex',alignItems:'center',gap:'6px',pointerEvents:'none',zIndex:1000,boxShadow:'0 2px 8px rgba(0,0,0,0.2)'}}><PenLine size={14}/> Click to add point. Click and drag for curves. Enter to finish.</div>}
      {interactionMode === 'SCISSORS' && <div className="card-micro-hint" style={{position:'absolute',top:'20px',left:'50%',transform:'translateX(-50%)',background:'var(--accent-color)',color:'white',padding:'6px 12px',borderRadius:'16px',fontSize:'12px',display:'flex',alignItems:'center',gap:'6px',pointerEvents:'none',zIndex:1000,boxShadow:'0 2px 8px rgba(0,0,0,0.2)'}}><Scissors size={14}/> Click a path segment to cut it.</div>}
      {interactionMode === 'TRIMMER' && <div className="card-micro-hint" style={{position:'absolute',top:'20px',left:'50%',transform:'translateX(-50%)',background:'var(--accent-color)',color:'white',padding:'6px 12px',borderRadius:'16px',fontSize:'12px',display:'flex',alignItems:'center',gap:'6px',pointerEvents:'none',zIndex:1000,boxShadow:'0 2px 8px rgba(0,0,0,0.2)'}}><BetweenHorizontalStart size={14}/> TRIM — Select segment or first point · Shift+click for manual range</div>}
      {interactionMode === 'EDIT_PATH' && <div className="card-micro-hint" style={{position:'absolute',top:'20px',left:'50%',transform:'translateX(-50%)',background:'var(--accent-color)',color:'white',padding:'6px 12px',borderRadius:'16px',fontSize:'12px',display:'flex',alignItems:'center',gap:'6px',pointerEvents:'none',zIndex:1000,boxShadow:'0 2px 8px rgba(0,0,0,0.2)'}}><MousePointer2 size={14}/> Drag nodes/handles to adjust. Double-click to exit.</div>}
    </div>
    <footer className="card-canvas-status"><span>{status}</span><span>{selection.elementIds.length?`${selection.elementIds.length} selected · Delete removes · Arrow nudge · Shift+Arrow 5 mm`:'Ctrl+Z/Y undo/redo · Ctrl+C/V copy/paste · Ctrl+D duplicate · Hold Space + drag to pan'}</span></footer>
   </section>
    {(()=>{
      const availableSectionsForSelection = getInspectorSections(primary?.type);
      const effectiveInspectorSection = availableSectionsForSelection.includes(activeInspectorSection) ? activeInspectorSection : 'GENERAL';
      return <InspectorContext.Provider value={effectiveInspectorSection}>
      <div className="dg-designer-inspector-layout">
        <DesignerInspector collapsed={inspectorCollapsed}>
          {primary&&effectiveInspectorSection==='GENERAL'&&<div className="card-style-actions"><button onClick={copyStyle}>Copy Style</button><button onClick={pasteStyle} disabled={!styleClipboardRef.current}>Paste Style</button><button onClick={resetStyle}>Reset Style</button></div>}
          {selected.length>1?<><BatchOpacityProperties elements={selected} artboard={active} mutate={mutate}/><MultiSelectionProperties elements={selected} artboard={active} mutate={mutate} groupSelected={groupSelected} ungroupSelected={ungroupSelected}/></>:primary?<ElementProperties element={primary} asset={primary.type==='IMAGE'||primary.type==='SVG'?template.sharedAssets.find(asset=>asset.id===primary.assetId):undefined} assets={template.sharedAssets} artboard={active} mutate={mutate} availableFields={availableFields} datasourceStatus={datasourceStatus}/>:selectedArtboardIds.length>1?<MultiArtboardProperties artboards={template.artboards.filter(a=>selectedArtboardIds.includes(a.id))} mutate={mutate}/>:<><Properties artboard={active} template={template} mutate={mutate}/><PrintProperties artboard={active} assets={template.sharedAssets} mutate={mutate}/></>}
          {effectiveInspectorSection==='DATA_BINDING'&&<PreviewDataPanel dataContext={dataContext} setDataContext={setDataContext} previewContextSource={previewContextSource} setPreviewContextSource={setPreviewContextSource} importedRecord={importedRecord} />}
        </DesignerInspector>
        <DesignerInspectorRail activeSection={effectiveInspectorSection} onSectionChange={(s: InspectorSectionKey) => { setActiveInspectorSection(s); setInspectorCollapsed(false); }} availableSections={availableSectionsForSelection} onCollapse={() => setInspectorCollapsed(true)} />
      </div>
      </InspectorContext.Provider>;
    })()}
    </div>
   </div>
  {exportDialogOpen && (
    <div className="export-dialog-overlay" style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:999,display:'grid',placeItems:'center'}} onClick={e=>{if(e.target===e.currentTarget)handleCancelExport();}}>
      <div className="export-dialog" style={{background:'var(--bg-primary)',padding:'20px',borderRadius:'8px',width:'420px',maxHeight:'90vh',overflowY:'auto',display:'flex',flexDirection:'column',gap:'14px'}}>
        <h3 style={{margin:0}}>Export</h3>
        <label>Format: <select value={exportFormat} onChange={e=>setExportFormat(e.target.value as any)}><option>PDF</option><option>PNG</option><option>JPEG</option></select></label>
        <label>Artboard Target: <select value={exportTargetMode} onChange={e=>setExportTargetMode(e.target.value as any)}><option value="CURRENT">Current Artboard</option><option value="SELECTED" disabled={!selectedArtboardIds.length}>Selected Artboards ({selectedArtboardIds.length})</option><option value="ALL">All Artboards ({artboards.length})</option></select></label>
        <label><input type="checkbox" checked={exportIncludeBleed} onChange={e=>setExportIncludeBleed(e.target.checked)}/> Include Bleed</label>
        <label><input type="checkbox" checked={exportIncludeCropMarks} onChange={e=>setExportIncludeCropMarks(e.target.checked)}/> Include Crop Marks</label>
        {(exportFormat === 'PNG' || exportFormat === 'JPEG') && (
          <label>Raster Quality: <select value={exportDpi} onChange={e=>setExportDpi(Number(e.target.value))}><option value={96}>96 DPI</option><option value={150}>150 DPI</option><option value={300}>300 DPI</option><option value={600}>600 DPI</option></select></label>
        )}
        {exportFormat === 'PNG' && <label><input type="checkbox" checked={exportTransparent} onChange={e=>setExportTransparent(e.target.checked)}/> Transparent Background</label>}
        {exportFormat === 'JPEG' && <label>JPEG Quality: <input type="number" min={1} max={100} value={exportJpegQuality} onChange={e=>setExportJpegQuality(Number(e.target.value))}/></label>}

        {/* ── Bulk Personalization ──────────────────────────────────────── */}
        {recordCount > 0 ? (
          <details open style={{border:'1px solid var(--border-color)',borderRadius:'6px',padding:'10px'}}>
            <summary style={{cursor:'pointer',fontWeight:600,fontSize:'13px',userSelect:'none'}}>
              Personalized Generation ({recordCount} record{recordCount===1?'':'s'} available)
            </summary>
            <div style={{display:'flex',flexDirection:'column',gap:'10px',marginTop:'10px'}}>
              <fieldset style={{border:'none',padding:0,margin:0}}>
                <legend style={{fontWeight:600,fontSize:'12px',marginBottom:'6px'}}>Generate For</legend>
                <label style={{display:'flex',gap:'6px',alignItems:'center',cursor:'pointer'}}><input type="radio" name="bulkRecordTarget" value="CURRENT_RECORD" checked={bulkRecordTarget==='CURRENT_RECORD'} onChange={()=>setBulkRecordTarget('CURRENT_RECORD')}/> Current Record ({safePreviewIndex+1} of {recordCount})</label>
                <label style={{display:'flex',gap:'6px',alignItems:'center',cursor:'pointer'}}><input type="radio" name="bulkRecordTarget" value="SELECTED_RECORDS" checked={bulkRecordTarget==='SELECTED_RECORDS'} onChange={()=>setBulkRecordTarget('SELECTED_RECORDS')}/> Selected Records {bulkRecordTarget==='SELECTED_RECORDS'&&<button type="button" style={{fontSize:'11px',padding:'1px 6px'}} onClick={()=>setBulkSelectDialogOpen(true)}>Choose ({bulkSelectedRecordIndexes.length})</button>}</label>
                <label style={{display:'flex',gap:'6px',alignItems:'center',cursor:'pointer'}}><input type="radio" name="bulkRecordTarget" value="ALL_RECORDS" checked={bulkRecordTarget==='ALL_RECORDS'} onChange={()=>setBulkRecordTarget('ALL_RECORDS')}/> All Records ({recordCount})</label>
              </fieldset>
              <label style={{fontSize:'12px'}}>Artboard Target:
                <select value={bulkArtboardTarget} onChange={e=>setBulkArtboardTarget(e.target.value as BulkArtboardTarget)} style={{marginLeft:'6px'}}>
                  <option value="ALL">All Artboards</option>
                  <option value="CURRENT">Current Artboard Only</option>
                  <option value="SELECTED" disabled={!selectedArtboardIds.length}>Selected Artboards</option>
                </select>
              </label>
              <label style={{fontSize:'12px'}}>Filename Template:
                <input type="text" value={bulkFilenameTemplate} onChange={e=>setBulkFilenameTemplate(e.target.value)} style={{width:'100%',marginTop:'4px',fontFamily:'monospace',fontSize:'11px'}} placeholder="{{recordIndex}}-{{artboardName}}"/>
                <small style={{color:'var(--text-secondary)'}}>Tokens: {'{{recordIndex}}'}, {'{{artboardName}}'}, {'{{FieldName}}'}</small>
              </label>
              {exportFormat === 'PDF' && <label style={{fontSize:'12px'}}><input type="checkbox" checked={bulkCombinePdf} onChange={e=>setBulkCombinePdf(e.target.checked)}/> Combine into single PDF</label>}
              {bulkRecordTarget==='SELECTED_RECORDS'&&bulkSelectedRecordIndexes.length===0&&<p style={{color:'var(--danger-color,#e44)',fontSize:'12px',margin:0}}>Select at least one record to generate.</p>}
            </div>
          </details>
        ) : (
          <p style={{fontSize:'12px',color:'var(--text-secondary)',background:'var(--bg-secondary)',padding:'8px',borderRadius:'4px',margin:0}}>
            Import a CSV or Excel file to enable personalized bulk generation.
          </p>
        )}

        <div style={{display:'flex',justifyContent:'flex-end',gap:'10px',marginTop:'4px',flexWrap:'wrap'}}>
          <button type="button" onClick={handleCancelExport}>Cancel</button>
          {recordCount > 0 && bulkRecordTarget !== 'CURRENT_RECORD' ? (
            <button type="button" className="primary" onClick={performBulkExport} disabled={isExporting||(bulkRecordTarget==='SELECTED_RECORDS'&&!bulkSelectedRecordIndexes.length)}>
              {isExporting ? 'Generating...' : `Generate (${bulkRecordTarget==='SELECTED_RECORDS'?bulkSelectedRecordIndexes.length:recordCount} record${(bulkRecordTarget==='SELECTED_RECORDS'?bulkSelectedRecordIndexes.length:recordCount)===1?'':'s'})`}
            </button>
          ) : (
            <button type="button" className="primary" onClick={performExport} disabled={isExporting}>{isExporting ? 'Exporting...' : 'Export'}</button>
          )}
        </div>
      </div>
    </div>
  )}

  {/* ── Record Selection Modal ──────────────────────────────────────────── */}
  {bulkSelectDialogOpen && (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:1000,display:'grid',placeItems:'center'}}>
      <div style={{background:'var(--bg-primary)',padding:'16px',borderRadius:'8px',width:'380px',maxHeight:'80vh',display:'flex',flexDirection:'column',gap:'10px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <strong>Select Records</strong>
          <div style={{display:'flex',gap:'8px'}}>
            <button style={{fontSize:'12px'}} onClick={()=>setBulkSelectedRecordIndexes(importedRows.map((_,i)=>i))}>All</button>
            <button style={{fontSize:'12px'}} onClick={()=>setBulkSelectedRecordIndexes([])}>Clear</button>
          </div>
        </div>
        <small style={{color:'var(--text-secondary)'}}>{bulkSelectedRecordIndexes.length} of {recordCount} selected</small>
        <div style={{overflowY:'auto',flex:1,border:'1px solid var(--border-color)',borderRadius:'4px'}}>
          {importedRows.slice(bulkSelectPage * 100, (bulkSelectPage + 1) * 100).map((row, indexOffset) => {
            const i = bulkSelectPage * 100 + indexOffset;
            return (
              <label key={i} style={{display:'flex',gap:'8px',alignItems:'center',padding:'6px 10px',cursor:'pointer',borderBottom:'1px solid var(--border-color)',fontSize:'12px'}}>
                <input type="checkbox" checked={bulkSelectedRecordIndexes.includes(i)} onChange={e=>{setBulkSelectedRecordIndexes(prev=>e.target.checked?[...prev,i]:prev.filter(x=>x!==i));}}/>
                <span style={{flex:1}}>{getRecordDisplayLabel(row as Record<string,unknown>,i)}</span>
                <span style={{color:'var(--text-secondary)'}}>{i+1}</span>
              </label>
            );
          })}
        </div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:'12px'}}>
          <span>Page {bulkSelectPage + 1} of {Math.ceil(recordCount / 100)}</span>
          <div style={{display:'flex',gap:'8px'}}>
            <button disabled={bulkSelectPage === 0} onClick={() => setBulkSelectPage(p => p - 1)}>Prev 100</button>
            <button disabled={(bulkSelectPage + 1) * 100 >= recordCount} onClick={() => setBulkSelectPage(p => p + 1)}>Next 100</button>
          </div>
        </div>
        <div style={{display:'flex',justifyContent:'flex-end',gap:'8px'}}>
          <button onClick={()=>setBulkSelectDialogOpen(false)}>Done</button>
        </div>
      </div>
    </div>
  )}

  {/* ── Bulk Progress Overlay ───────────────────────────────────────────── */}
  {bulkProgress && (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:998,display:'grid',placeItems:'center'}}>
      <div style={{background:'var(--bg-primary)',padding:'24px',borderRadius:'8px',width:'360px',display:'flex',flexDirection:'column',gap:'12px',textAlign:'center'}}>
        <strong>Generating personalized cards…</strong>
        <p style={{margin:0,fontSize:'13px',color:'var(--text-secondary)'}}>{bulkProgress.label}</p>
        <p style={{margin:0,fontSize:'13px'}}>{bulkProgress.current} / {bulkProgress.total}</p>
        <div style={{background:'var(--bg-secondary)',borderRadius:'4px',height:'8px',overflow:'hidden'}}>
          <div style={{height:'100%',background:'var(--accent-color,#6c63ff)',width:`${(bulkProgress.current/bulkProgress.total)*100}%`,transition:'width 0.2s'}}/>
        </div>
        <button type="button" onClick={()=>{bulkCancelRef.current?.cancel();setStatus('Cancellation requested…');}}>Cancel</button>
      </div>
    </div>
  )}

  {/* ── Bulk Result Summary ─────────────────────────────────────────────── */}
  {bulkResult && !bulkProgress && (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:997,display:'grid',placeItems:'center'}} onClick={()=>setBulkResult(null)}>
      <div style={{background:'var(--bg-primary)',padding:'20px',borderRadius:'8px',width:'360px',display:'flex',flexDirection:'column',gap:'10px'}} onClick={e=>e.stopPropagation()}>
        <strong>Generation {bulkResult.cancelled?'Cancelled':'Complete'}</strong>
        <p style={{margin:0,fontSize:'13px'}}>✓ {bulkResult.succeededItems} succeeded · ✗ {bulkResult.failedItems} failed{bulkResult.cancelled?' · Cancelled':''}</p>
        {bulkResult.failures.length > 0 && (
          <details><summary style={{fontSize:'12px',cursor:'pointer'}}>View failures ({bulkResult.failures.length})</summary>
            <ul style={{fontSize:'11px',margin:'4px 0',paddingLeft:'16px',maxHeight:'100px',overflowY:'auto'}}>
              {bulkResult.failures.map((f,i)=><li key={i}>Record {f.recordIndex+1}: {f.message}</li>)}
            </ul>
          </details>
        )}
        <button onClick={()=>setBulkResult(null)}>Dismiss</button>
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
 </div></DesignerShell>);
}

type DrawDraft={startX:number;startY:number;currentX:number;currentY:number;shapeType:DesignShapeKind;isShift:boolean;pointerIsDown:boolean;movedDuringPress:boolean;startSnap?:BoundarySnap;currentSnap?:BoundarySnap};

type EraserPoint={xMm:number;yMm:number};
type SpacingGuide={axis:'X'|'Y';fromMm:number;toMm:number;crossMm:number;gapMm:number};

function pointInPolygon(point:EraserPoint, polygon:EraserPoint[]):boolean{
  let inside=false;
  for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
    const a=polygon[i]!,b=polygon[j]!;
    const intersects=((a.yMm>point.yMm)!==(b.yMm>point.yMm))&&(point.xMm<(b.xMm-a.xMm)*(point.yMm-a.yMm)/((b.yMm-a.yMm)||1e-9)+a.xMm);
    if(intersects)inside=!inside;
  }
  return inside;
}
function segmentsIntersect(a:EraserPoint,b:EraserPoint,c:EraserPoint,d:EraserPoint):boolean{
  const cross=(p:EraserPoint,q:EraserPoint,r:EraserPoint)=>(q.xMm-p.xMm)*(r.yMm-p.yMm)-(q.yMm-p.yMm)*(r.xMm-p.xMm);
  const ab1=cross(a,b,c),ab2=cross(a,b,d),cd1=cross(c,d,a),cd2=cross(c,d,b);
  return ((ab1===0||ab2===0)||(ab1>0)!==(ab2>0))&&((cd1===0||cd2===0)||(cd1>0)!==(cd2>0));
}
function eraserHitsElement(points:EraserPoint[],element:DesignElement):boolean{
  if(points.length<2||!element.visible||element.locked)return false;
  const left=element.position.xMm,top=element.position.yMm,right=left+element.size.widthMm,bottom=top+element.size.heightMm;
  const corners=[{xMm:left,yMm:top},{xMm:right,yMm:top},{xMm:right,yMm:bottom},{xMm:left,yMm:bottom}];
  const closed=points.length>=3;
  if(closed&&corners.some(c=>pointInPolygon(c,points)))return true;
  const center={xMm:(left+right)/2,yMm:(top+bottom)/2};
  if(closed&&pointInPolygon(center,points))return true;
  if(points.some(p=>p.xMm>=left&&p.xMm<=right&&p.yMm>=top&&p.yMm<=bottom))return true;
  const edges=[[corners[0]!,corners[1]!],[corners[1]!,corners[2]!],[corners[2]!,corners[3]!],[corners[3]!,corners[0]!]] as const;
  for(let i=1;i<points.length;i++)for(const [c,d] of edges)if(segmentsIntersect(points[i-1]!,points[i]!,c,d))return true;
  return false;
}
function equalSpacingSnap(artboard:Artboard,elementIds:string[],rawDelta:{xMm:number;yMm:number},toleranceMm:number):{delta:{xMm:number;yMm:number};guides:SpacingGuide[]}{
  const moving=artboard.elements.filter(e=>elementIds.includes(e.id)&&e.visible&&!e.locked),bounds=getSelectionBounds(moving);
  if(!bounds)return{delta:rawDelta,guides:[]};
  const staticEls=artboard.elements.filter(e=>!elementIds.includes(e.id)&&e.visible&&!e.runtimeHidden);
  const moved={x:bounds.xMm+rawDelta.xMm,y:bounds.yMm+rawDelta.yMm,w:bounds.widthMm,h:bounds.heightMm};
  let dx=rawDelta.xMm,dy=rawDelta.yMm;const guides:SpacingGuide[]=[];
  const verticalOverlap=(e:DesignElement)=>Math.min(moved.y+moved.h,e.position.yMm+e.size.heightMm)-Math.max(moved.y,e.position.yMm)>0;
  const lefts=staticEls.filter(e=>verticalOverlap(e)&&e.position.xMm+e.size.widthMm<=moved.x+0.01).sort((a,b)=>(b.position.xMm+b.size.widthMm)-(a.position.xMm+a.size.widthMm));
  const rights=staticEls.filter(e=>verticalOverlap(e)&&e.position.xMm>=moved.x+moved.w-0.01).sort((a,b)=>a.position.xMm-b.position.xMm);
  if(lefts[0]&&rights[0]){
    const le=lefts[0].position.xMm+lefts[0].size.widthMm,rs=rights[0].position.xMm;
    const targetX=le+(rs-le-moved.w)/2,correction=targetX-moved.x;
    if(Math.abs(correction)<=toleranceMm){dx+=correction;const x=targetX;const gap=Math.max(0,x-le);const cross=moved.y+moved.h/2;guides.push({axis:'X',fromMm:le,toMm:x,crossMm:cross,gapMm:gap},{axis:'X',fromMm:x+moved.w,toMm:rs,crossMm:cross,gapMm:gap});}
  }
  const horizontalOverlap=(e:DesignElement)=>Math.min(moved.x+moved.w,e.position.xMm+e.size.widthMm)-Math.max(moved.x,e.position.xMm)>0;
  const tops=staticEls.filter(e=>horizontalOverlap(e)&&e.position.yMm+e.size.heightMm<=moved.y+0.01).sort((a,b)=>(b.position.yMm+b.size.heightMm)-(a.position.yMm+a.size.heightMm));
  const bottoms=staticEls.filter(e=>horizontalOverlap(e)&&e.position.yMm>=moved.y+moved.h-0.01).sort((a,b)=>a.position.yMm-b.position.yMm);
  if(tops[0]&&bottoms[0]){
    const te=tops[0].position.yMm+tops[0].size.heightMm,bs=bottoms[0].position.yMm;
    const targetY=te+(bs-te-moved.h)/2,correction=targetY-moved.y;
    if(Math.abs(correction)<=toleranceMm){dy+=correction;const y=targetY;const gap=Math.max(0,y-te);const cross=moved.x+moved.w/2;guides.push({axis:'Y',fromMm:te,toMm:y,crossMm:cross,gapMm:gap},{axis:'Y',fromMm:y+moved.h,toMm:bs,crossMm:cross,gapMm:gap});}
  }
  return{delta:{xMm:dx,yMm:dy},guides};
}
type Op={mode:'MOVE';lastX:number;lastY:number;ids:string[]}|{mode:'RESIZE';element:DesignElement;anchor:'NW'|'N'|'NE'|'E'|'SE'|'S'|'SW'|'W';startX:number;startY:number;keepAspect:boolean}|{mode:'ROTATE';element:DesignElement;startAngle:number;startRotation:number}|{mode:'PEN_DRAG';pathId:string;pointId:string;startX:number;startY:number}|{mode:'ERASER_LASSO'}|({mode:'DRAW_SHAPE_DRAG'}&DrawDraft);
function CardArtboardCanvas({artboard,assets,zoom,selection,setSelection,interactionMode,setInteractionMode,drawShapeType,pathSelectedNodeIds,setPathSelectedNodeIds,pathSelectedSegmentIds,setPathSelectedSegmentIds,mutate,commitMutate,beginHistoryTransaction,endHistoryTransaction,snapEnabled,gridSnapEnabled,guideSnapEnabled,showRulers,showGrid,showHiddenElements,gridSizeMm,setStatus,mirrorGuideAxis}:{artboard:Artboard;assets:DesignTemplate['sharedAssets'];zoom:number;selection:DesignSelectionState;setSelection:(s:DesignSelectionState)=>void;interactionMode:'SELECT'|'EDIT_PATH'|'SCISSORS'|'PEN'|'TRIMMER'|'ERASER'|'DRAW_SHAPE'|'FLEXIBLE_LINE';setInteractionMode:(m:'SELECT'|'EDIT_PATH'|'SCISSORS'|'PEN'|'TRIMMER'|'ERASER'|'DRAW_SHAPE'|'FLEXIBLE_LINE')=>void;drawShapeType:DesignShapeKind|null;pathSelectedNodeIds:string[];setPathSelectedNodeIds:(m:string[])=>void;pathSelectedSegmentIds:string[];setPathSelectedSegmentIds:(m:string[])=>void;mutate:(f:(t:DesignTemplate)=>DesignTemplate)=>void;commitMutate:(f:(t:DesignTemplate)=>DesignTemplate)=>void;beginHistoryTransaction:()=>void;endHistoryTransaction:()=>void;snapEnabled:boolean;gridSnapEnabled:boolean;guideSnapEnabled:boolean;showRulers:boolean;showGrid:boolean;showHiddenElements:boolean;gridSizeMm:number;setStatus:(message:string)=>void;mirrorGuideAxis:'HORIZONTAL'|'VERTICAL'|null}){
 const canvas=useRef<HTMLDivElement|null>(null);const interaction=useRef<Op|null>(null);const marquee=useRef<{startX:number;startY:number;add:boolean}|null>(null);const guideDrag=useRef<{id:string;orientation:'VERTICAL'|'HORIZONTAL';creating:boolean}|null>(null);const [guidePreview,setGuidePreview]=useState<{orientation:'VERTICAL'|'HORIZONTAL';positionMm:number}|null>(null);const [marqueeRect,setMarqueeRect]=useState<DesignRectMm|null>(null);const [snapGuides,setSnapGuides]=useState<SnapGuideIndicator[]>([]);const [eraserPoints,setEraserPoints]=useState<{xMm:number;yMm:number}[]>([]);const [spacingGuides,setSpacingGuides]=useState<Array<{axis:'X'|'Y';fromMm:number;toMm:number;crossMm:number;gapMm:number}>>([]);
 const [penHover, setPenHover] = useState<{xMm: number, yMm: number} | null>(null);
 const [boundarySnap,setBoundarySnap]=useState<BoundarySnap|null>(null);
 const [boundaryHover,setBoundaryHover]=useState<BoundarySnap|null>(null);
 const [drawDraft,setDrawDraft]=useState<DrawDraft|null>(null);
 useEffect(()=>{if(interactionMode!=='DRAW_SHAPE'){setDrawDraft(null);if(interaction.current?.mode==='DRAW_SHAPE_DRAG')interaction.current=null;}if(interactionMode!=='PEN'&&interactionMode!=='FLEXIBLE_LINE'&&interactionMode!=='DRAW_SHAPE'){setBoundarySnap(null);setBoundaryHover(null);}if(interactionMode!=='ERASER')setEraserPoints([]);if(interactionMode!=='SELECT')setSpacingGuides([]);},[interactionMode]);
 useEffect(()=>{if(interactionMode==='DRAW_SHAPE'){setDrawDraft(null);if(interaction.current?.mode==='DRAW_SHAPE_DRAG')interaction.current=null;}},[drawShapeType]);
 const trimmerTargets = useMemo(() => {
  const targets = new Map<string, PathDesignElement>();
  for (const element of artboard.elements) {
    if (!element.visible || element.locked || element.runtimeHidden) continue;
    if (element.type === 'PATH') {
      targets.set(element.id, element);
    } else if (element.type === 'SHAPE') {
      targets.set(element.id, {
        id: element.id, type: 'PATH', name: element.name, position: element.position, size: element.size,
        rotationDeg: element.rotationDeg, opacity: element.opacity, visible: element.visible, locked: element.locked,
        zIndex: element.zIndex, groupId: element.groupId, bindings: element.bindings, metadata: element.metadata,
        visibilityRule: element.visibilityRule, runtimeHidden: element.runtimeHidden,
        geometry: shapeToPathGeometry(element.shape, element.size), fill: element.fill, stroke: element.stroke, shadow: element.shadow
      });
    }
  }
  return targets;
 }, [artboard.elements]);
 const commitTrimFragments = useCallback((sourceId: string, trimmedGeometry: PathDesignElement['geometry']) => {
  const source = artboard.elements.find(element => element.id === sourceId);
  if (!source || (source.type !== 'PATH' && source.type !== 'SHAPE')) return;
  const normalized = splitGeometryIntoConnectedFragments(trimmedGeometry).map(fragment => normalizePathFragment(fragment, source));
  const fragmentIds = normalized.map(() => id('path-fragment'));
  const fragments: PathDesignElement[] = normalized.map((fragment, index) => ({
    id: fragmentIds[index]!, type: 'PATH', name: `${source.name} ${index + 1}`, position: fragment.position, size: fragment.size,
    rotationDeg: source.rotationDeg, opacity: source.opacity, visible: source.visible, locked: false, zIndex: source.zIndex,
    groupId: source.groupId, bindings: source.bindings, metadata: source.metadata, visibilityRule: source.visibilityRule,
    geometry: fragment.geometry, fill: fragment.geometry.closed ? source.fill : { type: 'NONE' }, stroke: source.stroke, shadow: source.shadow
  }));
  commitMutate(template => {
    const replaced=replaceElementsAtLayer(template,artboard.id,[sourceId],fragments);
    return {...replaced,artboards:replaced.artboards.map(current=>current.id!==artboard.id?current:{...current,groups:current.groups.map(group=>({...group,elementIds:group.elementIds.flatMap(elementId=>elementId===sourceId?fragmentIds:[elementId])}))})};
  });
  setSelection({ artboardId: artboard.id, elementIds: fragmentIds, primaryElementId: fragmentIds[0] });
 }, [artboard.elements, artboard.id, commitMutate, setSelection]);
 const point=(e:React.PointerEvent)=>{const r=canvas.current!.getBoundingClientRect();return{xMm:(e.clientX-r.left)/r.width*artboard.widthMm,yMm:(e.clientY-r.top)/r.height*artboard.heightMm};};
 const drawingSnap=(raw:{xMm:number;yMm:number},excludeIds:string[]=[])=>(snapEnabled?findBoundarySnap(artboard.elements,{x:raw.xMm,y:raw.yMm},8/(MM_TO_CSS_PX*(zoom/100)),excludeIds):undefined);
 const commitDrawDraft=(draft:DrawDraft,end:{xMm:number;yMm:number},endSnap?:BoundarySnap)=>{
   const sx=draft.startX,sy=draft.startY,ex=end.xMm,ey=end.yMm;
   const isCircle=draft.shapeType==='CIRCLE';
   let x=Math.min(sx,ex),y=Math.min(sy,ey),w=Math.abs(ex-sx),h=Math.abs(ey-sy);
   if(isCircle){const r=Math.hypot(ex-sx,ey-sy);x=sx-r;y=sy-r;w=r*2;h=r*2;}
   else if(draft.isShift&&draft.shapeType!=='LINE'){const size=Math.max(w,h);w=size;h=size;x=ex<sx?sx-size:sx;y=ey<sy?sy-size:sy;}
   const lineLength=Math.hypot(ex-sx,ey-sy),minSize=2;
   if(draft.shapeType==='LINE'?(lineLength<0.5):(w<minSize&&h<minSize)){setDrawDraft(null);interaction.current=null;endHistoryTransaction();return;}
   const newId=id('element');let generatedFaceIds:string[]=[];
   commitMutate(t=>{
     const art=t.artboards.find(a=>a.id===artboard.id);if(!art)return t;
     let geometry;
     if(draft.shapeType==='LINE'){
       const px=Math.min(sx,ex),py=Math.min(sy,ey),p1=id('point'),p2=id('point');
       geometry={points:[{id:p1,x:sx-px,y:sy-py,mode:'CORNER' as const},{id:p2,x:ex-px,y:ey-py,mode:'CORNER' as const}],segments:[{id:id('segment'),type:'LINE' as const,fromPointId:p1,toPointId:p2}],closed:false};
       x=px;y=py;w=Math.max(Math.abs(ex-sx),0.1);h=Math.max(Math.abs(ey-sy),0.1);
     }else geometry=shapeToPathGeometry(draft.shapeType,{widthMm:w,heightMm:h});
     const el:PathDesignElement={id:newId,type:'PATH',name:draft.shapeType,position:{xMm:x,yMm:y},size:{widthMm:w,heightMm:h},rotationDeg:0,opacity:1,zIndex:nextElementZIndex(t,artboard.id),visible:true,locked:false,geometry,fill:(draft.shapeType==='LINE'||draft.shapeType==='ARC')?{type:'NONE'}:{type:'SOLID',color:'#d1d5db'},stroke:{style:'SOLID',color:'#000000',widthMm:0.5},metadata:draft.shapeType==='LINE'&&draft.startSnap?{dividerBoundaryTargetId:draft.startSnap.elementId,faceComponentId:id('face-component')}:undefined};
     let next={...t,artboards:t.artboards.map(a=>a.id===artboard.id?{...a,elements:[...a.elements,el]}:a)};
     if(draft.shapeType==='LINE'){
       const nextArt=next.artboards.find(a=>a.id===artboard.id),divider=nextArt?.elements.find(item=>item.id===newId) as PathDesignElement|undefined;
       if(nextArt&&divider){
        // Do not gate face generation on UI snap metadata. The geometry engine
        // is authoritative and can prove whether both committed endpoints lie
        // on one current closed face. This also covers exact boundary clicks
        // where a contextual marker was not captured in draft state.
        const hinted=[draft.startSnap?.elementId,endSnap?.elementId].filter((value):value is string=>Boolean(value));
        const hintedSource=nextArt.elements.find(item=>hinted.includes(item.id));
        const split=splitComponentFaceByDivider(nextArt.elements,divider,hintedSource?.groupId??id('face-component'),hinted);
        if(split){
         const source=nextArt.elements.find(item=>item.id===split.sourceId)!;
         const {componentId,faces}=split;generatedFaceIds=faces.map(face=>face.id);
         const replaced=replaceElementsAtLayer(next,artboard.id,[source.id,divider.id],faces);
         next={...replaced,artboards:replaced.artboards.map(a=>a.id!==artboard.id?a:{...a,groups:a.groups.some(g=>g.id===componentId)?a.groups.map(g=>g.id===componentId?{...g,elementIds:g.elementIds.flatMap(eid=>eid===source.id?generatedFaceIds:[eid])}:g):[...a.groups,{id:componentId,name:`${source.name} Component`,elementIds:generatedFaceIds,visible:source.visible,locked:source.locked}]})};
        }
       }
     }
     return next;
   });
   if(generatedFaceIds.length){const firstFaceId=generatedFaceIds[0]!;setSelection({artboardId:artboard.id,elementIds:[firstFaceId],primaryElementId:firstFaceId});}else setSelection({artboardId:artboard.id,elementIds:[newId],primaryElementId:newId});
   endHistoryTransaction();
   if(draft.shapeType==='LINE'){
     const chained:DrawDraft={startX:ex,startY:ey,currentX:ex,currentY:ey,shapeType:'LINE',isShift:false,pointerIsDown:false,movedDuringPress:false,startSnap:endSnap};
     interaction.current={mode:'DRAW_SHAPE_DRAG',...chained};setDrawDraft(chained);
   }else{interaction.current=null;setDrawDraft(null);}
 };
 const eraserDownCapture=(e:React.PointerEvent<HTMLDivElement>)=>{
  if(interactionMode!=='ERASER'||e.button!==0)return;
  e.preventDefault();e.stopPropagation();
  e.currentTarget.setPointerCapture?.(e.pointerId);
  const p=point(e);beginHistoryTransaction();interaction.current={mode:'ERASER_LASSO'};setEraserPoints([p]);setSelection({artboardId:artboard.id,elementIds:[],primaryElementId:undefined});setStatus('Eraser — draw a freeform selection and release');
 };
 const downCanvas=(e:React.PointerEvent<HTMLDivElement>)=>{
  if (interactionMode === 'DRAW_SHAPE' && drawShapeType) {
    if(e.button!==0)return;
    const raw=point(e),snap=drawingSnap(raw),p=snap?{xMm:snap.point.x,yMm:snap.point.y}:raw;
    const existing=interaction.current?.mode==='DRAW_SHAPE_DRAG'?interaction.current:null;
    if(existing&&!existing.pointerIsDown){
      commitDrawDraft(existing,p,snap);
      return;
    }
    beginHistoryTransaction();
    const draft:DrawDraft={startX:p.xMm,startY:p.yMm,currentX:p.xMm,currentY:p.yMm,shapeType:drawShapeType,isShift:e.shiftKey,pointerIsDown:true,movedDuringPress:false,startSnap:snap};
    interaction.current={mode:'DRAW_SHAPE_DRAG',...draft};
    setDrawDraft(draft);
    setBoundarySnap(snap??null);
    return;
  }
  if (interactionMode === 'PEN' || interactionMode === 'FLEXIBLE_LINE') {
    if(e.button!==0)return;
    const rawPoint=point(e);
    const snap=findBoundarySnap(artboard.elements,{x:rawPoint.xMm,y:rawPoint.yMm},8/(MM_TO_CSS_PX*(zoom/100)),selection.elementIds.filter(elementId=>{const element=artboard.elements.find(candidate=>candidate.id===elementId);return element?.type==='PATH'&&!element.geometry.closed;}));
    const p=snap?{xMm:snap.point.x,yMm:snap.point.y}:rawPoint;
    beginHistoryTransaction();
    let targetPathId: string | undefined;
    let addedPointId: string = crypto.randomUUID();
    if (selection.elementIds.length === 1) {
      const selectedId = selection.elementIds[0];
      const selectedEl = artboard.elements.find(el => el.id === selectedId);
      if (selectedEl && selectedEl.type === 'PATH') {
        const localPt = worldToLocal({ x: p.xMm, y: p.yMm }, selectedEl);
        const newPtId = addedPointId;
        const newSegId = crypto.randomUUID();
        const endpoints = getPathEndpoints((selectedEl as PathDesignElement).geometry);
        const lastNode = endpoints.length > 0 ? endpoints[endpoints.length - 1] : (selectedEl as PathDesignElement).geometry.points[(selectedEl as PathDesignElement).geometry.points.length - 1]?.id;
        const firstNode = endpoints.length > 0 ? endpoints[0] : (selectedEl as PathDesignElement).geometry.points[0]?.id;
        if (firstNode && interactionMode !== 'FLEXIBLE_LINE') {
           const firstPt = (selectedEl as PathDesignElement).geometry.points.find(pt => pt.id === firstNode);
           if (firstPt) {
              const dist = Math.hypot(firstPt.x - localPt.x, firstPt.y - localPt.y);
              if (dist < 4) { 
                 commitMutate(t => {
                   return {
                     ...t, artboards: t.artboards.map(a => a.id === artboard.id ? {
                       ...a, elements: a.elements.map(el => {
                         if (el.id !== selectedId) return el;
                         const pEl = el as PathDesignElement;
                         const closeSegId = crypto.randomUUID();
                         const newGeo = { ...pEl.geometry, closed: true, segments: [...pEl.geometry.segments, { id: closeSegId, type: 'LINE' as const, fromPointId: lastNode, toPointId: firstNode }] };
                         return { ...pEl, geometry: newGeo };
                       })
                     } : a)
                   };
                 });
                 endHistoryTransaction();
                 setInteractionMode('SELECT');
                 return;
              }
           }
        }
        if (lastNode) {
          targetPathId = selectedId;
          let generatedFaceIds:string[]=[];
          commitMutate(t => {
            const extended={
              ...t, artboards: t.artboards.map(a => a.id === artboard.id ? {
                ...a, elements: a.elements.map(el => {
                  if (el.id !== selectedId) return el;
                  const pEl = el as PathDesignElement;
                  const newGeo = { ...pEl.geometry, points: [...pEl.geometry.points, { id: newPtId, x: localPt.x, y: localPt.y, mode: 'CORNER' as const }], segments: [...pEl.geometry.segments, { id: newSegId, type: 'LINE' as const, fromPointId: lastNode, toPointId: newPtId }] };
                  return { ...pEl, geometry: newGeo };
                })
              } : a)
            };
            if(interactionMode!=='FLEXIBLE_LINE')return extended;
            const currentArtboard=extended.artboards.find(a=>a.id===artboard.id),divider=currentArtboard?.elements.find(el=>el.id===selectedId) as PathDesignElement|undefined;
            if(!currentArtboard||!divider)return extended;
            const startTargetId=typeof divider.metadata?.dividerBoundaryTargetId==='string'?divider.metadata.dividerBoundaryTargetId:undefined;
            const hinted=[startTargetId,snap?.elementId].filter((value):value is string=>Boolean(value));
            const hintedSource=currentArtboard.elements.find(el=>hinted.includes(el.id));
            const fallbackComponentId=hintedSource?.groupId??(typeof divider.metadata?.faceComponentId==='string'?divider.metadata.faceComponentId:id('face-component'));
            const split=splitComponentFaceByDivider(currentArtboard.elements,divider,fallbackComponentId,hinted);if(!split)return extended;
            const source=currentArtboard.elements.find(el=>el.id===split.sourceId);if(!source)return extended;const {componentId,faces}=split;generatedFaceIds=faces.map(face=>face.id);
            const replaced=replaceElementsAtLayer(extended,artboard.id,[source.id,divider.id],faces);
            return{...replaced,artboards:replaced.artboards.map(a=>{if(a.id!==artboard.id)return a;const existing=a.groups.find(group=>group.id===componentId);return{...a,groups:existing?a.groups.map(group=>group.id===componentId?{...group,elementIds:group.elementIds.flatMap(elementId=>elementId===source.id?generatedFaceIds:[elementId])}:group):[...a.groups,{id:componentId,name:`${source.name} Component`,elementIds:generatedFaceIds,visible:source.visible,locked:source.locked}]};})};
          });
          if(generatedFaceIds.length){const firstFaceId=generatedFaceIds[0]!;setSelection({artboardId:artboard.id,elementIds:[firstFaceId],primaryElementId:firstFaceId});}
        }
      }
    }
      if (!targetPathId) {
        const newPathId = crypto.randomUUID();
        commitMutate(t => {
          return {
            ...t, artboards: t.artboards.map(a => a.id === artboard.id ? {
              ...a, elements: [...a.elements, {
                id: newPathId, type: 'PATH', name: interactionMode === 'FLEXIBLE_LINE' ? 'Flexible Line' : 'Path', locked: false, visible: true, opacity: 1, zIndex: Math.max(-1,...a.elements.map(element=>element.zIndex))+1, position: { xMm: p.xMm, yMm: p.yMm }, size: { widthMm: 0.1, heightMm: 0.1 }, rotationDeg: 0,
                geometry: { points: [{ id: addedPointId, x: 0, y: 0, mode: 'CORNER' }], segments: [], closed: false },
                metadata: snap ? {dividerBoundaryTargetId:snap.elementId,faceComponentId:id('face-component')} : undefined,
                style: { stroke: '#000000', strokeWidthMm: 0.5, fill: 'transparent' },
                fill: { type: 'NONE' },
                stroke: { type: 'SOLID', style: 'SOLID', color: '#000000', widthMm: 0.5, opacity: 1 }
              } as PathDesignElement]
            } : a)
          };
        });
        setSelection({ artboardId: artboard.id, elementIds: [newPathId], primaryElementId: newPathId });
        targetPathId = newPathId;
      }
      interaction.current = { mode: 'PEN_DRAG', pathId: targetPathId, pointId: addedPointId, startX: p.xMm, startY: p.yMm };
      return;
    }
    
    if(e.target!==e.currentTarget&&!(e.target as HTMLElement).classList.contains('card-artboard-empty-state'))return;
    if(e.button!==0)return;
    const pt=point(e);
    e.currentTarget.setPointerCapture(e.pointerId);
    marquee.current={startX:pt.xMm,startY:pt.yMm,add:e.shiftKey};
    setMarqueeRect({xMm:pt.xMm,yMm:pt.yMm,widthMm:0,heightMm:0});
    if(!e.shiftKey)setSelection({artboardId:artboard.id,elementIds:[],primaryElementId:undefined});
  };
  const moveCanvas=(e:React.PointerEvent<HTMLDivElement>)=>{const raw=point(e);const activeConnectTool=interactionMode==='PEN'||interactionMode==='FLEXIBLE_LINE'||interactionMode==='DRAW_SHAPE';const excluded=selection.elementIds.filter(elementId=>{const element=artboard.elements.find(candidate=>candidate.id===elementId);return element?.type==='PATH'&&!element.geometry.closed;});const snap=activeConnectTool?drawingSnap(raw,excluded):undefined;const hover=activeConnectTool?findBoundarySnap(artboard.elements,{x:raw.xMm,y:raw.yMm},14/(MM_TO_CSS_PX*(zoom/100)),excluded):undefined;const p=snap?{xMm:snap.point.x,yMm:snap.point.y}:raw;if(interactionMode==='PEN'||interactionMode==='FLEXIBLE_LINE')setPenHover({xMm:p.xMm,yMm:p.yMm});else if(interactionMode!=='DRAW_SHAPE')setPenHover(null);setBoundarySnap(snap??null);setBoundaryHover(hover??null);const guide=guideDrag.current;if(guide){const raw=guide.orientation==='VERTICAL'?p.xMm:p.yMm;const max=guide.orientation==='VERTICAL'?artboard.widthMm:artboard.heightMm;const positionMm=clamp(raw,0,max);setGuidePreview({orientation:guide.orientation,positionMm});if(!guide.creating)mutate(t=>moveGuide(t,artboard.id,guide.id,positionMm));return;}const op=interaction.current;if(op?.mode==='ERASER_LASSO'){const last=eraserPoints[eraserPoints.length-1];if(!last||Math.hypot(raw.xMm-last.xMm,raw.yMm-last.yMm)>=0.4)setEraserPoints(points=>[...points,raw]);return;}const snapOptions={enabled:snapEnabled&&!e.altKey,toleranceMm:1.5,snapToArtboard:true,snapToElements:true,snapToGuides:guideSnapEnabled,snapToGrid:gridSnapEnabled,gridSizeMm};if(op?.mode==='MOVE'){const dx=p.xMm-op.lastX,dy=p.yMm-op.lastY;interaction.current={...op,lastX:p.xMm,lastY:p.yMm};const snapped=snapMoveDelta(artboard,op.ids,{xMm:dx,yMm:dy},snapOptions);const spaced=snapEnabled&&!e.altKey?equalSpacingSnap(artboard,op.ids,snapped.delta,1.5):{delta:snapped.delta,guides:[] as SpacingGuide[]};setSnapGuides(snapped.guides);setSpacingGuides(spaced.guides);mutate(t=>moveElements(t,artboard.id,op.ids,spaced.delta));return;}if(op?.mode==='RESIZE'){const dx=p.xMm-op.startX,dy=p.yMm-op.startY,base=op.element.size;let w=base.widthMm,h=base.heightMm;if(op.anchor.includes('E'))w+=dx;if(op.anchor.includes('W'))w-=dx;if(op.anchor.includes('S'))h+=dy;if(op.anchor.includes('N'))h-=dy;const snapped=snapResizeSize(artboard,op.element,op.anchor,{widthMm:w,heightMm:h},snapOptions);setSnapGuides(snapped.guides);mutate(t=>resizeElement(t,artboard.id,op.element.id,snapped.size,{anchor:op.anchor,maintainAspectRatio:op.keepAspect}));return;}if(op?.mode==='ROTATE'){setSnapGuides([]);const c={xMm:op.element.position.xMm+op.element.size.widthMm/2,yMm:op.element.position.yMm+op.element.size.heightMm/2},angle=Math.atan2(p.yMm-c.yMm,p.xMm-c.xMm);mutate(t=>rotateElement(t,artboard.id,op.element.id,op.startRotation+(angle-op.startAngle)*180/Math.PI));return;}if(op?.mode==='PEN_DRAG'){const el=artboard.elements.find(el=>el.id===op.pathId);if(el&&el.type==='PATH'){const pEl=el as PathDesignElement;const localPt=worldToLocal({x:p.xMm,y:p.yMm},pEl);const startLocal=worldToLocal({x:op.startX,y:op.startY},pEl);const dx=localPt.x-startLocal.x;const dy=localPt.y-startLocal.y;if(Math.hypot(dx,dy)>1){mutate(t=>{return{...t,artboards:t.artboards.map(a=>a.id===artboard.id?{...a,elements:a.elements.map(e_=>{if(e_.id!==op.pathId)return e_;const pEl_=e_ as PathDesignElement;const newPts=pEl_.geometry.points.map(pt=>pt.id===op.pointId?{...pt,mode:'SYMMETRIC' as const,inHandle:{x:pt.x-dx,y:pt.y-dy},outHandle:{x:pt.x+dx,y:pt.y+dy}}:pt);const newSegs=pEl_.geometry.segments.map(seg=>seg.toPointId===op.pointId?{...seg,type:'CUBIC_BEZIER' as const}:seg);return{...pEl_,geometry:{...pEl_.geometry,points:newPts,segments:newSegs}};})}:a)};});}}return;}if(op?.mode==='DRAW_SHAPE_DRAG'){const movedDuringPress=op.movedDuringPress||(op.pointerIsDown&&Math.hypot(p.xMm-op.startX,p.yMm-op.startY)>0.6);const next:DrawDraft={...op,currentX:p.xMm,currentY:p.yMm,isShift:e.shiftKey,pointerIsDown:op.pointerIsDown,movedDuringPress,currentSnap:snap};interaction.current={mode:'DRAW_SHAPE_DRAG',...next};setDrawDraft(next);return;}if(marquee.current){const m=marquee.current;setMarqueeRect({xMm:Math.min(m.startX,p.xMm),yMm:Math.min(m.startY,p.yMm),widthMm:Math.abs(p.xMm-m.startX),heightMm:Math.abs(p.yMm-m.startY)});}};
  const upCanvas=()=>{if(interaction.current?.mode==='ERASER_LASSO'){const points=eraserPoints;const hitIds=artboard.elements.filter(element=>eraserHitsElement(points,element)).map(element=>element.id);if(hitIds.length){commitMutate(t=>deleteDesignElements(t,artboard.id,hitIds));endHistoryTransaction();setStatus(`Eraser removed ${hitIds.length} element${hitIds.length===1?'':'s'}`);}else{endHistoryTransaction();setStatus('Eraser — nothing intersected');}interaction.current=null;setEraserPoints([]);setSelection({artboardId:artboard.id,elementIds:[],primaryElementId:undefined});return;}if(guideDrag.current){const drag=guideDrag.current;if(drag.creating&&guidePreview)commitMutate(t=>addGuide(t,artboard.id,{id:drag.id,orientation:drag.orientation,positionMm:guidePreview.positionMm,locked:false}));else endHistoryTransaction();guideDrag.current=null;setGuidePreview(null);return;}if(marquee.current&&marqueeRect)setSelection(selectByMarquee(artboard,marqueeRect,marquee.current.add?'ADD':'REPLACE',selection));if(interaction.current?.mode==='DRAW_SHAPE_DRAG'){const op=interaction.current;if(op.pointerIsDown){/* CAD two-click invariant: pointer-up only arms the first point. Never commit from release, even if OSNAP moved the live preview to another nearby candidate. The second explicit pointer-down is the only commit trigger. */const next:DrawDraft={...op,pointerIsDown:false,movedDuringPress:false};interaction.current={mode:'DRAW_SHAPE_DRAG',...next};setDrawDraft(next);}}else if(interaction.current){endHistoryTransaction();interaction.current=null;}marquee.current=null;setMarqueeRect(null);setSnapGuides([]);setSpacingGuides([]);};
  const capture=(ev:React.PointerEvent)=>{ev.stopPropagation();(ev.currentTarget.closest('.card-artboard-canvas') as HTMLElement)?.setPointerCapture?.(ev.pointerId);};
  const ticks=rulerTicks(artboard,zoom),print=resolvePrintSettings(artboard.print),gridPx=gridSizeMm*MM_TO_CSS_PX;const canvasStyle:React.CSSProperties={width:`${artboard.widthMm*MM_TO_CSS_PX}px`,height:`${artboard.heightMm*MM_TO_CSS_PX}px`,transform:`scale(${zoom/100})`,backgroundColor:bg(artboard),backgroundImage:showGrid?`linear-gradient(to right, rgba(100,116,139,.16) 1px, transparent 1px),linear-gradient(to bottom, rgba(100,116,139,.16) 1px, transparent 1px)`:undefined,backgroundSize:showGrid?`${gridPx}px ${gridPx}px`:undefined, cursor: interactionMode === 'TRIMMER' ? TRIMMER_CURSOR : interactionMode==='ERASER' ? 'cell' : (interactionMode === 'PEN' || interactionMode === 'FLEXIBLE_LINE' || interactionMode === 'DRAW_SHAPE' || interactionMode === 'SCISSORS') ? 'crosshair' : undefined};
  const commandHint=interactionMode==='DRAW_SHAPE'?(drawShapeType==='LINE'?(drawDraft?'LINE — Specify next point':'LINE — Specify first point'):drawShapeType==='CIRCLE'?(drawDraft?'CIRCLE — Specify radius':'CIRCLE — Specify center'):(drawDraft?`${drawShapeType??'SHAPE'} — Specify opposite point`:`${drawShapeType??'SHAPE'} — Specify first point`)):interactionMode==='FLEXIBLE_LINE'?(selection.elementIds.length?'POLYLINE — Specify next point':'POLYLINE — Specify first point'):interactionMode==='PEN'?(selection.elementIds.length?'PEN — Specify next point':'PEN — Specify first point'):interactionMode==='TRIMMER'?'TRIM — Select segment or first point':interactionMode==='ERASER'?'ERASER — Draw around elements to remove':null;
 return <div ref={canvas} className={`card-artboard-canvas ${showRulers?'with-rulers':''}`} data-artboard-id={artboard.id} style={canvasStyle} onPointerDownCapture={eraserDownCapture} onPointerDown={downCanvas} onPointerMove={moveCanvas} onPointerUp={upCanvas} onPointerCancel={upCanvas}>
  {showRulers&&<><div className="card-ruler-corner"/><div className="card-ruler card-ruler-top" onPointerDown={ev=>{if(ev.button!==0)return;capture(ev);const p=point(ev);guideDrag.current={id:id('guide'),orientation:'VERTICAL',creating:true};setGuidePreview({orientation:'VERTICAL',positionMm:p.xMm});}}>{ticks.x.map(t=><i key={t.key} className={t.major?'major':''} style={{left:t.positionMm*MM_TO_CSS_PX}}><span>{t.label}</span></i>)}</div><div className="card-ruler card-ruler-left" onPointerDown={ev=>{if(ev.button!==0)return;capture(ev);const p=point(ev);guideDrag.current={id:id('guide'),orientation:'HORIZONTAL',creating:true};setGuidePreview({orientation:'HORIZONTAL',positionMm:p.yMm});}}>{ticks.y.map(t=><i key={t.key} className={t.major?'major':''} style={{top:t.positionMm*MM_TO_CSS_PX}}><span>{t.label}</span></i>)}</div></>}
  {print.showBleedInEditor&&<div className="card-print-bleed-boundary" style={{left:-print.bleed.leftMm*MM_TO_CSS_PX,top:-print.bleed.topMm*MM_TO_CSS_PX,right:-print.bleed.rightMm*MM_TO_CSS_PX,bottom:-print.bleed.bottomMm*MM_TO_CSS_PX}}/>}
  <div className="card-print-trim-boundary"/>
   {mirrorGuideAxis&&<div data-page-center-mirror-guide data-axis={mirrorGuideAxis} style={mirrorGuideAxis==='VERTICAL'?{position:'absolute',left:(artboard.widthMm/2)*MM_TO_CSS_PX,top:0,bottom:0,borderLeft:`${1.5/(zoom/100)}px dashed #8b5cf6`,pointerEvents:'none',zIndex:100004}:{position:'absolute',top:(artboard.heightMm/2)*MM_TO_CSS_PX,left:0,right:0,borderTop:`${1.5/(zoom/100)}px dashed #8b5cf6`,pointerEvents:'none',zIndex:100004}}/>}
  {print.showSafeAreaInEditor&&<div className="card-print-safe-boundary" style={{left:print.safeArea.leftMm*MM_TO_CSS_PX,top:print.safeArea.topMm*MM_TO_CSS_PX,right:print.safeArea.rightMm*MM_TO_CSS_PX,bottom:print.safeArea.bottomMm*MM_TO_CSS_PX}}/>}
  {print.showCropMarksInEditor&&<div className="card-print-crop-marks"><i className="tl"/><i className="tr"/><i className="bl"/><i className="br"/></div>}
  {commandHint&&<div data-cad-command-hint style={{position:'absolute',left:8/(zoom/100),bottom:8/(zoom/100),zIndex:100001,pointerEvents:'none',padding:`${4/(zoom/100)}px ${7/(zoom/100)}px`,fontSize:11/(zoom/100),borderRadius:4/(zoom/100),background:'rgba(17,24,39,.88)',color:'white',boxShadow:'0 1px 2px rgba(0,0,0,.15)'}}>{commandHint}</div>}
  {drawDraft && (() => {
    const op=drawDraft;
    const sx=op.startX,sy=op.startY,cx=op.currentX,cy=op.currentY;
    if(op.shapeType==='LINE'){
      const minX=Math.min(sx,cx),minY=Math.min(sy,cy),w=Math.max(Math.abs(cx-sx),0.1),h=Math.max(Math.abs(cy-sy),0.1);
      const x1=sx-minX,y1=sy-minY,x2=cx-minX,y2=cy-minY;
      return <div data-cad-live-preview style={{position:'absolute',left:minX*MM_TO_CSS_PX,top:minY*MM_TO_CSS_PX,width:w*MM_TO_CSS_PX,height:h*MM_TO_CSS_PX,pointerEvents:'none',zIndex:9999}}><svg style={{width:'100%',height:'100%',overflow:'visible'}} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none"><line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--accent-color)" strokeWidth={1.5/MM_TO_CSS_PX} vectorEffect="non-scaling-stroke"/></svg></div>;
    }
    const isCircle=op.shapeType==='CIRCLE',forceEqual=op.shapeType==='SQUARE';let x=Math.min(sx,cx),y=Math.min(sy,cy),w=Math.abs(cx-sx),h=Math.abs(cy-sy);
    if(isCircle){const r=Math.hypot(cx-sx,cy-sy);x=sx-r;y=sy-r;w=r*2;h=r*2;}else if(op.isShift||forceEqual){const size=Math.max(w,h);w=size;h=size;x=cx<sx?sx-size:sx;y=cy<sy?sy-size:sy;}
    if(w<.1||h<.1)return null;const pathD=geometryToSvgPath(shapeToPathGeometry(op.shapeType,{widthMm:w,heightMm:h}));
    return <div data-cad-live-preview style={{position:'absolute',left:x*MM_TO_CSS_PX,top:y*MM_TO_CSS_PX,width:w*MM_TO_CSS_PX,height:h*MM_TO_CSS_PX,pointerEvents:'none',zIndex:9999}}><svg style={{width:'100%',height:'100%',overflow:'visible'}} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none"><path d={pathD} fill="rgba(0,100,255,0.08)" stroke="var(--accent-color)" strokeWidth={1/MM_TO_CSS_PX} vectorEffect="non-scaling-stroke"/></svg></div>;
  })()}
  {artboard.guides.map(guide=><div key={guide.id} className={`card-user-guide ${guide.orientation==='VERTICAL'?'vertical':'horizontal'} ${guide.locked?'locked':''}`} style={guide.orientation==='VERTICAL'?{left:guide.positionMm*MM_TO_CSS_PX}:{top:guide.positionMm*MM_TO_CSS_PX}} title={`${guide.locked?'Locked ':''}${guide.orientation.toLowerCase()} guide · ${normalizeDisplayValue(mmToUnit(guide.positionMm,artboard.displayUnit))} ${artboard.displayUnit==='MM'?'mm':'in'} · double click to delete`} onDoubleClick={ev=>{ev.stopPropagation();if(!guide.locked)commitMutate(t=>deleteGuide(t,artboard.id,guide.id));}} onPointerDown={ev=>{if(ev.button!==0||guide.locked)return;capture(ev);beginHistoryTransaction();guideDrag.current={id:guide.id,orientation:guide.orientation,creating:false};}}/>)}
  {(boundaryHover||boundarySnap)&&(()=>{const feedback=boundarySnap??boundaryHover!;const target=artboard.elements.find(element=>element.id===feedback.elementId);if(!target||(target.type!=='PATH'&&target.type!=='SHAPE'))return null;const geo=target.type==='PATH'?target.geometry:shapeToPathGeometry(target.shape,target.size);const locked=boundarySnap?.elementId===target.id;return <div data-snap-target-boundary data-snap-state={locked?'LOCKED':'HOVER'} style={{position:'absolute',left:target.position.xMm*MM_TO_CSS_PX,top:target.position.yMm*MM_TO_CSS_PX,width:target.size.widthMm*MM_TO_CSS_PX,height:target.size.heightMm*MM_TO_CSS_PX,transform:`rotate(${target.rotationDeg}deg)`,transformOrigin:'center',pointerEvents:'none',zIndex:99998}}><svg viewBox={`0 0 ${target.size.widthMm} ${target.size.heightMm}`} preserveAspectRatio="none" style={{width:'100%',height:'100%',overflow:'visible'}}><path d={geometryToSvgPath(geo)} fill="none" stroke={locked?'#22c55e':'var(--accent-color)'} strokeWidth={(locked?2.4:1.4)/MM_TO_CSS_PX/(zoom/100)} vectorEffect="non-scaling-stroke" opacity={locked?1:.65}/></svg></div>;})()}
  {spacingGuides.map((guide,index)=>guide.axis==='X'?<div key={`spacing-x-${index}`} data-spacing-guide style={{position:'absolute',left:guide.fromMm*MM_TO_CSS_PX,top:guide.crossMm*MM_TO_CSS_PX,width:Math.max(0,(guide.toMm-guide.fromMm)*MM_TO_CSS_PX),height:0,borderTop:`${1/(zoom/100)}px dashed #db2777`,pointerEvents:'none',zIndex:100002}}><span style={{position:'absolute',left:'50%',top:-18/(zoom/100),transform:'translateX(-50%)',fontSize:10/(zoom/100),padding:`${1/(zoom/100)}px ${4/(zoom/100)}px`,background:'#fff',color:'#be185d',border:`${1/(zoom/100)}px solid #f9a8d4`,borderRadius:3/(zoom/100),whiteSpace:'nowrap'}}>{normalizeDisplayValue(guide.gapMm)} mm</span><i style={{position:'absolute',left:0,top:-4/(zoom/100),height:8/(zoom/100),borderLeft:`${1/(zoom/100)}px solid #db2777`}}/><i style={{position:'absolute',right:0,top:-4/(zoom/100),height:8/(zoom/100),borderRight:`${1/(zoom/100)}px solid #db2777`}}/></div>:<div key={`spacing-y-${index}`} data-spacing-guide style={{position:'absolute',left:guide.crossMm*MM_TO_CSS_PX,top:guide.fromMm*MM_TO_CSS_PX,height:Math.max(0,(guide.toMm-guide.fromMm)*MM_TO_CSS_PX),width:0,borderLeft:`${1/(zoom/100)}px dashed #db2777`,pointerEvents:'none',zIndex:100002}}><span style={{position:'absolute',left:6/(zoom/100),top:'50%',transform:'translateY(-50%)',fontSize:10/(zoom/100),padding:`${1/(zoom/100)}px ${4/(zoom/100)}px`,background:'#fff',color:'#be185d',border:`${1/(zoom/100)}px solid #f9a8d4`,borderRadius:3/(zoom/100),whiteSpace:'nowrap'}}>{normalizeDisplayValue(guide.gapMm)} mm</span><i style={{position:'absolute',top:0,left:-4/(zoom/100),width:8/(zoom/100),borderTop:`${1/(zoom/100)}px solid #db2777`}}/><i style={{position:'absolute',bottom:0,left:-4/(zoom/100),width:8/(zoom/100),borderBottom:`${1/(zoom/100)}px solid #db2777`}}/></div>)}
  {eraserPoints.length>0&&<svg data-eraser-lasso viewBox={`0 0 ${artboard.widthMm} ${artboard.heightMm}`} preserveAspectRatio="none" style={{position:'absolute',inset:0,width:'100%',height:'100%',overflow:'visible',pointerEvents:'none',zIndex:100003}}><polyline points={eraserPoints.map(p=>`${p.xMm},${p.yMm}`).join(' ')} fill="rgba(239,68,68,.08)" stroke="#ef4444" strokeWidth={1.5/MM_TO_CSS_PX/(zoom/100)} strokeDasharray={`${4/MM_TO_CSS_PX/(zoom/100)} ${3/MM_TO_CSS_PX/(zoom/100)}`}/>{eraserPoints.length>2&&<line x1={eraserPoints[eraserPoints.length-1]!.xMm} y1={eraserPoints[eraserPoints.length-1]!.yMm} x2={eraserPoints[0]!.xMm} y2={eraserPoints[0]!.yMm} stroke="#ef4444" strokeWidth={1/MM_TO_CSS_PX/(zoom/100)} strokeDasharray={`${2/MM_TO_CSS_PX/(zoom/100)} ${3/MM_TO_CSS_PX/(zoom/100)}`}/>}</svg>}
  {boundarySnap&&(()=>{const scale=zoom/100,size=10/scale,left=boundarySnap.point.x*MM_TO_CSS_PX-size/2,top=boundarySnap.point.y*MM_TO_CSS_PX-size/2,label=boundarySnap.kind.replace('_',' ');const common:React.CSSProperties={position:'absolute',left,top,width:size,height:size,boxSizing:'border-box',pointerEvents:'none',zIndex:100000};if(boundarySnap.kind==='INTERSECTION')return <div data-boundary-snap-marker data-snap-kind={boundarySnap.kind} title={label} style={{...common,color:'#22c55e',fontSize:12/scale,lineHeight:`${size}px`,fontWeight:800,textAlign:'center'}}>×</div>;if(boundarySnap.kind==='MIDPOINT')return <div data-boundary-snap-marker data-snap-kind={boundarySnap.kind} title={label} style={{...common,width:0,height:0,left:left+size/2,top:top+1/scale,borderLeft:`${5/scale}px solid transparent`,borderRight:`${5/scale}px solid transparent`,borderBottom:`${9/scale}px solid #22c55e`}}/>;return <div data-boundary-snap-marker data-snap-kind={boundarySnap.kind} title={label} style={{...common,borderRadius:boundarySnap.kind==='NODE'?'2px':'50%',border:`${2/scale}px solid #22c55e`,background:'white'}}/>;})()}
  {[...artboard.elements].sort((a,b)=>a.zIndex-b.zIndex||a.id.localeCompare(b.id)).filter(e=>e.visible && (!e.runtimeHidden || showHiddenElements)).map(e=>{
    const isSelected=selection.elementIds.includes(e.id);
    const trimmerTarget = interactionMode === 'TRIMMER' ? trimmerTargets.get(e.id) : undefined;
    const isPathEditing = trimmerTarget !== undefined || ((interactionMode==='EDIT_PATH' || interactionMode==='SCISSORS') && isSelected && e.type === 'PATH');
    const showSelectionBox = isSelected && interactionMode !== 'PEN' && interactionMode !== 'FLEXIBLE_LINE' && interactionMode !== 'SCISSORS' && interactionMode !== 'TRIMMER' && interactionMode !== 'ERASER' && !isPathEditing;
    const showHandles = isSelected && !e.locked && interactionMode !== 'PEN' && interactionMode !== 'FLEXIBLE_LINE' && interactionMode !== 'SCISSORS' && interactionMode !== 'TRIMMER' && interactionMode !== 'ERASER' && !isPathEditing;
    return <div key={e.id} data-element-id={e.id} className={`card-design-element-shell has-visual type-${e.type.toLowerCase()} ${showSelectionBox?'selected':''} ${e.locked?'locked':''} ${e.runtimeHidden?'ghosted':''} ${isPathEditing?'path-editing':''}`} style={{left:e.position.xMm*MM_TO_CSS_PX,top:e.position.yMm*MM_TO_CSS_PX,width:e.size.widthMm*MM_TO_CSS_PX,height:e.size.heightMm*MM_TO_CSS_PX,transform:`rotate(${e.rotationDeg}deg)`,opacity:e.runtimeHidden?e.opacity*0.4:e.opacity,zIndex:e.zIndex,outline:e.runtimeHidden?'1px dashed var(--accent-color)':undefined,cursor:interactionMode==='TRIMMER'?TRIMMER_CURSOR:undefined, pointerEvents: (interactionMode === 'PEN' || interactionMode === 'FLEXIBLE_LINE' || interactionMode === 'DRAW_SHAPE' || interactionMode==='ERASER') ? 'none' : undefined}} onDoubleClick={ev=>{if(e.type==='PATH'&&!e.locked){ev.stopPropagation();setInteractionMode('EDIT_PATH');setPathSelectedNodeIds([]);}}} onPointerDown={ev=>{if(ev.button!==0)return;if(interactionMode==='PEN' || interactionMode === 'FLEXIBLE_LINE' || interactionMode==='DRAW_SHAPE' || interactionMode==='TRIMMER')return;capture(ev);const p=point(ev),groupIds=e.metadata?.faceGeneration==='AUTO_SECTION'&&!ev.altKey?[e.id]:expandElementIdsToGroups(artboard,[e.id]),toggle=ev.ctrlKey||ev.metaKey||ev.shiftKey;let next:DesignSelectionState;if(toggle){const remove=groupIds.every(gid=>selection.elementIds.includes(gid));next=selection;for(const gid of groupIds)if(remove===next.elementIds.includes(gid))next=toggleSelection(next,gid);if(!remove)next={...next,primaryElementId:e.id};}else next=isSelected?selection:{artboardId:artboard.id,elementIds:groupIds,primaryElementId:e.id};setSelection(next);if(interactionMode==='EDIT_PATH' && (!isSelected || e.type !== 'PATH' || toggle)){setInteractionMode('SELECT');setPathSelectedNodeIds([]);} if(!toggle&&!e.locked&&next.elementIds.includes(e.id)){ if (!(interactionMode==='EDIT_PATH' && e.type === 'PATH' && isSelected)) { beginHistoryTransaction();interaction.current={mode:'MOVE',lastX:p.xMm,lastY:p.yMm,ids:next.elementIds.flatMap(elementId=>{const selected=artboard.elements.find(item=>item.id===elementId);return selected?.metadata?.faceGeneration==='AUTO_SECTION'?[elementId]:expandElementIdsToGroups(artboard,[elementId]);})}; }}}}>
    <ElementVisual element={e} assets={assets} mutate={commitMutate} artboardId={artboard.id}/>
    {showHandles&&<><i className="card-rotation-stem"/><i className="card-rotation-handle" onPointerDown={ev=>{capture(ev);const p=point(ev),c={xMm:e.position.xMm+e.size.widthMm/2,yMm:e.position.yMm+e.size.heightMm/2};beginHistoryTransaction();interaction.current={mode:'ROTATE',element:e,startAngle:Math.atan2(p.yMm-c.yMm,p.xMm-c.xMm),startRotation:e.rotationDeg};}}/>{(['nw','n','ne','e','se','s','sw','w'] as const).map(h=><i key={h} className={`card-transform-handle ${h}`} onPointerDown={ev=>{capture(ev);const p=point(ev);beginHistoryTransaction();interaction.current={mode:'RESIZE',element:e,anchor:h.toUpperCase() as Op extends {mode:'RESIZE';anchor:infer A}?A:never,startX:p.xMm,startY:p.yMm,keepAspect:ev.shiftKey||(e.type==='IMAGE'&&e.maintainAspectRatio===true)};}}/>)}</>}
    {isPathEditing && <PathNodeEditor element={(trimmerTarget ?? e) as PathDesignElement} zoom={zoom} interactionMode={interactionMode} pathSelectedNodeIds={pathSelectedNodeIds} setPathSelectedNodeIds={setPathSelectedNodeIds} pathSelectedSegmentIds={pathSelectedSegmentIds} setPathSelectedSegmentIds={setPathSelectedSegmentIds} mutate={commitMutate} artboardId={artboard.id} beginHistoryTransaction={beginHistoryTransaction} endHistoryTransaction={endHistoryTransaction} onTrimGeometry={geometry=>commitTrimFragments(e.id,geometry)} allElements={artboard.elements} />}
   </div>})}
  {snapGuides.map((guide,index)=>guide.axis==='X'?<div key={`snap-x-${index}`} className={`card-smart-guide vertical source-${guide.source.toLowerCase()}`} style={{left:guide.positionMm*MM_TO_CSS_PX}}/>:<div key={`snap-y-${index}`} className={`card-smart-guide horizontal source-${guide.source.toLowerCase()}`} style={{top:guide.positionMm*MM_TO_CSS_PX}}/>)}
  {marqueeRect&&<div className="card-selection-marquee" style={{left:marqueeRect.xMm*MM_TO_CSS_PX,top:marqueeRect.yMm*MM_TO_CSS_PX,width:marqueeRect.widthMm*MM_TO_CSS_PX,height:marqueeRect.heightMm*MM_TO_CSS_PX}}/>}
  {(interactionMode === 'PEN' || interactionMode === 'FLEXIBLE_LINE') && penHover && selection.elementIds.length === 1 && (()=>{
     const selectedId = selection.elementIds[0];
     const el = artboard.elements.find(e => e.id === selectedId);
     if (el && el.type === 'PATH') {
        const pEl = el as PathDesignElement;
        const endpoints = getPathEndpoints(pEl.geometry);
        const lastNodeId = endpoints.length > 0 ? endpoints[endpoints.length - 1] : pEl.geometry.points[pEl.geometry.points.length - 1]?.id;
        const lastNode = pEl.geometry.points.find(pt => pt.id === lastNodeId);
        if (lastNode) {
           const localHover = worldToLocal({ x: penHover.xMm, y: penHover.yMm }, pEl);
           return <div style={{position:'absolute',left:pEl.position.xMm*MM_TO_CSS_PX,top:pEl.position.yMm*MM_TO_CSS_PX,width:pEl.size.widthMm*MM_TO_CSS_PX,height:pEl.size.heightMm*MM_TO_CSS_PX,pointerEvents:'none',zIndex:9999}}>
             <svg style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',overflow:'visible'}} viewBox={`0 0 ${pEl.size.widthMm} ${pEl.size.heightMm}`} preserveAspectRatio="none">
                <line x1={lastNode.x} y1={lastNode.y} x2={localHover.x} y2={localHover.y} stroke="var(--accent-color)" strokeWidth={1/MM_TO_CSS_PX} strokeDasharray={`${4/MM_TO_CSS_PX} ${4/MM_TO_CSS_PX}`} />
                <circle cx={localHover.x} cy={localHover.y} r={3/MM_TO_CSS_PX} fill="none" stroke="var(--accent-color)" strokeWidth={1/MM_TO_CSS_PX} />
             </svg>
           </div>;
        }
     }
     return null;
   })()}
 </div>;
}

function LayerPanel({artboard,selection,interactionMode,setSelection,mutate,duplicateSelected,groupSelected,ungroupSelected}:{artboard:Artboard;selection:DesignSelectionState;interactionMode:'SELECT'|'EDIT_PATH'|'SCISSORS'|'PEN'|'TRIMMER'|'ERASER'|'DRAW_SHAPE'|'FLEXIBLE_LINE';setSelection:(s:DesignSelectionState)=>void;mutate:(f:(t:DesignTemplate)=>DesignTemplate)=>void;duplicateSelected:()=>void;groupSelected:()=>void;ungroupSelected:()=>void}){
  const layers=orderedLayers(artboard);const selectedSet=new Set(selection.elementIds);const selectedGroups=[...new Set(selection.elementIds.map(id=>groupForElement(artboard,id)?.id).filter(Boolean) as string[])];
  const getLayerIcon = (type: string) => {
    switch (type) {
      case 'TEXT': return <Type size={14} />;
      case 'IMAGE': return <ImageIcon size={14} />;
      case 'SVG': return <PenLine size={14} />;
      case 'SHAPE': return <Box size={14} />;
      default: return <Shapes size={14} />;
    }
  };
  return <div className="card-layers-panel">
    <div className="card-panel-heading"><div><strong>Layers</strong><small>{layers.length} element{layers.length===1?'':'s'}</small></div></div>
    <div className="card-layer-toolbar">
      <div className="card-layer-actions">
        <button onClick={duplicateSelected} disabled={!selection.elementIds.length}>Duplicate</button>
        <button onClick={groupSelected} disabled={selection.elementIds.length<2||selectedGroups.length>0}>Group</button>
        <button onClick={ungroupSelected} disabled={!selectedGroups.length}>Ungroup</button>
      </div>
      <div className="card-layer-order-actions" aria-label="Layer order actions">
        <button title="Bring to front" aria-label="Bring to front" disabled={!selection.elementIds.length||interactionMode!=='SELECT'} onClick={()=>mutate(t=>moveLayers(t,artboard.id,selection.elementIds,'FRONT'))}><ArrowUp size={12}/><ArrowUp size={12}/><span>Front</span></button>
        <button title="Move up" aria-label="Move up" disabled={!selection.elementIds.length||interactionMode!=='SELECT'} onClick={()=>mutate(t=>moveLayers(t,artboard.id,selection.elementIds,'FORWARD'))}><ArrowUp size={12}/><span>Up</span></button>
        <button title="Move down" aria-label="Move down" disabled={!selection.elementIds.length||interactionMode!=='SELECT'} onClick={()=>mutate(t=>moveLayers(t,artboard.id,selection.elementIds,'BACKWARD'))}><ArrowDown size={12}/><span>Down</span></button>
        <button title="Send to back" aria-label="Send to back" disabled={!selection.elementIds.length||interactionMode!=='SELECT'} onClick={()=>mutate(t=>moveLayers(t,artboard.id,selection.elementIds,'BACK'))}><ArrowDown size={12}/><ArrowDown size={12}/><span>Back</span></button>
      </div>
    </div>
    <div className="card-layer-list">
      {layers.length?layers.map(layer=>{
        const group=groupForElement(artboard,layer.id);
        return <div key={layer.id} className={`card-layer-row ${selectedSet.has(layer.id)?'active':''}`}>
          <button className="card-layer-main" title={layer.metadata?.faceGeneration==='AUTO_SECTION'?'Click: select section · Alt+Click: select component':undefined} onClick={event=>setSelection({artboardId:artboard.id,elementIds:layer.metadata?.faceGeneration==='AUTO_SECTION'&&!event.altKey?[layer.id]:expandElementIdsToGroups(artboard,[layer.id]),primaryElementId:layer.id})}>
            <div className="card-layer-icon">{getLayerIcon(layer.type)}</div>
            <div className="card-layer-content">
              <input aria-label={`Rename ${layer.name}`} value={layer.name || ''} placeholder={layer.type} onClick={e=>e.stopPropagation()} onChange={e=>mutate(t=>renameElement(t,artboard.id,layer.id,e.target.value))}/>
              {group&&<span className="card-layer-group">{group.name}</span>}
            </div>
          </button>
          <div className="card-layer-mini">
            <button title={layer.visible?(layer.runtimeHidden?'Hidden by condition':'Hide'):'Show'} style={{color: layer.runtimeHidden?'var(--accent-color)':undefined}} onClick={()=>mutate(t=>group?setGroupVisibility(t,artboard.id,group.id,!layer.visible):setElementVisibility(t,artboard.id,layer.id,!layer.visible))}>{layer.visible?(layer.runtimeHidden?<EyeOff size={12}/>:<Eye size={12}/>):<EyeOff size={12}/>}</button>
            <button title={layer.locked?'Unlock':'Lock'} onClick={()=>mutate(t=>group?setGroupLocked(t,artboard.id,group.id,!layer.locked):setElementLocked(t,artboard.id,layer.id,!layer.locked))}>{layer.locked?<Lock size={12}/>:<Unlock size={12}/>}</button>
            <button title="Bring to front" disabled={interactionMode!=='SELECT'} onClick={()=>mutate(t=>moveLayers(t,artboard.id,selectedSet.has(layer.id)?selection.elementIds:[layer.id],'FRONT'))}><ArrowUp size={12}/><ArrowUp size={12}/></button>
            <button title="Bring forward" disabled={interactionMode!=='SELECT'} onClick={()=>mutate(t=>moveLayers(t,artboard.id,selectedSet.has(layer.id)?selection.elementIds:[layer.id],'FORWARD'))}><ArrowUp size={12}/></button>
            <button title="Send backward" disabled={interactionMode!=='SELECT'} onClick={()=>mutate(t=>moveLayers(t,artboard.id,selectedSet.has(layer.id)?selection.elementIds:[layer.id],'BACKWARD'))}><ArrowDown size={12}/></button>
            <button title="Send to back" disabled={interactionMode!=='SELECT'} onClick={()=>mutate(t=>moveLayers(t,artboard.id,selectedSet.has(layer.id)?selection.elementIds:[layer.id],'BACK'))}><ArrowDown size={12}/><ArrowDown size={12}/></button>
          </div>
        </div>
      }):<div className="card-layer-empty">Add an element to create the first layer.</div>}
    </div>
  </div>;
}

function ElementVisual({element,assets,mutate,artboardId}:{element:DesignElement;assets:DesignTemplate['sharedAssets'];mutate:(f:(t:DesignTemplate)=>DesignTemplate)=>void;artboardId:string}){
 if(element.type==='TEXT')return <div className="card-text-visual" style={{fontFamily:element.style.fontFamily,fontSize:`${element.style.fontSizePt}pt`,fontWeight:element.style.fontWeight,fontStyle:element.style.italic?'italic':'normal',textDecoration:element.style.underline?'underline':'none',color:element.style.color,textAlign:element.style.alignment.toLowerCase() as 'left'|'center'|'right',lineHeight:element.style.lineHeight,letterSpacing:`${element.style.letterSpacingPt}pt`,textShadow:textShadowCss(element.shadow)}} onDoubleClick={ev=>{ev.stopPropagation();const value=window.prompt('Edit text',element.text);if(value!==null)mutate(t=>updateDesignElement(t,artboardId,element.id,e=>e.type==='TEXT'?{...e,text:value}:e));}}>{element.text}</div>;
 if(element.type==='SHAPE')return <ShapeVisual element={element} assets={assets}/>;
 if(element.type==='PATH')return <PathVisual element={element} assets={assets}/>;
 if(element.type==='IMAGE'){
    const src=resolveRasterImageElementSource(element,assets);
    const asset=assets.find(a=>a.id===element.assetId);
    const kind=src ? 'RASTER_IMAGE' : assetRenderKind(asset);
    return <div className="card-image-visual" style={{borderRadius:`${element.cornerRadiusMm??0}mm`,border:strokeCss(element.stroke),boxShadow:boxShadowCss(element.shadow)}}>{kind==='RASTER_IMAGE'&&src?<img src={src} alt={element.name} draggable={false} style={{objectFit:element.fit==='FIT'?'contain':element.fit==='FILL'?'cover':'fill',transform:`scale(${element.flipX?-1:1},${element.flipY?-1:1})`}}/>:<div className="card-missing-asset">{kind==='MISSING'?'Missing Asset':'Unsupported Asset'}</div>}</div>;
  }
  if(element.type==='SVG'){
    const dynamicSource = (element as any).source;
    const asset=assets.find(a=>a.id===element.assetId);
    const kind=dynamicSource ? 'VECTOR_SVG' : assetRenderKind(asset);
    const src=dynamicSource || asset?.source;
    const tinted=kind==='VECTOR_SVG'&&src&&(dynamicSource || asset?.metadata?.recolorable===true)&&element.tintColor;
    return <div className="card-svg-visual" style={{border:strokeCss(element.stroke),filter:dropShadowCss(element.shadow),transform:`scale(${element.flipX?-1:1},${element.flipY?-1:1})`}}>{kind==='VECTOR_SVG'&&src?(tinted?<div className="card-svg-tint" style={{backgroundColor:element.tintColor,maskImage:`url("${src}")`,WebkitMaskImage:`url("${src}")`}}/>:<img src={src} alt={element.name} draggable={false}/>):<div className="card-missing-asset">{kind==='MISSING'?'Missing Asset':'Unsupported Asset'}</div>}</div>;
  }
  if (element.type === 'QR') {
    return <QrVisual element={element as QrDesignElement} />;
  }
 return <div className="card-unsupported-element">{element.type}</div>;
}

function QrVisual({element}:{element:QrDesignElement}){
  const value = element.value || "QR";
  const size = Math.min(element.size.widthMm, element.size.heightMm) * MM_TO_CSS_PX;
  return <div className="card-qr-visual" style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',filter:'shadow' in element ? dropShadowCss((element as any).shadow) : undefined}}>
    <QRCode value={value} size={size} fgColor={element.foreground} bgColor={element.background} level={element.errorCorrection} style={{height:"auto",maxWidth:"100%",width:"100%"}} />
  </div>;
}

function PathNodeEditor({element, zoom, interactionMode, pathSelectedNodeIds, setPathSelectedNodeIds, pathSelectedSegmentIds, setPathSelectedSegmentIds, mutate, artboardId, beginHistoryTransaction, endHistoryTransaction, onTrimGeometry, allElements}: {element: PathDesignElement; zoom: number; interactionMode: string; pathSelectedNodeIds: string[]; setPathSelectedNodeIds: (m: string[]) => void; pathSelectedSegmentIds: string[]; setPathSelectedSegmentIds: (m: string[]) => void; mutate: (f: (t: DesignTemplate) => DesignTemplate) => void; artboardId: string; beginHistoryTransaction: () => void; endHistoryTransaction: () => void; onTrimGeometry: (geometry: PathDesignElement['geometry']) => void; allElements?: DesignElement[]}) {
  const [trimmerHover, setTrimmerHover] = useState<string | null>(null);
  // Smart trimmer: interval hover state
  const [hoveredInterval, setHoveredInterval] = useState<{segmentId:string;tStart:number;tEnd:number} | null>(null);
  const [trimSnap,setTrimSnap]=useState<{segmentId:string;t:number;x:number;y:number;kind:'NODE'|'INTERSECTION'|'NEAREST';nodeId?:string}|null>(null);
  const [selectedInterval, setSelectedInterval] = useState<{segmentId:string;tStart:number;tEnd:number} | null>(null);
  const [trimGeometry, setTrimGeometry] = useState<PathDesignElement['geometry'] | null>(null);
  const [trimStartNodeId, setTrimStartNodeId] = useState<string | null>(null);
  const [trimEndNodeId, setTrimEndNodeId] = useState<string | null>(null);
  const [trimRoutes, setTrimRoutes] = useState<string[][]>([]);
  const [trimRouteIndex, setTrimRouteIndex] = useState(0);
  const activeGeometry = trimGeometry ?? element.geometry;
  const selectedTrimRoute = trimRoutes[trimRouteIndex] ?? [];
  const trimNodeHitSize = 20 / (zoom / 100);
  // --- Central bulge handle state (used by bulge handle pointer drag) ---
  const [_bulgeSegId, setBulgeSegId] = useState<string | null>(null);

  useEffect(() => {
    setTrimGeometry(null);
    setTrimStartNodeId(null);
    setTrimEndNodeId(null);
    setTrimRoutes([]);
    setTrimRouteIndex(0);
    setTrimSnap(null);
  }, [element.id, element.geometry]);

  const clearManualTrim = useCallback(() => {
    setTrimGeometry(null);
    setTrimStartNodeId(null);
    setTrimEndNodeId(null);
    setTrimRoutes([]);
    setTrimRouteIndex(0);
  }, []);

  const selectTrimNode = useCallback((nodeId: string, geometry = activeGeometry) => {
    setSelectedInterval(null);
    setHoveredInterval(null);
    if (!trimStartNodeId || trimEndNodeId) {
      setTrimStartNodeId(nodeId);
      setTrimEndNodeId(null);
      setTrimRoutes([]);
      setTrimRouteIndex(0);
      return;
    }
    if (nodeId === trimStartNodeId) return;
    const routes = getPathRangeBetweenNodes(geometry, trimStartNodeId, nodeId);
    if (routes.length === 0) return;
    setTrimEndNodeId(nodeId);
    setTrimRoutes(routes);
    setTrimRouteIndex(0);
  }, [activeGeometry, trimEndNodeId, trimStartNodeId]);

  const selectTrimPointOnSegment = useCallback((segmentId: string, t: number) => {
    const segment = activeGeometry.segments.find(candidate => candidate.id === segmentId);
    if (!segment) return;
    if (t <= 0.02) { selectTrimNode(segment.fromPointId); return; }
    if (t >= 0.98) { selectTrimNode(segment.toPointId); return; }
    const existingPointIds = new Set(activeGeometry.points.map(point => point.id));
    const nextGeometry = splitPathSegment(activeGeometry, segmentId, t);
    const splitPoint = nextGeometry.points.find(point => !existingPointIds.has(point.id));
    if (!splitPoint) return;
    setTrimGeometry(nextGeometry);
    selectTrimNode(splitPoint.id, nextGeometry);
  }, [activeGeometry, selectTrimNode]);

  const deleteManualTrimRange = useCallback(() => {
    if (selectedTrimRoute.length === 0) return;
    beginHistoryTransaction();
    onTrimGeometry(deletePathSegmentRange(activeGeometry, selectedTrimRoute));
    endHistoryTransaction();
    clearManualTrim();
  }, [activeGeometry, beginHistoryTransaction, clearManualTrim, endHistoryTransaction, onTrimGeometry, selectedTrimRoute]);

  // Handle Delete/Backspace for smart trimmer
  useEffect(() => {
    if (interactionMode !== 'TRIMMER') return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Delete' || ev.key === 'Backspace') {
        if (selectedTrimRoute.length > 0) {
          ev.preventDefault();
          ev.stopImmediatePropagation();
          deleteManualTrimRange();
        } else if (selectedInterval) {
          ev.preventDefault();
          ev.stopImmediatePropagation();
          const { segmentId, tStart, tEnd } = selectedInterval;
          beginHistoryTransaction();
          onTrimGeometry(trimSegmentInterval(element.geometry, segmentId, tStart, tEnd));
          endHistoryTransaction();
          setSelectedInterval(null);
          setHoveredInterval(null);
        }
      }
      if (ev.key === 'Escape') {
        if (trimStartNodeId || trimEndNodeId || trimGeometry) {
          ev.preventDefault();
          ev.stopImmediatePropagation();
          clearManualTrim();
        } else if (selectedInterval) {
          ev.preventDefault();
          ev.stopImmediatePropagation();
          setSelectedInterval(null);
          setHoveredInterval(null);
        }
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [interactionMode, selectedInterval, selectedTrimRoute, trimStartNodeId, trimEndNodeId, trimGeometry, element, beginHistoryTransaction, clearManualTrim, deleteManualTrimRange, endHistoryTransaction, onTrimGeometry]);

  // Compute intersection-based smart trim intervals for a given segment
  const computeIntervals = useCallback((segmentId: string): TrimInterval[] => {
    if (!allElements) return [];
    return getSmartTrimIntervals(element, segmentId, allElements);
  }, [element, allElements]);

  // Render a partial segment path from tStart to tEnd using De Casteljau
  const renderPartialSegment = (seg: typeof activeGeometry.segments[0], tStart: number, tEnd: number): string => {
    const p1 = activeGeometry.points.find(p => p.id === seg.fromPointId);
    const p2 = activeGeometry.points.find(p => p.id === seg.toPointId);
    if (!p1 || !p2) return '';
    if (seg.type === 'LINE') {
      const ax = p1.x + (p2.x - p1.x) * tStart, ay = p1.y + (p2.y - p1.y) * tStart;
      const bx = p1.x + (p2.x - p1.x) * tEnd, by = p1.y + (p2.y - p1.y) * tEnd;
      return `M ${ax} ${ay} L ${bx} ${by}`;
    }
    // Cubic: use De Casteljau
    const h1 = p1.outHandle || p1;
    const h2 = p2.inHandle || p2;
    const bezier = (t: number) => {
      const mt = 1 - t;
      const q0x = mt*p1.x+t*h1.x, q0y = mt*p1.y+t*h1.y;
      const q1x = mt*h1.x+t*h2.x, q1y = mt*h1.y+t*h2.y;
      const q2x = mt*h2.x+t*p2.x, q2y = mt*h2.y+t*p2.y;
      const r0x = mt*q0x+t*q1x, r0y = mt*q0y+t*q1y;
      const r1x = mt*q1x+t*q2x, r1y = mt*q1y+t*q2y;
      return { x: mt*r0x+t*r1x, y: mt*r0y+t*r1y };
    };
    const start = bezier(tStart);
    const end = bezier(tEnd);
    // Approximate with a quadratic by sampling midpoint
    const mid = bezier((tStart + tEnd) / 2);
    return `M ${start.x} ${start.y} Q ${2*mid.x - start.x/2 - end.x/2} ${2*mid.y - start.y/2 - end.y/2} ${end.x} ${end.y}`;
  };

  const pointOnSegment=(seg:typeof activeGeometry.segments[0],t:number)=>{const p1=activeGeometry.points.find(point=>point.id===seg.fromPointId),p2=activeGeometry.points.find(point=>point.id===seg.toPointId);if(!p1||!p2)return null;if(seg.type==='LINE')return{x:p1.x+(p2.x-p1.x)*t,y:p1.y+(p2.y-p1.y)*t};const h1=p1.outHandle||p1,h2=p2.inHandle||p2,mt=1-t;return{x:mt**3*p1.x+3*mt**2*t*h1.x+3*mt*t**2*h2.x+t**3*p2.x,y:mt**3*p1.y+3*mt**2*t*h1.y+3*mt*t**2*h2.y+t**3*p2.y};};
  const acquireTrimSnap=(segmentId:string,clickPoint:{x:number;y:number})=>{const segment=activeGeometry.segments.find(candidate=>candidate.id===segmentId);if(!segment)return null;const tolerance=8/(MM_TO_CSS_PX*(zoom/100)),from=activeGeometry.points.find(point=>point.id===segment.fromPointId),to=activeGeometry.points.find(point=>point.id===segment.toPointId);for(const node of [from,to])if(node&&Math.hypot(clickPoint.x-node.x,clickPoint.y-node.y)<=tolerance)return{segmentId,t:node.id===segment.fromPointId?0:1,x:node.x,y:node.y,kind:'NODE' as const,nodeId:node.id};const intervals=computeIntervals(segmentId),cuts=[...new Set(intervals.flatMap(interval=>[interval.tStart,interval.tEnd]).filter(t=>t>0.001&&t<0.999))];let intersection:null|{segmentId:string;t:number;x:number;y:number;kind:'INTERSECTION'}=null,best=Infinity;for(const t of cuts){const point=pointOnSegment(segment,t);if(!point)continue;const distance=Math.hypot(clickPoint.x-point.x,clickPoint.y-point.y);if(distance<=tolerance&&distance<best){best=distance;intersection={segmentId,t,x:point.x,y:point.y,kind:'INTERSECTION'};}}if(intersection)return intersection;const hit=hitTestSegment(activeGeometry,segmentId,clickPoint),nearest=pointOnSegment(segment,hit.t);return nearest?{segmentId,t:hit.t,x:nearest.x,y:nearest.y,kind:'NEAREST' as const}:null;};

  return <div className="card-path-node-editor" style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',cursor:interactionMode==='TRIMMER'?TRIMMER_CURSOR:undefined}}>
    {interactionMode==='TRIMMER'&&selectedInterval&&<div style={{position:'absolute',left:0,top:-38,zIndex:20,whiteSpace:'nowrap',background:'var(--bg-primary)',border:'1px solid var(--border-color)',borderRadius:4,padding:'4px 6px',fontSize:11}}>TRIM — Press Delete to remove selected segment</div>}
    {interactionMode === 'TRIMMER' && trimStartNodeId && <div onPointerDown={event=>event.stopPropagation()} style={{position:'absolute',left:0,top:-38,zIndex:20,display:'flex',gap:4,alignItems:'center',whiteSpace:'nowrap',background:'var(--bg-primary)',border:'1px solid var(--border-color)',borderRadius:4,padding:'4px 6px'}}>
      <span style={{fontSize:11}}>{trimEndNodeId ? 'TRIM — Press Delete to remove selected segment' : 'TRIM — Select second point'}</span>
      {trimEndNodeId && <button type="button" onClick={deleteManualTrimRange}>Delete Segment</button>}
      {trimRoutes.length > 1 && <button type="button" onClick={()=>setTrimRouteIndex(index=>(index+1)%trimRoutes.length)}>Switch Side</button>}
      <button type="button" onClick={clearManualTrim}>Clear Trim Selection</button>
    </div>}
    <svg style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',pointerEvents:'none',overflow:'visible'}} viewBox={`0 0 ${element.size.widthMm} ${element.size.heightMm}`} preserveAspectRatio="none">
      {/* Intersection markers (editor-only, not persisted) */}
      {interactionMode === 'EDIT_PATH' && allElements && activeGeometry.segments.map(seg => {
        const intervals = computeIntervals(seg.id as string);
        return intervals.filter(iv => iv.tStart > 0.001 && iv.tStart < 0.999).map((iv, i) => {
          const p1 = activeGeometry.points.find(p => p.id === seg.fromPointId);
          const p2 = activeGeometry.points.find(p => p.id === seg.toPointId);
          if (!p1 || !p2) return null;
          const t = iv.tStart;
          let mx = 0, my = 0;
          if (seg.type === 'LINE') { mx = p1.x + (p2.x - p1.x)*t; my = p1.y + (p2.y - p1.y)*t; }
          else {
            const h1 = p1.outHandle || p1; const h2 = p2.inHandle || p2;
            const mt = 1 - t;
            const q0x = mt*p1.x+t*h1.x, q0y = mt*p1.y+t*h1.y;
            const q1x = mt*h1.x+t*h2.x, q1y = mt*h1.y+t*h2.y;
            const q2x = mt*h2.x+t*p2.x, q2y = mt*h2.y+t*p2.y;
            const r0x = mt*q0x+t*q1x, r0y = mt*q0y+t*q1y;
            const r1x = mt*q1x+t*q2x, r1y = mt*q1y+t*q2y;
            mx = mt*r0x+t*r1x; my = mt*r0y+t*r1y;
          }
          return <circle key={`ix-${seg.id}-${i}`} cx={mx} cy={my} r={2/MM_TO_CSS_PX} fill="var(--accent-color)" opacity={0.7} pointerEvents="none" />;
        });
      })}
      {interactionMode==='TRIMMER'&&trimSnap&&<circle data-trim-snap-marker cx={trimSnap.x} cy={trimSnap.y} r={3/MM_TO_CSS_PX/(zoom/100)} fill="white" stroke={trimSnap.kind==='INTERSECTION'?'var(--danger-color, #ef4444)':'var(--accent-color)'} strokeWidth={1.5/MM_TO_CSS_PX/(zoom/100)} pointerEvents="none"/>}

      {activeGeometry.segments.map(seg => {
        const p1 = activeGeometry.points.find(p=>p.id===seg.fromPointId);
        const p2 = activeGeometry.points.find(p=>p.id===seg.toPointId);
        if(!p1||!p2) return null;
        let d = '';
        if(seg.type === 'LINE') d = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`;
        else {
          const h1 = p1.outHandle || p1;
          const h2 = p2.inHandle || p2;
          d = `M ${p1.x} ${p1.y} C ${h1.x} ${h1.y}, ${h2.x} ${h2.y}, ${p2.x} ${p2.y}`;
        }
        
        const isSelected = pathSelectedSegmentIds.includes(seg.id as string);
        const isHoveredForTrim = trimmerHover === seg.id;

        // Smart trim hover/selected interval visualization
        const isHoveredInterval = hoveredInterval?.segmentId === seg.id;
        const isSelectedInterval = selectedInterval?.segmentId === seg.id;
        const isSelectedManualRange = selectedTrimRoute.includes(seg.id);
        
        return <g key={seg.id || `seg-${seg.fromPointId}-${seg.toPointId}`}>
          {isSelected && <path d={d} fill="none" stroke="var(--accent-color)" strokeWidth={2/MM_TO_CSS_PX} pointerEvents="none" />}
          {/* Smart trimmer interval hover highlight */}
          {isHoveredInterval && hoveredInterval && <path d={renderPartialSegment(seg, hoveredInterval.tStart, hoveredInterval.tEnd)} fill="none" stroke="rgba(255,100,0,0.7)" strokeWidth={3/MM_TO_CSS_PX} pointerEvents="none" strokeDasharray={`${3/MM_TO_CSS_PX} ${2/MM_TO_CSS_PX}`} />}
          {/* Smart trimmer selected interval highlight */}
          {isSelectedInterval && selectedInterval && <path d={renderPartialSegment(seg, selectedInterval.tStart, selectedInterval.tEnd)} fill="none" stroke="var(--danger-color, #ef4444)" strokeWidth={3/MM_TO_CSS_PX} pointerEvents="none" />}
          {isSelectedManualRange && <path d={d} fill="none" stroke="var(--danger-color, #ef4444)" strokeWidth={3/MM_TO_CSS_PX} pointerEvents="none" />}
          {/* Legacy full-segment hover (fallback / manual A/B) */}
          {interactionMode === 'TRIMMER' && isHoveredForTrim && !isHoveredInterval && <path d={d} fill="none" stroke="rgba(59,130,246,.55)" strokeWidth={2/MM_TO_CSS_PX} pointerEvents="none" />}
          <path d={d} fill="none" stroke="transparent" strokeWidth={(interactionMode==='TRIMMER'?10/(zoom/100):5)/MM_TO_CSS_PX} pointerEvents="stroke" style={{cursor: interactionMode === 'TRIMMER' ? TRIMMER_CURSOR : interactionMode === 'SCISSORS' ? 'crosshair' : 'pointer'}} 
            onPointerEnter={(ev) => {
              if (interactionMode === 'TRIMMER') {
                setTrimmerHover(seg.id as string);
                // Compute smart trim intervals
                const clickPt = (() => {
                  const shell = ev.currentTarget.closest('.card-path-node-editor') as HTMLElement;
                  if (!shell) return null;
                  const r = shell.getBoundingClientRect();
                  return { x: (ev.clientX - r.left)/r.width*element.size.widthMm, y: (ev.clientY - r.top)/r.height*element.size.heightMm };
                })();
                if (clickPt) {
                  setTrimSnap(acquireTrimSnap(seg.id as string,clickPt));
                  const intervals = computeIntervals(seg.id as string);
                  if (intervals.length > 1) {
                    // Find which interval the pointer is in
                    const { t } = hitTestSegment(activeGeometry, seg.id as string, clickPt);
                    const iv = findTrimInterval(intervals, t);
                    if (iv) setHoveredInterval(iv);
                  } else {
                    setHoveredInterval(null);
                  }
                }
              }
            }}
            onPointerMove={(ev) => {
              if (interactionMode === 'TRIMMER' && !selectedInterval) {
                const shell = ev.currentTarget.closest('.card-path-node-editor') as HTMLElement;
                if (!shell) return;
                const r = shell.getBoundingClientRect();
                const clickPt = { x: (ev.clientX - r.left)/r.width*element.size.widthMm, y: (ev.clientY - r.top)/r.height*element.size.heightMm };
                setTrimSnap(acquireTrimSnap(seg.id as string,clickPt));
                const intervals = computeIntervals(seg.id as string);
                if (intervals.length > 1) {
                  const { t } = hitTestSegment(activeGeometry, seg.id as string, clickPt);
                  const iv = findTrimInterval(intervals, t);
                  if (iv) setHoveredInterval(iv);
                } else {
                  setHoveredInterval(null);
                }
              }
            }}
            onPointerLeave={() => { if (interactionMode === 'TRIMMER') { setTrimmerHover(null); setHoveredInterval(null); setTrimSnap(null); } }}
            onPointerDown={(ev) => {
              if (ev.button !== 0) return;
              ev.stopPropagation();
              if (interactionMode === 'SCISSORS') {
                const shell = ev.currentTarget.closest('.card-path-node-editor') as HTMLElement;
                const r = shell.getBoundingClientRect();
                const clickPt = { x: (ev.clientX - r.left)/r.width*element.size.widthMm, y: (ev.clientY - r.top)/r.height*element.size.heightMm };
                const { t } = hitTestSegment(activeGeometry, seg.id as string, clickPt);
                beginHistoryTransaction();
                mutate(t_ => {
                  const art = t_.artboards.find(a=>a.id===artboardId);if(!art)return t_;
                  const el = art.elements.find(e=>e.id===element.id) as PathDesignElement;if(!el)return t_;
                  return {...t_, artboards: t_.artboards.map(a=>a.id===artboardId?{...a,elements:a.elements.map(e=>e.id===el.id?{...e,geometry:splitPathSegment(el.geometry, seg.id as string, t)}:e)}:a)};
                });
              } else if (interactionMode === 'TRIMMER') {
                const shell = ev.currentTarget.closest('.card-path-node-editor') as HTMLElement;
                const r = shell.getBoundingClientRect();
                const clickPt = { x: (ev.clientX - r.left)/r.width*element.size.widthMm, y: (ev.clientY - r.top)/r.height*element.size.heightMm };
                const { t } = hitTestSegment(activeGeometry, seg.id as string, clickPt);
                const snappedT=trimSnap?.segmentId===seg.id?trimSnap.t:t;
                setTrimSnap(null);
                if ((trimStartNodeId && !trimEndNodeId)||ev.shiftKey||trimSnap?.kind==='NODE'||trimSnap?.kind==='INTERSECTION') {
                  selectTrimPointOnSegment(seg.id, snappedT);
                } else if (hoveredInterval && hoveredInterval.segmentId === seg.id) {
                  setSelectedInterval(hoveredInterval);
                } else {
                  selectTrimPointOnSegment(seg.id, snappedT);
                }
              } else {
                setPathSelectedSegmentIds([seg.id as string]);
                setPathSelectedNodeIds([]);
              }
            }}
            onDoubleClick={(ev)=>{
              if (interactionMode === 'SCISSORS') return;
              ev.stopPropagation();
              beginHistoryTransaction();
              mutate(t_ => {
                const art = t_.artboards.find(a=>a.id===artboardId);if(!art)return t_;
                const el = art.elements.find(e=>e.id===element.id) as PathDesignElement;if(!el)return t_;
                return {...t_, artboards: t_.artboards.map(a=>a.id===artboardId?{...a,elements:a.elements.map(e=>e.id===el.id?{...e,geometry:splitPathSegment(el.geometry, seg.id as string, 0.5)}:e)}:a)};
              });
            }} />
        </g>;
      })}
      {/* Central Bulge Handle for selected two-node CUBIC_BEZIER or LINE segments */}
      {interactionMode === 'EDIT_PATH' && pathSelectedSegmentIds.length === 1 && (() => {
        const seg = element.geometry.segments.find(s => s.id === pathSelectedSegmentIds[0]);
        if (!seg) return null;
        const p1 = element.geometry.points.find(p => p.id === seg.fromPointId);
        const p2 = element.geometry.points.find(p => p.id === seg.toPointId);
        if (!p1 || !p2) return null;
        let cx = 0, cy = 0;
        if (seg.type === 'LINE') {
          cx = (p1.x + p2.x) / 2;
          cy = (p1.y + p2.y) / 2;
        } else {
          const h1 = p1.outHandle || p1; const h2 = p2.inHandle || p2;
          // Evaluate at t=0.5
          const mt = 0.5;
          const q0x = mt*p1.x+mt*h1.x, q0y = mt*p1.y+mt*h1.y;
          const q1x = mt*h1.x+mt*h2.x, q1y = mt*h1.y+mt*h2.y;
          const q2x = mt*h2.x+mt*p2.x, q2y = mt*h2.y+mt*p2.y;
          const r0x = mt*q0x+mt*q1x, r0y = mt*q0y+mt*q1y;
          const r1x = mt*q1x+mt*q2x, r1y = mt*q1y+mt*q2y;
          cx = mt*r0x+mt*r1x; cy = mt*r0y+mt*r1y;
        }
        const r = 4 / MM_TO_CSS_PX;
        return (
          <circle key={`bulge-${seg.id}`} cx={cx} cy={cy} r={r}
            fill="var(--accent-color)" opacity={0.85} cursor="ns-resize"
            pointerEvents="all"
            onPointerDown={(ev) => {
              if (ev.button !== 0) return;
              ev.stopPropagation();
              ev.currentTarget.setPointerCapture(ev.pointerId);
              setBulgeSegId(seg.id as string);
              const shell = ev.currentTarget.closest('.card-path-node-editor') as HTMLElement;
              const r = shell.getBoundingClientRect();
              const move = (eMove: PointerEvent) => {
                const lx = (eMove.clientX - r.left)/r.width*element.size.widthMm;
                const ly = (eMove.clientY - r.top)/r.height*element.size.heightMm;
                mutate(t => {
                  const art = t.artboards.find(a=>a.id===artboardId); if(!art)return t;
                  const el = art.elements.find(e=>e.id===element.id) as PathDesignElement; if(!el)return t;
                  const segRef = el.geometry.segments.find(s=>s.id===seg.id); if(!segRef)return t;
                  const pp1 = el.geometry.points.find(p=>p.id===segRef.fromPointId);
                  const pp2 = el.geometry.points.find(p=>p.id===segRef.toPointId);
                  if(!pp1||!pp2)return t;
                  // Convert to cubic
                  const newType: 'CUBIC_BEZIER' = 'CUBIC_BEZIER';
                  // Compute bulge: offset orthogonal to line from drag point
                  const dx = pp2.x - pp1.x, dy = pp2.y - pp1.y;
                  const midX = (pp1.x + pp2.x)/2, midY = (pp1.y + pp2.y)/2;
                  const bulgeX = lx - midX, bulgeY = ly - midY;
                  const kappa = 1.333;
                  const newOut = { x: pp1.x + (dx * 0.33) + bulgeX * kappa, y: pp1.y + (dy * 0.33) + bulgeY * kappa };
                  const newIn = { x: pp2.x - (dx * 0.33) + bulgeX * kappa, y: pp2.y - (dy * 0.33) + bulgeY * kappa };
                  const newPts = el.geometry.points.map(pt => {
                    if (pt.id === pp1.id) return { ...pt, outHandle: newOut };
                    if (pt.id === pp2.id) return { ...pt, inHandle: newIn };
                    return pt;
                  });
                  const newSegs = el.geometry.segments.map(s => s.id===seg.id ? {...s, type: newType} : s);
                  return {...t, artboards: t.artboards.map(a=>a.id===artboardId?{...a,elements:a.elements.map(e=>e.id===el.id?{...e,geometry:{...el.geometry,points:newPts,segments:newSegs}}:e)}:a)};
                });
              };
              const up = () => { setBulgeSegId(null); endHistoryTransaction(); window.removeEventListener('pointermove',move); window.removeEventListener('pointerup',up); };
              window.addEventListener('pointermove',move); window.addEventListener('pointerup',up);
              beginHistoryTransaction();
            }}
          />
        );
      })()}
      {activeGeometry.points.map(p => {
        if (!pathSelectedNodeIds.includes(p.id)) return null;
        return <g key={`handles-${p.id}`}>
          {p.inHandle && <line x1={p.x} y1={p.y} x2={p.inHandle.x} y2={p.inHandle.y} stroke="var(--accent-color)" strokeWidth={1/MM_TO_CSS_PX} strokeDasharray={`${4/MM_TO_CSS_PX} ${4/MM_TO_CSS_PX}`}/>}
          {p.outHandle && <line x1={p.x} y1={p.y} x2={p.outHandle.x} y2={p.outHandle.y} stroke="var(--accent-color)" strokeWidth={1/MM_TO_CSS_PX} strokeDasharray={`${4/MM_TO_CSS_PX} ${4/MM_TO_CSS_PX}`}/>}
        </g>;
      })}
    </svg>
    {activeGeometry.points.map(p => {
      if(interactionMode==='TRIMMER'&&p.id!==trimStartNodeId&&p.id!==trimEndNodeId&&p.id!==trimSnap?.nodeId)return null;
      const isSelected = pathSelectedNodeIds.includes(p.id);
      return <div key={`node-${p.id}`}>
        {isSelected && p.inHandle && <i className="card-path-handle in-handle" style={{position:'absolute',left:p.inHandle.x*MM_TO_CSS_PX,top:p.inHandle.y*MM_TO_CSS_PX,width:6,height:6,marginLeft:-3,marginTop:-3,backgroundColor:'white',border:'1px solid var(--accent-color)',borderRadius:'50%',cursor:'pointer'}} onPointerDown={ev=>{
          ev.stopPropagation();
          ev.currentTarget.setPointerCapture(ev.pointerId);
          beginHistoryTransaction();
          const shell = ev.currentTarget.parentElement!.parentElement!.parentElement!;
          const r = shell.getBoundingClientRect();
          const move = (eMove: PointerEvent) => {
            const lx = (eMove.clientX - r.left) / r.width * element.size.widthMm;
            const ly = (eMove.clientY - r.top) / r.height * element.size.heightMm;
            mutate(t => {
              const art = t.artboards.find(a=>a.id===artboardId);if(!art)return t;
              const el = art.elements.find(e=>e.id===element.id) as PathDesignElement;if(!el)return t;
              const nextGeo = {...el.geometry, points: el.geometry.points.map(pt=>{
                if(pt.id===p.id){
                  const mode = pt.mode || 'CORNER';
                  if(mode === 'CORNER' || !pt.outHandle) return {...pt, inHandle:{x:lx,y:ly}};
                  const dx = pt.x - lx; const dy = pt.y - ly;
                  if(mode === 'SYMMETRIC') return {...pt, inHandle:{x:lx,y:ly}, outHandle:{x:pt.x+dx,y:pt.y+dy}};
                  const distOut = Math.hypot(pt.outHandle.x - pt.x, pt.outHandle.y - pt.y);
                  const distIn = Math.hypot(dx, dy) || 1;
                  return {...pt, inHandle:{x:lx,y:ly}, outHandle:{x:pt.x+(dx/distIn)*distOut, y:pt.y+(dy/distIn)*distOut}};
                }
                return pt;
              })};
              return {...t, artboards: t.artboards.map(a=>a.id===artboardId?{...a,elements:a.elements.map(e=>e.id===el.id?{...e,geometry:nextGeo}:e)}:a)};
            });
          };
          const up = () => {window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);};
          window.addEventListener('pointermove',move);window.addEventListener('pointerup',up);
        }}/>}
        {isSelected && p.outHandle && <i className="card-path-handle out-handle" style={{position:'absolute',left:p.outHandle.x*MM_TO_CSS_PX,top:p.outHandle.y*MM_TO_CSS_PX,width:6,height:6,marginLeft:-3,marginTop:-3,backgroundColor:'white',border:'1px solid var(--accent-color)',borderRadius:'50%',cursor:'pointer'}} onPointerDown={ev=>{
          ev.stopPropagation();
          ev.currentTarget.setPointerCapture(ev.pointerId);
          beginHistoryTransaction();
          const shell = ev.currentTarget.parentElement!.parentElement!.parentElement!;
          const r = shell.getBoundingClientRect();
          const move = (eMove: PointerEvent) => {
            const lx = (eMove.clientX - r.left) / r.width * element.size.widthMm;
            const ly = (eMove.clientY - r.top) / r.height * element.size.heightMm;
            mutate(t => {
              const art = t.artboards.find(a=>a.id===artboardId);if(!art)return t;
              const el = art.elements.find(e=>e.id===element.id) as PathDesignElement;if(!el)return t;
              const nextGeo = {...el.geometry, points: el.geometry.points.map(pt=>{
                if(pt.id===p.id){
                  const mode = pt.mode || 'CORNER';
                  if(mode === 'CORNER' || !pt.inHandle) return {...pt, outHandle:{x:lx,y:ly}};
                  const dx = pt.x - lx; const dy = pt.y - ly;
                  if(mode === 'SYMMETRIC') return {...pt, outHandle:{x:lx,y:ly}, inHandle:{x:pt.x+dx,y:pt.y+dy}};
                  const distIn = Math.hypot(pt.inHandle.x - pt.x, pt.inHandle.y - pt.y);
                  const distOut = Math.hypot(dx, dy) || 1;
                  return {...pt, outHandle:{x:lx,y:ly}, inHandle:{x:pt.x+(dx/distOut)*distIn, y:pt.y+(dy/distOut)*distIn}};
                }
                return pt;
              })};
              return {...t, artboards: t.artboards.map(a=>a.id===artboardId?{...a,elements:a.elements.map(e=>e.id===el.id?{...e,geometry:nextGeo}:e)}:a)};
            });
          };
          const up = () => {window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);};
          window.addEventListener('pointermove',move);window.addEventListener('pointerup',up);
        }}/>}
        <i className={`card-path-node ${isSelected?'selected':''}`} style={{position:'absolute',left:p.x*MM_TO_CSS_PX,top:p.y*MM_TO_CSS_PX,width:interactionMode==='TRIMMER'?trimNodeHitSize:8,height:interactionMode==='TRIMMER'?trimNodeHitSize:8,marginLeft:interactionMode==='TRIMMER'?-trimNodeHitSize/2:-4,marginTop:interactionMode==='TRIMMER'?-trimNodeHitSize/2:-4,background:interactionMode==='TRIMMER'?`radial-gradient(circle, ${p.id===trimStartNodeId?'#22c55e':p.id===trimEndNodeId?'#3b82f6':'white'} 0 3px, var(--accent-color) 3px 4px, transparent 4px)`:undefined,backgroundColor:interactionMode==='TRIMMER'?undefined:isSelected?'var(--accent-color)':'white',border:interactionMode==='TRIMMER'?'none':'1px solid var(--accent-color)',borderRadius:'50%',cursor:interactionMode==='TRIMMER'?TRIMMER_CURSOR:'pointer',zIndex:interactionMode==='TRIMMER'?10:undefined}} onPointerDown={ev=>{
          ev.stopPropagation();
          if (interactionMode === 'TRIMMER') {
            ev.preventDefault();
            selectTrimNode(p.id);
            return;
          }
          ev.currentTarget.setPointerCapture(ev.pointerId);
          const toggle = ev.shiftKey;
          let nextIds = pathSelectedNodeIds;
          if (toggle) {
            nextIds = nextIds.includes(p.id) ? nextIds.filter(id=>id!==p.id) : [...nextIds, p.id];
          } else if (!nextIds.includes(p.id)) {
            nextIds = [p.id];
          }
          setPathSelectedNodeIds(nextIds);
          beginHistoryTransaction();
          const shell = ev.currentTarget.parentElement!.parentElement!;
          const r = shell.getBoundingClientRect();
          const move = (eMove: PointerEvent) => {
            const lx = (eMove.clientX - r.left) / r.width * element.size.widthMm;
            const ly = (eMove.clientY - r.top) / r.height * element.size.heightMm;
            mutate(t => {
              const art = t.artboards.find(a=>a.id===artboardId);
              if (!art) return t;
              const el = art.elements.find(e=>e.id===element.id) as PathDesignElement;
              if (!el) return t;
              const updatedPoints = el.geometry.points.map(pt => {
                if (nextIds.includes(pt.id)) {
                  if (pt.id === p.id) {
                    const dx = lx - pt.x; const dy = ly - pt.y;
                    const inH = pt.inHandle ? {x:pt.inHandle.x+dx, y:pt.inHandle.y+dy} : undefined;
                    const outH = pt.outHandle ? {x:pt.outHandle.x+dx, y:pt.outHandle.y+dy} : undefined;
                    return { ...pt, x: lx, y: ly, inHandle: inH, outHandle: outH };
                  }
                }
                return pt;
              });
              return {
                ...t, artboards: t.artboards.map(a=>a.id===artboardId ? {
                  ...a, elements: a.elements.map(e=>e.id===element.id ? {...e, geometry: {...el.geometry, points: updatedPoints}} : e)
                } : a)
              };
            });
          };
          const up = () => {
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerup', up);
          };
          window.addEventListener('pointermove', move);
          window.addEventListener('pointerup', up);
        }} />
      </div>;
    })}
  </div>;
}


function PathVisual({element,assets}:{element:PathDesignElement;assets:DesignTemplate['sharedAssets']}) {
  const gradientId = `gradient-${element.id.replace(/[^a-zA-Z0-9_-]/g,'')}`;
  const imageId = `image-fill-${element.id.replace(/[^a-zA-Z0-9_-]/g,'')}`;
  const fill = element.fill.type === 'SOLID' ? element.fill.color : element.fill.type === 'LINEAR_GRADIENT' ? `url(#${gradientId})` : element.fill.type === 'IMAGE' ? `url(#${imageId})` : 'transparent';
  const fillOpacity = element.fill.type === 'SOLID' || element.fill.type === 'IMAGE' ? (element.fill.opacity ?? 1) : 1;
  const stroke = element.stroke.style === 'NONE' ? 'none' : colorWithOpacity(element.stroke.color, element.stroke.opacity ?? 1);
  const sw = Math.max(0.4, element.stroke.widthMm * MM_TO_CSS_PX);
  const dash = element.stroke.style === 'DASHED' ? '6 4' : element.stroke.style === 'DOTTED' ? '2 3' : undefined;
  
  const d = geometryToSvgPath(element.geometry);
  const w = element.size.widthMm;
  const h = element.size.heightMm;
  
  const label=element.label;
  return (
    <div className="card-path-visual" style={{position:'relative',width:'100%',height:'100%'}}>
      <svg style={{filter:dropShadowCss(element.shadow), width: '100%', height: '100%', overflow: 'visible', position: 'absolute', top: 0, left: 0}} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        {element.fill.type === 'LINEAR_GRADIENT' && (
          <defs>
            <linearGradient id={gradientId} gradientTransform={`rotate(${element.fill.gradient.angleDeg} .5 .5)`}>
              {element.fill.gradient.stops.map((stop, index) => (
                <stop key={index} offset={`${stop.offset}%`} stopColor={stop.color} stopOpacity={stop.opacity ?? 1} />
              ))}
            </linearGradient>
          </defs>
        )}
        {element.fill.type === 'IMAGE' && <ImageFillPattern id={imageId} fill={element.fill} assets={assets} width={w} height={h}/>} 
        <path d={d} fill={fill} fillOpacity={fillOpacity} stroke={stroke} strokeWidth={sw / MM_TO_CSS_PX} strokeDasharray={dash ? dash.split(' ').map(n=>Number(n)/MM_TO_CSS_PX).join(' ') : undefined} />
      </svg>
      {label?.enabled&&label.text&&<div data-path-label style={{position:'absolute',inset:`${Math.max(0,label.paddingMm)*MM_TO_CSS_PX}px`,display:'flex',alignItems:label.verticalAlignment==='TOP'?'flex-start':label.verticalAlignment==='BOTTOM'?'flex-end':'center',justifyContent:label.alignment==='LEFT'?'flex-start':label.alignment==='RIGHT'?'flex-end':'center',overflow:'hidden',pointerEvents:'none',fontFamily:label.fontFamily,fontSize:`${label.fontSizePt}pt`,fontWeight:label.fontWeight,fontStyle:label.italic?'italic':'normal',textDecoration:label.underline?'underline':'none',color:label.color,lineHeight:label.lineHeight,textAlign:label.alignment.toLowerCase() as React.CSSProperties['textAlign'],whiteSpace:'pre-wrap',wordBreak:'break-word'}}>{label.text}</div>}
    </div>
  );
}

function ImageFillPattern({id,fill,assets,width,height}:{id:string;fill:Extract<ShapeDesignElement['fill'],{type:'IMAGE'}>;assets:DesignTemplate['sharedAssets'];width:number;height:number}){
 const source=resolveRasterImageFillSource(fill,assets);
 if(!source)return null;
 const preserveAspectRatio=fill.fit==='FIT'?'xMidYMid meet':fill.fit==='FILL'?'xMidYMid slice':'none';
 return <defs><pattern id={id} patternUnits="userSpaceOnUse" width={width} height={height}><image href={source} x="0" y="0" width={width} height={height} preserveAspectRatio={preserveAspectRatio}/></pattern></defs>;
}

function ShapeVisual({element,assets}:{element:ShapeDesignElement;assets:DesignTemplate['sharedAssets']}){
 const gradientId=`gradient-${element.id.replace(/[^a-zA-Z0-9_-]/g,'')}`,imageId=`image-fill-${element.id.replace(/[^a-zA-Z0-9_-]/g,'')}`,fill=element.fill.type==='SOLID'?element.fill.color:element.fill.type==='LINEAR_GRADIENT'?`url(#${gradientId})`:element.fill.type==='IMAGE'?`url(#${imageId})`:'transparent',fillOpacity=element.fill.type==='SOLID'||element.fill.type==='IMAGE'?(element.fill.opacity??1):1,stroke=element.stroke.style==='NONE'?'none':colorWithOpacity(element.stroke.color,element.stroke.opacity??1),sw=Math.max(.4,element.stroke.widthMm*MM_TO_CSS_PX),dash=element.stroke.style==='DASHED'?'6 4':element.stroke.style==='DOTTED'?'2 3':undefined;
 const common={fill,fillOpacity,stroke,strokeWidth:sw,strokeDasharray:dash,vectorEffect:'non-scaling-stroke' as const};
 const label=element.label;
 return <div className="card-shape-visual" style={{position:'relative',width:'100%',height:'100%',filter:dropShadowCss(element.shadow)}}>
   <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',transform:`scale(${element.flipX?-1:1},${element.flipY?-1:1})`}} viewBox="0 0 100 100" preserveAspectRatio="none">
     {element.fill.type==='LINEAR_GRADIENT'&&<defs><linearGradient id={gradientId} gradientTransform={`rotate(${element.fill.gradient.angleDeg} .5 .5)`}>{element.fill.gradient.stops.map((stop,index)=><stop key={index} offset={`${stop.offset}%`} stopColor={stop.color} stopOpacity={stop.opacity??1}/>)}</linearGradient></defs>}
     {element.fill.type==='IMAGE'&&<ImageFillPattern id={imageId} fill={element.fill} assets={assets} width={100} height={100}/>} 
     {shapeNode(element,common)}
   </svg>
   {label?.enabled&&label.text&&<div data-shape-label style={{position:'absolute',inset:`${Math.max(0,label.paddingMm)*MM_TO_CSS_PX}px`,display:'flex',alignItems:label.verticalAlignment==='TOP'?'flex-start':label.verticalAlignment==='BOTTOM'?'flex-end':'center',justifyContent:label.alignment==='LEFT'?'flex-start':label.alignment==='RIGHT'?'flex-end':'center',overflow:'hidden',pointerEvents:'none',fontFamily:label.fontFamily,fontSize:`${label.fontSizePt}pt`,fontWeight:label.fontWeight,fontStyle:label.italic?'italic':'normal',textDecoration:label.underline?'underline':'none',color:label.color,lineHeight:label.lineHeight,textAlign:label.alignment.toLowerCase() as React.CSSProperties['textAlign'],whiteSpace:'pre-wrap',wordBreak:'break-word'}}>{label.text}</div>}
 </div>;
}
function shapeNode(element:ShapeDesignElement,common:Record<string,unknown>){
 if(element.shape==='ROUNDED_RECTANGLE')return <rect x="1" y="1" width="98" height="98" rx={Math.min(48,(element.cornerRadiusMm??3)*4)} ry={Math.min(48,(element.cornerRadiusMm??3)*4)} {...common}/>;
 if(element.shape==='LINE')return <line x1="2" y1="50" x2="98" y2="50" {...common} fill="none"/>;
 const geometry=shapeToPathGeometry(element.shape,{widthMm:100,heightMm:100});
 return <path d={geometryToSvgPath(geometry)} {...common} fill={geometry.closed?(common.fill as string):'none'}/>;
}

const InspectorContext = createContext<InspectorSectionKey>('GENERAL');

function Section({ sectionKey, title, children }: { sectionKey: InspectorSectionKey; title: string; children: React.ReactNode }) {
  const active = useContext(InspectorContext);
  if (active !== sectionKey) return null;
  return <InspectorSection sectionKey={sectionKey} title={title}>{children}</InspectorSection>;
}


function ElementProperties({element,asset,assets,artboard,mutate,availableFields,datasourceStatus}:{element:DesignElement;asset?:AssetReference;assets:DesignTemplate['sharedAssets'];artboard:Artboard;mutate:(f:(t:DesignTemplate)=>DesignTemplate)=>void;availableFields:import('@document-tool/contracts').FieldDefinition[];datasourceStatus:string}){
 const artboardId=artboard.id;
 const num=(label:string,value:number,onChange:(v:number)=>void,step='0.1')=><label>{label}<input type="number" step={step} value={normalizeDisplayValue(value)} disabled={element.locked} onChange={e=>{const v=Number(e.target.value);if(Number.isFinite(v))onChange(v);}}/></label>;
 const update=(fn:(e:DesignElement)=>DesignElement)=>mutate(t=>updateDesignElement(t,artboardId,element.id,fn));
 return <div className="card-property-sections">
  <Section sectionKey="GENERAL" title="General">
    <div className="card-property-note"><strong>{element.name}</strong><span>{element.type}{element.locked?' · Locked':''}</span></div>
    {element.type==='PATH'&&element.metadata?.faceGeneration==='AUTO_SECTION'&&<FaceFillQuickControl element={element} update={update}/>}
  </Section>
  {element.type==='TEXT'&&<AdvancedTextProperties element={element} update={update} availableFields={availableFields} datasourceStatus={datasourceStatus}/>} {element.type==='SHAPE'&&<AdvancedShapeProperties element={element} update={update} assets={assets} mutate={mutate} artboardId={artboardId} availableFields={availableFields} datasourceStatus={datasourceStatus}/>} {element.type==='PATH'&&<AdvancedPathProperties element={element} update={update} assets={assets} mutate={mutate} artboardId={artboardId} availableFields={availableFields} datasourceStatus={datasourceStatus}/>} {element.type==='IMAGE'&&<AdvancedImageProperties element={element} update={update} availableFields={availableFields} datasourceStatus={datasourceStatus}/>} {element.type==='SVG'&&<SvgProperties element={element} asset={asset} update={update} availableFields={availableFields} datasourceStatus={datasourceStatus}/>} {element.type==='QR'&&<AdvancedQrProperties element={element as QrDesignElement} update={update} availableFields={availableFields} />} {element.type==='BARCODE'&&<AdvancedBarcodeProperties element={element as BarcodeDesignElement} update={update} availableFields={availableFields} />} 
  <ConditionalVisibilityProperties element={element} update={update} availableFields={availableFields} datasourceStatus={datasourceStatus}/>
  {(element.type==='IMAGE'||element.type==='SVG')&&<Section sectionKey="ADVANCED" title="Print Quality"><ElementPrintQuality element={element} asset={asset} print={artboard.print}/></Section>} 
  <Section sectionKey="TRANSFORM" title="Transform"><div className="card-property-grid">{num('X (mm)',element.position.xMm,v=>mutate(t=>setElementPosition(t,artboardId,element.id,{xMm:v,yMm:element.position.yMm})))}{num('Y (mm)',element.position.yMm,v=>mutate(t=>setElementPosition(t,artboardId,element.id,{xMm:element.position.xMm,yMm:v})))}{num('Width (mm)',element.size.widthMm,v=>mutate(t=>resizeElement(t,artboardId,element.id,{widthMm:v,heightMm:element.size.heightMm})))}{num('Height (mm)',element.size.heightMm,v=>mutate(t=>resizeElement(t,artboardId,element.id,{widthMm:element.size.widthMm,heightMm:v})))}</div>{num('Rotation (°)',element.rotationDeg,v=>mutate(t=>rotateElement(t,artboardId,element.id,v)))}<div className="card-layer-action-grid" data-page-center-mirror-inspector><button disabled={element.locked} title="Mirror Across Page Horizontal Center" onClick={()=>mutate(t=>mirrorElementsAcrossArtboard(t,artboardId,[element.id],'HORIZONTAL'))}>↕ Mirror H</button><button disabled={element.locked} title="Mirror Across Page Vertical Center" onClick={()=>mutate(t=>mirrorElementsAcrossArtboard(t,artboardId,[element.id],'VERTICAL'))}>↔ Mirror V</button></div></Section>
  <Section sectionKey="TRANSFORM" title="Align to Artboard"><div className="card-layer-action-grid card-align-grid"><button disabled={element.locked} onClick={()=>mutate(t=>alignElements(t,artboardId,[element.id],'LEFT','ARTBOARD'))}>Left</button><button disabled={element.locked} onClick={()=>mutate(t=>alignElements(t,artboardId,[element.id],'HCENTER','ARTBOARD'))}>H Center</button><button disabled={element.locked} onClick={()=>mutate(t=>alignElements(t,artboardId,[element.id],'RIGHT','ARTBOARD'))}>Right</button><button disabled={element.locked} onClick={()=>mutate(t=>alignElements(t,artboardId,[element.id],'TOP','ARTBOARD'))}>Top</button><button disabled={element.locked} onClick={()=>mutate(t=>alignElements(t,artboardId,[element.id],'VCENTER','ARTBOARD'))}>V Center</button><button disabled={element.locked} onClick={()=>mutate(t=>alignElements(t,artboardId,[element.id],'BOTTOM','ARTBOARD'))}>Bottom</button><button disabled={element.locked} onClick={()=>mutate(t=>centerElementsOnArtboard(t,artboardId,[element.id],'BOTH'))}>Center Both</button></div></Section>
  <Section sectionKey="ADVANCED" title="Actions"><button className="card-delete-element" disabled={element.locked} onClick={()=>mutate(t=>deleteDesignElements(t,artboardId,[element.id]))}><Trash2 size={14}/>Delete Element</button></Section>
 </div>;
}
function FaceFillQuickControl({element,update}:{element:PathDesignElement;update:(f:(e:DesignElement)=>DesignElement)=>void}){
  const solid=element.fill.type==='SOLID'?element.fill:{type:'SOLID' as const,color:'#dbeafe',opacity:1};
  const setColor=(color:string)=>update(e=>e.type==='PATH'?{...e,fill:{type:'SOLID',color,opacity:element.fill.type==='SOLID'?(element.fill.opacity??1):1}}:e);
  return <div className="card-property-details" data-section-face-fill-quick>
    <label>Section Fill<div className="card-color-row"><input aria-label="Section fill color" type="color" value={solid.color} onChange={e=>setColor(e.target.value)}/><input value={solid.color} onChange={e=>setColor(e.target.value)}/></div></label>
    <small style={{color:'var(--text-secondary)'}}>This color applies only to the selected section.</small>
  </div>;
}

function OpacityControl({value,onChange}:{value:number;onChange:(value:number)=>void}){const percent=Math.round(clamp(value,0,1)*100);return <label>Opacity<div className="card-range-row"><input type="range" min="0" max="100" value={percent} onChange={e=>onChange(Number(e.target.value)/100)}/><input type="number" min="0" max="100" value={percent} onChange={e=>onChange(clamp(Number(e.target.value)||0,0,100)/100)}/><span>%</span></div></label>}
function ShadowControls({shadow,onChange}:{shadow?:DesignShadow;onChange:(shadow:DesignShadow)=>void}){const s=shadow??DEFAULT_DESIGN_SHADOW,patch=(p:Partial<DesignShadow>)=>onChange({...s,...p});return <div className="card-property-details"><label className="card-check-row"><input type="checkbox" checked={s.enabled} onChange={e=>patch({enabled:e.target.checked})}/>Enabled</label>{s.enabled&&<><label>Color<div className="card-color-row"><input type="color" value={s.color} onChange={e=>patch({color:e.target.value})}/><input value={s.color} onChange={e=>patch({color:e.target.value})}/></div></label><div className="card-property-grid"><label>Opacity (%)<input type="number" min="0" max="100" value={Math.round(s.opacity*100)} onChange={e=>patch({opacity:clamp(Number(e.target.value)||0,0,100)/100})}/></label><label>Blur (mm)<input type="number" min="0" step=".1" value={s.blurMm} onChange={e=>patch({blurMm:Math.max(0,Number(e.target.value)||0)})}/></label><label>Offset X (mm)<input type="number" step=".1" value={s.offsetXmm} onChange={e=>patch({offsetXmm:Number(e.target.value)||0})}/></label><label>Offset Y (mm)<input type="number" step=".1" value={s.offsetYmm} onChange={e=>patch({offsetYmm:Number(e.target.value)||0})}/></label></div></>}</div>}
function BorderControls({stroke,onChange}:{stroke?:ShapeDesignElement['stroke'];onChange:(stroke:ShapeDesignElement['stroke'])=>void}){const s=stroke??{color:'#000000',widthMm:0,style:'NONE',opacity:1},patch=(p:Partial<typeof s>)=>onChange({...s,...p});return <div className="card-property-details"><label>Style<select value={s.style} onChange={e=>patch({style:e.target.value as typeof s.style})}><option value="NONE">None</option><option value="SOLID">Solid</option><option value="DASHED">Dashed</option><option value="DOTTED">Dotted</option></select></label>{s.style!=='NONE'&&<><label>Color<div className="card-color-row"><input type="color" value={s.color} onChange={e=>patch({color:e.target.value})}/><input value={s.color} onChange={e=>patch({color:e.target.value})}/></div></label><div className="card-property-grid"><label>Width (mm)<input type="number" min="0" step=".1" value={s.widthMm} onChange={e=>patch({widthMm:Math.max(0,Number(e.target.value)||0)})}/></label><label>Opacity (%)<input type="number" min="0" max="100" value={Math.round((s.opacity??1)*100)} onChange={e=>patch({opacity:clamp(Number(e.target.value)||0,0,100)/100})}/></label></div></>}</div>}
function ConditionalVisibilityProperties({element,update,availableFields,datasourceStatus}:{element:DesignElement;update:(f:(e:DesignElement)=>DesignElement)=>void;availableFields:import('@document-tool/contracts').FieldDefinition[];datasourceStatus:string}){
  const rule = element.visibilityRule;
  const isEnabled = rule?.enabled ?? false;
  
  const currentField = availableFields.find(f => f.name === rule?.fieldPath);
  const operators = useMemo(() => {
    if (!currentField) return [];
    const t = currentField.type;
    if (t === 'number') return ['EQUALS','NOT_EQUALS','GREATER_THAN','GREATER_OR_EQUAL','LESS_THAN','LESS_OR_EQUAL','IS_EMPTY','IS_NOT_EMPTY'];
    if (t === 'boolean') return ['EQUALS','NOT_EQUALS','IS_EMPTY','IS_NOT_EMPTY'];
    if (t === 'date' || t === 'datetime') return ['EQUALS','NOT_EQUALS','BEFORE','AFTER','ON_OR_BEFORE','ON_OR_AFTER','IS_EMPTY','IS_NOT_EMPTY'];
    return ['EQUALS','NOT_EQUALS','CONTAINS','NOT_CONTAINS','STARTS_WITH','ENDS_WITH','IS_EMPTY','IS_NOT_EMPTY'];
  }, [currentField]);

  const patch = (p: Partial<import('@document-tool/contracts').ElementVisibilityRule>) => {
    update(e => {
      const existing = e.visibilityRule ?? { id: crypto.randomUUID(), enabled: true, fieldPath: availableFields[0]?.name ?? '', operator: 'IS_NOT_EMPTY' };
      return { ...e, visibilityRule: { ...existing, ...p } };
    });
  };

  return <Section sectionKey="DATA_BINDING" title="Conditional Visibility">
    <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
      <label className="card-check-row">
        <input type="checkbox" checked={isEnabled} onChange={e => patch({enabled: e.target.checked})} /> Enable condition
      </label>
      
      {isEnabled && (
        availableFields.length === 0 ? (
          <div style={{fontSize:'12px', color:'var(--text-secondary)'}}>{datasourceStatus || 'No imported datasource available.'}</div>
        ) : (
          <div style={{display:'flex', flexDirection:'column', gap:'8px', paddingLeft: '20px', borderLeft: '2px solid var(--border-color)'}}>
            <label>Field:
              <SearchableFieldPicker 
                availableFields={availableFields} 
                currentFieldPath={rule?.fieldPath ?? '__NONE__'} 
                onSelectField={val => {
                  if (val === '__NONE__') update(e => ({ ...e, visibilityRule: undefined }));
                  else patch({ fieldPath: val, operator: 'IS_NOT_EMPTY' });
                }} 
              />
            </label>
            {rule?.fieldPath && !currentField && <div style={{color:'red',fontSize:'11px'}}>⚠ Field not available in current datasource</div>}
            
            <label>Operator:
              <select value={rule?.operator ?? 'IS_NOT_EMPTY'} onChange={e => patch({operator: e.target.value as import('@document-tool/contracts').VisibilityOperator})}>
                {operators.map(o => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
              </select>
            </label>

            {rule?.operator !== 'IS_EMPTY' && rule?.operator !== 'IS_NOT_EMPTY' && (
              <label>Comparison Value:
                {currentField?.type === 'boolean' ? (
                  <select value={String(rule?.value ?? 'true')} onChange={e => patch({value: e.target.value === 'true'})}>
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </select>
                ) : (
                  <input type={currentField?.type === 'number' ? 'number' : 'text'} value={String(rule?.value ?? '')} onChange={e => {
                    const val = currentField?.type === 'number' ? Number(e.target.value) : e.target.value;
                    patch({value: val});
                  }} />
                )}
              </label>
            )}

            <div style={{fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px'}}>
              Current Result: <strong style={{color: element.runtimeHidden ? 'red' : 'green'}}>{element.runtimeHidden ? 'Hidden' : 'Visible'}</strong>
            </div>

            <button className="secondary" onClick={() => update(e => ({ ...e, visibilityRule: undefined }))}>Remove Condition</button>
          </div>
        )
      )}
    </div>
  </Section>;
}

function AdvancedTextProperties({element,update,availableFields,datasourceStatus}:{element:TextDesignElement;update:(f:(e:DesignElement)=>DesignElement)=>void;availableFields:import('@document-tool/contracts').FieldDefinition[];datasourceStatus:string}){
  const patch=(p:Partial<TextDesignElement>)=>update(e=>e.type==='TEXT'?{...e,...p}:e);
  const style=(p:Partial<TextDesignElement['style']>)=>patch({style:{...element.style,...p}});
  const textBinding=getTextBinding(element);
  const isBound=!!textBinding;
  const isMissingField=isBound&&textBinding.sourceType==='FIELD'&&!availableFields.some(f=>f.name===textBinding.fieldPath);
  
  const bindingMode = element.textBindingMode === 'TEMPLATE' ? 'TEMPLATE' : 'FULL';
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInsertField = (fieldPath: string) => {
    if (fieldPath === '__NONE__') return;
    const txt = textareaRef.current;
    if (txt) {
      const start = txt.selectionStart;
      const end = txt.selectionEnd;
      const val = element.text;
      const newText = val.substring(0, start) + `{{${fieldPath}}}` + val.substring(end);
      patch({text: newText});
      setTimeout(() => {
         txt.focus();
         txt.setSelectionRange(start + fieldPath.length + 4, start + fieldPath.length + 4);
      }, 0);
    } else {
      patch({text: element.text + `{{${fieldPath}}}`});
    }
  };

  const handleModeChange = (mode: 'FULL' | 'TEMPLATE') => {
    if (mode === 'TEMPLATE') {
      const currentVal = isBound && textBinding.fieldPath ? `{{${textBinding.fieldPath}}}` : element.text;
      update(el => {
        const unbound = removeTextBinding(el as TextDesignElement);
        return { ...unbound, text: currentVal, textBindingMode: 'TEMPLATE' };
      });
    } else {
      update(el => {
        return { ...el, textBindingMode: 'FULL' };
      });
    }
  };
  
  return <><Section sectionKey="TYPOGRAPHY" title="Typography"><label>Content<textarea ref={textareaRef} value={element.text} onChange={e=>patch({text:e.target.value})}/></label><label>Font<select value={element.style.fontFamily} onChange={e=>style({fontFamily:e.target.value})}>{['Arial','Helvetica','Georgia','Times New Roman','Verdana','Trebuchet MS','Courier New'].map(f=><option key={f}>{f}</option>)}</select></label><div className="card-property-grid"><label>Size (pt)<input type="number" min="1" value={element.style.fontSizePt} onChange={e=>style({fontSizePt:Math.max(1,Number(e.target.value)||1)})}/></label><label>Weight<select value={element.style.fontWeight} onChange={e=>style({fontWeight:Number(e.target.value)})}>{[300,400,500,600,700,800].map(w=><option key={w} value={w}>{w}</option>)}</select></label></div><div className="card-segmented-control triple"><button className={element.style.italic?'active':''} onClick={()=>style({italic:!element.style.italic})}>Italic</button><button className={element.style.underline?'active':''} onClick={()=>style({underline:!element.style.underline})}>Underline</button><button className={element.style.fontWeight>=700?'active':''} onClick={()=>style({fontWeight:element.style.fontWeight>=700?400:700})}>Bold</button></div><label>Alignment<select value={element.style.alignment} onChange={e=>style({alignment:e.target.value as TextDesignElement['style']['alignment']})}><option value="LEFT">Left</option><option value="CENTER">Center</option><option value="RIGHT">Right</option></select></label><div className="card-property-grid"><label>Line height<input type="number" min=".5" step=".1" value={element.style.lineHeight} onChange={e=>style({lineHeight:Math.max(.5,Number(e.target.value)||1.2)})}/></label><label>Letter spacing<input type="number" step=".1" value={element.style.letterSpacingPt} onChange={e=>style({letterSpacingPt:Number(e.target.value)||0})}/></label></div></Section>
  <Section sectionKey="DATA_BINDING" title="Dynamic Binding">
    {availableFields.length===0?<div style={{fontSize:'12px',color:'var(--text-secondary)'}}>{datasourceStatus}</div>:
      <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
        <label>Binding Mode:
          <select value={bindingMode} onChange={e => handleModeChange(e.target.value as 'FULL' | 'TEMPLATE')}>
            <option value="FULL">Replace Entire Text</option>
            <option value="TEMPLATE">Insert Dynamic Fields</option>
          </select>
        </label>
        
        {bindingMode === 'FULL' ? (
          <>
            <label>Field:
              <SearchableFieldPicker 
                availableFields={availableFields} 
                currentFieldPath={textBinding?.fieldPath ?? '__NONE__'} 
                onSelectField={val => {
                  if (val === '__NONE__') update(el => removeTextBinding(el as TextDesignElement));
                  else update(el => setTextFieldBinding(el as TextDesignElement, val));
                }} 
              />
            </label>
            {isBound&&<div style={{fontSize:'11px'}}>Fallback: {textBinding.fallbackValue as string}</div>}
            {isMissingField&&<div style={{color:'red',fontSize:'11px'}}>⚠ {textBinding.fieldPath} Not available in current datasource</div>}
            {isBound&&<button className="secondary" onClick={()=>update(el=>removeTextBinding(el as TextDesignElement))}>Remove Binding</button>}
          </>
        ) : (
          <>
            <label>Search Field:
              <SearchableFieldPicker 
                availableFields={availableFields} 
                currentFieldPath={'__NONE__'} 
                onSelectField={handleInsertField}
              />
            </label>
            <div style={{fontSize:'11px', color:'var(--text-secondary)'}}>
              Use the dropdown to insert a placeholder into the text content above.
            </div>
          </>
        )}
      </div>
    }
  </Section>
  <Section sectionKey="APPEARANCE" title="Appearance"><label>Text color<div className="card-color-row"><input type="color" value={element.style.color} onChange={e=>style({color:e.target.value})}/><input value={element.style.color} onChange={e=>style({color:e.target.value})}/></div></label><OpacityControl value={element.opacity} onChange={opacity=>patch({opacity})}/></Section>
  <Section sectionKey="ADVANCED" title="Shadow"><ShadowControls shadow={element.shadow} onChange={shadow=>patch({shadow})}/></Section></>}
function defaultShapeLabel(): NonNullable<ShapeDesignElement['label']>{return{enabled:true,text:'Text',fontFamily:'Arial',fontSizePt:12,fontWeight:400,italic:false,underline:false,color:'#111827',alignment:'CENTER',verticalAlignment:'CENTER',paddingMm:2,lineHeight:1.2};}
function ShapeTextControls({label,onChange}:{label?:ShapeDesignElement['label'];onChange:(label:NonNullable<ShapeDesignElement['label']>|undefined)=>void}){
 const current=label??defaultShapeLabel(), patch=(p:Partial<NonNullable<ShapeDesignElement['label']>>)=>onChange({...current,...p});
 return <div className="card-property-details" data-shape-text-controls>
  <label className="card-check-row"><input type="checkbox" checked={label?.enabled??false} onChange={e=>onChange(e.target.checked?{...current,enabled:true}:undefined)}/>Enable text</label>
  {label?.enabled&&<>
   <label>Content<textarea value={current.text} onChange={e=>patch({text:e.target.value})}/></label>
   <div className="card-property-grid">
    <label>Font<select value={current.fontFamily} onChange={e=>patch({fontFamily:e.target.value})}>{['Arial','Helvetica','Georgia','Times New Roman','Verdana','Trebuchet MS','Courier New'].map(font=><option key={font}>{font}</option>)}</select></label>
    <label>Size (pt)<input type="number" min="1" value={current.fontSizePt} onChange={e=>patch({fontSizePt:Math.max(1,Number(e.target.value)||1)})}/></label>
    <label>Weight<input type="number" min="100" max="900" step="100" value={current.fontWeight} onChange={e=>patch({fontWeight:clamp(Number(e.target.value)||400,100,900)})}/></label>
    <label>Padding (mm)<input type="number" min="0" step=".5" value={current.paddingMm} onChange={e=>patch({paddingMm:Math.max(0,Number(e.target.value)||0)})}/></label>
    <label>Line height<input type="number" min=".5" step=".1" value={current.lineHeight} onChange={e=>patch({lineHeight:Math.max(.5,Number(e.target.value)||1.2)})}/></label>
   </div>
   <label>Text color<div className="card-color-row"><input type="color" value={current.color} onChange={e=>patch({color:e.target.value})}/><input value={current.color} onChange={e=>patch({color:e.target.value})}/></div></label>
   <div className="card-segmented-control"><button className={current.fontWeight>=700?'active':''} onClick={()=>patch({fontWeight:current.fontWeight>=700?400:700})}>B</button><button className={current.italic?'active':''} onClick={()=>patch({italic:!current.italic})}>I</button><button className={current.underline?'active':''} onClick={()=>patch({underline:!current.underline})}>U</button></div>
   <label>Horizontal<select value={current.alignment} onChange={e=>patch({alignment:e.target.value as any})}><option value="LEFT">Left</option><option value="CENTER">Center</option><option value="RIGHT">Right</option></select></label>
   <label>Vertical<select value={current.verticalAlignment} onChange={e=>patch({verticalAlignment:e.target.value as any})}><option value="TOP">Top</option><option value="CENTER">Middle</option><option value="BOTTOM">Bottom</option></select></label>
  </>}
 </div>;
}
function ShapeImageFillControls({element,assets,mutate,artboardId,availableFields,datasourceStatus}:{element:ShapeDesignElement|PathDesignElement;assets:DesignTemplate['sharedAssets'];mutate:(f:(t:DesignTemplate)=>DesignTemplate)=>void;artboardId:string;availableFields:import('@document-tool/contracts').FieldDefinition[];datasourceStatus:string}){
 const fill=element.fill.type==='IMAGE'?element.fill:undefined;
 const imageAssets=assets.filter(asset=>asset.kind==='IMAGE'||asset.kind==='LOGO'||asset.mimeType?.startsWith('image/'));
 const sourceBinding=getFillImageSourceBinding(element);
 const imageSourceFields=availableFields.filter(field=>field.type==='string');
 const isBound=!!sourceBinding;
 const isMissingField=isBound&&sourceBinding.sourceType==='FIELD'&&!availableFields.some(field=>field.name===sourceBinding.fieldPath);
 const setFill=(next:NonNullable<typeof fill>)=>mutate(t=>updateDesignElement(t,artboardId,element.id,e=>(e.type==='SHAPE'||e.type==='PATH')?{...e,fill:next}:e));
 const updateBinding=(fieldPath:string)=>mutate(t=>updateDesignElement(t,artboardId,element.id,e=>{if(e.type!=='SHAPE'&&e.type!=='PATH')return e;return fieldPath==='__NONE__'?removeFillImageSourceBinding(e):setFillImageSourceFieldBinding(e,fieldPath);}));
 const upload=async(file?:File)=>{if(!file)return;if(!file.type.startsWith('image/'))return;const source=await readAsDataUrl(file);const dimensions=await readImageDimensions(source);const assetId=id('asset-shape-fill');mutate(t=>{const next=addAssetReference(t,{id:assetId,name:file.name,kind:'IMAGE',sourceType:'DATA_URL',source,mimeType:file.type,widthPx:dimensions.widthPx,heightPx:dimensions.heightPx,metadata:{originalFileName:file.name,userUploaded:true}});return updateDesignElement(next,artboardId,element.id,e=>(e.type==='SHAPE'||e.type==='PATH')?{...e,fill:{type:'IMAGE',assetId,fit:'FILL',opacity:1}}:e);});};
 return <div className="card-property-details" data-shape-image-fill-controls>
  <label>Image<select value={fill?.assetId??''} onChange={e=>e.target.value&&setFill({type:'IMAGE',assetId:e.target.value,fit:fill?.fit??'FILL',opacity:fill?.opacity??1})}><option value="">Select image…</option>{imageAssets.map(asset=><option key={asset.id} value={asset.id}>{asset.name}</option>)}</select></label>
  <label className="secondary">Upload image<input aria-label="Upload shape fill image" type="file" accept="image/*" onChange={e=>{void upload(e.target.files?.[0]);e.currentTarget.value='';}}/></label>
  <label>Dynamic image field
   {imageSourceFields.length===0?<div style={{fontSize:'11px',color:'var(--text-secondary)',marginTop:'4px'}}>{availableFields.length===0?datasourceStatus:'No string/image source fields available.'}</div>:<SearchableFieldPicker availableFields={imageSourceFields} currentFieldPath={sourceBinding?.fieldPath??'__NONE__'} onSelectField={updateBinding}/>}
  </label>
  {isBound&&<div style={{fontSize:'11px',color:'var(--text-secondary)'}}>Fallback: selected image asset</div>}
  {isMissingField&&<div style={{color:'red',fontSize:'11px'}}>⚠ {sourceBinding.fieldPath} Not available in current datasource</div>}
  {isBound&&<button className="secondary" onClick={()=>updateBinding('__NONE__')}>Remove Image Binding</button>}
  {fill&&<><label>Fit<select value={fill.fit} onChange={e=>setFill({...fill,fit:e.target.value as typeof fill.fit})}><option value="FIT">Fit</option><option value="FILL">Fill / Crop</option><option value="STRETCH">Stretch</option></select></label><label>Image opacity<input type="range" min="0" max="1" step="0.05" value={fill.opacity??1} onChange={e=>setFill({...fill,opacity:Number(e.target.value)})}/></label></>}
 </div>;
}
function AdvancedShapeProperties({element,update,assets,mutate,artboardId,availableFields,datasourceStatus}:{element:ShapeDesignElement;update:(f:(e:DesignElement)=>DesignElement)=>void;assets:DesignTemplate['sharedAssets'];mutate:(f:(t:DesignTemplate)=>DesignTemplate)=>void;artboardId:string;availableFields:import('@document-tool/contracts').FieldDefinition[];datasourceStatus:string}){
 const patch=(p:Partial<ShapeDesignElement>)=>update(e=>e.type==='SHAPE'?{...e,...p}:e),mode=element.fill.type==='NONE'?'NONE':element.fill.type==='LINEAR_GRADIENT'?'LINEAR_GRADIENT':element.fill.type==='IMAGE'?'IMAGE':'SOLID',solid=element.fill.type==='SOLID'?element.fill:{type:'SOLID' as const,color:'#dbeafe',opacity:1},gradient=element.fill.type==='LINEAR_GRADIENT'?element.fill.gradient:{type:'LINEAR' as const,angleDeg:0,stops:[{offset:0,color:'#2563eb'},{offset:100,color:'#dbeafe'}]},setGradient=(p:Partial<typeof gradient>)=>patch({fill:{type:'LINEAR_GRADIENT',gradient:{...gradient,...p}}}),setStop=(index:number,p:Partial<(typeof gradient.stops)[number]>)=>setGradient({stops:gradient.stops.map((s,i)=>i===index?{...s,...p}:s)});
 return <><Section sectionKey="APPEARANCE" title="Appearance"><label>Shape Kind<input type="text" value={shapeLabel(element.shape)} readOnly disabled/></label><label>Fill<select value={mode} onChange={e=>patch({fill:e.target.value==='NONE'?{type:'NONE'}:e.target.value==='LINEAR_GRADIENT'?{type:'LINEAR_GRADIENT',gradient}:e.target.value==='IMAGE'?(element.fill.type==='IMAGE'?element.fill:{type:'IMAGE',assetId:'',fit:'FILL',opacity:1}):solid})}><option value="SOLID">Solid</option><option value="NONE">Transparent</option><option value="LINEAR_GRADIENT">Linear Gradient</option><option value="IMAGE">Image</option></select></label>{mode==='SOLID'&&<label>Fill color<div className="card-color-row"><input type="color" value={solid.color} onChange={e=>patch({fill:{...solid,color:e.target.value}})}/><input value={solid.color} readOnly/></div></label>}{mode==='LINEAR_GRADIENT'&&<div className="card-gradient-editor"><label>Angle (°)<input type="number" min="0" max="360" value={gradient.angleDeg} onChange={e=>setGradient({angleDeg:clamp(Number(e.target.value)||0,0,360)})}/></label>{gradient.stops.map((stop,index)=><div className="card-gradient-stop" key={index}><input type="color" value={stop.color} onChange={e=>setStop(index,{color:e.target.value})}/><input aria-label="Stop position" type="number" min="0" max="100" value={stop.offset} onChange={e=>setStop(index,{offset:clamp(Number(e.target.value)||0,0,100)})}/></div>)}</div>}{mode==='IMAGE'&&<ShapeImageFillControls element={element} assets={assets} mutate={mutate} artboardId={artboardId} availableFields={availableFields} datasourceStatus={datasourceStatus}/>}<OpacityControl value={element.opacity} onChange={opacity=>patch({opacity})}/></Section><Section sectionKey="APPEARANCE" title="Shape Text"><ShapeTextControls label={element.label} onChange={label=>patch({label})}/></Section><Section sectionKey="APPEARANCE" title="Border"><BorderControls stroke={element.stroke} onChange={stroke=>patch({stroke})}/></Section><Section sectionKey="ADVANCED" title="Shadow"><ShadowControls shadow={element.shadow} onChange={shadow=>patch({shadow})}/></Section></>;
}
function AdvancedPathProperties({element,update,assets,mutate,artboardId,availableFields,datasourceStatus}:{element:PathDesignElement;update:(f:(e:DesignElement)=>DesignElement)=>void;assets:DesignTemplate['sharedAssets'];mutate:(f:(t:DesignTemplate)=>DesignTemplate)=>void;artboardId:string;availableFields:import('@document-tool/contracts').FieldDefinition[];datasourceStatus:string}){const patch=(p:Partial<PathDesignElement>)=>update(e=>e.type==='PATH'?{...e,...p}:e),mode=element.fill.type==='NONE'?'NONE':element.fill.type==='LINEAR_GRADIENT'?'LINEAR_GRADIENT':element.fill.type==='IMAGE'?'IMAGE':'SOLID',solid=element.fill.type==='SOLID'?element.fill:{type:'SOLID' as const,color:'#dbeafe',opacity:1},gradient=element.fill.type==='LINEAR_GRADIENT'?element.fill.gradient:{type:'LINEAR' as const,angleDeg:0,stops:[{offset:0,color:'#2563eb'},{offset:100,color:'#dbeafe'}]},setGradient=(p:Partial<typeof gradient>)=>patch({fill:{type:'LINEAR_GRADIENT',gradient:{...gradient,...p}}}),setStop=(index:number,p:Partial<(typeof gradient.stops)[number]>)=>setGradient({stops:gradient.stops.map((s,i)=>i===index?{...s,...p}:s)});return <><Section sectionKey="APPEARANCE" title="Appearance"><label>Shape Kind<input type="text" value={element.name} readOnly disabled/></label><label>Fill<select value={mode} onChange={e=>patch({fill:e.target.value==='NONE'?{type:'NONE'}:e.target.value==='LINEAR_GRADIENT'?{type:'LINEAR_GRADIENT',gradient}:e.target.value==='IMAGE'?(element.fill.type==='IMAGE'?element.fill:{type:'IMAGE',assetId:'',fit:'FILL',opacity:1}):solid})}><option value="SOLID">Solid</option><option value="NONE">Transparent</option><option value="LINEAR_GRADIENT">Linear Gradient</option><option value="IMAGE">Image</option></select></label>{mode==='SOLID'&&<label>Fill color<div className="card-color-row"><input type="color" value={solid.color} onChange={e=>patch({fill:{...solid,color:e.target.value}})}/><input value={solid.color} readOnly/></div></label>}{mode==='LINEAR_GRADIENT'&&<div className="card-gradient-editor"><label>Angle (°)<input type="number" min="0" max="360" value={gradient.angleDeg} onChange={e=>setGradient({angleDeg:clamp(Number(e.target.value)||0,0,360)})}/></label>{gradient.stops.map((stop,index)=><div className="card-gradient-stop" key={index}><input type="color" value={stop.color} onChange={e=>setStop(index,{color:e.target.value})}/><input aria-label="Stop position" type="number" min="0" max="100" value={stop.offset} onChange={e=>setStop(index,{offset:clamp(Number(e.target.value)||0,0,100)})}/><button disabled={index===0} onClick={()=>setGradient({stops:moveItem(gradient.stops,index,index-1)})}>↑</button><button disabled={index===gradient.stops.length-1} onClick={()=>setGradient({stops:moveItem(gradient.stops,index,index+1)})}>↓</button><button disabled={gradient.stops.length<=2} onClick={()=>setGradient({stops:gradient.stops.filter((_,i)=>i!==index)})}>×</button></div>)}<button onClick={()=>setGradient({stops:[...gradient.stops,{offset:100,color:'#ffffff'}]})}>Add Stop</button></div>}{mode==='IMAGE'&&<ShapeImageFillControls element={element} assets={assets} mutate={mutate} artboardId={artboardId} availableFields={availableFields} datasourceStatus={datasourceStatus}/>}<OpacityControl value={element.opacity} onChange={opacity=>patch({opacity})}/></Section><Section sectionKey="APPEARANCE" title="Shape Text"><ShapeTextControls label={element.label} onChange={label=>patch({label})}/></Section><Section sectionKey="APPEARANCE" title="Border"><BorderControls stroke={element.stroke} onChange={stroke=>patch({stroke})}/></Section><Section sectionKey="ADVANCED" title="Shadow"><ShadowControls shadow={element.shadow} onChange={shadow=>patch({shadow})}/></Section></>}
function AdvancedImageProperties({element,update,availableFields,datasourceStatus}:{element:ImageDesignElement;update:(f:(e:DesignElement)=>DesignElement)=>void;availableFields:import('@document-tool/contracts').FieldDefinition[];datasourceStatus:string}){
  const patch=(p:Partial<ImageDesignElement>)=>update(e=>e.type==='IMAGE'?{...e,...p}:e);
  const sourceBinding=getSourceBinding(element);
  const isBound=!!sourceBinding;
  const isMissingField=isBound&&sourceBinding.sourceType==='FIELD'&&!availableFields.some(f=>f.name===sourceBinding.fieldPath);
  return <><Section sectionKey="APPEARANCE" title="Image"><label>Fit<select value={element.fit} onChange={e=>patch({fit:e.target.value as ImageDesignElement['fit']})}><option value="FIT">Fit</option><option value="FILL">Fill</option><option value="STRETCH">Stretch</option></select></label><div className="card-segmented-control"><button className={element.flipX?'active':''} onClick={()=>patch({flipX:!element.flipX})}>Flip X</button><button className={element.flipY?'active':''} onClick={()=>patch({flipY:!element.flipY})}>Flip Y</button></div><label className="card-check-row"><input type="checkbox" checked={element.maintainAspectRatio??true} onChange={e=>patch({maintainAspectRatio:e.target.checked})}/>Lock aspect ratio</label></Section>
  <Section sectionKey="DATA_BINDING" title="Dynamic Binding">
    {availableFields.length===0?<div style={{fontSize:'12px',color:'var(--text-secondary)'}}>{datasourceStatus}</div>:
      <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
        <label>Source Field:
          <SearchableFieldPicker 
            availableFields={availableFields} 
            currentFieldPath={sourceBinding?.fieldPath ?? '__NONE__'} 
            onSelectField={val => {
              if (val === '__NONE__') update(el => removeSourceBinding(el as ImageDesignElement));
              else update(el => setSourceFieldBinding(el as ImageDesignElement, val));
            }} 
          />
        </label>
        {isBound&&<div style={{fontSize:'11px'}}>Fallback: Default Asset</div>}
        {isMissingField&&<div style={{color:'red',fontSize:'11px'}}>⚠ {sourceBinding.fieldPath} Not available in current datasource</div>}
        {isBound&&<button className="secondary" onClick={()=>update(el=>removeSourceBinding(el as ImageDesignElement))}>Remove Binding</button>}
      </div>
    }
  </Section>
  <Section sectionKey="APPEARANCE" title="Appearance"><OpacityControl value={element.opacity} onChange={opacity=>patch({opacity})}/><label>Corner radius (mm)<input type="number" min="0" step=".5" value={element.cornerRadiusMm??0} onChange={e=>patch({cornerRadiusMm:Math.max(0,Number(e.target.value)||0)})}/></label></Section><Section sectionKey="APPEARANCE" title="Border"><BorderControls stroke={element.stroke} onChange={stroke=>patch({stroke})}/></Section><Section sectionKey="ADVANCED" title="Shadow"><ShadowControls shadow={element.shadow} onChange={shadow=>patch({shadow})}/></Section></>}
function SvgProperties({element,asset,update,availableFields,datasourceStatus}:{element:SvgDesignElement;asset?:AssetReference;update:(f:(e:DesignElement)=>DesignElement)=>void;availableFields:import('@document-tool/contracts').FieldDefinition[];datasourceStatus:string}){
  const patch=(p:Partial<SvgDesignElement>)=>update(e=>e.type==='SVG'?{...e,...p}:e),canTint=asset?.metadata?.recolorable===true;
  const sourceBinding=getSourceBinding(element);
  const isBound=!!sourceBinding;
  const isMissingField=isBound&&sourceBinding.sourceType==='FIELD'&&!availableFields.some(f=>f.name===sourceBinding.fieldPath);
  return <><Section sectionKey="DATA_BINDING" title="Dynamic Binding">
    {availableFields.length===0?<div style={{fontSize:'12px',color:'var(--text-secondary)'}}>{datasourceStatus}</div>:
      <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
        <label>Source Field:
          <SearchableFieldPicker 
            availableFields={availableFields} 
            currentFieldPath={sourceBinding?.fieldPath ?? '__NONE__'} 
            onSelectField={val => {
              if (val === '__NONE__') update(el => removeSourceBinding(el as SvgDesignElement));
              else update(el => setSourceFieldBinding(el as SvgDesignElement, val));
            }} 
          />
        </label>
        {isBound&&<div style={{fontSize:'11px'}}>Fallback: Default Asset</div>}
        {isMissingField&&<div style={{color:'red',fontSize:'11px'}}>⚠ {sourceBinding.fieldPath} Not available in current datasource</div>}
        {isBound&&<button className="secondary" onClick={()=>update(el=>removeSourceBinding(el as SvgDesignElement))}>Remove Binding</button>}
      </div>
    }
  </Section>
  <Section sectionKey="APPEARANCE" title="Appearance"><OpacityControl value={element.opacity} onChange={opacity=>patch({opacity})}/>
  {canTint&&<label>SVG Color / Tint<div className="card-color-row"><input type="color" value={element.tintColor??'#111827'} onChange={e=>patch({tintColor:e.target.value})}/><input value={element.tintColor??''} placeholder="Original" onChange={e=>patch({tintColor:e.target.value||undefined})}/></div></label>}
  </Section><Section sectionKey="ADVANCED" title="Shadow"><ShadowControls shadow={element.shadow} onChange={shadow=>patch({shadow})}/></Section></>}
function AdvancedQrProperties({element,update,availableFields}:{element:QrDesignElement;update:(f:(e:DesignElement)=>DesignElement)=>void;availableFields:import('@document-tool/contracts').FieldDefinition[];}){
  const patch=(p:Partial<QrDesignElement>)=>update(e=>e.type==='QR'?{...e,...p}:e);
  const valueBinding=getValueBinding(element);
  const isBound=!!valueBinding;
  const isMissingField=isBound&&valueBinding.sourceType==='FIELD'&&!availableFields.some(f=>f.name===valueBinding.fieldPath);
  return <><Section sectionKey="APPEARANCE" title="QR Code">
    <label>Value / URL<input value={element.value} onChange={e=>patch({value:e.target.value})}/></label>
    <label>Error Correction<select value={element.errorCorrection} onChange={e=>patch({errorCorrection:e.target.value as QrDesignElement['errorCorrection']})}><option value="L">L (7%)</option><option value="M">M (15%)</option><option value="Q">Q (25%)</option><option value="H">H (30%)</option></select></label>
    <label>Foreground Color<div className="card-color-row"><input type="color" value={element.foreground} onChange={e=>patch({foreground:e.target.value})}/><input value={element.foreground} onChange={e=>patch({foreground:e.target.value})}/></div></label>
    <label>Background Color<div className="card-color-row"><input type="color" value={element.background} onChange={e=>patch({background:e.target.value})}/><input value={element.background} onChange={e=>patch({background:e.target.value})}/></div></label>
  </Section>
  <Section sectionKey="DATA_BINDING" title="Dynamic Binding">
    {availableFields.length===0?<div style={{fontSize:'12px',color:'var(--text-secondary)'}}>No imported datasource available.</div>:
      <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
        <div className="card-property-details">
          <label style={{marginBottom: '4px'}}>Value Source</label>
          <div className="card-radio-group" style={{display:'flex', gap:'12px'}}>
            <label style={{display:'flex', alignItems:'center', gap:'4px'}}><input type="radio" checked={!isBound} onChange={() => update(el => removeValueBinding(el as QrDesignElement))}/> Static Value</label>
            <label style={{display:'flex', alignItems:'center', gap:'4px'}}><input type="radio" checked={isBound} onChange={() => {
              if (!isBound && availableFields.length > 0) {
                update(el => setValueFieldBinding(el as QrDesignElement, availableFields[0].name));
              }
            }}/> Dynamic Field</label>
          </div>
        </div>
        
        {!isBound ? (
          <label>Value<input value={element.value} onChange={e=>patch({value:e.target.value})}/></label>
        ) : (
          <>
            <label>Field:
              <SearchableFieldPicker 
                availableFields={availableFields} 
                currentFieldPath={valueBinding?.fieldPath ?? '__NONE__'} 
                onSelectField={val => {
                  if (val === '__NONE__') update(el => removeValueBinding(el as QrDesignElement));
                  else update(el => setValueFieldBinding(el as QrDesignElement, val));
                }} 
              />
            </label>
            <div style={{fontSize:'11px', color:'var(--text-secondary)'}}>Bound to: {valueBinding?.fieldPath}</div>
            <div style={{fontSize:'11px', color:'var(--text-secondary)'}}>Fallback: {valueBinding?.fallbackValue as string}</div>
            {isMissingField&&<div style={{color:'red',fontSize:'11px'}}>⚠ {valueBinding.fieldPath} Not available in current datasource</div>}
            <button className="secondary" onClick={()=>update(el=>removeValueBinding(el as QrDesignElement))}>Remove Binding</button>
          </>
        )}
      </div>
    }
  </Section></>
}

function AdvancedBarcodeProperties({element,update,availableFields}:{element:BarcodeDesignElement;update:(f:(e:DesignElement)=>DesignElement)=>void;availableFields:import('@document-tool/contracts').FieldDefinition[];}){
  const patch=(p:Partial<BarcodeDesignElement>)=>update(e=>e.type==='BARCODE'?{...e,...p}:e);
  const valueBinding=getValueBinding(element);
  const isBound=!!valueBinding;
  const isMissingField=isBound&&valueBinding.sourceType==='FIELD'&&!availableFields.some(f=>f.name===valueBinding.fieldPath);
  return <><Section sectionKey="APPEARANCE" title="Barcode">
    <label>Value / Data<input value={element.value} onChange={e=>patch({value:e.target.value})}/></label>
    <label>Symbology (Static)<input value={element.symbology} readOnly disabled/></label>
    <label>Foreground Color<div className="card-color-row"><input type="color" value={element.foreground} onChange={e=>patch({foreground:e.target.value})}/><input value={element.foreground} onChange={e=>patch({foreground:e.target.value})}/></div></label>
    <label>Background Color<div className="card-color-row"><input type="color" value={element.background} onChange={e=>patch({background:e.target.value})}/><input value={element.background} onChange={e=>patch({background:e.target.value})}/></div></label>
  </Section>
  <Section sectionKey="DATA_BINDING" title="Dynamic Binding">
    {availableFields.length===0?<div style={{fontSize:'12px',color:'var(--text-secondary)'}}>No imported datasource available.</div>:
      <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
        <div className="card-property-details">
          <label style={{marginBottom: '4px'}}>Value Source</label>
          <div className="card-radio-group" style={{display:'flex', gap:'12px'}}>
            <label style={{display:'flex', alignItems:'center', gap:'4px'}}><input type="radio" checked={!isBound} onChange={() => update(el => removeValueBinding(el as BarcodeDesignElement))}/> Static Value</label>
            <label style={{display:'flex', alignItems:'center', gap:'4px'}}><input type="radio" checked={isBound} onChange={() => {
              if (!isBound && availableFields.length > 0) {
                update(el => setValueFieldBinding(el as BarcodeDesignElement, availableFields[0].name));
              }
            }}/> Dynamic Field</label>
          </div>
        </div>
        
        {!isBound ? (
          <label>Value / Data<input value={element.value} onChange={e=>patch({value:e.target.value})}/></label>
        ) : (
          <>
            <label>Field:
              <SearchableFieldPicker 
                availableFields={availableFields} 
                currentFieldPath={valueBinding?.fieldPath ?? '__NONE__'} 
                onSelectField={val => {
                  if (val === '__NONE__') update(el => removeValueBinding(el as BarcodeDesignElement));
                  else update(el => setValueFieldBinding(el as BarcodeDesignElement, val));
                }} 
              />
            </label>
            <div style={{fontSize:'11px', color:'var(--text-secondary)'}}>Bound to: {valueBinding?.fieldPath}</div>
            <div style={{fontSize:'11px', color:'var(--text-secondary)'}}>Fallback: {valueBinding?.fallbackValue as string}</div>
            {isMissingField&&<div style={{color:'red',fontSize:'11px'}}>⚠ {valueBinding.fieldPath} Not available in current datasource</div>}
            <button className="secondary" onClick={()=>update(el=>removeValueBinding(el as BarcodeDesignElement))}>Remove Binding</button>
          </>
        )}
      </div>
    }
  </Section></>
}
function BatchOpacityProperties({elements,artboard,mutate}:{elements:DesignElement[];artboard:Artboard;mutate:(f:(t:DesignTemplate)=>DesignTemplate)=>void}){const compatible=elements.filter(e=>['TEXT','SHAPE','IMAGE','SVG'].includes(e.type)),first=compatible[0]?.opacity,mixed=compatible.some(e=>Math.abs(e.opacity-(first??e.opacity))>.0001),percent=Math.round((first??1)*100);if(!compatible.length)return null;return <Section sectionKey="APPEARANCE" title="Appearance"><label>Opacity {mixed?'(Mixed)':''}<div className="card-range-row"><input type="range" min="0" max="100" value={mixed?100:percent} onChange={e=>mutate(t=>updateElementsOpacity(t,artboard.id,compatible.map(x=>x.id),Number(e.target.value)/100))}/><span>{mixed?'Mixed':`${percent}%`}</span></div></label></Section>}
function ElementPrintQuality({element,asset,print}:{element:ImageDesignElement|SvgDesignElement;asset?:AssetReference;print:Artboard['print']}){if(element.type==='SVG')return <div className={`card-print-quality ${assetRenderKind(asset)==='VECTOR_SVG'?'good':'error'}`}><strong>{assetRenderKind(asset)==='VECTOR_SVG'?'Vector — resolution independent':asset?'Unsupported Asset':'Missing Asset'}</strong></div>;const quality=imagePrintQuality(element,asset,print);return <div className={`card-print-quality ${quality.status.toLowerCase()}`}><strong>{quality.message}</strong><span>Source: {asset?.widthPx&&asset?.heightPx?`${asset.widthPx} × ${asset.heightPx} px`:'Dimensions unavailable'}</span><span>Placed: {normalizeDisplayValue(element.size.widthMm)} × {normalizeDisplayValue(element.size.heightMm)} mm</span><span>Effective: {quality.effectiveDpi?`${Math.round(quality.effectiveDpi)} DPI`:'Unknown'}</span></div>}
function MultiSelectionProperties({elements,artboard,mutate,groupSelected,ungroupSelected}:{elements:DesignElement[];artboard:Artboard;mutate:(f:(t:DesignTemplate)=>DesignTemplate)=>void;groupSelected:()=>void;ungroupSelected:()=>void}){
 const [reference,setReference]=useState<DesignAlignmentReference>('SELECTION');
 const b=getSelectionBounds(elements),ids=elements.map(e=>e.id),grouped=elements.some(e=>e.groupId),unitCount=getAlignmentUnitCount(artboard,ids);
 const align=(mode:'LEFT'|'HCENTER'|'RIGHT'|'TOP'|'VCENTER'|'BOTTOM')=>mutate(t=>alignElements(t,artboard.id,ids,mode,reference));
  const distribute=(axis:'HORIZONTAL'|'VERTICAL')=>mutate(t=>distributeElements(t,artboard.id,ids,axis,reference));
  return <div className="card-property-sections">
  <Section sectionKey="GENERAL" title="General">
    <div className="card-property-note"><strong>{elements.length} elements selected</strong><span>{unitCount} alignment unit{unitCount===1?'':'s'} · groups stay atomic · locked units stay fixed.</span></div>
    <div className="card-layer-action-grid"><button onClick={groupSelected} disabled={grouped}>Group</button><button onClick={ungroupSelected} disabled={!grouped}>Ungroup</button></div>
  </Section>
  <Section sectionKey="TRANSFORM" title="Transform">
    <div className="card-layer-action-grid"><button onClick={()=>mutate(t=>scaleElements(t,artboard.id,ids,1.1))}>Scale +10%</button><button onClick={()=>mutate(t=>rotateElementsAsGroup(t,artboard.id,ids,15))}>Rotate +15°</button></div>
    <label>Reference<select value={reference} onChange={e=>setReference(e.target.value as DesignAlignmentReference)}><option value="SELECTION">Selection bounds</option><option value="ARTBOARD">Artboard</option></select></label><div className="card-layer-action-grid card-align-grid"><button onClick={()=>align('LEFT')}>Left</button><button onClick={()=>align('HCENTER')}>H Center</button><button onClick={()=>align('RIGHT')}>Right</button><button onClick={()=>align('TOP')}>Top</button><button onClick={()=>align('VCENTER')}>V Center</button><button onClick={()=>align('BOTTOM')}>Bottom</button><button onClick={()=>distribute('HORIZONTAL')} disabled={unitCount<3}>Distribute H</button><button onClick={()=>distribute('VERTICAL')} disabled={unitCount<3}>Distribute V</button><button onClick={()=>mutate(t=>centerElementsOnArtboard(t,artboard.id,ids,'BOTH'))}>Center Artboard</button></div>
    {b&&<div className="card-property-grid"><label>X (mm)<input readOnly value={normalizeDisplayValue(b.xMm)}/></label><label>Y (mm)<input readOnly value={normalizeDisplayValue(b.yMm)}/></label><label>Width (mm)<input readOnly value={normalizeDisplayValue(b.widthMm)}/></label><label>Height (mm)<input readOnly value={normalizeDisplayValue(b.heightMm)}/></label></div>}
  </Section>
  </div>}
function MultiArtboardProperties({artboards,mutate}:{artboards:Artboard[];mutate:(f:(t:DesignTemplate)=>DesignTemplate)=>void}){
  if(!artboards.length) return null;
  const ids=artboards.map(a=>a.id);
  const commonPrint=artboards[0]!.print;
  return <div className="card-property-sections">
    <Section sectionKey="GENERAL" title="Batch Properties">
      <div className="card-property-note"><strong>{artboards.length} Artboards Selected</strong><span>Batch operations</span></div>
      <div className="card-layer-action-grid">
        <button onClick={()=>mutate(t=>applyPrintSettingsToTargets(t,commonPrint,'SELECTED',artboards[0]!.id,ids))}>Sync Print Settings</button>
      </div>
    </Section>
  </div>;
}
function Properties({artboard,template,mutate}:{artboard:Artboard;template:DesignTemplate;mutate:(f:(t:DesignTemplate)=>DesignTemplate)=>void}){const unit=artboard.displayUnit,w=normalizeDisplayValue(mmToUnit(artboard.widthMm,unit)),h=normalizeDisplayValue(mmToUnit(artboard.heightMm,unit)),preset=ARTBOARD_PRESETS.find(p=>near(p.widthMm,artboard.widthMm)&&near(p.heightMm,artboard.heightMm));const dimensions=(nw:number,nh:number)=>{const wm=unitToMm(nw,unit),hm=unitToMm(nh,unit);if(wm>0&&hm>0&&Number.isFinite(wm)&&Number.isFinite(hm))mutate(t=>resizeArtboard(t,artboard.id,wm,hm));};
const availableToPair=template.artboards.filter(a=>a.id!==artboard.id&&!a.pairId);
return <div className="card-property-sections">
<Section sectionKey="GENERAL" title="General">
  <label>Name<input value={artboard.name} onChange={e=>{if(e.target.value.trim())mutate(t=>renameArtboard(t,artboard.id,e.target.value));}}/></label>
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
        {availableToPair.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
      </select>}
    </div>
  )}
</Section>
<Section sectionKey="GENERAL" title="Dimensions"><label>Preset<select value={preset?.id??'custom'} onChange={e=>{const p=ARTBOARD_PRESETS.find(x=>x.id===e.target.value);if(p)mutate(t=>resizeArtboard(t,artboard.id,p.widthMm,p.heightMm));}}><option value="custom">Custom</option>{ARTBOARD_PRESETS.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}</select></label><div className="card-property-grid"><label>Width ({unit==='MM'?'mm':'in'})<input type="number" min="0.001" step="0.1" value={w} onChange={e=>dimensions(Number(e.target.value),h)}/></label><label>Height ({unit==='MM'?'mm':'in'})<input type="number" min="0.001" step="0.1" value={h} onChange={e=>dimensions(w,Number(e.target.value))}/></label></div><label>Display unit<select value={unit} onChange={e=>mutate(t=>setArtboardDisplayUnit(t,artboard.id,e.target.value as DesignUnit))}><option value="MM">Millimetres (mm)</option><option value="IN">Inches (in)</option></select></label><label>Orientation<div className="card-segmented-control"><button className={artboard.widthMm>=artboard.heightMm?'active':''} onClick={()=>{if(artboard.widthMm<artboard.heightMm)mutate(t=>resizeArtboard(t,artboard.id,artboard.heightMm,artboard.widthMm));}}>Landscape</button><button className={artboard.heightMm>artboard.widthMm?'active':''} onClick={()=>{if(artboard.heightMm<=artboard.widthMm)mutate(t=>resizeArtboard(t,artboard.id,artboard.heightMm,artboard.widthMm));}}>Portrait</button></div></label></Section><Section sectionKey="GENERAL" title="Background"><label>Background<div className="card-color-row"><input type="color" value={color(artboard)} onChange={e=>mutate(t=>setArtboardBackground(t,artboard.id,{type:'SOLID',color:e.target.value,opacity:1}))}/><input value={color(artboard)} readOnly/></div></label></Section><Section sectionKey="GENERAL" title={`Guides (${artboard.guides.length})`}>{artboard.guides.length?<div className="card-guide-list">{artboard.guides.map(guide=><div key={guide.id} className="card-guide-row"><span>{guide.orientation==='VERTICAL'?'V':'H'}</span><input type="number" step="0.1" value={normalizeDisplayValue(mmToUnit(guide.positionMm,unit))} disabled={guide.locked} onChange={e=>mutate(t=>moveGuide(t,artboard.id,guide.id,unitToMm(Number(e.target.value),unit)))}/><small>{unit==='MM'?'mm':'in'}</small><button title={guide.locked?'Unlock guide':'Lock guide'} onClick={()=>mutate(t=>setGuideLocked(t,artboard.id,guide.id,!guide.locked))}>{guide.locked?'🔒':'🔓'}</button><button title="Delete guide" disabled={guide.locked} onClick={()=>mutate(t=>deleteGuide(t,artboard.id,guide.id))}>×</button></div>)}</div>:<div className="card-property-note"><span>Drag from the top or left ruler to create a guide.</span></div>}</Section><Section sectionKey="GENERAL" title="Notice"><div className="card-property-note"><strong>Phase 6.1.3</strong><span>Rulers, configurable editor grid and persistent artboard guides are active. Guides remain editor-only and feed the shared smart-snapping engine.</span></div></Section></div>}

function PrintProperties({artboard,assets,mutate}:{artboard:Artboard;assets:AssetReference[];mutate:(f:(t:DesignTemplate)=>DesignTemplate)=>void}){const settings=resolvePrintSettings(artboard.print),preflight=useMemo(()=>validateArtboardPrint(artboard,assets),[artboard,assets]),patch=(value:Partial<Artboard['print']>)=>mutate(template=>updateArtboardPrintSettings(template,artboard.id,value)),insets=(key:'bleed'|'safeArea',label:string)=>{const current=settings[key],change=(side:keyof typeof current,value:number)=>patch({[key]:{...current,[side]:Math.max(0,value)}});return <Section sectionKey="GENERAL" title={label}><div className="card-property-grid"><label>Top (mm)<input type="number" min="0" step=".5" value={current.topMm} onChange={e=>change('topMm',Number(e.target.value)||0)}/></label><label>Right (mm)<input type="number" min="0" step=".5" value={current.rightMm} onChange={e=>change('rightMm',Number(e.target.value)||0)}/></label><label>Bottom (mm)<input type="number" min="0" step=".5" value={current.bottomMm} onChange={e=>change('bottomMm',Number(e.target.value)||0)}/></label><label>Left (mm)<input type="number" min="0" step=".5" value={current.leftMm} onChange={e=>change('leftMm',Number(e.target.value)||0)}/></label></div></Section>};return <div className="card-property-sections"><Section sectionKey="GENERAL" title="Print Settings"><label className="card-check-row"><input type="checkbox" checked={settings.showBleedInEditor} onChange={e=>patch({showBleedInEditor:e.target.checked})}/>Show Bleed</label><label className="card-check-row"><input type="checkbox" checked={settings.showSafeAreaInEditor} onChange={e=>patch({showSafeAreaInEditor:e.target.checked})}/>Show Safe Area</label><label className="card-check-row"><input type="checkbox" checked={settings.showCropMarksInEditor} onChange={e=>patch({showCropMarksInEditor:e.target.checked})}/>Show Crop Marks</label><label className="card-check-row"><input type="checkbox" checked={settings.cropMarksEnabledForExport} onChange={e=>patch({cropMarksEnabledForExport:e.target.checked})}/>Export Crop Marks</label><div className="card-property-grid"><label>Minimum DPI<input type="number" min="1" value={settings.minimumRasterDpi} onChange={e=>patch({minimumRasterDpi:Math.max(1,Number(e.target.value)||150)})}/></label><label>Preferred DPI<input type="number" min="1" value={settings.preferredRasterDpi} onChange={e=>patch({preferredRasterDpi:Math.max(1,Number(e.target.value)||300)})}/></label></div><div className="card-property-note"><span>{artboard.widthMm} × {artboard.heightMm} mm @ {settings.preferredRasterDpi} DPI</span><strong>{requiredPixels(artboard.widthMm,settings.preferredRasterDpi)} × {requiredPixels(artboard.heightMm,settings.preferredRasterDpi)} px recommended</strong></div></Section>{insets('bleed','Bleed — outside trim')}{insets('safeArea','Safe Area — inside trim')}<Section sectionKey="GENERAL" title="Print Preflight"><div className="card-preflight-summary"><span className={preflight.errors?'error':'good'}>{preflight.errors} errors</span><span className={preflight.warnings?'warning':'good'}>{preflight.warnings} warnings</span></div>{preflight.issues.slice(0,6).map(issue=><div key={issue.id} className={`card-preflight-issue ${issue.severity.toLowerCase()}`}>{issue.message}</div>)}{!preflight.issues.length&&<div className="card-print-quality good"><strong>Print Ready</strong><span>Trim size and placed assets passed preflight.</span></div>}</Section></div>}

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

function PreviewDataPanel({dataContext, setDataContext, previewContextSource, setPreviewContextSource, importedRecord}: {dataContext: DesignDataContext, setDataContext: (dc: DesignDataContext) => void, previewContextSource: 'IMPORTED'|'MANUAL', setPreviewContextSource: (s: 'IMPORTED'|'MANUAL')=>void, importedRecord: Record<string, any>}) {
  const [jsonInput, setJsonInput] = useState(JSON.stringify(dataContext.record, null, 2));
  useEffect(() => { setJsonInput(JSON.stringify(dataContext.record, null, 2)); }, [dataContext.record]);
  const [error, setError] = useState<string>('');
  const handleApply = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setDataContext({ ...dataContext, record: parsed });
      setPreviewContextSource('MANUAL');
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
    }
  };
  const handleRestore = () => {
    setDataContext({ ...dataContext, record: importedRecord });
    setPreviewContextSource('IMPORTED');
    setError('');
  };
  return (
    <div className="card-properties-group" style={{marginTop:'auto', borderTop:'1px solid var(--border-color)', paddingTop:'15px'}}>
      <label>
        <span>Preview Data Context (JSON)</span>
        <textarea
          style={{fontFamily:'monospace', fontSize:'11px', height:'120px', width:'100%', resize:'vertical'}}
          value={jsonInput}
          onChange={e => setJsonInput(e.target.value)}
        />
      </label>
      {error && <div style={{color:'red', fontSize:'11px', marginBottom:'5px'}}>{error}</div>}
      <div style={{display:'flex', gap:'5px', marginTop:'5px'}}>
        <button onClick={handleApply}>Apply Preview Data</button>
        {previewContextSource === 'MANUAL' && <button onClick={handleRestore}>Use Imported Record</button>}
      </div>
    </div>
  );
}

function SearchableFieldPicker({availableFields, currentFieldPath, onSelectField}: {availableFields: import('@document-tool/contracts').FieldDefinition[], currentFieldPath: string, onSelectField: (path: string) => void}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const filtered = useMemo(() => filterAvailableFields(availableFields, query), [availableFields, query]);
  const currentField = availableFields.find(f => f.name === currentFieldPath);

  return (
    <div className="card-field-picker" ref={containerRef} style={{position:'relative', width:'100%', marginTop:'4px'}}>
      <button 
        type="button" 
        className="card-field-picker-trigger" 
        onClick={() => { setOpen(!open); setQuery(''); }}
        style={{width:'100%', textAlign:'left', padding:'4px 8px', display:'flex', justifyContent:'space-between', alignItems:'center', background:'var(--bg-secondary)', border:'1px solid var(--border-color)', borderRadius:'4px'}}
      >
        <span style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
          {currentField ? (currentField.label || currentField.name) : (currentFieldPath === '__NONE__' ? 'None' : currentFieldPath)}
        </span>
        <span>▾</span>
      </button>

      {open && (
        <div className="card-field-picker-dropdown" style={{marginTop:'4px', background:'var(--bg-primary)', border:'1px solid var(--border-color)', borderRadius:'4px', display:'flex', flexDirection:'column', maxHeight:'250px'}}>
          <input 
            autoFocus
            type="text" 
            placeholder="Search fields..." 
            value={query} 
            onChange={e => setQuery(e.target.value)} 
            onKeyDown={e => {
              if (e.key === 'Escape') setOpen(false);
              else if (e.key === 'Enter' && filtered.length > 0) {
                onSelectField(filtered[0]!.name);
                setOpen(false);
              }
            }}
            style={{margin:'4px', padding:'4px 8px', border:'1px solid var(--border-color)', borderRadius:'2px', color:'var(--text-primary)', background:'var(--bg-secondary)'}}
          />
          <div style={{overflowY:'auto', flex:1}}>
            <button 
              type="button"
              className="card-field-picker-option"
              onClick={() => { onSelectField('__NONE__'); setOpen(false); }}
              style={{display:'block', width:'100%', textAlign:'left', padding:'6px 8px', background:'transparent', border:'none', cursor:'pointer', color:'var(--text-primary)'}}
            >
              None
            </button>
            {filtered.slice(0, 100).map(f => (
              <button
                key={f.name}
                type="button"
                className="card-field-picker-option"
                onClick={() => { onSelectField(f.name); setOpen(false); }}
                style={{display:'flex', flexDirection:'column', width:'100%', textAlign:'left', padding:'6px 8px', background:'transparent', border:'none', borderTop:'1px solid var(--border-color)', cursor:'pointer', color:'var(--text-primary)'}}
              >
                <strong>{f.label || f.name}</strong>
                {f.label && f.label !== f.name && <span style={{fontSize:'10px', color:'var(--text-secondary)'}}>{f.name}</span>}
                <span style={{fontSize:'10px', color:'var(--text-secondary)'}}>{f.type}</span>
              </button>
            ))}
            {filtered.length > 100 && (
              <div style={{padding:'6px 8px', fontSize:'11px', color:'var(--text-secondary)', textAlign:'center', borderTop:'1px solid var(--border-color)'}}>
                Refine search to see more fields.
              </div>
            )}
            {filtered.length === 0 && (
              <div style={{padding:'6px 8px', fontSize:'11px', color:'var(--text-secondary)', textAlign:'center', borderTop:'1px solid var(--border-color)'}}>
                No fields found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
