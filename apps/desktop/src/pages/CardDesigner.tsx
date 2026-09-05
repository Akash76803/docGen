import { DesignerShell } from '../components/designer/DesignerShell.tsx';
import { DesignerHeader } from '../components/designer/DesignerHeader.tsx';
import { DesignerShortcutsModal } from '../components/designer/DesignerShortcutsModal.tsx';
import { resolveDesignerShapeShortcut, resolveDesignerUtilityShortcut } from '../components/designer/designerShortcutRegistry.ts';
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
import { buildCardRenderModel, prepareArtboardForCardExport, validateExportMemory, geometryToSvgPath, deletePathPointsSafely, splitPathSegment, insertPathNodeWithSymmetry, hitTestSegment, getPathEndpoints, getPathRangeBetweenNodes, deletePathSegmentRange, joinPathGeometries, closePathGeometry, worldToLocal, localToWorld, shapeToPathGeometry, getSmartTrimIntervals, findTrimInterval, trimSegmentInterval, erasePathWithWorldStroke, splitGeometryIntoConnectedFragments, normalizePathFragment, weldPathEndpointsToNearbyNodes, materializeStraightPathIntersections, findBoundarySnap, resolvePointSnap, splitComponentFaceByDivider, findJoinedLineRegionAtPoint, findCadRayIntersections, createCadLineGeometry, createCadLineMetadata, appendCadPolylinePoint, createCadPolylineMetadata, createCadXLineGeometry, createCadXLineMetadata, createCadRayGeometry, createCadRayMetadata, createCadArcGeometry, createCadArcMetadata, resolveCadDynamicEndpoint, type BoundarySnap, type PointSnapResult, type TrimInterval, type CardExportRequest, type PackagingExportMode } from '@document-tool/design-engine';
import { ExportCancellationSource, ExportCancelledError, ExportOrchestrator, RendererRegistry, ZipBundler, type ResolvedExportDocument } from '@document-tool/renderer-sdk';
import { IsolatedCardExportCanvas } from './CardExportCanvas';
import { deliverExportedFiles } from '../services/fileDelivery.js';
import { CardPdfExportRenderer } from '@document-tool/renderer-pdf';
import { registerPngRenderer, registerJpegRenderer, BrowserExactPageRasterizer } from '@document-tool/renderer-image';
import { createCombinedPdfAccumulator, type CombinedPdfAccumulator } from '../services/cardCombinedPdf.js';
import { useCallback, useEffect,useMemo,useRef,useState,createContext,useContext } from 'react';
import { createPortal } from 'react-dom';
import QRCode from 'react-qr-code';
import type { Artboard,AssetReference,DesignElement,DesignFill,DesignShadow,DesignShapeKind,DesignStroke,DesignTemplate,DesignUnit,ImageDesignElement,ShapeDesignElement,SvgDesignElement,TextDesignElement,TextStyleRunStyle,TextLayerEffect,TextLayerEffectType,QrDesignElement,BarcodeDesignElement,PathDesignElement,PathGeometry,ArtboardRole,DesignDataContext } from '@document-tool/contracts';
import {
  ARTBOARD_PRESETS,ARTBOARD_PRESET_CATEGORIES,applyArtboardPreset,findArtboardPresetBySize,searchArtboardPresets,addArtboard,addAssetReference,addDesignElement,createBlankArtboard,createImageElement,createShapeElement,createTextElement,createQrElement,createBarcodeElement,
  deleteArtboard,deleteDesignElements,duplicateArtboard,emptySelection,getSelectionBounds,mmToUnit,moveArtboard,moveElements,nextElementZIndex,
  normalizeDisplayValue,nudgeElements,renameArtboard,resizeArtboard,resizeElement,resizeSelectionBoundsFromDelta,resizeElementsFromSnapshots,rotateElement,snapRotationDeg,worldDeltaToElementLocal,sanitizeSelection,selectAllSelectable,selectByMarquee,
  selectedElements,selectOnly,setArtboardBackground,setArtboardDisplayUnit,setElementPosition,toggleSelection,unitToMm,updateDesignElement,
  orderedLayers,renameElement,renameGroup,setElementVisibility,setElementLocked,moveLayers,replaceElementsAtLayer,duplicateDesignElements,groupElements,ungroupElements,restoreGroups,
  expandElementIdsToGroups,groupForElement,setGroupLocked,setGroupVisibility,scaleElements,rotateElementsAsGroup,
  createDesignHistory,commitDesignHistory,undoDesignHistory,redoDesignHistory,resetDesignHistory,
  createDesignClipboardPayload,pasteDesignClipboard,createSvgElement,DESIGN_STARTER_TEMPLATES,DECORATIVE_ASSETS,decorativeAssetReference,
  alignElements,distributeElements,centerElementsOnArtboard,getAlignmentUnitCount,matchAlignmentUnitsSize,resolveMixedValue,setElementsPositionAxis,setElementsSizeDimension,setElementsRotation,
  snapMoveDelta,snapResizeSize,addGuide,moveGuide,deleteGuide,setGuideLocked,setAllGuidesLocked,clearGuides,
  copyDesignElementStyle,pasteDesignElementStyle,resetDesignElementStyle,updateElementsOpacity,DEFAULT_DESIGN_SHADOW,DEFAULT_RADIAL_GRADIENT,DEFAULT_PATTERN_FILL,normalizeImageFillTransform,normalizeStrokeDashArray,parseStrokeDashPatternText,
  prepareAssetImport,assetRenderKind,resolveRasterImageElementSource,resolveRasterImageFillSource,resolvePrintSettings,imagePrintQuality,validateArtboardPrint,requiredPixels,updateArtboardPrintSettings,
  setArtboardRole,pairArtboards,unpairArtboard,createBackSide,applyPrintSettingsToTargets,resolveArtboardBindings,
  getTextBinding,setTextFieldBinding,removeTextBinding,resolveDataContextSeeding,
  getSourceBinding,setSourceFieldBinding,removeSourceBinding,
  getFillImageSourceBinding,setFillImageSourceFieldBinding,removeFillImageSourceBinding,
  getArtboardBackgroundImageSourceBinding,setArtboardBackgroundImageSourceFieldBinding,removeArtboardBackgroundImageSourceBinding,
  getValueBinding,setValueFieldBinding,removeValueBinding,mirrorElementsAcrossArtboard,mirrorElementsAcrossReferenceLine,flipElementsInPlace,flipElementsAsGroup,
  CARTON_STYLE_OPTIONS,DEFAULT_CARTON_DIELINE_INPUT,cartonDielineInputFromTemplate,generateCartonDieline,validateCartonDielineInput,packagingPanelsFromArtboard,
  importSvgDieline,createSvgDielineArtboard,assignImportedDielineLayer,mapSelectionToPackagingPanel,lockImportedDielineTechnicalGeometry,
  prepareElementForPackagingPanel,packagingMetadataForPanel,assignElementsToPackagingPanel,fitElementsToPackagingPanel,validatePackagingArtwork,packagingClipInsets,refreshPackagingArtworkIndex,setPackagingPanelArtworkOrientation,selectPackagingPanelArtworkIds,runPackagingPreflight,createBackgroundRemovedAsset,applyBackgroundRemovedAssetToImage,resetImageBackgroundRemoval,buildRichTextSegments,applyTextStyleRun,clearTextStyleRuns,rebaseTextStyleRunsOnEdit,applyBackgroundRemovedAssetToImageFill,resetImageFillBackgroundRemoval,addTextLayerEffect,removeTextLayerEffect,toggleTextLayerEffect,duplicateTextLayerEffect,resetTextLayerEffect,moveTextLayerEffect,migrateLegacyTextEffects,normalizeTextLayerEffects
} from '@document-tool/design-engine';
import type { ArtboardOrientation,ArtboardPreset,ArtboardPresetCategory,CartonDielineInput,CartonMeasurementBasis,CartonStyle,PackagingPanel,ManualPackagingPanelRole,PackagingArtworkOrientation,PackagingPreflightResult,DesignAlignmentReference,DesignClipboardPayload,DesignHistoryState,DesignRectMm,DesignSelectionState,DesignStyleClipboard,SnapGuideIndicator,RegroupSnapshot } from '@document-tool/design-engine';
import { LocalStorageArtboardPresetRepository,LocalStorageDesignTemplateRepository,LocalStorageUserAssetLibraryRepository,type CustomArtboardPreset,type UserAssetLibraryItem } from '@document-tool/persistence';
import { ArrowDown,ArrowUp,Copy,Maximize2,Minus,MonitorUp,Plus,RotateCcw,Trash2,Upload,PenLine, Type, Image as ImageIcon, Box, Shapes, Eye, EyeOff, Lock, Unlock, Scissors, MousePointer2, BetweenHorizontalStart, ChevronDown, ChevronRight, Layers3, Hand } from 'lucide-react';
import { loadImportWorkspace } from '../services/workspaceStore.js';
import { clampPreviewRecordIndex, getPreviewRecord, createRecordDesignDataContext, getRecordDisplayLabel } from '../services/previewRecordHelpers.js';
import { createBulkGenerationPlan, BulkCancellationToken, resolveItemArtboard, type BulkCardGenerationRequest, type BulkArtboardTarget, type BulkRecordTarget, type BulkGenerationResult } from '../services/cardBulkGeneration.js';
import { processImageBackground, sampleImageColor, processDynamicBackgroundRemovalArtboard, DYNAMIC_BG_REMOVAL_METADATA_KEY, DYNAMIC_FILL_BG_REMOVAL_METADATA_KEY, type BackgroundRemovalBrushEdit } from '../lib/imageBackgroundRemovalBrowser.js';
import { DESIGN_FONT_GROUPS, DESIGN_FONT_FAMILIES, FONT_WEIGHT_OPTIONS, FONT_FILE_ACCEPT, isSupportedFontFile, fontMimeType, inferFontFamilyFromFilename } from '../components/designer/fontLibrary.js';

const MM_TO_CSS_PX=96/25.4,MIN_ZOOM=5,MAX_ZOOM=3200,POINT_SNAP_SCREEN_TOLERANCE_PX=9,INTERSECTION_CAPTURE_SCREEN_TOLERANCE_PX=18,INTERSECTION_LOCK_RELEASE_SCREEN_TOLERANCE_PX=30;

type FontLibraryAsset = UserAssetLibraryItem & { metadata: UserAssetLibraryItem['metadata'] & { fontAsset?: boolean; fontFamily?: string; fontFormat?: string } };
type FontManagerContextValue = {
  uploadedFonts: FontLibraryAsset[];
  favorites: string[];
  recent: string[];
  registered: string[];
  status: string;
  uploadFonts: (files: FileList | File[]) => Promise<void>;
  deleteFont: (asset: FontLibraryAsset) => Promise<void>;
  toggleFavorite: (family: string) => void;
  markRecent: (family: string) => void;
};
const FontManagerContext=createContext<FontManagerContextValue>({uploadedFonts:[],favorites:[],recent:[],registered:[],status:'',uploadFonts:async()=>{},deleteFont:async()=>{},toggleFavorite:()=>{},markRecent:()=>{}});
function isFontAsset(asset:UserAssetLibraryItem):asset is FontLibraryAsset{return asset.kind==='OTHER'&&asset.metadata?.fontAsset===true&&typeof asset.metadata?.fontFamily==='string';}

const TRIMMER_CURSOR = 'url("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2224%22 height=%2224%22 viewBox=%220 0 24 24%22%3E%3Ccircle cx=%2212%22 cy=%2212%22 r=%228%22 fill=%22white%22 stroke=%22%23ef4444%22 stroke-width=%222%22/%3E%3Cpath d=%22M12 5v14M5 12h14%22 stroke=%22%23ef4444%22 stroke-width=%222%22/%3E%3C/svg%3E") 12 12, crosshair';
const SHAPES:DesignShapeKind[]=['RECTANGLE','SQUARE','ROUNDED_RECTANGLE','CAPSULE','CIRCLE','ELLIPSE','LINE','TRIANGLE','RIGHT_TRIANGLE','DIAMOND','PENTAGON','HEXAGON','OCTAGON','TRAPEZOID','PARALLELOGRAM','ARROW','DOUBLE_ARROW','CURVED_ARROW','CHEVRON','DOUBLE_CHEVRON','STAR','POLYGON','HEART','CLOUD','SPEECH_BUBBLE','CALLOUT','DOCUMENT','CYLINDER','CROSS','PLUS','BANNER','SHIELD','RIBBON','BADGE','HALF_CIRCLE','ARC','BRACKET','LABEL_TAG'];
const id=(p:string)=>`${p}-${globalThis.crypto?.randomUUID?.()??`${Date.now()}-${Math.random().toString(16).slice(2)}`}`;
function fresh():DesignTemplate{const artboard=createBlankArtboard({id:id('artboard'),name:'Front',order:0,widthMm:90,heightMm:50});artboard.print=resolvePrintSettings();return{kind:'CARD_DESIGN',schemaVersion:1,id:id('card-template'),name:'Untitled Card Design',version:1,status:'DRAFT',artboards:[artboard],sharedAssets:[]};}

export function CardDesigner({onBack}:{onBack?:()=>void} = {}){
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
 const [shortcutsOpen,setShortcutsOpen]=useState(false);
 const [space,setSpace]=useState(false);
 const [panMode,setPanMode]=useState(false);
 const [snapEnabled,setSnapEnabled]=useState(true);
 const [gridSnapEnabled,setGridSnapEnabled]=useState(false);
 const [guideSnapEnabled,setGuideSnapEnabled]=useState(true);
 const [showSmartCenters,setShowSmartCenters]=useState(true);
 const [polarTrackingEnabled,setPolarTrackingEnabled]=useState(true);
 const [orthoTrackingEnabled,setOrthoTrackingEnabled]=useState(false);
 const [parallelTrackingEnabled,setParallelTrackingEnabled]=useState(true);
 const [polarIncrementDeg,setPolarIncrementDeg]=useState(15);
 const [pathSymmetryMode,setPathSymmetryMode]=useState<'OFF'|'H'|'V'>('OFF');
 const [showRulers,setShowRulers]=useState(true);
 const [showGrid,setShowGrid]=useState(false);
 const [showHiddenElements,setShowHiddenElements]=useState(false);
 const [gridSizeMm,setGridSizeMm]=useState(5);
 const [mirrorGuideAxis,setMirrorGuideAxis]=useState<'HORIZONTAL'|'VERTICAL'|null>(null);
 const mirrorGuideTimerRef=useRef<number|null>(null);
 const [userAssets,setUserAssets]=useState<UserAssetLibraryItem[]>([]);
 const [fontManagerStatus,setFontManagerStatus]=useState('');
 const [registeredFontFamilies,setRegisteredFontFamilies]=useState<string[]>([]);
 const [fontFavorites,setFontFavorites]=useState<string[]>(()=>{try{return JSON.parse(window.localStorage.getItem('document-tool.card-font-favorites.v1')||'[]')}catch{return[]}});
 const [recentFonts,setRecentFonts]=useState<string[]>(()=>{try{return JSON.parse(window.localStorage.getItem('document-tool.card-font-recent.v1')||'[]')}catch{return[]}});
 const [savedTemplates,setSavedTemplates]=useState<DesignTemplate[]>([]);
 const [templateLibraryStatus,setTemplateLibraryStatus]=useState('');
 const [assetLibraryStatus,setAssetLibraryStatus]=useState('');
 const [decorativeQuery,setDecorativeQuery]=useState('');
 const [selection,setSelection]=useState<DesignSelectionState>(()=>emptySelection(''));
 const [packagingPanelMode,setPackagingPanelMode]=useState(false);
 const [activePackagingPanelId,setActivePackagingPanelId]=useState<string|null>(null);
 const [focusedPackagingPanelId,setFocusedPackagingPanelId]=useState<string|null>(null);
 const [packagingPreflightOpen,setPackagingPreflightOpen]=useState(false);
 const [regroupHistory,setRegroupHistory]=useState<{artboardId:string;groups:RegroupSnapshot[]}|null>(null);
  const [interactionMode, setInteractionModeRaw] = useState<'SELECT' | 'EDIT_PATH' | 'SCISSORS' | 'PEN' | 'TRIMMER' | 'SPLIT' | 'ERASER' | 'FILL_BUCKET' | 'DRAW_SHAPE' | 'FLEXIBLE_LINE' | 'MIRROR_LINE' | 'XLINE' | 'RAY' | 'ANGLE_LINE' | 'ARC' | 'REFERENCE_ALIGN'>('SELECT');
 const [referenceMirrorMode,setReferenceMirrorMode]=useState<'COPY'|'MOVE'>('COPY');
 useEffect(()=>{if(interactionMode!=='SELECT'&&panMode)setPanMode(false);},[interactionMode,panMode]);
  const [fillBucketType,setFillBucketType]=useState<'SOLID'|'NONE'>('SOLID');
  const [fillBucketColor,setFillBucketColor]=useState('#3b82f6');
  const [drawShapeType, setDrawShapeType] = useState<DesignShapeKind | null>(null);
  const [pathSelectedNodeIds, setPathSelectedNodeIds] = useState<string[]>([]);
  const [pathSelectedSegmentIds, setPathSelectedSegmentIds] = useState<string[]>([]);
  
   const setInteractionMode = (newMode: 'SELECT' | 'EDIT_PATH' | 'SCISSORS' | 'PEN' | 'TRIMMER' | 'SPLIT' | 'ERASER' | 'FILL_BUCKET' | 'DRAW_SHAPE' | 'FLEXIBLE_LINE' | 'MIRROR_LINE' | 'XLINE' | 'RAY' | 'ANGLE_LINE' | 'ARC' | 'REFERENCE_ALIGN') => {
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
 const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(true);
  const [inspectorCollapsed, setInspectorCollapsed] = useState(true);
  const [autoPanActive, setAutoPanActive] = useState(false);
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
 const resolvedActive=useMemo(()=>activeSource ? resolveArtboardBindings(activeSource, dataContext) : undefined, [activeSource, dataContext]);
 const [dynamicProcessedActive,setDynamicProcessedActive]=useState<Artboard|undefined>(undefined);
 useEffect(()=>{
   if(!resolvedActive){setDynamicProcessedActive(undefined);return;}
   const controller=new AbortController();
   setDynamicProcessedActive(undefined);
   void processDynamicBackgroundRemovalArtboard(resolvedActive,template.sharedAssets,controller.signal).then(next=>{if(!controller.signal.aborted)setDynamicProcessedActive(next);}).catch(error=>{if(error?.name!=='AbortError')setStatus(`Dynamic background removal preview warning: ${error instanceof Error?error.message:'Unable to process image.'}`);});
   return()=>controller.abort();
 },[resolvedActive,template.sharedAssets]);
 const active=dynamicProcessedActive??resolvedActive;
 const packagingPanels=useMemo(()=>activeSource?packagingPanelsFromArtboard(activeSource):[],[activeSource]);
 const activePackagingPanel=useMemo(()=>packagingPanels.find(panel=>panel.id===activePackagingPanelId)??null,[packagingPanels,activePackagingPanelId]);
 const focusedPackagingPanel=useMemo(()=>packagingPanels.find(panel=>panel.id===focusedPackagingPanelId)??null,[packagingPanels,focusedPackagingPanelId]);
 const packagingIssues=useMemo(()=>activeSource?validatePackagingArtwork(activeSource,packagingPanels):[],[activeSource,packagingPanels]);
 const packagingPreflight=useMemo(()=>activeSource?runPackagingPreflight(activeSource,packagingPanels):null,[activeSource,packagingPanels]);
 const inspectedPackagingPanel=focusedPackagingPanel??activePackagingPanel;
 const inspectedPackagingArtworkIds=useMemo(()=>activeSource&&inspectedPackagingPanel?selectPackagingPanelArtworkIds(activeSource,inspectedPackagingPanel.id):[],[activeSource,inspectedPackagingPanel]);
 useEffect(()=>{if(activePackagingPanelId&&!packagingPanels.some(panel=>panel.id===activePackagingPanelId))setActivePackagingPanelId(null);if(focusedPackagingPanelId&&!packagingPanels.some(panel=>panel.id===focusedPackagingPanelId))setFocusedPackagingPanelId(null);if(!packagingPanels.length)setPackagingPanelMode(false);},[activeSource?.id,packagingPanels,activePackagingPanelId,focusedPackagingPanelId]);
 useEffect(()=>{const onKey=(event:KeyboardEvent)=>{if(event.key==='Escape'&&focusedPackagingPanelId){setFocusedPackagingPanelId(null);setStatus('Panel focus exited');}};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey);},[focusedPackagingPanelId]);
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
  const uploadedFonts=useMemo(()=>userAssets.filter(isFontAsset),[userAssets]);
  useEffect(()=>{window.localStorage.setItem('document-tool.card-font-favorites.v1',JSON.stringify(fontFavorites));},[fontFavorites]);
  useEffect(()=>{window.localStorage.setItem('document-tool.card-font-recent.v1',JSON.stringify(recentFonts));},[recentFonts]);
  useEffect(()=>{let cancelled=false;const loaded:string[]=[];(async()=>{for(const asset of uploadedFonts){const family=String(asset.metadata.fontFamily||asset.name);try{const face=new FontFace(family,`url(${asset.source})`);await face.load();if(cancelled)return;document.fonts.add(face);loaded.push(family);}catch{}}if(!cancelled)setRegisteredFontFamilies(Array.from(new Set(loaded)));})();return()=>{cancelled=true};},[uploadedFonts]);
  const markFontRecent=(family:string)=>{const clean=family.trim();if(!clean)return;setRecentFonts(current=>[clean,...current.filter(item=>item!==clean)].slice(0,10));};
  const toggleFontFavorite=(family:string)=>setFontFavorites(current=>current.includes(family)?current.filter(item=>item!==family):[family,...current]);
  const uploadFontFiles=async(files:FileList|File[])=>{const list=Array.from(files);if(!list.length)return;let added=0,duplicates=0;for(const file of list){try{if(!isSupportedFontFile(file)){setFontManagerStatus(`${file.name}: unsupported font type.`);continue;}if(file.size>5*1024*1024){setFontManagerStatus(`${file.name}: exceeds 5 MB font limit.`);continue;}const family=inferFontFamilyFromFilename(file.name);const duplicate=userAssets.some(asset=>isFontAsset(asset)&&(asset.metadata.originalFileName===file.name||asset.metadata.fontFamily===family));if(duplicate){duplicates++;continue;}const now=new Date().toISOString();const item:UserAssetLibraryItem={id:id('font-asset'),name:family,kind:'OTHER',sourceType:'DATA_URL',source:await readAsDataUrl(file),mimeType:fontMimeType(file.name,file.type),metadata:{userLibrary:true,createdAt:now,updatedAt:now,userUploaded:true,fontAsset:true,fontFamily:family,fontFormat:file.name.split('.').pop()?.toUpperCase(),originalFileName:file.name,fileSize:file.size,category:'FONT'}};await assetRepo.save(item);added++;}catch(e){setFontManagerStatus(e instanceof Error?`${file.name}: ${e.message}`:`${file.name}: unable to add font.`);}}if(added)setUserAssets(await assetRepo.list());setFontManagerStatus(`${added} font${added===1?'':'s'} added${duplicates?` · ${duplicates} duplicate${duplicates===1?'':'s'} skipped`:''}`);};
  const deleteFontAsset=async(asset:FontLibraryAsset)=>{if(!window.confirm(`Delete “${asset.metadata.fontFamily}” from My Fonts? Existing designs keep the family name but may fall back if the font is unavailable.`))return;try{await assetRepo.delete(asset.id);setUserAssets(await assetRepo.list());setFontManagerStatus('Font removed from My Fonts');}catch(e){setFontManagerStatus(e instanceof Error?e.message:'Unable to remove font');}};
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

  // Selection-derived tool capabilities must be initialized before the global
  // keyboard effect below reads them in its dependency array. Keeping these
  // declarations here avoids a render-time temporal-dead-zone crash.
  const selectedEls = active ? active.elements.filter(e => selection.elementIds.includes(e.id)) : [];
  const selectedPaths = selectedEls.filter(e => e.type === 'PATH') as PathDesignElement[];
  const canEditPath = selectedPaths.length === 1 && selectedEls.length === 1;
  const canScissors = canEditPath;
  const canTrim = active?.elements.some(element => element.visible && !element.locked && !element.runtimeHidden && (element.type === 'PATH' || element.type === 'SHAPE')) ?? false;
  const canJoin = selectedPaths.length === 2 && selectedEls.length === 2 && !selectedPaths[0]!.geometry.closed && !selectedPaths[1]!.geometry.closed;
  const canClose = selectedPaths.length === 1 && selectedEls.length === 1 && !selectedPaths[0]!.geometry.closed && getPathEndpoints(selectedPaths[0]!.geometry).length === 2;

  useEffect(()=>{if(active)setSelection(s=>sanitizeSelection(s,active));},[active]);
  useEffect(()=>{
    const kd=(e:KeyboardEvent)=>{
      if(e.code==='Space'&&!isForm(e.target)){setSpace(true);e.preventDefault();return;}
      if(!active||isForm(e.target))return;
      if(e.key==='Tab'&&!e.ctrlKey&&!e.metaKey&&!e.altKey){
        e.preventDefault();
        const showPanels=leftPanelCollapsed&&inspectorCollapsed;
        setLeftPanelCollapsed(!showPanels);
        setInspectorCollapsed(!showPanels);
        setStatus(showPanels?'Workspace panels shown':'Canvas workspace expanded');
        return;
      }
      if(e.key==='F8'){e.preventDefault();setOrthoTrackingEnabled(v=>!v);setStatus('Ortho tracking toggled');return;}
      if(e.key==='F10'){e.preventDefault();setPolarTrackingEnabled(v=>!v);setStatus('Polar tracking toggled');return;}

      const command=e.ctrlKey||e.metaKey;
      if(command&&e.key.toLowerCase()==='z'){e.preventDefault();if(e.shiftKey)redo();else undo();return;}
      if(command&&e.key.toLowerCase()==='y'){e.preventDefault();redo();return;}
      if(command&&e.key.toLowerCase()==='c'){e.preventDefault();copySelected();return;}
      if(command&&e.key.toLowerCase()==='v'){e.preventDefault();pasteClipboard();return;}
      if(command&&e.key.toLowerCase()==='d'&&selection.elementIds.length){e.preventDefault();if(e.shiftKey)duplicateSelectedInPlace();else duplicateSelected();return;}
      if(command&&e.key.toLowerCase()==='g'){e.preventDefault();if(e.shiftKey)ungroupSelected();else groupSelected();return;}
      if(command&&e.key.toLowerCase()==='a'){e.preventDefault();setSelection(selectAllSelectable(active));return;}

      const shapeShortcut=resolveDesignerShapeShortcut(e);
      if(shapeShortcut){
        e.preventDefault();
        endHistoryTransaction();
        setDrawShapeType(shapeShortcut);
        setInteractionMode('DRAW_SHAPE');
        setStatus(`${shapeLabel(shapeShortcut)} — draw`);
        return;
      }

      const utilityShortcut=resolveDesignerUtilityShortcut(e);
      if(utilityShortcut){
        e.preventDefault();
        endHistoryTransaction();
        switch(utilityShortcut){
          case 'SELECT': setInteractionMode('SELECT'); setStatus('Select tool'); break;
          case 'LINE': setDrawShapeType('LINE'); setInteractionMode('DRAW_SHAPE'); setStatus('LINE — Specify first point'); break;
          case 'POLYLINE': setInteractionMode('FLEXIBLE_LINE'); setStatus('POLYLINE — Specify first point'); break;
          case 'XLINE': setInteractionMode('XLINE'); setStatus('XLINE — Specify first point'); break;
          case 'RAY': setInteractionMode('RAY'); setStatus('RAY — Specify origin point'); break;
          case 'ANGLE_LINE': setInteractionMode('ANGLE_LINE'); setStatus('ANGLE LINE — Specify start point'); break;
          case 'ARC': setInteractionMode('ARC'); setStatus('ARC — Specify start point'); break;
          case 'PEN': setInteractionMode('PEN'); setStatus('Pen — Specify first point'); break;
          case 'EDIT_PATH': if(canEditPath){setInteractionMode('EDIT_PATH');setStatus('Edit Path');}else setStatus('Edit Path requires exactly one PATH selection'); break;
          case 'SCISSORS': if(canScissors){setInteractionMode('SCISSORS');setStatus('Scissors');}else setStatus('Scissors requires exactly one PATH selection'); break;
          case 'SPLIT': setInteractionMode('SPLIT'); setStatus('Split — Specify first boundary point'); break;
          case 'TRIMMER': if(canTrim){setInteractionMode('TRIMMER');setStatus('Erase Segment');}else setStatus('No trimmable geometry available'); break;
          case 'ERASER': setInteractionMode('ERASER'); setStatus('Freeform Eraser'); break;
          case 'FILL_BUCKET': setInteractionMode('FILL_BUCKET'); setStatus('Fill Bucket'); break;
          case 'JOIN_PATH': if(canJoin){onJoinPaths();setStatus('Paths joined');}else setStatus('Join Path requires exactly two open PATHs'); break;
          case 'CLOSE_PATH': if(canClose){onClosePath();setStatus('Path closed');}else setStatus('Close Path requires exactly one open PATH'); break;
        }
        return;
      }

      if(e.key==='Enter'){
        if(interactionMode==='FLEXIBLE_LINE'||interactionMode==='PEN'){
          endHistoryTransaction();setSelection(emptySelection(active.id));setPathSelectedNodeIds([]);setStatus(`${interactionMode==='PEN'?'Pen':'Polyline'} — Specify first point`);return;
        }
        if(interactionMode==='EDIT_PATH'){endHistoryTransaction();setInteractionMode('SELECT');setPathSelectedNodeIds([]);return;}
      }
      if(e.key==='Escape'){
        const drawMode=interactionMode==='FLEXIBLE_LINE'||interactionMode==='PEN'||interactionMode==='DRAW_SHAPE'||interactionMode==='SPLIT'||interactionMode==='MIRROR_LINE'||interactionMode==='XLINE'||interactionMode==='RAY'||interactionMode==='ANGLE_LINE'||interactionMode==='ARC'||interactionMode==='REFERENCE_ALIGN';
        if(drawMode){endHistoryTransaction();setInteractionMode('SELECT');setPathSelectedNodeIds([]);setStatus('Select tool');}
        else if(interactionMode==='EDIT_PATH'||interactionMode==='SCISSORS'||interactionMode==='TRIMMER'||interactionMode==='ERASER'||interactionMode==='FILL_BUCKET'){endHistoryTransaction();setInteractionMode('SELECT');setPathSelectedNodeIds([]);}
        else{setSelection(emptySelection(active.id));}
        return;
      }
      if((e.key==='Delete'||e.key==='Backspace')&&selection.elementIds.length){
        e.preventDefault();
        if(interactionMode==='TRIMMER')return;
        if(interactionMode==='EDIT_PATH'&&pathSelectedNodeIds.length>0){
          mutate(t=>{const art=t.artboards.find(a=>a.id===active.id);if(!art)return t;const el=art.elements.find(el=>el.id===selection.primaryElementId) as PathDesignElement;if(!el||el.type!=='PATH')return t;const nextGeo=deletePathPointsSafely(el.geometry,pathSelectedNodeIds);return {...t,artboards:t.artboards.map(a=>a.id===active.id?{...a,elements:a.elements.map(e=>e.id===el.id?{...e,geometry:nextGeo}:e)}:a)};});
          setPathSelectedNodeIds([]);setStatus('Node deleted');
        }else{mutate(t=>deleteDesignElements(t,active.id,selection.elementIds));setSelection(emptySelection(active.id));setStatus('Element deleted');}
        return;
      }
      const dir=e.key==='ArrowLeft'?'LEFT':e.key==='ArrowRight'?'RIGHT':e.key==='ArrowUp'?'UP':e.key==='ArrowDown'?'DOWN':null;
      if(dir&&selection.elementIds.length){
        e.preventDefault();
        if(interactionMode==='EDIT_PATH'&&pathSelectedNodeIds.length>0){
          mutate(t=>{const art=t.artboards.find(a=>a.id===active.id);if(!art)return t;const el=art.elements.find(el=>el.id===selection.primaryElementId) as PathDesignElement;if(!el||el.type!=='PATH')return t;const amt=e.shiftKey?5:1;const dx=dir==='LEFT'?-amt:dir==='RIGHT'?amt:0,dy=dir==='UP'?-amt:dir==='DOWN'?amt:0;const nextGeo={...el.geometry,points:el.geometry.points.map(p=>pathSelectedNodeIds.includes(p.id)?{...p,x:p.x+dx,y:p.y+dy,inHandle:p.inHandle?{x:p.inHandle.x+dx,y:p.inHandle.y+dy}:undefined,outHandle:p.outHandle?{x:p.outHandle.x+dx,y:p.outHandle.y+dy}:undefined}:p)};return {...t,artboards:t.artboards.map(a=>a.id===active.id?{...a,elements:a.elements.map(e=>e.id===el.id?{...e,geometry:nextGeo}:e)}:a)};});
          setStatus('Nodes nudged');
        }else{mutate(t=>nudgeElements(t,active.id,selection.elementIds,dir,e.shiftKey));setStatus('Unsaved changes');}
      }
    };
    const ku=(e:KeyboardEvent)=>{if(e.code==='Space')setSpace(false)};
    window.addEventListener('keydown',kd);window.addEventListener('keyup',ku);
    return()=>{window.removeEventListener('keydown',kd);window.removeEventListener('keyup',ku)};
  },[active,selection.elementIds,historyVersion,interactionMode,pathSelectedNodeIds,canEditPath,canScissors,canTrim,canJoin,canClose,leftPanelCollapsed,inspectorCollapsed]);
 const refreshSavedTemplates=async()=>{try{const list=await repo.list();setSavedTemplates(list);setTemplateLibraryStatus('');return list;}catch(e){setTemplateLibraryStatus(e instanceof Error?e.message:'Unable to load saved templates.');return[];}};
 const save=async()=>{try{await repo.save(template);await repo.setActiveId(template.id);await refreshSavedTemplates();setDirty(false);setStatus('Saved locally');setTemplateLibraryStatus('Template saved locally.');}catch(e){setStatus(e instanceof Error?e.message:'Save failed');}};
 const newDesign=()=>{if(dirty&&!window.confirm('Discard unsaved Card Designer changes?'))return;const f=fresh();setTemplate(f);templateRef.current=f;resetHistory(f);setActiveId(f.artboards[0]!.id);setSelection(emptySelection(f.artboards[0]!.id));setRegroupHistory(null);setZoom(100);setDirty(true);setStatus('New card design');};
 const openSavedTemplate=async(templateId:string)=>{if(templateId===template.id)return;if(dirty&&!window.confirm('Discard unsaved Card Designer changes and open this saved template?'))return;try{const stored=await repo.getById(templateId);if(!stored){await refreshSavedTemplates();setTemplateLibraryStatus('Saved template was not found.');return;}await repo.setActiveId(stored.id);setTemplate(stored);templateRef.current=stored;resetHistory(stored);const aid=[...stored.artboards].sort((a,b)=>a.order-b.order)[0]?.id??'';setActiveId(aid);setSelectedArtboardIds([]);setSelection(emptySelection(aid));setRegroupHistory(null);setZoom(100);setDirty(false);setStatus(`Opened ${stored.name}`);setTemplateLibraryStatus('');}catch(e){setTemplateLibraryStatus(e instanceof Error?e.message:'Unable to open saved template.');}};
 const deleteSavedTemplate=async(saved:DesignTemplate)=>{if(!window.confirm(`Delete “${saved.name}” from saved templates?`))return;try{await repo.delete(saved.id);const list=await refreshSavedTemplates();if(saved.id===template.id){const next=list[0]??fresh();if(list[0])await repo.setActiveId(next.id);else await repo.setActiveId(null);setTemplate(next);templateRef.current=next;resetHistory(next);const aid=[...next.artboards].sort((a,b)=>a.order-b.order)[0]?.id??'';setActiveId(aid);setSelectedArtboardIds([]);setSelection(emptySelection(aid));setDirty(!list[0]);}setTemplateLibraryStatus('Saved template deleted.');}catch(e){setTemplateLibraryStatus(e instanceof Error?e.message:'Unable to delete saved template.');}};
 const loadStarterTemplate=(starterId:(typeof DESIGN_STARTER_TEMPLATES)[number]['id'])=>{const starter=DESIGN_STARTER_TEMPLATES.find(x=>x.id===starterId);if(!starter)return;if(dirty&&!window.confirm(`Replace current unsaved design with ${starter.name}?`))return;const next=starter.create(id);setTemplate(next);templateRef.current=next;resetHistory(next);setActiveId(next.artboards[0]!.id);setSelection(emptySelection(next.artboards[0]!.id));setZoom(100);setDirty(true);setStatus(`${starter.name} template loaded`);};
 const loadCorporateIdTemplate=()=>loadStarterTemplate('corporate-employee-id-cr80');
 const panelPlacement=(widthMm:number,heightMm:number)=>focusedPackagingPanel?{xMm:focusedPackagingPanel.xMm+Math.max(0,(focusedPackagingPanel.widthMm-widthMm)/2),yMm:focusedPackagingPanel.yMm+Math.max(0,(focusedPackagingPanel.heightMm-heightMm)/2)}:{xMm:Math.max(2,((active?.widthMm??widthMm)-widthMm)/2),yMm:Math.max(2,((active?.heightMm??heightMm)-heightMm)/2)};
 const addPanelAwareDesignElement=(source:DesignTemplate,artboardId:string,element:DesignElement)=>{let prepared=element;if(focusedPackagingPanel)prepared=prepareElementForPackagingPanel(element,focusedPackagingPanel);let next=addDesignElement(source,artboardId,prepared);if(focusedPackagingPanel)next=refreshPackagingArtworkIndex(next,artboardId,packagingPanels);return next;};

 const insertDecoration=(assetId:(typeof DECORATIVE_ASSETS)[number]['id'])=>{if(!active)return;const def=DECORATIVE_ASSETS.find(a=>a.id===assetId);if(!def)return;const existing=template.sharedAssets.find(a=>a.metadata?.decorativeAssetId===def.id);const generated=decorativeAssetReference(def);const finalAsset=existing??{...generated,id:id(`asset-${def.id}`)};const placed=panelPlacement(def.defaultWidthMm,def.defaultHeightMm);const element=def.assetKind==='IMAGE'?createImageElement(finalAsset.id,{id:id('image-decoration'),name:def.name,xMm:placed.xMm,yMm:placed.yMm,widthMm:def.defaultWidthMm,heightMm:def.defaultHeightMm,zIndex:nextElementZIndex(template,active.id)}):createSvgElement(finalAsset.id,{id:id('svg-decoration'),name:def.name,xMm:placed.xMm,yMm:placed.yMm,widthMm:def.defaultWidthMm,heightMm:def.defaultHeightMm,zIndex:nextElementZIndex(template,active.id)});mutate(t=>addPanelAwareDesignElement(existing?t:addAssetReference(t,finalAsset),active.id,element));setSelection(selectOnly(active.id,element.id));setStatus(`${def.name} added`);};
 const insertUserAsset=(libraryAsset:UserAssetLibraryItem)=>{if(!active)return;const existing=template.sharedAssets.find(a=>a.metadata?.userLibraryAssetId===libraryAsset.id);const finalAsset:AssetReference=existing??{...libraryAsset,id:id('asset-user'),metadata:{...libraryAsset.metadata,userLibraryAssetId:libraryAsset.id}};const ratio=(libraryAsset.widthPx??1)/(libraryAsset.heightPx??1);const defaultWidth=Math.min(45,Math.max(15,active.widthMm*.45));const defaultHeight=libraryAsset.kind==='SVG'?Math.min(35,defaultWidth):Math.min(active.heightMm*.6,defaultWidth/(ratio||1));const placed=panelPlacement(defaultWidth,defaultHeight);const common={name:libraryAsset.name,xMm:placed.xMm,yMm:placed.yMm,widthMm:defaultWidth,heightMm:defaultHeight,zIndex:nextElementZIndex(template,active.id)};const element=libraryAsset.kind==='SVG'?createSvgElement(finalAsset.id,{id:id('svg-user-asset'),...common}):createImageElement(finalAsset.id,{id:id('image-user-asset'),...common});mutate(t=>addPanelAwareDesignElement(existing?t:addAssetReference(t,finalAsset),active.id,element));setSelection(selectOnly(active.id,element.id));setStatus(`${libraryAsset.name} added from My Assets`);};
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
 const zoomAtPointer=(event:React.WheelEvent<HTMLDivElement>)=>{if(event.shiftKey&&!event.ctrlKey&&!event.metaKey)return;event.preventDefault();const view=viewport.current;if(!view)return;const rect=view.getBoundingClientRect(),x=event.clientX-rect.left,y=event.clientY-rect.top,previous=zoom,factor=event.deltaY<0?1.14:1/1.14,next=clamp(Math.round(previous*factor),MIN_ZOOM,MAX_ZOOM);if(next===previous)return;const contentX=view.scrollLeft+x,contentY=view.scrollTop+y;setZoom(next);requestAnimationFrame(()=>{const ratio=next/previous;view.scrollLeft=contentX*ratio-x;view.scrollTop=contentY*ratio-y;});};
 const selectInserted=(elementId:string)=>{if(!active)return;setSelection(selectOnly(active.id,elementId));setStatus('Element added');};

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

 const insertText=()=>{if(!active)return;const eid=id('text'),placed=panelPlacement(45,12);mutate(t=>addPanelAwareDesignElement(t,active.id,createTextElement({id:eid,name:'Text',xMm:placed.xMm,yMm:placed.yMm,zIndex:nextElementZIndex(t,active.id)})));selectInserted(eid);};
 const insertShape=(shape:DesignShapeKind='RECTANGLE')=>{if(!active)return;const eid=id('shape'),placed=panelPlacement(28,18);mutate(t=>addPanelAwareDesignElement(t,active.id,createShapeElement(shape,{id:eid,xMm:placed.xMm,yMm:placed.yMm,zIndex:nextElementZIndex(t,active.id)})));selectInserted(eid);};
 const insertQr=()=>{if(!active)return;const eid=id('qr'),placed=panelPlacement(20,20);mutate(t=>addPanelAwareDesignElement(t,active.id,createQrElement({id:eid,name:'QR Code',xMm:placed.xMm,yMm:placed.yMm,zIndex:nextElementZIndex(t,active.id)})));selectInserted(eid);};
 const insertBarcode=()=>{if(!active)return;const eid=id('barcode'),placed=panelPlacement(35,15);mutate(t=>addPanelAwareDesignElement(t,active.id,createBarcodeElement({id:eid,name:'Barcode',xMm:placed.xMm,yMm:placed.yMm,zIndex:nextElementZIndex(t,active.id)})));selectInserted(eid);};
 const groupSelected=()=>{if(!active||selection.elementIds.length<2)return;const gid=id('group');mutate(t=>groupElements(t,active.id,selection.elementIds,gid,`Group ${active.groups.length+1}`));setSelection({...selection,elementIds:expandElementIdsToGroups({...active,groups:[...active.groups,{id:gid,name:`Group ${active.groups.length+1}`,elementIds:selection.elementIds}],elements:active.elements.map(e=>selection.elementIds.includes(e.id)?{...e,groupId:gid}:e)},selection.elementIds)});setStatus('Elements grouped');};
 const ungroupSelected=()=>{if(!active)return;const groups=[...new Set(selection.elementIds.map(eid=>groupForElement(active,eid)?.id).filter(Boolean) as string[])].map(gid=>active.groups.find(g=>g.id===gid)).filter(Boolean) as Artboard['groups'];if(!groups.length)return;setRegroupHistory({artboardId:active.id,groups:groups.map(g=>({id:g.id,name:g.name,elementIds:[...g.elementIds],visible:g.visible??true,locked:g.locked??false,parentGroupId:g.parentGroupId}))});mutate(t=>groups.reduce((acc,g)=>ungroupElements(acc,active.id,g.id),t));setStatus(`${groups.length} group${groups.length===1?'':'s'} ungrouped · Regroup available`);};
 const canRegroup=Boolean(active&&regroupHistory?.artboardId===active.id&&regroupHistory.groups.length&&regroupHistory.groups.every(g=>g.elementIds.every(eid=>{const element=active.elements.find(e=>e.id===eid);return Boolean(element&&!element.groupId);})));
 const regroupSelected=()=>{if(!active||!regroupHistory||regroupHistory.artboardId!==active.id||!canRegroup)return;const ids=regroupHistory.groups.flatMap(g=>g.elementIds);mutate(t=>restoreGroups(t,active.id,regroupHistory.groups));setSelection({artboardId:active.id,elementIds:ids,primaryElementId:ids.length?ids[ids.length-1]:undefined});setRegroupHistory(null);setStatus('Previous group structure restored');};
 const duplicateSelected=()=>{if(!active||!selection.elementIds.length)return;let newIds:string[]=[];mutate(t=>{const r=duplicateDesignElements(t,active.id,expandElementIdsToGroups(active,selection.elementIds),()=>id('element-copy'));newIds=r.elementIds;return r.template;});setSelection({artboardId:active.id,elementIds:newIds,primaryElementId:newIds.length > 0 ? newIds[newIds.length - 1] : undefined});setStatus('Selection duplicated');};
 const duplicateSelectedInPlace=()=>{if(!active||!selection.elementIds.length)return;let newIds:string[]=[];mutate(t=>{const r=duplicateDesignElements(t,active.id,expandElementIdsToGroups(active,selection.elementIds),()=>id('element-copy'),{xMm:0,yMm:0});newIds=r.elementIds;return r.template;});setSelection({artboardId:active.id,elementIds:newIds,primaryElementId:newIds.length>0?newIds[newIds.length-1]:undefined});setStatus('Selection duplicated in place');};
 const uploadImage=async(file:File)=>{if(!active)return;if(!file.type.startsWith('image/')){setStatus('Select a supported image file.');return;}try{const dataUrl=await readAsDataUrl(file);const dims=await readImageDimensions(dataUrl);const assetId=id('asset'),elementId=id('image');const ratio=dims.widthPx>0&&dims.heightPx>0?dims.widthPx/dims.heightPx:1.4;const width=Math.min(40,Math.max(15,active.widthMm*.45)),height=Math.min(active.heightMm*.6,width/ratio);mutate(t=>{let next=addAssetReference(t,{id:assetId,name:file.name,kind:'IMAGE',sourceType:'DATA_URL',source:dataUrl,mimeType:file.type,widthPx:dims.widthPx,heightPx:dims.heightPx});const placed=panelPlacement(width,height);next=addPanelAwareDesignElement(next,active.id,createImageElement(assetId,{id:elementId,name:file.name,xMm:placed.xMm,yMm:placed.yMm,widthMm:width,heightMm:height,zIndex:nextElementZIndex(next,active.id)}));return next;});selectInserted(elementId);}catch(e){setStatus(e instanceof Error?e.message:'Image upload failed');}};

  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'PDF'|'PNG'|'JPEG'>('PDF');
  const [exportTargetMode, setExportTargetMode] = useState<'CURRENT'|'SELECTED'|'ALL'>('ALL');
  const [exportIncludeBleed, setExportIncludeBleed] = useState(false);
  const [exportIncludeCropMarks, setExportIncludeCropMarks] = useState(false);
  const [exportDpi, setExportDpi] = useState(300);
  const [exportTransparent, setExportTransparent] = useState(false);
  const [exportJpegQuality, setExportJpegQuality] = useState(90);
  const [packagingExportMode,setPackagingExportMode]=useState<PackagingExportMode>('DIELINE_PROOF');

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
            packagingMode: packagingExportMode,
          };
          const processedResolved=await processDynamicBackgroundRemovalArtboard(resolved,template.sharedAssets);
          if(cancelToken.cancelled)break;
          const resolvedForExport=prepareArtboardForCardExport(processedResolved,cardRequest);

          // Memory validation before render
          const memError = validateExportMemory(cardRequest, resolvedForExport.widthMm, resolvedForExport.heightMm);
          if (memError) throw new Error(memError);

          // Render via orchestrator (reuse existing infrastructure)
          setExportRasterTargets([resolvedForExport]);
          await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); // Wait for portal render
          
          if (isCombinedPdf && pdfAccumulator && rasterizer) {
            const reqDpi = exportDpi || 300;
            const rasterResult = await rasterizer.rasterizePageAsJpeg(resolvedForExport.id, reqDpi);
            const wMm = resolvedForExport.widthMm + (exportIncludeBleed ? 6 : 0);
            const hMm = resolvedForExport.heightMm + (exportIncludeBleed ? 6 : 0);
            pdfAccumulator.addPage(rasterResult, wMm, hMm, i);
            succeeded++;
          } else {
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

            const files = await generateExportFiles([resolvedForExport], cardRequest, exportReq, host, cancelToken);
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
        transparentBackground: exportTransparent,
        packagingMode: packagingExportMode
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

      const targets:Artboard[] = [];
      for(const sourceTarget of sourceTargets){
        const resolved=resolveArtboardBindings(sourceTarget,dataContext);
        const processed=await processDynamicBackgroundRemovalArtboard(resolved,template.sharedAssets);
        targets.push(prepareArtboardForCardExport(processed,request));
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
  useEffect(()=>{if(primary?.type==='PATH'&&primary.metadata?.faceGeneration==='AUTO_SECTION'){setActiveInspectorSection('APPEARANCE');setInspectorCollapsed(false);}},[primary?.id]);
  const toolbarMode = getDesignerToolbarMode(selected.map(e => e.type), selected.length);
  const showMirrorGuide=(axis:'HORIZONTAL'|'VERTICAL')=>{setMirrorGuideAxis(axis);if(mirrorGuideTimerRef.current!==null)window.clearTimeout(mirrorGuideTimerRef.current);mirrorGuideTimerRef.current=window.setTimeout(()=>setMirrorGuideAxis(null),1100);};
  const fontManagerValue:FontManagerContextValue={uploadedFonts,favorites:fontFavorites,recent:recentFonts,registered:registeredFontFamilies,status:fontManagerStatus,uploadFonts:uploadFontFiles,deleteFont:deleteFontAsset,toggleFavorite:toggleFontFavorite,markRecent:markFontRecent};
  return (
    <FontManagerContext.Provider value={fontManagerValue}><DesignerShell
      header={
        <DesignerHeader
          title={template.name}
          onTitleChange={newTitle => mutate(t => ({ ...t, name: newTitle }))}
          statusLabel="Draft"
          canUndo={historyRef.current.past.length > 0}
          canRedo={historyRef.current.future.length > 0}
          canCopy={selection.elementIds.length > 0}
          canPaste={!!clipboardRef.current}
          onBack={onBack}
          onUndo={undo}
          onRedo={redo}
          onCopy={copySelected}
          onPaste={pasteClipboard}
          onNew={newDesign}
          onTemplateAction={loadCorporateIdTemplate}
          onShortcuts={() => setShortcutsOpen(true)}
          onSave={save}
          onExport={() => setExportDialogOpen(true)}
        />
      }
      toolbar={
        <DesignerContextToolbar
          mode={toolbarMode}
          sourceArtboard={activeSource || active}
          sourceElements={selected.map(e => (activeSource?.elements || []).find(se => se.id === e.id) || e)}
          primaryElementId={selection.primaryElementId}
          mutate={mutate}
          onGroupSelected={groupSelected}
          onUngroupSelected={ungroupSelected}
          pathEditMode={{active: interactionMode === 'EDIT_PATH', selectedNodeIds: pathSelectedNodeIds}}
          interactionMode={interactionMode}
          setInteractionMode={setInteractionMode}
          pathSelectedSegmentIds={pathSelectedSegmentIds}
          setPathSelectedSegmentIds={setPathSelectedSegmentIds}
          setPathSelectedNodeIds={setPathSelectedNodeIds}
          onMirrorInvoked={showMirrorGuide}
          onReferenceMirrorRequested={mode=>{setReferenceMirrorMode(mode);setInteractionMode('MIRROR_LINE');setStatus(`Mirror by Line (${mode === 'COPY' ? 'Copy' : 'Move'}) — specify first axis point`);}}
          onReferenceAlignRequested={()=>{setInteractionMode('REFERENCE_ALIGN');setStatus('Align Edge — click a straight edge on the selected/target shape, then click Ray/XLINE/Line reference');}}
          pathSymmetryMode={pathSymmetryMode}
          setPathSymmetryMode={setPathSymmetryMode}
          onReplaceSelection={elementIds=>setSelection({artboardId:active.id,elementIds,primaryElementId:elementIds[0]})}
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
            fillBucketType={fillBucketType}
            fillBucketColor={fillBucketColor}
            onFillBucketTypeChange={setFillBucketType}
            onFillBucketColorChange={setFillBucketColor}
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
            <details className="card-library-section card-user-asset-library" open><summary><span>My Assets</span><small>{userAssets.filter(asset=>!isFontAsset(asset)).length} saved</small></summary><div className="card-library-body"><div className="card-user-assets-toolbar"><button className="primary" onClick={()=>assetLibraryUploadRef.current?.click()}><Upload size={14}/>Add Asset</button><small>PNG, JPG, WebP, GIF, SVG · max 2 MB</small></div><input ref={assetLibraryUploadRef} hidden type="file" multiple accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,.svg" onChange={e=>{if(e.target.files)void addFilesToAssetLibrary(e.target.files);e.currentTarget.value='';}}/>{assetLibraryStatus&&<div className="card-asset-library-status">{assetLibraryStatus}</div>}{userAssets.filter(asset=>!isFontAsset(asset)).length?<div className="card-decorative-grid card-user-assets-grid">{userAssets.filter(asset=>!isFontAsset(asset)).map(asset=><div key={asset.id} className="card-user-asset-card"><button className="card-user-asset-insert" title={`Insert ${asset.name}`} onClick={()=>insertUserAsset(asset)}><span className="card-decorative-thumb"><img src={asset.source} alt=""/></span><span>{asset.name}</span></button><div className="card-user-asset-actions"><button title="Rename asset" onClick={()=>void renameUserAsset(asset)}><PenLine size={12}/></button><button className="danger" title="Delete from library" onClick={()=>void deleteUserAsset(asset)}><Trash2 size={12}/></button></div></div>)}</div>:<div className="card-empty-library"><strong>Your reusable asset library is empty.</strong><span>Add logos, florals, icons or SVG artwork once and reuse them across designs.</span></div>}</div></details>
            <CartonDielineGenerator template={template} artboard={active} mutate={mutate} setSelection={setSelection} setStatus={setStatus}/>
            <SvgDielineImportPanel template={template} artboard={active} selection={selection} mutate={mutate} setSelection={setSelection} setStatus={setStatus}/>
            <StarterTemplateGallery onLoad={loadStarterTemplate}/>
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
          <LayerPanel artboard={active} selection={selection} interactionMode={interactionMode} setSelection={setSelection} mutate={mutate} duplicateSelected={duplicateSelected} groupSelected={groupSelected} ungroupSelected={ungroupSelected} regroupSelected={regroupSelected} canRegroup={canRegroup}/>
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
   <section className="card-canvas-column"><div className="card-canvas-toolbar"><div className="canvas-artboard-name"><MonitorUp size={15}/><strong>{active.name}</strong><span>{active.widthMm} × {active.heightMm} mm</span></div><div className="canvas-zoom-controls"><button className={leftPanelCollapsed&&inspectorCollapsed?'active':''} title="Toggle workspace panels (Tab)" onClick={()=>{const showPanels=leftPanelCollapsed&&inspectorCollapsed;setLeftPanelCollapsed(!showPanels);setInspectorCollapsed(!showPanels);setStatus(showPanels?'Workspace panels shown':'Canvas workspace expanded');}}><Maximize2 size={14}/>Canvas</button><button className={interactionMode === 'PEN' ? 'active' : ''} title="Pen Tool (Draw Paths)" style={{color: interactionMode === 'PEN' ? 'var(--accent-color)' : 'inherit', fontWeight: interactionMode === 'PEN' ? 'bold' : 'normal'}} onClick={() => setInteractionMode(interactionMode === 'PEN' ? 'SELECT' : 'PEN')}>Pen Tool</button><button className={snapEnabled?'active':''} title="Smart snapping. Hold Alt while dragging to temporarily bypass." onClick={()=>setSnapEnabled(v=>!v)}>Snap {snapEnabled?'On':'Off'}</button><label className="card-toolbar-check" title="Show measurement rulers around the artboard."><input type="checkbox" checked={showRulers} onChange={e=>setShowRulers(e.target.checked)}/>Rulers</label><label className="card-toolbar-check" title="Show editor-only grid."><input type="checkbox" checked={showGrid} onChange={e=>setShowGrid(e.target.checked)}/>Grid</label><label className="card-toolbar-check" title="Show conditionally hidden elements as ghosted."><input type="checkbox" checked={showHiddenElements} onChange={e=>setShowHiddenElements(e.target.checked)}/>Hidden</label><label className="card-toolbar-check" title="Snap elements to the configured grid."><input type="checkbox" checked={gridSnapEnabled} onChange={e=>setGridSnapEnabled(e.target.checked)}/>Snap Grid</label><label className="card-toolbar-check" title="Snap elements to custom guides."><input type="checkbox" checked={guideSnapEnabled} onChange={e=>setGuideSnapEnabled(e.target.checked)}/>Snap Guides</label><label className="card-toolbar-check" title="Show editor-only artboard and shape center guides."><input type="checkbox" checked={showSmartCenters} onChange={e=>setShowSmartCenters(e.target.checked)}/>Centers</label><label className="card-toolbar-check" title="CAD polar tracking: snap line-like drawing to configured angle increments."><input type="checkbox" checked={polarTrackingEnabled} onChange={e=>setPolarTrackingEnabled(e.target.checked)}/>Polar</label><label className="card-toolbar-check" title="CAD Ortho: constrain line-like drawing to horizontal or vertical."><input type="checkbox" checked={orthoTrackingEnabled} onChange={e=>setOrthoTrackingEnabled(e.target.checked)}/>Ortho</label><label className="card-toolbar-check" title="Track parallel/perpendicular to nearby element rotations."><input type="checkbox" checked={parallelTrackingEnabled} onChange={e=>setParallelTrackingEnabled(e.target.checked)}/>Par/Perp</label><label className="card-grid-size-control" title="Polar angle increment"><span>Angle</span><input type="number" min="1" max="90" step="1" value={polarIncrementDeg} onChange={e=>{const n=Number(e.target.value);if(Number.isFinite(n)&&n>=1&&n<=90)setPolarIncrementDeg(n);}}/><small>°</small></label><label className="card-grid-size-control" title="Grid spacing"><span>Grid</span><input type="number" min="0.5" step="0.5" value={normalizeDisplayValue(mmToUnit(gridSizeMm,active.displayUnit))} onChange={e=>{const next=unitToMm(Number(e.target.value),active.displayUnit);if(Number.isFinite(next)&&next>=0.5)setGridSizeMm(next);}}/><small>{active.displayUnit==='MM'?'mm':'in'}</small></label><button title="Lock or unlock all guides" className={active.guides.length&&active.guides.every(g=>g.locked)?'active':''} onClick={()=>mutate(t=>setAllGuidesLocked(t,active.id,!active.guides.every(g=>g.locked)))} disabled={!active.guides.length}>{active.guides.length&&active.guides.every(g=>g.locked)?'Unlock Guides':'Lock Guides'}</button><button title="Clear unlocked guides" onClick={()=>mutate(t=>clearGuides(t,active.id))} disabled={!active.guides.some(g=>!g.locked)}>Clear Guides</button>{packagingPanels.length>0&&<><button className={packagingPanelMode?'active':''} title="Packaging panel selection mode" onClick={()=>{setPackagingPanelMode(v=>!v);setInteractionMode('SELECT');setStatus(!packagingPanelMode?'Packaging Panels — click a panel':'Packaging Panels off');}}>Panels</button>{activePackagingPanel&&<button title={`Focus ${activePackagingPanel.name}`} onClick={()=>{setFocusedPackagingPanelId(activePackagingPanel.id);setPackagingPanelMode(false);setSelection(emptySelection(active.id));setStatus(`Focus Panel — ${activePackagingPanel.name}`);}}>Focus {activePackagingPanel.face}</button>}{focusedPackagingPanelId&&<button className="active" title="Exit focused panel (Esc)" onClick={()=>{setFocusedPackagingPanelId(null);setStatus('Panel focus exited');}}>Exit Panel</button>}{focusedPackagingPanel&&<><button disabled={!selection.elementIds.length} title="Assign selected elements to focused panel artwork" onClick={()=>{mutate(t=>assignElementsToPackagingPanel(t,active.id,selection.elementIds,focusedPackagingPanel,packagingPanels));setStatus(`Assigned ${selection.elementIds.length} element${selection.elementIds.length===1?'':'s'} to ${focusedPackagingPanel.name}`);}}>Assign</button><button disabled={!selection.elementIds.length} title="Fit selection inside panel while preserving aspect ratio" onClick={()=>mutate(t=>fitElementsToPackagingPanel(t,active.id,selection.elementIds,focusedPackagingPanel,packagingPanels,'FIT',template.sharedAssets))}>Fit</button><button disabled={!selection.elementIds.length} title="Fill focused panel" onClick={()=>mutate(t=>fitElementsToPackagingPanel(t,active.id,selection.elementIds,focusedPackagingPanel,packagingPanels,'FILL',template.sharedAssets))}>Fill</button><button disabled={!selection.elementIds.length} title="Contain selection inside focused panel" onClick={()=>mutate(t=>fitElementsToPackagingPanel(t,active.id,selection.elementIds,focusedPackagingPanel,packagingPanels,'CONTAIN',template.sharedAssets))}>Contain</button><button disabled={!selection.elementIds.length} title="Extend selected background through required bleed" onClick={()=>mutate(t=>fitElementsToPackagingPanel(t,active.id,selection.elementIds,focusedPackagingPanel,packagingPanels,'BLEED_FILL',template.sharedAssets))}>Bleed Fill</button><label title="Artwork orientation for the focused packaging panel" style={{display:'inline-flex',alignItems:'center',gap:4}}><span>Orient</span><select value={focusedPackagingPanel.artworkRotationDeg} onChange={event=>mutate(t=>setPackagingPanelArtworkOrientation(t,active.id,focusedPackagingPanel.id,Number(event.target.value),packagingPanels))}><option value={0}>0°</option><option value={90}>90°</option><option value={180}>180°</option><option value={270}>270°</option></select></label><button className={packagingIssues.length?'warning':''} title={packagingIssues.map(issue=>issue.message).join('\n')||'No packaging warnings'} onClick={()=>setStatus(packagingIssues.length?packagingIssues.slice(0,3).map(issue=>issue.message).join(' · '):'Packaging checks — no warnings')}>Warnings {packagingIssues.length}</button><button className={packagingPreflight?.errors?'warning':packagingPreflight?.warnings?'warning':''} title="Run packaging preflight" onClick={()=>setPackagingPreflightOpen(true)}>Preflight {packagingPreflight?`${packagingPreflight.errors}E/${packagingPreflight.warnings}W`:''}</button></>}</>}<button className={panMode?'active':''} title="Pan tool — drag canvas with left mouse. Middle mouse and Space+drag always pan." onClick={()=>{const next=!panMode;setPanMode(next);if(next)setInteractionMode('SELECT');setStatus(next?'Pan tool on — drag canvas':'Pan tool off');}}><Hand size={14}/>Pan</button><button title="Zoom out" onClick={()=>setZoom(z=>clamp(Math.round(z/1.25),MIN_ZOOM,MAX_ZOOM))}><Minus size={15}/></button><label title="CAD zoom: mouse wheel zooms around the pointer; middle mouse or Space+drag pans." style={{display:'inline-flex',alignItems:'center',gap:2}}><input aria-label="Canvas zoom percent" type="number" min={MIN_ZOOM} max={MAX_ZOOM} step={5} value={zoom} onChange={e=>{const value=Number(e.target.value);if(Number.isFinite(value))setZoom(clamp(Math.round(value),MIN_ZOOM,MAX_ZOOM));}} style={{width:58}}/><span>%</span></label><button title="Zoom in" onClick={()=>setZoom(z=>clamp(Math.round(z*1.25),MIN_ZOOM,MAX_ZOOM))}><Plus size={15}/></button><button onClick={()=>setZoom(100)}><RotateCcw size={14}/>Actual</button><button onClick={fit}><Maximize2 size={14}/>Fit</button></div></div>
    {recordCount > 0 && <div className="card-record-navigator" role="navigation" aria-label="Record preview navigation" style={{display:'flex',alignItems:'center',gap:'8px',padding:'4px 12px',background:'var(--bg-secondary)',borderBottom:'1px solid var(--border-color)',fontSize:'12px',minHeight:'30px'}}><span style={{color:'var(--text-secondary)',fontWeight:600}}>Preview:</span><button aria-label="Previous record" title="Previous record" disabled={safePreviewIndex<=0||previewContextSource==='MANUAL'} onClick={()=>navigatePreviewRecord(-1)} style={{padding:'2px 8px',minWidth:'28px'}}>‹</button><select aria-label="Jump to record" value={safePreviewIndex} disabled={previewContextSource==='MANUAL'} onChange={e=>setPreviewRecordIndex(Number(e.target.value))} style={{fontSize:'12px',padding:'1px 4px',maxWidth:'140px'}} title="Jump to record"><option value={safePreviewIndex}>{getRecordDisplayLabel(currentPreviewRecord as Record<string,unknown>, safePreviewIndex)}</option>{importedRows.map((_,i)=>i!==safePreviewIndex&&<option key={i} value={i}>{getRecordDisplayLabel(importedRows[i] as Record<string,unknown>,i)}</option>)}</select><span style={{color:'var(--text-secondary)'}}>{safePreviewIndex+1} of {recordCount}</span><button aria-label="Next record" title="Next record" disabled={safePreviewIndex>=recordCount-1||previewContextSource==='MANUAL'} onClick={()=>navigatePreviewRecord(1)} style={{padding:'2px 8px',minWidth:'28px'}}>›</button>{previewContextSource==='MANUAL'&&<span style={{color:'var(--accent-color)',fontSize:'11px'}}>Manual override active</span>}</div>}
    <div ref={viewport} className={`card-canvas-viewport ${(space||panMode||autoPanActive)?'pan-ready':''} ${autoPanActive?'pan-active':''}`} onWheel={zoomAtPointer} onPointerDownCapture={e=>{const target=e.target as HTMLElement;const anyToolDoubleDragPan=e.button===0&&e.detail>=2&&!target.closest('[data-element-id],[data-packaging-panel-id],button,input,select,textarea,[contenteditable="true"]');const wantsPan=e.button===1||((space||panMode)&&e.button===0)||anyToolDoubleDragPan;if(!wantsPan)return;const v=viewport.current;if(!v)return;e.preventDefault();e.stopPropagation();e.currentTarget.setPointerCapture(e.pointerId);pan.current={x:e.clientX,y:e.clientY,left:v.scrollLeft,top:v.scrollTop};if(anyToolDoubleDragPan){setAutoPanActive(true);setStatus(`Temporary pan — ${interactionMode} tool preserved`);}}} onPointerMove={e=>{const v=viewport.current,p=pan.current;if(!v||!p)return;e.preventDefault();v.scrollLeft=p.left-(e.clientX-p.x);v.scrollTop=p.top-(e.clientY-p.y);}} onPointerUp={()=>{pan.current=null;setAutoPanActive(false);}} onPointerCancel={()=>{pan.current=null;setAutoPanActive(false);}}>
      <div className="card-canvas-stage" style={{minWidth:`max(100%, ${active.widthMm*MM_TO_CSS_PX*(zoom/100)+160}px)`,minHeight:`max(100%, ${active.heightMm*MM_TO_CSS_PX*(zoom/100)+160}px)`}}>
       <div className="card-canvas-zoom-frame" data-canvas-zoom-frame style={{width:active.widthMm*MM_TO_CSS_PX*(zoom/100),height:active.heightMm*MM_TO_CSS_PX*(zoom/100)}}>
        <CardArtboardCanvas artboard={active} assets={template.sharedAssets} zoom={zoom} selection={selection} setSelection={setSelection} packagingPanels={packagingPanels} packagingPanelMode={packagingPanelMode} activePackagingPanelId={activePackagingPanelId} setActivePackagingPanelId={setActivePackagingPanelId} focusedPackagingPanelId={focusedPackagingPanelId} setFocusedPackagingPanelId={setFocusedPackagingPanelId} interactionMode={interactionMode} setInteractionMode={setInteractionMode} fillBucketType={fillBucketType} fillBucketColor={fillBucketColor} drawShapeType={drawShapeType} pathSelectedNodeIds={pathSelectedNodeIds} setPathSelectedNodeIds={setPathSelectedNodeIds} pathSelectedSegmentIds={pathSelectedSegmentIds} setPathSelectedSegmentIds={setPathSelectedSegmentIds} mutate={mutateTransient} commitMutate={mutate} beginHistoryTransaction={beginHistoryTransaction} endHistoryTransaction={endHistoryTransaction} snapEnabled={snapEnabled} gridSnapEnabled={gridSnapEnabled} guideSnapEnabled={guideSnapEnabled} showRulers={showRulers} showGrid={showGrid} showHiddenElements={showHiddenElements} gridSizeMm={gridSizeMm} setStatus={setStatus} mirrorGuideAxis={mirrorGuideAxis} showSmartCenters={showSmartCenters} pathSymmetryMode={pathSymmetryMode} referenceMirrorMode={referenceMirrorMode} polarTrackingEnabled={polarTrackingEnabled} orthoTrackingEnabled={orthoTrackingEnabled} parallelTrackingEnabled={parallelTrackingEnabled} polarIncrementDeg={polarIncrementDeg}/>
       </div>
      </div>
      {interactionMode === 'FLEXIBLE_LINE' && <div className="card-micro-hint" style={{position:'absolute',top:'20px',left:'50%',transform:'translateX(-50%)',background:'var(--accent-color)',color:'white',padding:'6px 12px',borderRadius:'16px',fontSize:'12px',display:'flex',alignItems:'center',gap:'6px',pointerEvents:'none',zIndex:1000,boxShadow:'0 2px 8px rgba(0,0,0,0.2)'}}><PenLine size={14}/> POLYLINE — Click vertices · Enter or double-click finishes · Esc selects.</div>}
      {interactionMode === 'PEN' && <div className="card-micro-hint" style={{position:'absolute',top:'20px',left:'50%',transform:'translateX(-50%)',background:'var(--accent-color)',color:'white',padding:'6px 12px',borderRadius:'16px',fontSize:'12px',display:'flex',alignItems:'center',gap:'6px',pointerEvents:'none',zIndex:1000,boxShadow:'0 2px 8px rgba(0,0,0,0.2)'}}><PenLine size={14}/> Click to add point. Click and drag for curves. Enter to finish.</div>}
      {interactionMode === 'REFERENCE_ALIGN' && <div className="card-micro-hint" style={{position:'absolute',top:'20px',left:'50%',transform:'translateX(-50%)',background:'#7e22ce',color:'white',padding:'6px 12px',borderRadius:'16px',fontSize:'12px',display:'flex',alignItems:'center',gap:'6px',pointerEvents:'none',zIndex:1000,boxShadow:'0 2px 8px rgba(0,0,0,0.2)'}}>ALIGN EDGE — Pick target edge → pick Ray/XLINE/Line reference · Esc cancels</div>}
      {interactionMode === 'RAY' && <div className="card-micro-hint" style={{position:'absolute',top:'20px',left:'50%',transform:'translateX(-50%)',background:'var(--accent-color)',color:'white',padding:'6px 12px',borderRadius:'16px',fontSize:'12px',display:'flex',alignItems:'center',gap:'6px',pointerEvents:'none',zIndex:1000,boxShadow:'0 2px 8px rgba(0,0,0,0.2)'}}><PenLine size={14}/> RAY — Click origin, then direction · R shortcut · Esc selects.</div>}
      {interactionMode === 'ANGLE_LINE' && <div className="card-micro-hint" style={{position:'absolute',top:'20px',left:'50%',transform:'translateX(-50%)',background:'var(--accent-color)',color:'white',padding:'6px 12px',borderRadius:'16px',fontSize:'12px',display:'flex',alignItems:'center',gap:'6px',pointerEvents:'none',zIndex:1000,boxShadow:'0 2px 8px rgba(0,0,0,0.2)'}}><PenLine size={14}/> ANGLE LINE — Click start, then use Length/Angle · A shortcut · Esc selects.</div>}
      {interactionMode === 'SCISSORS' && <div className="card-micro-hint" style={{position:'absolute',top:'20px',left:'50%',transform:'translateX(-50%)',background:'var(--accent-color)',color:'white',padding:'6px 12px',borderRadius:'16px',fontSize:'12px',display:'flex',alignItems:'center',gap:'6px',pointerEvents:'none',zIndex:1000,boxShadow:'0 2px 8px rgba(0,0,0,0.2)'}}><Scissors size={14}/> Click a path segment to cut it.</div>}
      {interactionMode === 'SPLIT' && <div className="card-micro-hint" style={{position:'absolute',top:'20px',left:'50%',transform:'translateX(-50%)',background:'var(--accent-color)',color:'white',padding:'6px 12px',borderRadius:'16px',fontSize:'12px',display:'flex',alignItems:'center',gap:'6px',pointerEvents:'none',zIndex:1000,boxShadow:'0 2px 8px rgba(0,0,0,0.2)'}}><Scissors size={14}/> SPLIT — Snap start and end points to a closed shape boundary.</div>}
      {interactionMode === 'TRIMMER' && <div className="card-micro-hint" style={{position:'absolute',top:'20px',left:'50%',transform:'translateX(-50%)',background:'var(--accent-color)',color:'white',padding:'6px 12px',borderRadius:'16px',fontSize:'12px',display:'flex',alignItems:'center',gap:'6px',pointerEvents:'none',zIndex:1000,boxShadow:'0 2px 8px rgba(0,0,0,0.2)'}}><BetweenHorizontalStart size={14}/> ERASE SEGMENT — Select interval or first point · Shift+click for manual range</div>}
      {interactionMode === 'EDIT_PATH' && <div className="card-micro-hint" style={{position:'absolute',top:'20px',left:'50%',transform:'translateX(-50%)',background:'var(--accent-color)',color:'white',padding:'6px 12px',borderRadius:'16px',fontSize:'12px',display:'flex',alignItems:'center',gap:'6px',pointerEvents:'none',zIndex:1000,boxShadow:'0 2px 8px rgba(0,0,0,0.2)'}}><MousePointer2 size={14}/> Drag nodes/handles to adjust. Double-click to exit.</div>}
    </div>
    <footer className="card-canvas-status"><span>{status}</span><span>{selection.elementIds.length?`${selection.elementIds.length} selected · Delete removes · Arrow nudge · Shift+Arrow 5 mm`:'Tab canvas/panels · Double-click + drag empty canvas to pan · Space + drag always pans'}</span></footer>
   </section>
    {(()=>{
      const availableSectionsForSelection = getInspectorSections(primary?.type);
      const effectiveInspectorSection = availableSectionsForSelection.includes(activeInspectorSection) ? activeInspectorSection : 'GENERAL';
      return <InspectorContext.Provider value={effectiveInspectorSection}>
      <div className="dg-designer-inspector-layout">
        <DesignerInspector collapsed={inspectorCollapsed}>
          {inspectedPackagingPanel&&<PackagingPanelInspector panel={inspectedPackagingPanel} artworkCount={inspectedPackagingArtworkIds.length} warningCount={packagingIssues.filter(issue=>issue.panelId===inspectedPackagingPanel.id).length} focused={focusedPackagingPanelId===inspectedPackagingPanel.id} onOrientationChange={(orientation)=>mutate(t=>setPackagingPanelArtworkOrientation(t,active.id,inspectedPackagingPanel.id,orientation,packagingPanels))} onFocus={()=>{setFocusedPackagingPanelId(inspectedPackagingPanel.id);setPackagingPanelMode(false);setSelection(emptySelection(active.id));setStatus(`Focus Panel — ${inspectedPackagingPanel.name}`);}} onExitFocus={()=>{setFocusedPackagingPanelId(null);setStatus('Panel focus exited');}} onSelectArtwork={()=>{const ids=selectPackagingPanelArtworkIds(active,inspectedPackagingPanel.id);setSelection({...emptySelection(active.id),elementIds:ids,primaryElementId:ids[0]});setStatus(`${ids.length} artwork element${ids.length===1?'':'s'} selected for ${inspectedPackagingPanel.name}`);}} onPreflight={()=>setPackagingPreflightOpen(true)}/>}
          {primary&&effectiveInspectorSection==='GENERAL'&&<div className="card-style-actions"><button onClick={copyStyle}>Copy Style</button><button onClick={pasteStyle} disabled={!styleClipboardRef.current}>Paste Style</button><button onClick={resetStyle}>Reset Style</button></div>}
          {selected.length>1?<><BatchOpacityProperties elements={selected} artboard={active} mutate={mutate}/><MultiSelectionProperties elements={selected} primaryElementId={selection.primaryElementId} artboard={active} mutate={mutate} groupSelected={groupSelected} ungroupSelected={ungroupSelected} regroupSelected={regroupSelected} canRegroup={canRegroup}/></>:primary?<ElementProperties element={primary} asset={primary.type==='IMAGE'||primary.type==='SVG'?template.sharedAssets.find(asset=>asset.id===primary.assetId):undefined} assets={template.sharedAssets} artboard={active} mutate={mutate} availableFields={availableFields} datasourceStatus={datasourceStatus}/>:selectedArtboardIds.length>1?<MultiArtboardProperties artboards={template.artboards.filter(a=>selectedArtboardIds.includes(a.id))} mutate={mutate}/>:<><Properties artboard={active} template={template} mutate={mutate} availableFields={availableFields} datasourceStatus={datasourceStatus}/><PrintProperties artboard={active} assets={template.sharedAssets} mutate={mutate}/></>}
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
        {packagingPanels.length>0&&<div style={{border:'1px solid var(--border-color)',borderRadius:6,padding:10,display:'grid',gap:6}}><strong style={{fontSize:13}}>Packaging Output</strong><label>Mode: <select value={packagingExportMode} onChange={e=>setPackagingExportMode(e.target.value as PackagingExportMode)}><option value="CLIENT_PROOF">Artwork Only · Client Proof</option><option value="DIELINE_PROOF">Artwork + CUT/CREASE · Dieline Proof</option><option value="TECHNICAL">CUT/CREASE + Labels · Technical View</option></select></label><small style={{color:'var(--text-secondary)'}}>{packagingExportMode==='CLIENT_PROOF'?'CUT/CREASE and editor guides are excluded.':packagingExportMode==='DIELINE_PROOF'?'Artwork plus CUT and CREASE lines are exported, regardless of editor layer visibility.':'Artwork is excluded; CUT, CREASE and panel annotations are exported.'}</small></div>}
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

  {packagingPreflightOpen&&packagingPreflight&&<PackagingPreflightDialog result={packagingPreflight} onClose={()=>setPackagingPreflightOpen(false)}/>}

  <DesignerShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />

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
 </div></DesignerShell></FontManagerContext.Provider>);
}

function PackagingPanelInspector({panel,artworkCount,warningCount,focused,onOrientationChange,onFocus,onExitFocus,onSelectArtwork,onPreflight}:{panel:PackagingPanel;artworkCount:number;warningCount:number;focused:boolean;onOrientationChange:(orientation:PackagingArtworkOrientation)=>void;onFocus:()=>void;onExitFocus:()=>void;onSelectArtwork:()=>void;onPreflight:()=>void}){
 return <div className="card-property-sections" data-packaging-panel-inspector>
  <Section sectionKey="GENERAL" title="Packaging Panel">
   <div className="card-property-note"><strong>{panel.name}</strong><span>{panel.kind} · {panel.edge}</span></div>
   <div className="card-property-grid"><label>Width (mm)<input value={panel.widthMm.toFixed(2)} readOnly/></label><label>Height (mm)<input value={panel.heightMm.toFixed(2)} readOnly/></label><label>Safe (mm)<input value={panel.safeMarginMm.toFixed(2)} readOnly/></label><label>Bleed (mm)<input value={panel.bleedMm.toFixed(2)} readOnly/></label></div>
   <label>Artwork Orientation<select value={panel.artworkRotationDeg} onChange={event=>onOrientationChange(Number(event.target.value) as PackagingArtworkOrientation)}><option value={0}>0°</option><option value={90}>90°</option><option value={180}>180°</option><option value={270}>270°</option></select></label>
   <div className="card-preflight-summary"><span className="good">{artworkCount} artwork</span><span className={warningCount?'warning':'good'}>{warningCount} warnings</span></div>
   <div className="card-style-actions"><button onClick={focused?onExitFocus:onFocus}>{focused?'Exit Panel':'Enter Panel'}</button><button onClick={onSelectArtwork} disabled={!artworkCount}>Select Artwork</button><button onClick={onPreflight}>Preflight</button></div>
  </Section>
 </div>;
}

function PackagingPreflightDialog({result,onClose}:{result:PackagingPreflightResult;onClose:()=>void}){
 return <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.55)',zIndex:1200,display:'grid',placeItems:'center'}} onClick={event=>{if(event.target===event.currentTarget)onClose();}}>
  <div style={{background:'var(--bg-primary)',width:'min(620px,92vw)',maxHeight:'82vh',overflow:'auto',padding:20,borderRadius:10,display:'flex',flexDirection:'column',gap:12}}>
   <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}><div><strong>Packaging Preflight</strong><div style={{fontSize:12,color:'var(--text-secondary)'}}>{result.passed?'No blocking structural errors':'Blocking errors found'}</div></div><button onClick={onClose}>Close</button></div>
   <div className="card-preflight-summary"><span className={result.errors?'error':'good'}>{result.errors} errors</span><span className={result.warnings?'warning':'good'}>{result.warnings} warnings</span><span>{result.infos} info</span></div>
   {!result.issues.length&&<div className="card-print-quality good"><strong>Packaging checks passed</strong><span>No structural or artwork issues detected.</span></div>}
   {result.issues.map((issue,index)=><div key={`${issue.code}-${issue.elementId??issue.panelId??index}-${index}`} className={`card-preflight-issue ${issue.severity.toLowerCase()}`}><strong>{issue.severity} · {issue.code}</strong><div>{issue.message}</div></div>)}
  </div>
 </div>;
}

type DrawDraft={startX:number;startY:number;currentX:number;currentY:number;shapeType:DesignShapeKind;intent?:'DRAW'|'SPLIT';isShift:boolean;pointerIsDown:boolean;movedDuringPress:boolean;startSnap?:PointSnapResult;currentSnap?:PointSnapResult};

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
function fillableElementContainsPoint(element:DesignElement,world:EraserPoint):boolean{
 if(element.type!=='PATH'&&element.type!=='SHAPE')return false;
 const geometry=element.type==='PATH'?element.geometry:shapeToPathGeometry(element.shape,element.size);
 if(!geometry.closed||!geometry.segments.length)return false;
 const local=worldToLocal({x:world.xMm,y:world.yMm},element);
 const byId=new Map(geometry.points.map(point=>[point.id,point]));
 const polygon:EraserPoint[]=[];
 for(const segment of geometry.segments){
  const from=byId.get(segment.fromPointId),to=byId.get(segment.toPointId);if(!from||!to)continue;
  const steps=segment.type==='LINE'?1:20;
  for(let index=0;index<=steps;index++){
   if(polygon.length&&index===0)continue;
   const t=index/steps;
   if(segment.type==='LINE')polygon.push({xMm:from.x+(to.x-from.x)*t,yMm:from.y+(to.y-from.y)*t});
   else{const first=from.outHandle??from,second=to.inHandle??to,mt=1-t;polygon.push({xMm:mt**3*from.x+3*mt**2*t*first.x+3*mt*t**2*second.x+t**3*to.x,yMm:mt**3*from.y+3*mt**2*t*first.y+3*mt*t**2*second.y+t**3*to.y});}
  }
 }
 return polygon.length>=3&&pointInPolygon({xMm:local.x,yMm:local.y},polygon);
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
function artboardSymmetrySnap(artboard:Artboard,elementIds:string[],rawDelta:{xMm:number;yMm:number},toleranceMm:number):{delta:{xMm:number;yMm:number};guides:SpacingGuide[]}{
 const moving=artboard.elements.filter(e=>elementIds.includes(e.id)&&e.visible&&!e.locked),bounds=getSelectionBounds(moving);if(!bounds)return{delta:rawDelta,guides:[]};
 const staticEls=artboard.elements.filter(e=>!elementIds.includes(e.id)&&e.visible&&!e.runtimeHidden);
 const movedCenter={x:bounds.xMm+bounds.widthMm/2+rawDelta.xMm,y:bounds.yMm+bounds.heightMm/2+rawDelta.yMm};
 const boardCenter={x:artboard.widthMm/2,y:artboard.heightMm/2};let dx=rawDelta.xMm,dy=rawDelta.yMm;const guides:SpacingGuide[]=[];
 let bestX:{correction:number;source:number;target:number;cross:number}|undefined;
 let bestY:{correction:number;source:number;target:number;cross:number}|undefined;
 for(const e of staticEls){
  const cx=e.position.xMm+e.size.widthMm/2,cy=e.position.yMm+e.size.heightMm/2;
  const mirrorX=2*boardCenter.x-cx,correctionX=mirrorX-movedCenter.x;
  if(Math.abs(correctionX)<=toleranceMm&&(!bestX||Math.abs(correctionX)<Math.abs(bestX.correction)))bestX={correction:correctionX,source:cx,target:mirrorX,cross:(cy+movedCenter.y)/2};
  const mirrorY=2*boardCenter.y-cy,correctionY=mirrorY-movedCenter.y;
  if(Math.abs(correctionY)<=toleranceMm&&(!bestY||Math.abs(correctionY)<Math.abs(bestY.correction)))bestY={correction:correctionY,source:cy,target:mirrorY,cross:(cx+movedCenter.x)/2};
 }
 if(bestX){dx+=bestX.correction;const gap=Math.abs(bestX.source-boardCenter.x);guides.push({axis:'X',fromMm:Math.min(bestX.source,boardCenter.x),toMm:Math.max(bestX.source,boardCenter.x),crossMm:movedCenter.y,gapMm:gap},{axis:'X',fromMm:Math.min(boardCenter.x,bestX.target),toMm:Math.max(boardCenter.x,bestX.target),crossMm:movedCenter.y,gapMm:gap});}
 if(bestY){dy+=bestY.correction;const gap=Math.abs(bestY.source-boardCenter.y);guides.push({axis:'Y',fromMm:Math.min(bestY.source,boardCenter.y),toMm:Math.max(bestY.source,boardCenter.y),crossMm:movedCenter.x,gapMm:gap},{axis:'Y',fromMm:Math.min(boardCenter.y,bestY.target),toMm:Math.max(boardCenter.y,bestY.target),crossMm:movedCenter.x,gapMm:gap});}
 return{delta:{xMm:dx,yMm:dy},guides};
}
type Op={mode:'MOVE';lastX:number;lastY:number;ids:string[]}|{mode:'RESIZE';element:DesignElement;anchor:'NW'|'N'|'NE'|'E'|'SE'|'S'|'SW'|'W';startX:number;startY:number;defaultKeepAspect:boolean;centerBased:boolean}|{mode:'MULTI_RESIZE';elements:DesignElement[];bounds:DesignRectMm;anchor:'NW'|'N'|'NE'|'E'|'SE'|'S'|'SW'|'W';startX:number;startY:number}|{mode:'ROTATE';element:DesignElement;startAngle:number;startRotation:number}|{mode:'PEN_DRAG';pathId:string;pointId:string;startX:number;startY:number}|{mode:'ERASER_LASSO'}|{mode:'MIRROR_LINE';startX:number;startY:number;currentX:number;currentY:number}|({mode:'DRAW_SHAPE_DRAG'}&DrawDraft);

type ReferenceAlignPick = { targetId:string; segmentIndex:number };

function vectorGeometryForElement(element: DesignElement): PathGeometry | null {
  if (element.type === 'PATH') return element.geometry;
  if (element.type === 'SHAPE') return shapeToPathGeometry(element.shape, element.size);
  return null;
}
function pointSegmentDistance(point:{x:number;y:number},a:{x:number;y:number},b:{x:number;y:number}){
  const dx=b.x-a.x,dy=b.y-a.y,l2=dx*dx+dy*dy;
  if(l2<1e-9)return Math.hypot(point.x-a.x,point.y-a.y);
  const t=Math.max(0,Math.min(1,((point.x-a.x)*dx+(point.y-a.y)*dy)/l2));
  return Math.hypot(point.x-(a.x+t*dx),point.y-(a.y+t*dy));
}
function elementLinearSegments(element:DesignElement){
  const geometry=vectorGeometryForElement(element);
  if(!geometry)return [] as Array<{id:string;index:number;fromLocal:{x:number;y:number};toLocal:{x:number;y:number};fromWorld:{x:number;y:number};toWorld:{x:number;y:number}}>;
  return geometry.segments.map((segment,index)=>({segment,index})).filter(item=>item.segment.type==='LINE').flatMap(({segment,index})=>{
    const from=geometry.points.find(point=>point.id===segment.fromPointId);
    const to=geometry.points.find(point=>point.id===segment.toPointId);
    if(!from||!to)return [];
    return [{id:segment.id,index,fromLocal:{x:from.x,y:from.y},toLocal:{x:to.x,y:to.y},fromWorld:localToWorld({x:from.x,y:from.y},element),toWorld:localToWorld({x:to.x,y:to.y},element)}];
  });
}
function nearestLinearSegment(element:DesignElement,point:{x:number;y:number},toleranceMm:number){
  let best:ReturnType<typeof elementLinearSegments>[number]|undefined,bestDistance=Infinity;
  for(const segment of elementLinearSegments(element)){
    const distance=pointSegmentDistance(point,segment.fromWorld,segment.toWorld);
    if(distance<bestDistance){best=segment;bestDistance=distance;}
  }
  return best&&bestDistance<=toleranceMm?best:undefined;
}
function normalizeLineDelta(deg:number){
  let value=((deg+180)%360+360)%360-180;
  if(value>90)value-=180;
  if(value<-90)value+=180;
  return value;
}
function projectReferencePoint(point:{x:number;y:number},a:{x:number;y:number},b:{x:number;y:number},kind?:string){
  const dx=b.x-a.x,dy=b.y-a.y,l2=dx*dx+dy*dy;
  if(l2<1e-9)return a;
  let t=((point.x-a.x)*dx+(point.y-a.y)*dy)/l2;
  if(kind==='RAY')t=Math.max(0,t);
  else if(kind!=='XLINE')t=Math.max(0,Math.min(1,t));
  return{x:a.x+t*dx,y:a.y+t*dy};
}
function alignElementEdgeToReference(target:DesignElement,targetSegmentIndex:number,reference:DesignElement,referenceSegmentIndex:number):DesignElement|null{
  const targetSegment=elementLinearSegments(target).find(segment=>segment.index===targetSegmentIndex);
  const referenceSegment=elementLinearSegments(reference).find(segment=>segment.index===referenceSegmentIndex);
  if(!targetSegment||!referenceSegment)return null;
  const targetAngle=Math.atan2(targetSegment.toWorld.y-targetSegment.fromWorld.y,targetSegment.toWorld.x-targetSegment.fromWorld.x)*180/Math.PI;
  const referenceAngle=Math.atan2(referenceSegment.toWorld.y-referenceSegment.fromWorld.y,referenceSegment.toWorld.x-referenceSegment.fromWorld.x)*180/Math.PI;
  const nextRotation=target.rotationDeg+normalizeLineDelta(referenceAngle-targetAngle);
  const midLocal={x:(targetSegment.fromLocal.x+targetSegment.toLocal.x)/2,y:(targetSegment.fromLocal.y+targetSegment.toLocal.y)/2};
  const rotated={...target,rotationDeg:nextRotation} as DesignElement;
  const rotatedMid=localToWorld(midLocal,rotated);
  const kind=String(reference.metadata?.cadGeometryKind??'');
  const referencePoint=projectReferencePoint(rotatedMid,referenceSegment.fromWorld,referenceSegment.toWorld,kind);
  return{
    ...target,
    rotationDeg:nextRotation,
    position:{xMm:target.position.xMm+(referencePoint.x-rotatedMid.x),yMm:target.position.yMm+(referencePoint.y-rotatedMid.y)}
  };
}

function CardArtboardCanvas({artboard,assets,zoom,selection,setSelection,packagingPanels,packagingPanelMode,activePackagingPanelId,setActivePackagingPanelId,focusedPackagingPanelId,setFocusedPackagingPanelId,interactionMode,setInteractionMode,fillBucketType,fillBucketColor,drawShapeType,pathSelectedNodeIds,setPathSelectedNodeIds,pathSelectedSegmentIds,setPathSelectedSegmentIds,mutate,commitMutate,beginHistoryTransaction,endHistoryTransaction,snapEnabled,gridSnapEnabled,guideSnapEnabled,showRulers,showGrid,showHiddenElements,gridSizeMm,setStatus,mirrorGuideAxis,showSmartCenters,pathSymmetryMode,referenceMirrorMode,polarTrackingEnabled,orthoTrackingEnabled,parallelTrackingEnabled,polarIncrementDeg}:{artboard:Artboard;assets:DesignTemplate['sharedAssets'];zoom:number;selection:DesignSelectionState;setSelection:(s:DesignSelectionState)=>void;packagingPanels:PackagingPanel[];packagingPanelMode:boolean;activePackagingPanelId:string|null;setActivePackagingPanelId:(id:string|null)=>void;focusedPackagingPanelId:string|null;setFocusedPackagingPanelId:(id:string|null)=>void;interactionMode:'SELECT'|'EDIT_PATH'|'SCISSORS'|'PEN'|'TRIMMER'|'SPLIT'|'ERASER'|'FILL_BUCKET'|'DRAW_SHAPE'|'FLEXIBLE_LINE'|'MIRROR_LINE'|'XLINE'|'RAY'|'ANGLE_LINE'|'ARC'|'REFERENCE_ALIGN';setInteractionMode:(m:'SELECT'|'EDIT_PATH'|'SCISSORS'|'PEN'|'TRIMMER'|'SPLIT'|'ERASER'|'FILL_BUCKET'|'DRAW_SHAPE'|'FLEXIBLE_LINE'|'MIRROR_LINE'|'XLINE'|'RAY'|'ANGLE_LINE'|'ARC'|'REFERENCE_ALIGN')=>void;fillBucketType:'SOLID'|'NONE';fillBucketColor:string;drawShapeType:DesignShapeKind|null;pathSelectedNodeIds:string[];setPathSelectedNodeIds:React.Dispatch<React.SetStateAction<string[]>>;pathSelectedSegmentIds:string[];setPathSelectedSegmentIds:(m:string[])=>void;mutate:(f:(t:DesignTemplate)=>DesignTemplate)=>void;commitMutate:(f:(t:DesignTemplate)=>DesignTemplate)=>void;beginHistoryTransaction:()=>void;endHistoryTransaction:()=>void;snapEnabled:boolean;gridSnapEnabled:boolean;guideSnapEnabled:boolean;showRulers:boolean;showGrid:boolean;showHiddenElements:boolean;gridSizeMm:number;setStatus:(message:string)=>void;mirrorGuideAxis:'HORIZONTAL'|'VERTICAL'|null;showSmartCenters:boolean;pathSymmetryMode:'OFF'|'H'|'V';referenceMirrorMode:'COPY'|'MOVE';polarTrackingEnabled:boolean;orthoTrackingEnabled:boolean;parallelTrackingEnabled:boolean;polarIncrementDeg:number}){
 const canvas=useRef<HTMLDivElement|null>(null);const interaction=useRef<Op|null>(null);const marquee=useRef<{startX:number;startY:number;add:boolean}|null>(null);const guideDrag=useRef<{id:string;orientation:'VERTICAL'|'HORIZONTAL';creating:boolean}|null>(null);const [guidePreview,setGuidePreview]=useState<{orientation:'VERTICAL'|'HORIZONTAL';positionMm:number}|null>(null);const [marqueeRect,setMarqueeRect]=useState<DesignRectMm|null>(null);const [snapGuides,setSnapGuides]=useState<SnapGuideIndicator[]>([]);const eraserPointsRef=useRef<EraserPoint[]>([]);const [eraserPoints,setEraserPoints]=useState<EraserPoint[]>([]);const [spacingGuides,setSpacingGuides]=useState<Array<{axis:'X'|'Y';fromMm:number;toMm:number;crossMm:number;gapMm:number}>>([]);const [referenceMirrorDraft,setReferenceMirrorDraft]=useState<{startX:number;startY:number;currentX:number;currentY:number}|null>(null);const intersectionCaptureLockRef=useRef<{point:{x:number;y:number};elementId:string;detailId:string;label:string}|null>(null);
 const [penHover, setPenHover] = useState<{xMm: number, yMm: number} | null>(null);
 const [boundarySnap,setBoundarySnap]=useState<PointSnapResult|null>(null);
 const [boundaryHover,setBoundaryHover]=useState<BoundarySnap|null>(null);
 const [cardinalHover,setCardinalHover]=useState<{elementId:string;points:Array<{x:number;y:number;angle:0|90|180|270}>}|null>(null);
 const [drawDraft,setDrawDraft]=useState<DrawDraft|null>(null);
 const [arcDraft,setArcDraft]=useState<{start:{xMm:number;yMm:number};through?:{xMm:number;yMm:number};current:{xMm:number;yMm:number}}|null>(null);
 const [cadDynamicInput,setCadDynamicInput]=useState<{length:string;angle:string;focused:'LENGTH'|'ANGLE'|null}>({length:'',angle:'',focused:null});
 const [cadCircleRadiusInput,setCadCircleRadiusInput]=useState<{radius:string;focused:boolean}>({radius:'',focused:false});
 const [projectedOrthoGuide,setProjectedOrthoGuide]=useState<{point:{x:number;y:number};verticalFrom:{x:number;y:number};horizontalFrom:{x:number;y:number}}|null>(null);
 const [referenceAlignPick,setReferenceAlignPick]=useState<ReferenceAlignPick|null>(null);
 const cadLengthInputRef=useRef<HTMLInputElement|null>(null);
 const cadAngleInputRef=useRef<HTMLInputElement|null>(null);
 const cadCircleRadiusInputRef=useRef<HTMLInputElement|null>(null);
 const xlineReferenceRef=useRef<{elementId:string;angleDeg:number;kind:'XLINE'|'RAY'}|null>(null);
 useEffect(()=>{if(interactionMode!=='REFERENCE_ALIGN')setReferenceAlignPick(null);if(interactionMode!=='ARC')setArcDraft(null);if(interactionMode==='SELECT'){xlineReferenceRef.current=null;setCadDynamicInput({length:'',angle:'',focused:null});setCadCircleRadiusInput({radius:'',focused:false});setProjectedOrthoGuide(null);}},[interactionMode]);
 useEffect(()=>{if(interactionMode!=='DRAW_SHAPE'&&interactionMode!=='SPLIT'&&interactionMode!=='XLINE'&&interactionMode!=='RAY'&&interactionMode!=='ANGLE_LINE'){setDrawDraft(null);if(interaction.current?.mode==='DRAW_SHAPE_DRAG')interaction.current=null;}if(interactionMode!=='PEN'&&interactionMode!=='FLEXIBLE_LINE'&&interactionMode!=='DRAW_SHAPE'&&interactionMode!=='SPLIT'&&interactionMode!=='MIRROR_LINE'&&interactionMode!=='XLINE'&&interactionMode!=='RAY'&&interactionMode!=='ANGLE_LINE'){setBoundarySnap(null);setBoundaryHover(null);setCardinalHover(null);}if(interactionMode!=='ERASER'){eraserPointsRef.current=[];setEraserPoints([]);}if(interactionMode!=='SELECT')setSpacingGuides([]);if(interactionMode!=='MIRROR_LINE'){setReferenceMirrorDraft(null);if(interaction.current?.mode==='MIRROR_LINE')interaction.current=null;}},[interactionMode]);
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
    return {...replaced,artboards:replaced.artboards.map(current=>{if(current.id!==artboard.id)return current;const groups=current.groups.map(group=>({...group,elementIds:group.elementIds.flatMap(elementId=>elementId===sourceId?fragmentIds:[elementId])}));return{...current,groups,elements:weldPathEndpointsToNearbyNodes(current.elements,fragmentIds)};})};
  });
  setSelection({ artboardId: artboard.id, elementIds: fragmentIds, primaryElementId: fragmentIds[0] });
 }, [artboard.elements, artboard.id, commitMutate, setSelection]);
 const point=(e:React.PointerEvent)=>{const r=canvas.current!.getBoundingClientRect();return{xMm:(e.clientX-r.left)/r.width*artboard.widthMm,yMm:(e.clientY-r.top)/r.height*artboard.heightMm};};
 const applyBucketFill=(element:DesignElement)=>{
  if(element.locked){setStatus('Fill Bucket — element is locked');return;}
  if(!element.visible||element.runtimeHidden){setStatus('Fill Bucket — hidden elements cannot be filled');return;}
  if(element.type!=='SHAPE'&&element.type!=='PATH'){setStatus('Fill Bucket — select a closed shape or section');return;}
  const closed=element.type==='PATH'?element.geometry.closed:shapeToPathGeometry(element.shape,element.size).closed;
  if(!closed){setStatus('Fill Bucket — boundary is open; close the path before filling');return;}
  const fill=fillBucketType==='NONE'?{type:'NONE' as const}:{type:'SOLID' as const,color:fillBucketColor,opacity:1};
  commitMutate(template=>updateDesignElement(template,artboard.id,element.id,current=>(current.type==='SHAPE'||current.type==='PATH')?{...current,fill}:current));
  setSelection({artboardId:artboard.id,elementIds:[element.id],primaryElementId:element.id});
  setStatus(fillBucketType==='NONE'?'Fill Bucket — fill removed':'Fill Bucket — solid fill applied');
 };
 const pointSnapToleranceMm=(screenPx:number)=>{const rect=canvas.current?.getBoundingClientRect();return rect&&rect.width>0?screenPx/rect.width*artboard.widthMm:screenPx/(MM_TO_CSS_PX*(zoom/100));};
 const normalizeAngle=(deg:number)=>((deg%360)+360)%360;
 const angleDistance=(a:number,b:number)=>{const d=Math.abs(normalizeAngle(a)-normalizeAngle(b));return Math.min(d,360-d);};
 const cubicPoint=(p0:{x:number;y:number},p1:{x:number;y:number},p2:{x:number;y:number},p3:{x:number;y:number},t:number)=>{const u=1-t,uu=u*u,tt=t*t;return{x:uu*u*p0.x+3*uu*t*p1.x+3*u*tt*p2.x+tt*t*p3.x,y:uu*u*p0.y+3*uu*t*p1.y+3*u*tt*p2.y+tt*t*p3.y};};
 const elementTrackingSegments=(el:DesignElement)=>{
   const segments:{a:{x:number;y:number};b:{x:number;y:number};elementId:string}[]=[];
   if(el.type==='PATH'||el.type==='SHAPE'){
     const geometry=el.type==='PATH'?el.geometry:shapeToPathGeometry(el.shape,el.size);
     const byId=new Map(geometry.points.map(p=>[p.id,p] as const));
     for(const segment of geometry.segments){
       const from=byId.get(segment.fromPointId),to=byId.get(segment.toPointId);if(!from||!to)continue;
       if(segment.type==='LINE')segments.push({a:localToWorld({x:from.x,y:from.y},el),b:localToWorld({x:to.x,y:to.y},el),elementId:el.id});
       else {
         const p0={x:from.x,y:from.y},p1=from.outHandle??p0,p3={x:to.x,y:to.y},p2=to.inHandle??p3;let prev=localToWorld(p0,el);
         for(let i=1;i<=16;i++){const next=localToWorld(cubicPoint(p0,p1,p2,p3,i/16),el);segments.push({a:prev,b:next,elementId:el.id});prev=next;}
       }
     }
     return segments;
   }
   const w=el.size.widthMm,h=el.size.heightMm;const corners=[{x:0,y:0},{x:w,y:0},{x:w,y:h},{x:0,y:h}].map(pt=>localToWorld(pt,el));
   for(let i=0;i<4;i++)segments.push({a:corners[i]!,b:corners[(i+1)%4]!,elementId:el.id});
   return segments;
 };
 const raySegmentIntersection=(start:{x:number;y:number},angleDeg:number,a:{x:number;y:number},b:{x:number;y:number})=>{const rad=angleDeg*Math.PI/180,dx=Math.cos(rad),dy=Math.sin(rad),sx=b.x-a.x,sy=b.y-a.y,den=dx*sy-dy*sx;if(Math.abs(den)<1e-9)return null;const qx=a.x-start.x,qy=a.y-start.y,t=(qx*sy-qy*sx)/den,u=(qx*dy-qy*dx)/den;if(t<=0.05||u<-1e-6||u>1+1e-6)return null;return{x:start.x+dx*t,y:start.y+dy*t,distanceMm:t};};
 const pointToSegmentDistance=(point:{x:number;y:number},a:{x:number;y:number},b:{x:number;y:number})=>{const dx=b.x-a.x,dy=b.y-a.y,len2=dx*dx+dy*dy;if(len2<1e-12)return Math.hypot(point.x-a.x,point.y-a.y);const t=clamp(((point.x-a.x)*dx+(point.y-a.y)*dy)/len2,0,1);return Math.hypot(point.x-(a.x+t*dx),point.y-(a.y+t*dy));};
 const pointInsideSegments=(point:{x:number;y:number},segments:ReturnType<typeof elementTrackingSegments>)=>{let inside=false;for(const seg of segments){const {a,b}=seg;if((a.y>point.y)!==(b.y>point.y)){const x=a.x+(point.y-a.y)*(b.x-a.x)/(b.y-a.y);if(x>point.x)inside=!inside;}}return inside;};
 const cardinalPointsForElement=(el:DesignElement)=>{if(el.type!=='SHAPE'&&el.type!=='PATH')return [] as Array<{x:number;y:number;angle:0|90|180|270}>;const geometry=el.type==='PATH'?el.geometry:shapeToPathGeometry(el.shape,el.size);if(!geometry.closed)return [];const center={x:el.position.xMm+el.size.widthMm/2,y:el.position.yMm+el.size.heightMm/2};const segments=elementTrackingSegments(el);const defs:Array<{angle:0|90|180|270;ray:number}>=[{angle:0,ray:0},{angle:90,ray:270},{angle:180,ray:180},{angle:270,ray:90}];return defs.flatMap(def=>{let best:{x:number;y:number;distanceMm:number}|null=null;for(const seg of segments){const hit=raySegmentIntersection(center,def.ray,seg.a,seg.b);if(hit&&(!best||hit.distanceMm<best.distanceMm))best=hit;}return best?[{x:best.x,y:best.y,angle:def.angle}]:[];});};
 const findCardinalHover=(raw:{xMm:number;yMm:number},excludeIds:readonly string[]=[])=>{const hoverTolerance=pointSnapToleranceMm(12);const candidates=[...artboard.elements].sort((a,b)=>b.zIndex-a.zIndex||b.id.localeCompare(a.id));for(const el of candidates){if(excludeIds.includes(el.id)||!el.visible||el.runtimeHidden||(el.type!=='SHAPE'&&el.type!=='PATH'))continue;const geometry=el.type==='PATH'?el.geometry:shapeToPathGeometry(el.shape,el.size);if(!geometry.closed)continue;const segments=elementTrackingSegments(el);if(!segments.length)continue;const pt={x:raw.xMm,y:raw.yMm};const nearBoundary=segments.some(seg=>pointToSegmentDistance(pt,seg.a,seg.b)<=hoverTolerance);if(!nearBoundary&&!pointInsideSegments(pt,segments))continue;const points=cardinalPointsForElement(el);if(points.length)return {elementId:el.id,points};}return null;};
 const nearestCardinalSnap=(raw:{xMm:number;yMm:number},excludeIds:readonly string[]=[])=>{const hover=findCardinalHover(raw,excludeIds);if(!hover)return null;const tolerance=pointSnapToleranceMm(POINT_SNAP_SCREEN_TOLERANCE_PX);let best:{point:{x:number;y:number};angle:0|90|180|270;distanceMm:number;elementId:string}|null=null;for(const point_ of hover.points){const distanceMm=Math.hypot(point_.x-raw.xMm,point_.y-raw.yMm);if(distanceMm<=tolerance&&(!best||distanceMm<best.distanceMm))best={point:{x:point_.x,y:point_.y},angle:point_.angle,distanceMm,elementId:hover.elementId};}return best;};
 const cadRayIntersections=(start:{x:number;y:number},angleDeg:number,excludeIds:readonly string[]=[])=>findCadRayIntersections(artboard.elements,start,angleDeg,excludeIds);
 const rayToArtboardDistance=(start:{x:number;y:number},angleDeg:number)=>{const r=angleDeg*Math.PI/180,dx=Math.cos(r),dy=Math.sin(r),ts:number[]=[];if(dx>1e-9)ts.push((artboard.widthMm-start.x)/dx);else if(dx<-1e-9)ts.push((0-start.x)/dx);if(dy>1e-9)ts.push((artboard.heightMm-start.y)/dy);else if(dy<-1e-9)ts.push((0-start.y)/dy);return Math.max(0,...ts.filter(t=>t>0));};
 const xlineAngle=(el:DesignElement)=>{const ox=Number(el.metadata?.cadOriginX),oy=Number(el.metadata?.cadOriginY),tx=Number(el.metadata?.cadThroughX),ty=Number(el.metadata?.cadThroughY);if([ox,oy,tx,ty].every(Number.isFinite)&&Math.hypot(tx-ox,ty-oy)>1e-6)return normalizeAngle(Math.atan2(ty-oy,tx-ox)*180/Math.PI);const seg=elementTrackingSegments(el)[0];return seg?normalizeAngle(Math.atan2(seg.b.y-seg.a.y,seg.b.x-seg.a.x)*180/Math.PI):normalizeAngle(el.rotationDeg||0);};
 const acquireXLineReference=(raw:{xMm:number;yMm:number})=>{if(!parallelTrackingEnabled)return xlineReferenceRef.current;const tolerance=pointSnapToleranceMm(12);let best:{elementId:string;angleDeg:number;distanceMm:number;kind:'XLINE'|'RAY'}|null=null;for(const el of artboard.elements){if(!el.visible||el.runtimeHidden||!['XLINE','RAY'].includes(String(el.metadata?.cadGeometryKind)))continue;for(const seg of elementTrackingSegments(el)){const distanceMm=pointToSegmentDistance({x:raw.xMm,y:raw.yMm},seg.a,seg.b);if(distanceMm<=tolerance&&(!best||distanceMm<best.distanceMm))best={elementId:el.id,angleDeg:xlineAngle(el),distanceMm,kind:String(el.metadata?.cadGeometryKind)==='RAY'?'RAY':'XLINE'};}}if(best)xlineReferenceRef.current={elementId:best.elementId,angleDeg:best.angleDeg,kind:best.kind};return xlineReferenceRef.current;};
 const nearestCadDirection=(start:{x:number;y:number},raw:{xMm:number;yMm:number})=>{
   const dx=raw.xMm-start.x,dy=raw.yMm-start.y,length=Math.hypot(dx,dy);if(length<0.0001)return {point:raw,angleDeg:0,lengthMm:0,label:''};
   const rawAngle=normalizeAngle(Math.atan2(dy,dx)*180/Math.PI);
   let candidates:{angle:number;label:string}[]=[];
   if(orthoTrackingEnabled)candidates=[{angle:0,label:'Horizontal'},{angle:90,label:'Vertical'},{angle:180,label:'Horizontal'},{angle:270,label:'Vertical'}];
   else {
     const xref=acquireXLineReference(raw);
     if(xref){const base=xref.kind==='RAY'?'RAY':'XLINE';candidates.push({angle:xref.angleDeg,label:`${base} Parallel`},{angle:normalizeAngle(xref.angleDeg+180),label:`${base} Parallel`},{angle:normalizeAngle(xref.angleDeg+90),label:`${base} Perpendicular`},{angle:normalizeAngle(xref.angleDeg+270),label:`${base} Perpendicular`});}
     if(polarTrackingEnabled){const inc=Math.max(1,polarIncrementDeg);for(let a=0;a<360;a+=inc)candidates.push({angle:a,label:`Polar ${Math.round(a)}°`});}
     if(parallelTrackingEnabled){for(const el of artboard.elements){if(!el.visible||el.runtimeHidden||el.metadata?.cadGeometryKind==='XLINE')continue;const refs:number[]=[normalizeAngle(el.rotationDeg||0)];if(el.type==='PATH'){const byId=new Map(el.geometry.points.map(point=>[point.id,point] as const));for(const seg of el.geometry.segments){const a=byId.get(seg.fromPointId),b=byId.get(seg.toPointId);if(a&&b&&Math.hypot(b.x-a.x,b.y-a.y)>0.001)refs.push(normalizeAngle(Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI+(el.rotationDeg||0)));}}for(const a of refs)candidates.push({angle:a,label:'Parallel'},{angle:normalizeAngle(a+180),label:'Parallel'},{angle:normalizeAngle(a+90),label:'Perpendicular'},{angle:normalizeAngle(a+270),label:'Perpendicular'});}}
   }
   if(!candidates.length)return {point:raw,angleDeg:rawAngle,lengthMm:length,label:''};
   let best=candidates[0],bestD=angleDistance(rawAngle,best.angle);for(const c of candidates.slice(1)){const d=angleDistance(rawAngle,c.angle);if(d<bestD){best=c;bestD=d;}}
   const toleranceDeg=orthoTrackingEnabled?45:5;
   if(bestD>toleranceDeg)return {point:raw,angleDeg:rawAngle,lengthMm:length,label:''};
   const rad=best.angle*Math.PI/180;return {point:{xMm:start.x+Math.cos(rad)*length,yMm:start.y+Math.sin(rad)*length},angleDeg:normalizeAngle(best.angle),lengthMm:length,label:best.label};
 };
 const applyCadDirection=(raw:{xMm:number;yMm:number},lineStart?:{x:number;y:number})=>lineStart?nearestCadDirection(lineStart,raw):{point:raw,angleDeg:0,lengthMm:0,label:''};
 const isCadLineLikeTool=interactionMode==='PEN'||interactionMode==='FLEXIBLE_LINE'||interactionMode==='SPLIT'||interactionMode==='MIRROR_LINE'||interactionMode==='XLINE'||interactionMode==='RAY'||interactionMode==='ANGLE_LINE'||(interactionMode==='DRAW_SHAPE'&&drawShapeType==='LINE');
 const cadReferencePoints=(excludeIds:readonly string[]=[])=>{const points:Array<{x:number;y:number;elementId:string}>=[];for(const el of artboard.elements){if(excludeIds.includes(el.id)||!el.visible||el.runtimeHidden)continue;if(el.type==='PATH'){for(const node of el.geometry.points){const world=localToWorld({x:node.x,y:node.y},el);points.push({x:world.x,y:world.y,elementId:el.id});}}else if(el.type==='SHAPE'){for(const cp of cardinalPointsForElement(el))points.push({x:cp.x,y:cp.y,elementId:el.id});points.push({x:el.position.xMm+el.size.widthMm/2,y:el.position.yMm+el.size.heightMm/2,elementId:el.id});}}return points;};
 const nearestProjectedOrthoIntersection=(raw:{xMm:number;yMm:number},excludeIds:readonly string[]=[])=>{const refs=cadReferencePoints(excludeIds);const tolerance=pointSnapToleranceMm(INTERSECTION_CAPTURE_SCREEN_TOLERANCE_PX);const verticalRefs=refs.filter(ref=>Math.abs(ref.x-raw.xMm)<=tolerance).sort((a,b)=>Math.abs(a.x-raw.xMm)-Math.abs(b.x-raw.xMm)).slice(0,24);const horizontalRefs=refs.filter(ref=>Math.abs(ref.y-raw.yMm)<=tolerance).sort((a,b)=>Math.abs(a.y-raw.yMm)-Math.abs(b.y-raw.yMm)).slice(0,24);let best:null|{point:{x:number;y:number};verticalFrom:{x:number;y:number};horizontalFrom:{x:number;y:number};elementId:string;distanceMm:number}=null;for(const verticalFrom of verticalRefs){for(const horizontalFrom of horizontalRefs){if(verticalFrom===horizontalFrom)continue;const point_={x:verticalFrom.x,y:horizontalFrom.y};const distanceMm=Math.hypot(point_.x-raw.xMm,point_.y-raw.yMm);if(distanceMm>tolerance)continue;if(!best||distanceMm<best.distanceMm)best={point:point_,verticalFrom:{x:verticalFrom.x,y:verticalFrom.y},horizontalFrom:{x:horizontalFrom.x,y:horizontalFrom.y},elementId:verticalFrom.elementId,distanceMm};}}return best;};
 const drawingSnap=(raw:{xMm:number;yMm:number},excludeIds:string[]=[],lineStart?:{x:number;y:number})=>{if(!isCadLineLikeTool){intersectionCaptureLockRef.current=null;return undefined;}acquireXLineReference(raw);const tracked=applyCadDirection(raw,lineStart);const tolerance=pointSnapToleranceMm(POINT_SNAP_SCREEN_TOLERANCE_PX);const prioritySnap=snapEnabled?resolvePointSnap(artboard,{x:tracked.point.xMm,y:tracked.point.yMm},{toleranceMm:tolerance,excludeIds,lineStart,snapToBoundaries:false,snapToVertices:true,snapToIntersections:true,snapToGuides:false,snapToGrid:false,snapToObjectCenters:false,snapToArtboardCenter:false,gridSizeMm}):undefined;if(prioritySnap){intersectionCaptureLockRef.current=prioritySnap.kind==='INTERSECTION'?{point:prioritySnap.point,elementId:prioritySnap.elementId??'',detailId:prioritySnap.detailId??'EXACT_INTERSECTION',label:prioritySnap.label??'Intersection'}:null;return prioritySnap;}const cardinal=snapEnabled?nearestCardinalSnap(raw,excludeIds):null;if(cardinal){intersectionCaptureLockRef.current=null;setProjectedOrthoGuide(null);return {point:cardinal.point,kind:'INTERSECTION' as const,label:`Cardinal ${cardinal.angle}°`,distanceMm:cardinal.distanceMm,elementId:cardinal.elementId,detailId:`CARDINAL_${cardinal.angle}`};}const projectedOrtho=snapEnabled&&lineStart?nearestProjectedOrthoIntersection(raw,excludeIds):null;if(projectedOrtho){setProjectedOrthoGuide({point:projectedOrtho.point,verticalFrom:projectedOrtho.verticalFrom,horizontalFrom:projectedOrtho.horizontalFrom});const lock={point:projectedOrtho.point,elementId:projectedOrtho.elementId,detailId:'PROJECTED_ORTHO_INTERSECTION',label:'Projected Perpendicular Intersection'};intersectionCaptureLockRef.current=lock;return {point:lock.point,kind:'INTERSECTION' as const,label:lock.label,distanceMm:projectedOrtho.distanceMm,elementId:lock.elementId,detailId:lock.detailId};}setProjectedOrthoGuide(null);if(snapEnabled&&lineStart){const releaseTolerance=pointSnapToleranceMm(INTERSECTION_LOCK_RELEASE_SCREEN_TOLERANCE_PX),locked=intersectionCaptureLockRef.current;if(locked){const lockDistance=Math.hypot(locked.point.x-raw.xMm,locked.point.y-raw.yMm);if(lockDistance<=releaseTolerance)return {point:locked.point,kind:'INTERSECTION' as const,label:locked.label,distanceMm:lockDistance,elementId:locked.elementId,detailId:locked.detailId};intersectionCaptureLockRef.current=null;}const captureTolerance=pointSnapToleranceMm(INTERSECTION_CAPTURE_SCREEN_TOLERANCE_PX);const dx=raw.xMm-lineStart.x,dy=raw.yMm-lineStart.y;const rawAngle=normalizeAngle(Math.atan2(dy,dx)*180/Math.PI);const captureAngle=tracked.label?tracked.angleDeg:rawAngle;const cursorPoint=tracked.label?tracked.point:raw;const projected=cadRayIntersections(lineStart,captureAngle,excludeIds).map(hit=>({...hit,cursorDistance:Math.hypot(hit.x-cursorPoint.xMm,hit.y-cursorPoint.yMm)})).sort((a,b)=>a.cursorDistance-b.cursorDistance)[0];if(projected&&projected.cursorDistance<=captureTolerance){const lock={point:{x:projected.x,y:projected.y},elementId:projected.elementId,detailId:'PROJECTED_INTERSECTION_CAPTURE',label:`${tracked.label?`${tracked.label} `:''}Exact Intersection`};intersectionCaptureLockRef.current=lock;return {point:lock.point,kind:'INTERSECTION' as const,label:lock.label,distanceMm:projected.cursorDistance,elementId:lock.elementId,detailId:lock.detailId};}}else intersectionCaptureLockRef.current=null;const pointSnap=snapEnabled?resolvePointSnap(artboard,{x:tracked.point.xMm,y:tracked.point.yMm},{toleranceMm:tolerance,excludeIds,lineStart,snapToBoundaries:true,snapToVertices:true,snapToIntersections:true,snapToGuides:guideSnapEnabled,snapToGrid:gridSnapEnabled,snapToObjectCenters:true,snapToArtboardCenter:true,gridSizeMm}):undefined;if(pointSnap)return pointSnap;if(lineStart&&(polarTrackingEnabled||orthoTrackingEnabled||parallelTrackingEnabled)&&tracked.label)return {point:{x:tracked.point.xMm,y:tracked.point.yMm},kind:'GUIDE' as const,label:tracked.label,distanceMm:0};return undefined;};
 const shapeDrawingSnap=(raw:{xMm:number;yMm:number},excludeIds:string[]=[])=>{
   if(!snapEnabled)return undefined;
   const tolerance=pointSnapToleranceMm(POINT_SNAP_SCREEN_TOLERANCE_PX);
   const priority=resolvePointSnap(artboard,{x:raw.xMm,y:raw.yMm},{toleranceMm:tolerance,excludeIds,snapToBoundaries:false,snapToVertices:true,snapToIntersections:true,snapToGuides:false,snapToGrid:false,snapToObjectCenters:true,snapToArtboardCenter:true,gridSizeMm});
   if(priority)return priority;
   const cardinal=nearestCardinalSnap(raw,excludeIds);
   if(cardinal)return {point:cardinal.point,kind:'INTERSECTION' as const,label:`Cardinal ${cardinal.angle}°`,distanceMm:cardinal.distanceMm,elementId:cardinal.elementId,detailId:`CARDINAL_${cardinal.angle}`};
   return resolvePointSnap(artboard,{x:raw.xMm,y:raw.yMm},{toleranceMm:tolerance,excludeIds,snapToBoundaries:true,snapToVertices:true,snapToIntersections:true,snapToGuides:guideSnapEnabled,snapToGrid:gridSnapEnabled,snapToObjectCenters:true,snapToArtboardCenter:true,gridSizeMm});
 };
 const activePathLineStart=()=>{if(selection.elementIds.length!==1)return undefined;const selected=artboard.elements.find(element=>element.id===selection.elementIds[0]);if(!selected||selected.type!=='PATH'||selected.geometry.closed)return undefined;const endpoints=getPathEndpoints(selected.geometry);const lastId=endpoints[endpoints.length-1]??selected.geometry.points[selected.geometry.points.length-1]?.id;const last=selected.geometry.points.find(point=>point.id===lastId);return last?localToWorld({x:last.x,y:last.y},selected):undefined;};
 const commitDrawDraft=(draft:DrawDraft,end:{xMm:number;yMm:number},endSnap?:PointSnapResult)=>{
   const splitOnly=draft.intent==='SPLIT';
   const sx=draft.startX,sy=draft.startY,ex=end.xMm,ey=end.yMm;
   const isCircle=draft.shapeType==='CIRCLE';
   let x=Math.min(sx,ex),y=Math.min(sy,ey),w=Math.abs(ex-sx),h=Math.abs(ey-sy);
   if(isCircle){const r=Math.hypot(ex-sx,ey-sy);x=sx-r;y=sy-r;w=r*2;h=r*2;}
   else if(draft.isShift&&draft.shapeType!=='LINE'){const size=Math.max(w,h);w=size;h=size;x=ex<sx?sx-size:sx;y=ey<sy?sy-size:sy;}
   const lineLength=Math.hypot(ex-sx,ey-sy),minSize=2;
   if(draft.shapeType==='LINE'?(lineLength<0.5):(w<minSize&&h<minSize)){setDrawDraft(null);interaction.current=null;endHistoryTransaction();return;}
   const newId=id('element');let generatedFaceIds:string[]=[];
   if(splitOnly){
     const line=createCadLineGeometry({xMm:sx,yMm:sy},{xMm:ex,yMm:ey},{point1Id:id('point'),point2Id:id('point'),segmentId:id('segment')});
     const divider:PathDesignElement={id:newId,type:'PATH',name:'Split Divider',position:line.position,size:line.size,rotationDeg:0,opacity:1,zIndex:Math.max(-1,...artboard.elements.map(element=>element.zIndex))+1,visible:true,locked:false,geometry:line.geometry,fill:{type:'NONE'},stroke:{style:'SOLID',color:'#000000',widthMm:0.5},metadata:{...createCadLineMetadata(draft.startSnap?.elementId,endSnap?.elementId),faceComponentId:id('face-component'),cadIntent:'SPLIT'}};
     const hinted=[draft.startSnap?.elementId,endSnap?.elementId].filter((value):value is string=>Boolean(value));
     const hintedSource=artboard.elements.find(item=>hinted.includes(item.id));
     const split=splitComponentFaceByDivider([...artboard.elements,divider],divider,hintedSource?.groupId??id('face-component'),hinted);
     if(!split){
       endHistoryTransaction();interaction.current=null;setDrawDraft(null);setBoundarySnap(null);setSelection({artboardId:artboard.id,elementIds:[],primaryElementId:undefined});setStatus('Split failed — line must start and end on a closed shape boundary');return;
     }
     const source=artboard.elements.find(item=>item.id===split.sourceId);
     if(!source){
       endHistoryTransaction();interaction.current=null;setDrawDraft(null);setBoundarySnap(null);setStatus('Split failed — target shape is no longer available');return;
     }
     const {componentId,faces}=split;const faceIds=faces.map(face=>face.id);
     commitMutate(t=>{
       const replaced=replaceElementsAtLayer(t,artboard.id,[source.id],faces);
       return{...replaced,artboards:replaced.artboards.map(a=>{if(a.id!==artboard.id)return a;const existing=a.groups.find(group=>group.id===componentId);return{...a,groups:existing?a.groups.map(group=>group.id===componentId?{...group,elementIds:group.elementIds.flatMap(elementId=>elementId===source.id?faceIds:[elementId])}:group):[...a.groups,{id:componentId,name:`${source.name} Component`,elementIds:faceIds,visible:source.visible,locked:source.locked}]};})};
     });
     const firstFaceId=faceIds[0]!;setSelection({artboardId:artboard.id,elementIds:[firstFaceId],primaryElementId:firstFaceId});endHistoryTransaction();interaction.current=null;setDrawDraft(null);setBoundarySnap(null);setStatus(`Split created ${faceIds.length} independent parts`);return;
   }
   commitMutate(t=>{
     const art=t.artboards.find(a=>a.id===artboard.id);if(!art)return t;
     let geometry;
     if(draft.shapeType==='LINE'){
       const line=createCadLineGeometry({xMm:sx,yMm:sy},{xMm:ex,yMm:ey},{point1Id:id('point'),point2Id:id('point'),segmentId:id('segment')});
       geometry=line.geometry;
       x=line.position.xMm;y=line.position.yMm;w=line.size.widthMm;h=line.size.heightMm;
     }else geometry=shapeToPathGeometry(draft.shapeType,{widthMm:w,heightMm:h});
     const el:PathDesignElement={id:newId,type:'PATH',name:splitOnly?'Split Divider':draft.shapeType,position:{xMm:x,yMm:y},size:{widthMm:w,heightMm:h},rotationDeg:0,opacity:1,zIndex:nextElementZIndex(t,artboard.id),visible:true,locked:false,geometry,fill:(draft.shapeType==='LINE'||draft.shapeType==='ARC')?{type:'NONE'}:{type:'SOLID',color:'#d1d5db'},stroke:{style:'SOLID',color:'#000000',widthMm:0.5},metadata:{...(draft.shapeType==='LINE'?{...createCadLineMetadata(draft.startSnap?.elementId,endSnap?.elementId),faceComponentId:id('face-component'),cadIntent:'DRAW'}:{}),...(focusedPackagingPanel?packagingMetadataForPanel(focusedPackagingPanel):{})}};
     let next={...t,artboards:t.artboards.map(a=>a.id===artboard.id?{...a,elements:[...a.elements,el]}:a)};
     if(draft.shapeType==='LINE'){
       next={...next,artboards:next.artboards.map(a=>a.id===artboard.id?{...a,elements:materializeStraightPathIntersections(a.elements,[newId])}:a)};
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
     return focusedPackagingPanel?refreshPackagingArtworkIndex(next,artboard.id,packagingPanels):next;
   });
   if(generatedFaceIds.length){const firstFaceId=generatedFaceIds[0]!;setSelection({artboardId:artboard.id,elementIds:[firstFaceId],primaryElementId:firstFaceId});}else setSelection({artboardId:artboard.id,elementIds:[newId],primaryElementId:newId});
   endHistoryTransaction();
   if(draft.shapeType==='LINE'&&!splitOnly&&interactionMode!=='ANGLE_LINE'){
     const chained:DrawDraft={startX:ex,startY:ey,currentX:ex,currentY:ey,shapeType:'LINE',intent:'DRAW',isShift:false,pointerIsDown:false,movedDuringPress:false,startSnap:endSnap};
     interaction.current={mode:'DRAW_SHAPE_DRAG',...chained};setDrawDraft(chained);setStatus('LINE — Specify next point · Enter finishes chain · Esc selects');
   }else{interaction.current=null;setDrawDraft(null);if(interactionMode==='ANGLE_LINE')setStatus('ANGLE LINE — Specify next start point');else{setInteractionMode('SELECT');setStatus(`${draft.shapeType} created — selected for resize, rotation and point inspection`);}}
 };
 const commitDynamicCadLine=()=>{
   if(!((interactionMode==='DRAW_SHAPE'&&drawShapeType==='LINE')||interactionMode==='ANGLE_LINE')||!drawDraft)return;
   const liveDx=drawDraft.currentX-drawDraft.startX,liveDy=drawDraft.currentY-drawDraft.startY;
   const liveLength=Math.hypot(liveDx,liveDy);
   const tracked=nearestCadDirection({x:drawDraft.startX,y:drawDraft.startY},{xMm:drawDraft.currentX,yMm:drawDraft.currentY});
   const parsedLength=cadDynamicInput.length.trim()===''?NaN:Number(cadDynamicInput.length);const parsedAngle=cadDynamicInput.angle.trim()===''?NaN:Number(cadDynamicInput.angle);
   const lengthMm=Number.isFinite(parsedLength)&&parsedLength>0?parsedLength:liveLength;
   const angleDeg=Number.isFinite(parsedAngle)?normalizeAngle(parsedAngle):(tracked.label?tracked.angleDeg:normalizeAngle(Math.atan2(liveDy,liveDx)*180/Math.PI));
   if(!Number.isFinite(lengthMm)||lengthMm<0.01){setStatus(`${interactionMode==='ANGLE_LINE'?'ANGLE LINE':'LINE'} — enter a length greater than 0`);return;}
   const end=resolveCadDynamicEndpoint({xMm:drawDraft.startX,yMm:drawDraft.startY},lengthMm,angleDeg);
   commitDrawDraft(drawDraft,end,undefined);setCadDynamicInput({length:'',angle:'',focused:null});setStatus(`${interactionMode==='ANGLE_LINE'?'ANGLE LINE':'LINE'} — ${lengthMm.toFixed(2)} mm @ ${angleDeg.toFixed(2)}° committed`);
 };
 const commitDynamicCadCircle=()=>{if(interactionMode!=='DRAW_SHAPE'||drawShapeType!=='CIRCLE'||!drawDraft)return;const liveRadius=Math.hypot(drawDraft.currentX-drawDraft.startX,drawDraft.currentY-drawDraft.startY);const parsed=Number(cadCircleRadiusInput.radius);const radiusMm=cadCircleRadiusInput.radius.trim()!==''&&Number.isFinite(parsed)?parsed:liveRadius;if(!Number.isFinite(radiusMm)||radiusMm<0.5){setStatus('CIRCLE — enter a radius of at least 0.5 mm');return;}commitDrawDraft(drawDraft,{xMm:drawDraft.startX+radiusMm,yMm:drawDraft.startY},undefined);setCadCircleRadiusInput({radius:'',focused:false});setStatus(`CIRCLE — radius ${radiusMm.toFixed(2)} mm committed`);};
 const toolDownCapture=(e:React.PointerEvent<HTMLDivElement>)=>{
  if(e.button!==0)return;
  if(interactionMode==='ARC'){
   e.preventDefault();e.stopPropagation();downCanvas(e);return;
  }
  if(interactionMode==='FILL_BUCKET'){
   e.preventDefault();e.stopPropagation();
   const p=point(e);
   const containing=[...artboard.elements].filter(element=>element.visible&&!element.runtimeHidden&&fillableElementContainsPoint(element,p)).sort((a,b)=>b.zIndex-a.zIndex);
   const existingSection=containing.find(element=>element.metadata?.faceGeneration==='AUTO_SECTION');
   if(existingSection){applyBucketFill(existingSection);return;}
   const region=findJoinedLineRegionAtPoint(artboard.elements,{x:p.xMm,y:p.yMm});
   if(region){
    const newId=id('joined-line-section'),componentId=id('face-component');
    const fill=fillBucketType==='NONE'?{type:'NONE' as const}:{type:'SOLID' as const,color:fillBucketColor,opacity:1};
    const section:PathDesignElement={id:newId,type:'PATH',name:'Joined Line Section',position:region.position,size:region.size,rotationDeg:0,opacity:1,zIndex:Math.max(-1,...artboard.elements.map(element=>element.zIndex))+1,visible:true,locked:false,geometry:region.geometry,fill,stroke:{style:'SOLID',color:'#000000',widthMm:.5,opacity:1},metadata:{faceComponentId:componentId,faceGeneration:'AUTO_SECTION',faceTopologyVersion:1,joinedLineSourceIds:region.sourceElementIds}};
    commitMutate(template=>({...template,artboards:template.artboards.map(current=>current.id!==artboard.id?current:{...current,elements:[...current.elements,section]})}));
    setSelection({artboardId:artboard.id,elementIds:[newId],primaryElementId:newId});
    setStatus(`Fill Bucket — joined lines created an independent section (${region.sourceElementIds.length} source paths)`);
   }else{const target=containing[0];if(target)applyBucketFill(target);else setStatus('Fill Bucket — no closed boundary at this point');}
   return;
  }
  if(interactionMode!=='ERASER')return;
  e.preventDefault();e.stopPropagation();
  e.currentTarget.setPointerCapture?.(e.pointerId);
  const p=point(e);beginHistoryTransaction();interaction.current={mode:'ERASER_LASSO'};eraserPointsRef.current=[p];setEraserPoints([p]);setSelection({artboardId:artboard.id,elementIds:[],primaryElementId:undefined});setStatus('Eraser — drag across geometry and release');
 };
 const downCanvas=(e:React.PointerEvent<HTMLDivElement>)=>{
  if(interactionMode==='FILL_BUCKET'){
    if(e.button===0){e.preventDefault();setStatus('Fill Bucket — click inside a closed shape or section');}
    return;
  }
  if(interactionMode==='MIRROR_LINE'){
    if(e.button!==0)return;
    const raw=point(e);const existing=interaction.current?.mode==='MIRROR_LINE'?interaction.current:undefined;
    const snap=drawingSnap(raw,[],existing?{x:existing.startX,y:existing.startY}:undefined);const p=snap?{xMm:snap.point.x,yMm:snap.point.y}:raw;
    if(!existing){interaction.current={mode:'MIRROR_LINE',startX:p.xMm,startY:p.yMm,currentX:p.xMm,currentY:p.yMm};setReferenceMirrorDraft({startX:p.xMm,startY:p.yMm,currentX:p.xMm,currentY:p.yMm});setStatus(`Mirror by Line (${referenceMirrorMode==='COPY'?'Copy':'Move'}) — specify second axis point`);setBoundarySnap(snap??null);return;}
    if(Math.hypot(p.xMm-existing.startX,p.yMm-existing.startY)<0.01){setStatus('Mirror by Line — reference axis needs two distinct points');return;}
    beginHistoryTransaction();commitMutate(t=>mirrorElementsAcrossReferenceLine(t,artboard.id,selection.elementIds,{xMm:existing.startX,yMm:existing.startY},{xMm:p.xMm,yMm:p.yMm},referenceMirrorMode));endHistoryTransaction();
    interaction.current=null;setReferenceMirrorDraft(null);setBoundarySnap(null);setInteractionMode('SELECT');setStatus(`Mirror by Line ${referenceMirrorMode==='COPY'?'copy created':'applied'}`);return;
  }
  if(interactionMode==='ARC'){
    if(e.button!==0)return;
    const raw=point(e);const lineStart=arcDraft?.through??arcDraft?.start;const snap=drawingSnap(raw,[],lineStart?{x:lineStart.xMm,y:lineStart.yMm}:undefined);const p=snap?{xMm:snap.point.x,yMm:snap.point.y}:raw;
    if(!arcDraft){setArcDraft({start:p,current:p});setBoundarySnap(snap??null);setStatus('ARC — Specify through point');return;}
    if(!arcDraft.through){if(Math.hypot(p.xMm-arcDraft.start.xMm,p.yMm-arcDraft.start.yMm)<.01){setStatus('ARC — through point must differ from start');return;}setArcDraft({...arcDraft,through:p,current:p});setBoundarySnap(snap??null);setStatus('ARC — Specify end point');return;}
    const built=createCadArcGeometry(arcDraft.start,arcDraft.through,p);
    if(!built){setStatus('ARC — points are collinear; choose a curved end point');return;}
    const newId=id('arc');beginHistoryTransaction();
    commitMutate(t=>({...t,artboards:t.artboards.map(a=>a.id!==artboard.id?a:{...a,elements:[...a.elements,{id:newId,type:'PATH',name:'CAD Arc',locked:false,visible:true,opacity:1,zIndex:Math.max(-1,...a.elements.map(element=>element.zIndex))+1,position:built.position,size:built.size,rotationDeg:0,geometry:built.geometry,metadata:{...createCadArcMetadata(arcDraft.start,arcDraft.through!,p,built),faceComponentId:id('face-component')},fill:{type:'NONE'},stroke:{style:'SOLID',color:'#000000',widthMm:.5,opacity:1}} as PathDesignElement]})}));
    endHistoryTransaction();
    setSelection({artboardId:artboard.id,elementIds:[newId],primaryElementId:newId});setArcDraft(null);setBoundarySnap(null);setStatus(`ARC created — R ${built.radiusMm.toFixed(2)} mm · Specify next start point`);return;
  }
  if(interactionMode==='ANGLE_LINE'){
    if(e.button!==0)return;
    const raw=point(e);const existing=interaction.current?.mode==='DRAW_SHAPE_DRAG'?interaction.current:null;
    const snap=drawingSnap(raw,[],existing?{x:existing.startX,y:existing.startY}:undefined);const p=snap?{xMm:snap.point.x,yMm:snap.point.y}:raw;
    if(existing&&!existing.pointerIsDown){
      commitDrawDraft(existing,p,snap);
      setCadDynamicInput({length:'',angle:'',focused:null});
      return;
    }
    beginHistoryTransaction();const draft:DrawDraft={startX:p.xMm,startY:p.yMm,currentX:p.xMm,currentY:p.yMm,shapeType:'LINE',intent:'DRAW',isShift:e.shiftKey,pointerIsDown:true,movedDuringPress:false,startSnap:snap};
    interaction.current={mode:'DRAW_SHAPE_DRAG',...draft};setDrawDraft(draft);setCadDynamicInput({length:'',angle:'',focused:null});setBoundarySnap(snap??null);setStatus('ANGLE LINE — Enter Length and Angle or specify endpoint');return;
  }
  if(interactionMode==='RAY'){
    if(e.button!==0)return;
    const raw=point(e);const existing=interaction.current?.mode==='DRAW_SHAPE_DRAG'?interaction.current:null;
    const snap=drawingSnap(raw,[],existing?{x:existing.startX,y:existing.startY}:undefined);const p=snap?{xMm:snap.point.x,yMm:snap.point.y}:raw;
    if(existing&&!existing.pointerIsDown){
      if(Math.hypot(p.xMm-existing.startX,p.yMm-existing.startY)<0.01){setStatus('RAY — direction point must differ from origin');return;}
      const built=createCadRayGeometry({xMm:existing.startX,yMm:existing.startY},{xMm:p.xMm,yMm:p.yMm},artboard.widthMm,artboard.heightMm);
      const newId=id('ray');
      commitMutate(t=>({...t,artboards:t.artboards.map(a=>{
        if(a.id!==artboard.id)return a;
        const ray:PathDesignElement={id:newId,type:'PATH',name:'Ray',locked:false,visible:true,opacity:1,zIndex:Math.max(-1,...a.elements.map(el=>el.zIndex))+1,position:built.position,size:built.size,rotationDeg:0,geometry:built.geometry,metadata:{...createCadRayMetadata({xMm:existing.startX,yMm:existing.startY},{xMm:p.xMm,yMm:p.yMm}),faceComponentId:id('face-component')},fill:{type:'NONE'},stroke:{style:'DASHED',color:'#7c3aed',widthMm:0.35,opacity:0.9,dashArray:[3,2]}};
        return {...a,elements:[...a.elements,ray]};
      })}));
      endHistoryTransaction();interaction.current=null;setDrawDraft(null);setBoundarySnap(null);setSelection({artboardId:artboard.id,elementIds:[newId],primaryElementId:newId});setStatus('RAY created — Specify next origin');return;
    }
    beginHistoryTransaction();const draft:DrawDraft={startX:p.xMm,startY:p.yMm,currentX:p.xMm,currentY:p.yMm,shapeType:'LINE',intent:'DRAW',isShift:e.shiftKey,pointerIsDown:true,movedDuringPress:false,startSnap:snap};interaction.current={mode:'DRAW_SHAPE_DRAG',...draft};setDrawDraft(draft);setBoundarySnap(snap??null);setStatus('RAY — Specify direction point');return;
  }
  if(interactionMode==='XLINE'){
    if(e.button!==0)return;
    const raw=point(e);const existing=interaction.current?.mode==='DRAW_SHAPE_DRAG'?interaction.current:null;
    const snap=drawingSnap(raw,[],existing?{x:existing.startX,y:existing.startY}:undefined);const p=snap?{xMm:snap.point.x,yMm:snap.point.y}:raw;
    if(existing&&!existing.pointerIsDown){
      if(Math.hypot(p.xMm-existing.startX,p.yMm-existing.startY)<0.01){setStatus('XLINE — direction point must differ from first point');return;}
      const built=createCadXLineGeometry({xMm:existing.startX,yMm:existing.startY},{xMm:p.xMm,yMm:p.yMm},artboard.widthMm,artboard.heightMm);
      const newId=id('xline');
      commitMutate(t=>({...t,artboards:t.artboards.map(a=>{
        if(a.id!==artboard.id)return a;
        const xline:PathDesignElement={id:newId,type:'PATH',name:'Construction Line',locked:false,visible:true,opacity:1,zIndex:Math.max(-1,...a.elements.map(el=>el.zIndex))+1,position:built.position,size:built.size,rotationDeg:0,geometry:built.geometry,metadata:{...createCadXLineMetadata({xMm:existing.startX,yMm:existing.startY},{xMm:p.xMm,yMm:p.yMm}),faceComponentId:id('face-component')},fill:{type:'NONE'},stroke:{style:'DASHED',color:'#8b5cf6',widthMm:0.35,opacity:0.9,dashArray:[2,2]}};
        return {...a,elements:[...a.elements,xline]};
      })}));
      endHistoryTransaction();interaction.current=null;setDrawDraft(null);setBoundarySnap(null);setSelection({artboardId:artboard.id,elementIds:[newId],primaryElementId:newId});setStatus('XLINE created — Specify next point');return;
    }
    beginHistoryTransaction();const draft:DrawDraft={startX:p.xMm,startY:p.yMm,currentX:p.xMm,currentY:p.yMm,shapeType:'LINE',intent:'DRAW',isShift:e.shiftKey,pointerIsDown:true,movedDuringPress:false,startSnap:snap};interaction.current={mode:'DRAW_SHAPE_DRAG',...draft};setDrawDraft(draft);setBoundarySnap(snap??null);setStatus('XLINE — Specify direction point');return;
  }
  if ((interactionMode === 'DRAW_SHAPE' && drawShapeType) || interactionMode === 'SPLIT') {
    if(e.button!==0)return;
    const activeShapeType:DesignShapeKind=interactionMode==='SPLIT'?'LINE':drawShapeType!;
    const raw=point(e);
    const existing=interaction.current?.mode==='DRAW_SHAPE_DRAG'?interaction.current:null;
    const useCadSnap=interactionMode==='SPLIT'||activeShapeType==='LINE';
    const snap=useCadSnap?drawingSnap(raw,[],existing?{x:existing.startX,y:existing.startY}:undefined):shapeDrawingSnap(raw),p=snap?{xMm:snap.point.x,yMm:snap.point.y}:raw;
    if(existing&&!existing.pointerIsDown){
      commitDrawDraft(existing,p,snap);
      return;
    }
    beginHistoryTransaction();
    const draft:DrawDraft={startX:p.xMm,startY:p.yMm,currentX:p.xMm,currentY:p.yMm,shapeType:activeShapeType,intent:interactionMode==='SPLIT'?'SPLIT':'DRAW',isShift:e.shiftKey,pointerIsDown:true,movedDuringPress:false,startSnap:snap};
    interaction.current={mode:'DRAW_SHAPE_DRAG',...draft};
    setDrawDraft(draft);
    if(interactionMode==='DRAW_SHAPE'&&activeShapeType==='LINE')setCadDynamicInput({length:'',angle:'',focused:null});
    if(interactionMode==='DRAW_SHAPE'&&activeShapeType==='CIRCLE')setCadCircleRadiusInput({radius:'',focused:false});
    setBoundarySnap(snap??null);
    return;
  }
  if (interactionMode === 'PEN' || interactionMode === 'FLEXIBLE_LINE') {
    if(e.button!==0)return;
    const rawPoint=point(e);
    const excluded=selection.elementIds.filter(elementId=>{const element=artboard.elements.find(candidate=>candidate.id===elementId);return element?.type==='PATH'&&!element.geometry.closed;});
    const snap=drawingSnap(rawPoint,excluded,activePathLineStart());
    const p=snap?{xMm:snap.point.x,yMm:snap.point.y}:rawPoint;
    beginHistoryTransaction();
    let targetPathId: string | undefined;
    const addedPointId = crypto.randomUUID();
    if (selection.elementIds.length === 1) {
      const selectedId = selection.elementIds[0];
      const selectedEl = artboard.elements.find(el => el.id === selectedId);
      if (selectedEl && selectedEl.type === 'PATH' && (interactionMode!=='FLEXIBLE_LINE'||selectedEl.metadata?.cadGeometryKind==='POLYLINE')) {
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
          commitMutate(t => {
            const extended={
              ...t, artboards: t.artboards.map(a => a.id === artboard.id ? {
                ...a, elements: a.elements.map(el => {
                  if (el.id !== selectedId) return el;
                  const pEl = el as PathDesignElement;
                  if(interactionMode==='FLEXIBLE_LINE'){const appended=appendCadPolylinePoint(pEl,{xMm:p.xMm,yMm:p.yMm},newPtId);return {...appended,metadata:{...appended.metadata,...(snap?.elementId?{cadEndTargetId:snap.elementId}:{})}};}
                  const newGeo = { ...pEl.geometry, points: [...pEl.geometry.points, { id: newPtId, x: localPt.x, y: localPt.y, mode: 'CORNER' as const }], segments: [...pEl.geometry.segments, { id: newSegId, type: 'LINE' as const, fromPointId: lastNode, toPointId: newPtId }] };
                  return { ...pEl, geometry: newGeo };
                })
              } : a)
            };
            return extended;
          });
        }
      }
    }
      if (!targetPathId) {
        const newPathId = crypto.randomUUID();
        commitMutate(t => {
          return {
            ...t, artboards: t.artboards.map(a => a.id === artboard.id ? {
              ...a, elements: [...a.elements, {
                id: newPathId, type: 'PATH', name: interactionMode === 'FLEXIBLE_LINE' ? 'Polyline' : 'Path', locked: false, visible: true, opacity: 1, zIndex: Math.max(-1,...a.elements.map(element=>element.zIndex))+1, position: { xMm: p.xMm, yMm: p.yMm }, size: { widthMm: 0.1, heightMm: 0.1 }, rotationDeg: 0,
                geometry: { points: [{ id: addedPointId, x: 0, y: 0, mode: 'CORNER' }], segments: [], closed: false },
                metadata: interactionMode==='FLEXIBLE_LINE'?{...createCadPolylineMetadata(snap?.elementId),faceComponentId:id('face-component')}:(snap?{dividerBoundaryTargetId:snap.elementId,faceComponentId:id('face-component')}:undefined),
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
      if(interactionMode==='PEN')interaction.current = { mode: 'PEN_DRAG', pathId: targetPathId, pointId: addedPointId, startX: p.xMm, startY: p.yMm };
      else interaction.current=null;
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

  const handleReferenceAlignClick=(element:DesignElement,worldPoint:{x:number;y:number})=>{
    if(element.locked||!element.visible||element.runtimeHidden)return;
    const tolerance=pointSnapToleranceMm(18);
    if(!referenceAlignPick){
      if(element.type!=='SHAPE'&&element.type!=='PATH'){setStatus('Align Edge — target must be a Shape or Path');return;}
      const edge=nearestLinearSegment(element,worldPoint,tolerance);
      if(!edge){setStatus('Align Edge — click directly on a straight target edge');return;}
      setReferenceAlignPick({targetId:element.id,segmentIndex:edge.index});
      setStatus('Target edge selected — now click Ray, XLINE, Line or Polyline segment reference');
      return;
    }
    if(element.id===referenceAlignPick.targetId){setStatus('Reference must be a different line/path');return;}
    if(element.type!=='PATH'){setStatus('Reference must be Ray, XLINE, Line or Polyline segment');return;}
    const referenceSegment=nearestLinearSegment(element,worldPoint,tolerance);
    if(!referenceSegment){setStatus('Click directly on the reference line/segment');return;}
    const target=artboard.elements.find(candidate=>candidate.id===referenceAlignPick.targetId);
    if(!target){setReferenceAlignPick(null);setStatus('Target no longer exists');return;}
    beginHistoryTransaction();
    commitMutate(template=>({...template,artboards:template.artboards.map(board=>board.id!==artboard.id?board:{...board,elements:board.elements.map(candidate=>{
      if(candidate.id!==target.id)return candidate;
      return alignElementEdgeToReference(candidate,referenceAlignPick.segmentIndex,element,referenceSegment.index)??candidate;
    })})}));
    endHistoryTransaction();
    setSelection({artboardId:artboard.id,elementIds:[target.id],primaryElementId:target.id});
    setReferenceAlignPick(null);
    setInteractionMode('SELECT');
    setStatus('Edge aligned exactly to reference');
  };

  const moveArcCapture=(e:React.PointerEvent<HTMLDivElement>)=>{
    if(interactionMode!=='ARC'||!arcDraft)return;
    const raw=point(e),anchor=arcDraft.through??arcDraft.start;
    const snap=drawingSnap(raw,[],{x:anchor.xMm,y:anchor.yMm});
    const current=snap?{xMm:snap.point.x,yMm:snap.point.y}:raw;
    setArcDraft({...arcDraft,current});setBoundarySnap(snap??null);
  };

  const moveCanvas=(e:React.PointerEvent<HTMLDivElement>)=>{const raw=point(e);const activeConnectTool=interactionMode==='PEN'||interactionMode==='FLEXIBLE_LINE'||interactionMode==='SPLIT'||interactionMode==='MIRROR_LINE'||interactionMode==='XLINE'||interactionMode==='RAY'||interactionMode==='ANGLE_LINE'||(interactionMode==='DRAW_SHAPE'&&drawShapeType==='LINE');const activeShapeDraw=interactionMode==='DRAW_SHAPE'&&!!drawShapeType;const excluded=selection.elementIds.filter(elementId=>{const element=artboard.elements.find(candidate=>candidate.id===elementId);return element?.type==='PATH'&&!element.geometry.closed;});const drawOp=interaction.current?.mode==='DRAW_SHAPE_DRAG'?interaction.current:undefined;const lineStart=drawOp?{x:drawOp.startX,y:drawOp.startY}:activePathLineStart();const snap=activeConnectTool?drawingSnap(raw,excluded,lineStart):(activeShapeDraw?shapeDrawingSnap(raw,excluded):undefined);const hover=(activeConnectTool||activeShapeDraw)?findBoundarySnap(artboard.elements,{x:raw.xMm,y:raw.yMm},pointSnapToleranceMm(14),excluded):undefined;const cardinalTool=interactionMode==='PEN'||interactionMode==='FLEXIBLE_LINE'||interactionMode==='SPLIT'||interactionMode==='MIRROR_LINE'||interactionMode==='XLINE'||interactionMode==='RAY'||interactionMode==='ANGLE_LINE'||activeShapeDraw;const cardinal=cardinalTool?findCardinalHover(raw,excluded):null;const p=snap?{xMm:snap.point.x,yMm:snap.point.y}:raw;if(interactionMode==='PEN'||interactionMode==='FLEXIBLE_LINE')setPenHover({xMm:p.xMm,yMm:p.yMm});else if(interactionMode!=='DRAW_SHAPE'&&interactionMode!=='SPLIT')setPenHover(null);setBoundarySnap(snap??null);setBoundaryHover(hover??null);setCardinalHover(cardinal);const guide=guideDrag.current;if(guide){const raw=guide.orientation==='VERTICAL'?p.xMm:p.yMm;const max=guide.orientation==='VERTICAL'?artboard.widthMm:artboard.heightMm;const positionMm=clamp(raw,0,max);setGuidePreview({orientation:guide.orientation,positionMm});if(!guide.creating)mutate(t=>moveGuide(t,artboard.id,guide.id,positionMm));return;}const op=interaction.current;if(op?.mode==='MIRROR_LINE'){const snap=drawingSnap(raw,[],{x:op.startX,y:op.startY});const mp=snap?{xMm:snap.point.x,yMm:snap.point.y}:raw;interaction.current={...op,currentX:mp.xMm,currentY:mp.yMm};setReferenceMirrorDraft({startX:op.startX,startY:op.startY,currentX:mp.xMm,currentY:mp.yMm});setBoundarySnap(snap??null);return;}if(op?.mode==='ERASER_LASSO'){const last=eraserPointsRef.current[eraserPointsRef.current.length-1];if(!last||Math.hypot(raw.xMm-last.xMm,raw.yMm-last.yMm)>=0.25){eraserPointsRef.current=[...eraserPointsRef.current,raw];setEraserPoints(eraserPointsRef.current);}return;}const snapOptions={enabled:snapEnabled&&!e.altKey,toleranceMm:1.5,snapToArtboard:true,snapToElements:true,snapToGuides:guideSnapEnabled,snapToGrid:gridSnapEnabled,gridSizeMm};if(op?.mode==='MOVE'){const dx=p.xMm-op.lastX,dy=p.yMm-op.lastY;interaction.current={...op,lastX:p.xMm,lastY:p.yMm};const snapped=snapMoveDelta(artboard,op.ids,{xMm:dx,yMm:dy},snapOptions);const spaced=snapEnabled&&!e.altKey?equalSpacingSnap(artboard,op.ids,snapped.delta,1.5):{delta:snapped.delta,guides:[] as SpacingGuide[]};const symmetric=snapEnabled&&!e.altKey?artboardSymmetrySnap(artboard,op.ids,spaced.delta,1.5):{delta:spaced.delta,guides:[] as SpacingGuide[]};setSnapGuides(snapped.guides);setSpacingGuides(symmetric.guides.length?symmetric.guides:spaced.guides);mutate(t=>moveElements(t,artboard.id,op.ids,symmetric.delta));return;}if(op?.mode==='RESIZE'){const worldDelta={xMm:p.xMm-op.startX,yMm:p.yMm-op.startY};const localDelta=worldDeltaToElementLocal(worldDelta,op.element.rotationDeg);const multiplier=op.centerBased?2:1,base=op.element.size;let w=base.widthMm,h=base.heightMm;if(op.anchor.includes('E'))w+=localDelta.xMm*multiplier;if(op.anchor.includes('W'))w-=localDelta.xMm*multiplier;if(op.anchor.includes('S'))h+=localDelta.yMm*multiplier;if(op.anchor.includes('N'))h-=localDelta.yMm*multiplier;const snapped=snapResizeSize(artboard,op.element,op.anchor,{widthMm:w,heightMm:h},snapOptions);const keepAspect=e.shiftKey?!op.defaultKeepAspect:op.defaultKeepAspect;setSnapGuides(snapped.guides);mutate(t=>resizeElement(t,artboard.id,op.element.id,snapped.size,{anchor:op.anchor,maintainAspectRatio:keepAspect,centerBased:op.centerBased}));return;}if(op?.mode==='MULTI_RESIZE'){const delta={xMm:p.xMm-op.startX,yMm:p.yMm-op.startY};const targetBounds=resizeSelectionBoundsFromDelta(op.bounds,op.anchor,delta,{maintainAspectRatio:e.shiftKey,centerBased:e.altKey});setSnapGuides([]);setSpacingGuides([]);mutate(t=>resizeElementsFromSnapshots(t,artboard.id,op.elements,op.bounds,targetBounds));return;}if(op?.mode==='ROTATE'){setSnapGuides([]);const c={xMm:op.element.position.xMm+op.element.size.widthMm/2,yMm:op.element.position.yMm+op.element.size.heightMm/2},angle=Math.atan2(p.yMm-c.yMm,p.xMm-c.xMm),nextRotation=op.startRotation+(angle-op.startAngle)*180/Math.PI;mutate(t=>rotateElement(t,artboard.id,op.element.id,e.shiftKey?snapRotationDeg(nextRotation,15):nextRotation));return;}if(op?.mode==='PEN_DRAG'){const el=artboard.elements.find(el=>el.id===op.pathId);if(el&&el.type==='PATH'){const pEl=el as PathDesignElement;const localPt=worldToLocal({x:p.xMm,y:p.yMm},pEl);const startLocal=worldToLocal({x:op.startX,y:op.startY},pEl);const dx=localPt.x-startLocal.x;const dy=localPt.y-startLocal.y;if(Math.hypot(dx,dy)>1){mutate(t=>{return{...t,artboards:t.artboards.map(a=>a.id===artboard.id?{...a,elements:a.elements.map(e_=>{if(e_.id!==op.pathId)return e_;const pEl_=e_ as PathDesignElement;const newPts=pEl_.geometry.points.map(pt=>pt.id===op.pointId?{...pt,mode:'SYMMETRIC' as const,inHandle:{x:pt.x-dx,y:pt.y-dy},outHandle:{x:pt.x+dx,y:pt.y+dy}}:pt);const newSegs=pEl_.geometry.segments.map(seg=>seg.toPointId===op.pointId?{...seg,type:'CUBIC_BEZIER' as const}:seg);return{...pEl_,geometry:{...pEl_.geometry,points:newPts,segments:newSegs}};})}:a)};});}}return;}if(op?.mode==='DRAW_SHAPE_DRAG'){const movedDuringPress=op.movedDuringPress||(op.pointerIsDown&&Math.hypot(p.xMm-op.startX,p.yMm-op.startY)>0.6);const next:DrawDraft={...op,currentX:p.xMm,currentY:p.yMm,isShift:e.shiftKey,pointerIsDown:op.pointerIsDown,movedDuringPress,currentSnap:snap};interaction.current={mode:'DRAW_SHAPE_DRAG',...next};setDrawDraft(next);return;}if(marquee.current){const m=marquee.current;setMarqueeRect({xMm:Math.min(m.startX,p.xMm),yMm:Math.min(m.startY,p.yMm),widthMm:Math.abs(p.xMm-m.startX),heightMm:Math.abs(p.yMm-m.startY)});}};
  const commitEraserStroke=(stroke:EraserPoint[])=>{
    let affected=0;
    const radiusMm=6/(MM_TO_CSS_PX*(zoom/100));
    commitMutate(template=>{
      let next=template;
      const current=template.artboards.find(candidate=>candidate.id===artboard.id);
      if(!current)return template;
      for(const source of current.elements){
        if(!source.visible||source.runtimeHidden||source.locked)continue;
        if(source.type==='PATH'||source.type==='SHAPE'){
          const pathSource:PathDesignElement=source.type==='PATH'?source:{...source,type:'PATH',geometry:shapeToPathGeometry(source.shape,source.size),fill:source.fill,stroke:source.stroke,shadow:source.shadow};
          const erased=erasePathWithWorldStroke(pathSource,stroke,radiusMm);
          const unchanged=erased.segments.length===pathSource.geometry.segments.length&&erased.segments.every((segment,index)=>segment.id===pathSource.geometry.segments[index]?.id);
          if(unchanged)continue;
          affected++;
          const normalized=splitGeometryIntoConnectedFragments(erased).map(fragment=>normalizePathFragment(fragment,source));
          if(!normalized.length){next=deleteDesignElements(next,artboard.id,[source.id]);continue;}
          const fragmentIds=normalized.map(()=>id('eraser-fragment'));
          const fragments:PathDesignElement[]=normalized.map((fragment,index)=>({
            id:fragmentIds[index]!,type:'PATH',name:`${source.name} ${index+1}`,
            position:fragment.position,size:fragment.size,rotationDeg:source.rotationDeg,
            opacity:source.opacity,visible:source.visible,locked:false,zIndex:source.zIndex,
            groupId:source.groupId,bindings:source.bindings,metadata:source.metadata,
            visibilityRule:source.visibilityRule,geometry:fragment.geometry,
            fill:fragment.geometry.closed?source.fill:{type:'NONE'},stroke:source.stroke,shadow:source.shadow
          }));
          next=replaceElementsAtLayer(next,artboard.id,[source.id],fragments);
          next={...next,artboards:next.artboards.map(candidate=>candidate.id!==artboard.id?candidate:{...candidate,groups:candidate.groups.map(group=>({...group,elementIds:group.elementIds.flatMap(elementId=>elementId===source.id?fragmentIds:[elementId])}))})};
        }else if(eraserHitsElement(stroke,source)){
          affected++;
          next=deleteDesignElements(next,artboard.id,[source.id]);
        }
      }
      return next;
    });
    return affected;
  };
  const cancelEraserStroke=()=>{
    if(interaction.current?.mode!=='ERASER_LASSO')return;
    interaction.current=null;eraserPointsRef.current=[];setEraserPoints([]);endHistoryTransaction();setStatus('Eraser stroke cancelled');
  };
  const upCanvas=()=>{if(interaction.current?.mode==='ERASER_LASSO'){const affected=commitEraserStroke(eraserPointsRef.current);endHistoryTransaction();setStatus(affected?`Eraser removed geometry from ${affected} element${affected===1?'':'s'}`:'Eraser — nothing intersected');interaction.current=null;eraserPointsRef.current=[];setEraserPoints([]);setSelection({artboardId:artboard.id,elementIds:[],primaryElementId:undefined});return;}if(guideDrag.current){const drag=guideDrag.current;if(drag.creating&&guidePreview)commitMutate(t=>addGuide(t,artboard.id,{id:drag.id,orientation:drag.orientation,positionMm:guidePreview.positionMm,locked:false}));else endHistoryTransaction();guideDrag.current=null;setGuidePreview(null);return;}if(marquee.current&&marqueeRect)setSelection(selectByMarquee(artboard,marqueeRect,marquee.current.add?'ADD':'REPLACE',selection));if(interaction.current?.mode==='MIRROR_LINE'){/* two-click CAD tool: pointer-up must preserve the first axis point */}else if(interaction.current?.mode==='DRAW_SHAPE_DRAG'){const op=interaction.current;if(op.pointerIsDown){const isTwoClickCad=interactionMode==='SPLIT'||interactionMode==='XLINE'||interactionMode==='RAY'||interactionMode==='ANGLE_LINE'||(interactionMode==='DRAW_SHAPE'&&(op.shapeType==='LINE'||op.shapeType==='CIRCLE'));if(isTwoClickCad){/* LINE/SPLIT/XLINE are explicit CAD click-click tools. */const next:DrawDraft={...op,pointerIsDown:false,movedDuringPress:false};interaction.current={mode:'DRAW_SHAPE_DRAG',...next};setDrawDraft(next);}else{/* Parametric shapes keep the standard drag-release workflow. */commitDrawDraft(op,{xMm:op.currentX,yMm:op.currentY},op.currentSnap);}}}else if(interaction.current){endHistoryTransaction();interaction.current=null;}marquee.current=null;setMarqueeRect(null);setSnapGuides([]);setSpacingGuides([]);};
  // CAD LINE is intentionally click-click. Pointer-up never commits a line;
  // this prevents small mouse drags/releases from creating inaccurate geometry.
  const upCanvasWithLineCommit=()=>{upCanvas();};
  const capture=(ev:React.PointerEvent)=>{ev.stopPropagation();(ev.currentTarget.closest('.card-artboard-canvas') as HTMLElement)?.setPointerCapture?.(ev.pointerId);};
  const ticks=rulerTicks(artboard,zoom),print=resolvePrintSettings(artboard.print),gridPx=gridSizeMm*MM_TO_CSS_PX;const canvasStyle:React.CSSProperties={width:`${artboard.widthMm*MM_TO_CSS_PX}px`,height:`${artboard.heightMm*MM_TO_CSS_PX}px`,transform:`scale(${zoom/100})`,transformOrigin:'top left',backgroundColor:'transparent', cursor: interactionMode === 'TRIMMER' ? TRIMMER_CURSOR : interactionMode==='ERASER' ? 'crosshair' : interactionMode==='FILL_BUCKET' ? 'copy' : (interactionMode === 'PEN' || interactionMode === 'FLEXIBLE_LINE' || interactionMode === 'DRAW_SHAPE' || interactionMode === 'SPLIT' || interactionMode === 'SCISSORS' || interactionMode === 'MIRROR_LINE' || interactionMode === 'XLINE' || interactionMode === 'RAY' || interactionMode === 'ANGLE_LINE' || interactionMode === 'ARC') ? 'crosshair' : undefined};
  const focusedPackagingPanel=packagingPanels.find(panel=>panel.id===focusedPackagingPanelId)??null;
  const multiSelectionElements=artboard.elements.filter(element=>selection.elementIds.includes(element.id)&&element.visible&&!element.locked);
  const multiSelectionBounds=selection.elementIds.length>1?getSelectionBounds(multiSelectionElements):null;
  const cadHud=(()=>{let start:{x:number;y:number}|undefined,current:{x:number;y:number}|undefined;if(referenceMirrorDraft){start={x:referenceMirrorDraft.startX,y:referenceMirrorDraft.startY};current={x:referenceMirrorDraft.currentX,y:referenceMirrorDraft.currentY};}else if(drawDraft&&(drawDraft.shapeType==='LINE'||interactionMode==='SPLIT'||interactionMode==='XLINE'||interactionMode==='RAY'||interactionMode==='ANGLE_LINE')){start={x:drawDraft.startX,y:drawDraft.startY};current={x:drawDraft.currentX,y:drawDraft.currentY};}else if((interactionMode==='PEN'||interactionMode==='FLEXIBLE_LINE')&&penHover){const ls=activePathLineStart();if(ls){start=ls;current={x:penHover.xMm,y:penHover.yMm};}}if(!start||!current)return null;const dx=current.x-start.x,dy=current.y-start.y;const len=Math.hypot(dx,dy);if(len<0.001){if(interactionMode==='ANGLE_LINE')return {angleDeg:0,guideAngleDeg:0,label:'',lengthMm:0,xMm:current.x,yMm:current.y,startX:start.x,startY:start.y,rayLengthMm:rayToArtboardDistance(start,0),intersections:[]};return null;}const ang=normalizeAngle(Math.atan2(dy,dx)*180/Math.PI);const tracked=nearestCadDirection(start,{xMm:current.x,yMm:current.y});const guideAngle=tracked.label?tracked.angleDeg:ang;const intersections=cadRayIntersections(start,guideAngle,selection.elementIds);return {angleDeg:ang,guideAngleDeg:guideAngle,label:tracked.label,lengthMm:len,xMm:current.x,yMm:current.y,startX:start.x,startY:start.y,rayLengthMm:rayToArtboardDistance(start,guideAngle),intersections};})();
  const angular45Guides=cadHud&&drawDraft&&((interactionMode==='DRAW_SHAPE'&&drawShapeType==='LINE')||interactionMode==='ANGLE_LINE')?[0,45,90,135,180,225,270,315].map(angle=>({angle,active:angleDistance(cadHud.guideAngleDeg,angle)<0.5,lengthMm:Math.min(rayToArtboardDistance({x:cadHud.startX,y:cadHud.startY},angle),32)})):[];
  useEffect(()=>{const onKeyDown=(event:KeyboardEvent)=>{if(event.key!=='Enter'||interactionMode!=='DRAW_SHAPE'||drawShapeType!=='LINE')return;const target=event.target as HTMLElement|null;if(target&&(target.tagName==='INPUT'||target.tagName==='TEXTAREA'||target.tagName==='SELECT'||target.isContentEditable))return;event.preventDefault();endHistoryTransaction();interaction.current=null;setDrawDraft(null);setBoundarySnap(null);setBoundaryHover(null);setCardinalHover(null);intersectionCaptureLockRef.current=null;setStatus('LINE — Specify first point');};window.addEventListener('keydown',onKeyDown);return()=>window.removeEventListener('keydown',onKeyDown);},[interactionMode,drawShapeType,endHistoryTransaction,setStatus]);
  const commandHint=interactionMode==='SPLIT'?(drawDraft?'SPLIT — Specify end point on boundary':'SPLIT — Specify start point on boundary'):interactionMode==='DRAW_SHAPE'?(drawShapeType==='LINE'?(drawDraft?'LINE — Specify next point':'LINE — Specify first point'):drawShapeType==='CIRCLE'?(drawDraft?'CIRCLE — Specify radius':'CIRCLE — Specify center'):(drawDraft?`${drawShapeType??'SHAPE'} — Specify opposite point`:`${drawShapeType??'SHAPE'} — Specify first point`)):interactionMode==='FLEXIBLE_LINE'?(selection.elementIds.length?'POLYLINE — Specify next point':'POLYLINE — Specify first point'):interactionMode==='PEN'?(selection.elementIds.length?'PEN — Specify next point':'PEN — Specify first point'):interactionMode==='TRIMMER'?'ERASE SEGMENT — Select interval or first point':interactionMode==='ERASER'?'ERASER — Drag across geometry to erase':interactionMode==='FILL_BUCKET'?'FILL BUCKET — Click a closed shape or section':interactionMode==='MIRROR_LINE'?(referenceMirrorDraft?`MIRROR LINE ${referenceMirrorMode} — Specify second axis point`:`MIRROR LINE ${referenceMirrorMode} — Specify first axis point`):interactionMode==='XLINE'?(drawDraft?'XLINE — Specify direction point':'XLINE — Specify point'):interactionMode==='RAY'?(drawDraft?'RAY — Specify direction point':'RAY — Specify origin point'):interactionMode==='ANGLE_LINE'?(drawDraft?'ANGLE LINE — Enter Length / Angle or specify endpoint':'ANGLE LINE — Specify start point'):null;
 return <div ref={canvas} className={`card-artboard-canvas ${showRulers?'with-rulers':''}`} data-artboard-id={artboard.id} style={canvasStyle} onPointerDownCapture={toolDownCapture} onPointerDown={downCanvas} onPointerMoveCapture={moveArcCapture} onPointerMove={moveCanvas} onPointerUp={upCanvasWithLineCommit} onDoubleClick={ev=>{if(interactionMode==='FLEXIBLE_LINE'){ev.preventDefault();endHistoryTransaction();setSelection(emptySelection(artboard.id));setPenHover(null);setBoundarySnap(null);setStatus('Polyline — Specify first point');}}} onPointerCancel={cancelEraserStroke}>
  <ArtboardBackgroundVisual artboard={artboard} assets={assets}/>
  {focusedPackagingPanelId&&(()=>{const panel=packagingPanels.find(item=>item.id===focusedPackagingPanelId);if(!panel)return null;return <div data-packaging-focus-mask style={{position:'absolute',left:panel.xMm*MM_TO_CSS_PX,top:panel.yMm*MM_TO_CSS_PX,width:panel.widthMm*MM_TO_CSS_PX,height:panel.heightMm*MM_TO_CSS_PX,boxShadow:'0 0 0 10000px rgba(15,23,42,.58)',outline:`${2/(zoom/100)}px solid #7c3aed`,pointerEvents:'none',zIndex:99990}}><span style={{position:'absolute',left:4/(zoom/100),top:4/(zoom/100),padding:`${2/(zoom/100)}px ${5/(zoom/100)}px`,fontSize:10/(zoom/100),fontWeight:800,background:'#7c3aed',color:'white',borderRadius:3/(zoom/100),whiteSpace:'nowrap'}}>{panel.name} · FOCUS</span></div>;})()}
  {packagingPanelMode&&<div data-packaging-panel-overlay style={{position:'absolute',inset:0,zIndex:100020,pointerEvents:'none'}}>{packagingPanels.map(panel=>{const selected=panel.id===activePackagingPanelId;return <button key={panel.id} type="button" data-packaging-panel-id={panel.id} aria-label={`Select packaging panel ${panel.name}`} title={`${panel.name} · ${panel.widthMm.toFixed(1)} × ${panel.heightMm.toFixed(1)} mm`} onPointerDown={event=>{event.preventDefault();event.stopPropagation();setActivePackagingPanelId(panel.id);setSelection(emptySelection(artboard.id));setStatus(`Panel selected — ${panel.name} · ${panel.widthMm.toFixed(1)} × ${panel.heightMm.toFixed(1)} mm`);}} onDoubleClick={event=>{event.preventDefault();event.stopPropagation();if(panel.editable){setFocusedPackagingPanelId(panel.id);setStatus(`Focus Panel — ${panel.name}`);}}} style={{position:'absolute',left:panel.xMm*MM_TO_CSS_PX,top:panel.yMm*MM_TO_CSS_PX,width:panel.widthMm*MM_TO_CSS_PX,height:panel.heightMm*MM_TO_CSS_PX,border:`${(selected?2:1.2)/(zoom/100)}px solid ${selected?'#7c3aed':'#0ea5e9'}`,background:selected?'rgba(124,58,237,.14)':'rgba(14,165,233,.07)',pointerEvents:'auto',cursor:panel.editable?'pointer':'not-allowed',padding:0}}><span style={{position:'absolute',left:3/(zoom/100),top:3/(zoom/100),fontSize:9/(zoom/100),fontWeight:800,color:selected?'#6d28d9':'#0369a1',background:'rgba(255,255,255,.88)',padding:`${1/(zoom/100)}px ${3/(zoom/100)}px`,borderRadius:2/(zoom/100),whiteSpace:'nowrap'}}>{panel.name}</span></button>;})}</div>}
  {showGrid&&<div data-artboard-grid-overlay style={{position:'absolute',inset:0,zIndex:90000,pointerEvents:'none',backgroundImage:`linear-gradient(to right, rgba(100,116,139,.16) 1px, transparent 1px),linear-gradient(to bottom, rgba(100,116,139,.16) 1px, transparent 1px)`,backgroundSize:`${gridPx}px ${gridPx}px`}}/>}
  {showRulers&&<><div className="card-ruler-corner"/><div className="card-ruler card-ruler-top" onPointerDown={ev=>{if(ev.button!==0)return;capture(ev);const p=point(ev);guideDrag.current={id:id('guide'),orientation:'VERTICAL',creating:true};setGuidePreview({orientation:'VERTICAL',positionMm:p.xMm});}}>{ticks.x.map(t=><i key={t.key} className={t.major?'major':''} style={{left:t.positionMm*MM_TO_CSS_PX}}><span>{t.label}</span></i>)}</div><div className="card-ruler card-ruler-left" onPointerDown={ev=>{if(ev.button!==0)return;capture(ev);const p=point(ev);guideDrag.current={id:id('guide'),orientation:'HORIZONTAL',creating:true};setGuidePreview({orientation:'HORIZONTAL',positionMm:p.yMm});}}>{ticks.y.map(t=><i key={t.key} className={t.major?'major':''} style={{top:t.positionMm*MM_TO_CSS_PX}}><span>{t.label}</span></i>)}</div></>}
  {print.showBleedInEditor&&<div className="card-print-bleed-boundary" style={{left:-print.bleed.leftMm*MM_TO_CSS_PX,top:-print.bleed.topMm*MM_TO_CSS_PX,right:-print.bleed.rightMm*MM_TO_CSS_PX,bottom:-print.bleed.bottomMm*MM_TO_CSS_PX}}/>}
  <div className="card-print-trim-boundary"/>
   {interactionMode==='ARC'&&<div data-cad-command-hint style={{position:'absolute',left:8/(zoom/100),bottom:8/(zoom/100),zIndex:100008,pointerEvents:'none',padding:`${4/(zoom/100)}px ${7/(zoom/100)}px`,fontSize:11/(zoom/100),borderRadius:4/(zoom/100),background:'rgba(17,24,39,.9)',color:'white'}}>{!arcDraft?'ARC — Specify start point':!arcDraft.through?'ARC — Specify through point':'ARC — Specify end point'}</div>}
   {arcDraft&&<svg data-cad-arc-preview aria-hidden="true" style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:100007,overflow:'visible'}} viewBox={`0 0 ${artboard.widthMm} ${artboard.heightMm}`} preserveAspectRatio="none">{arcDraft.through&&createCadArcGeometry(arcDraft.start,arcDraft.through,arcDraft.current)?(()=>{const built=createCadArcGeometry(arcDraft.start,arcDraft.through!,arcDraft.current)!;return <path d={geometryToSvgPath(built.geometry)} transform={`translate(${built.position.xMm} ${built.position.yMm})`} fill="none" stroke="#2563eb" strokeWidth={1.8/MM_TO_CSS_PX/(zoom/100)} vectorEffect="non-scaling-stroke"/>;})():<line x1={arcDraft.start.xMm} y1={arcDraft.start.yMm} x2={arcDraft.current.xMm} y2={arcDraft.current.yMm} stroke="#2563eb" strokeWidth={1.4/MM_TO_CSS_PX/(zoom/100)} strokeDasharray={`${3/MM_TO_CSS_PX/(zoom/100)} ${2/MM_TO_CSS_PX/(zoom/100)}`} vectorEffect="non-scaling-stroke"/>}<circle cx={arcDraft.start.xMm} cy={arcDraft.start.yMm} r={3/MM_TO_CSS_PX/(zoom/100)} fill="#2563eb"/>{arcDraft.through&&<circle cx={arcDraft.through.xMm} cy={arcDraft.through.yMm} r={3/MM_TO_CSS_PX/(zoom/100)} fill="#f59e0b"/>}</svg>}
   {referenceMirrorDraft&&<svg data-reference-line-mirror-preview aria-hidden="true" style={{position:'absolute',left:0,top:0,width:artboard.widthMm*MM_TO_CSS_PX,height:artboard.heightMm*MM_TO_CSS_PX,pointerEvents:'none',zIndex:100006,overflow:'visible'}} viewBox={`0 0 ${artboard.widthMm} ${artboard.heightMm}`} preserveAspectRatio="none"><line x1={referenceMirrorDraft.startX} y1={referenceMirrorDraft.startY} x2={referenceMirrorDraft.currentX} y2={referenceMirrorDraft.currentY} stroke="#8b5cf6" strokeWidth={1.8/MM_TO_CSS_PX/(zoom/100)} strokeDasharray={`${4/MM_TO_CSS_PX/(zoom/100)} ${3/MM_TO_CSS_PX/(zoom/100)}`} vectorEffect="non-scaling-stroke"/><circle cx={referenceMirrorDraft.startX} cy={referenceMirrorDraft.startY} r={3/MM_TO_CSS_PX/(zoom/100)} fill="#8b5cf6" vectorEffect="non-scaling-stroke"/><circle cx={referenceMirrorDraft.currentX} cy={referenceMirrorDraft.currentY} r={3/MM_TO_CSS_PX/(zoom/100)} fill="#8b5cf6" vectorEffect="non-scaling-stroke"/></svg>}
   {mirrorGuideAxis&&<div data-page-center-mirror-guide data-axis={mirrorGuideAxis} style={mirrorGuideAxis==='VERTICAL'?{position:'absolute',left:(artboard.widthMm/2)*MM_TO_CSS_PX,top:0,bottom:0,borderLeft:`${1.5/(zoom/100)}px dashed #8b5cf6`,pointerEvents:'none',zIndex:100004}:{position:'absolute',top:(artboard.heightMm/2)*MM_TO_CSS_PX,left:0,right:0,borderTop:`${1.5/(zoom/100)}px dashed #8b5cf6`,pointerEvents:'none',zIndex:100004}}/>}
  {print.showSafeAreaInEditor&&<div className="card-print-safe-boundary" style={{left:print.safeArea.leftMm*MM_TO_CSS_PX,top:print.safeArea.topMm*MM_TO_CSS_PX,right:print.safeArea.rightMm*MM_TO_CSS_PX,bottom:print.safeArea.bottomMm*MM_TO_CSS_PX}}/>}
  {print.showCropMarksInEditor&&<div className="card-print-crop-marks"><i className="tl"/><i className="tr"/><i className="bl"/><i className="br"/></div>}
  {cadHud&&angular45Guides.length>0&&<div data-cad-angular-guides style={{position:'absolute',inset:0,pointerEvents:'none',zIndex:99998}}><svg width="100%" height="100%" viewBox={`0 0 ${artboard.widthMm} ${artboard.heightMm}`} preserveAspectRatio="none">{angular45Guides.map(guide=>{const rad=guide.angle*Math.PI/180,endX=cadHud.startX+Math.cos(rad)*guide.lengthMm,endY=cadHud.startY+Math.sin(rad)*guide.lengthMm;return <g key={guide.angle} data-cad-angular-guide={guide.angle} data-active={guide.active?'true':'false'}><line x1={cadHud.startX} y1={cadHud.startY} x2={endX} y2={endY} stroke={guide.active?'#f59e0b':'#64748b'} opacity={guide.active?.95:.42} strokeWidth={(guide.active?1.5:.8)/MM_TO_CSS_PX/(zoom/100)} strokeDasharray={`${1.5/MM_TO_CSS_PX/(zoom/100)} ${1.5/MM_TO_CSS_PX/(zoom/100)}`} vectorEffect="non-scaling-stroke"/><text x={endX} y={endY} dx={3/MM_TO_CSS_PX/(zoom/100)} dy={-3/MM_TO_CSS_PX/(zoom/100)} fill={guide.active?'#b45309':'#64748b'} fontSize={8/MM_TO_CSS_PX/(zoom/100)}>{guide.angle}°</text></g>;})}</svg></div>}
  {cadHud&&<><div data-cad-tracking-guide style={{position:'absolute',left:0,top:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:99999}}><svg width="100%" height="100%" viewBox={`0 0 ${artboard.widthMm} ${artboard.heightMm}`} preserveAspectRatio="none"><line x1={cadHud.startX} y1={cadHud.startY} x2={cadHud.startX+Math.cos(cadHud.guideAngleDeg*Math.PI/180)*cadHud.rayLengthMm} y2={cadHud.startY+Math.sin(cadHud.guideAngleDeg*Math.PI/180)*cadHud.rayLengthMm} stroke="#a855f7" strokeWidth={1.2/MM_TO_CSS_PX/(zoom/100)} strokeDasharray={`${2/MM_TO_CSS_PX/(zoom/100)} ${1.5/MM_TO_CSS_PX/(zoom/100)}`} vectorEffect="non-scaling-stroke"/>{cadHud.intersections.slice(0,8).map((hit,index)=><g key={`${hit.elementId}-${index}`} data-cad-projected-intersection><circle cx={hit.x} cy={hit.y} r={3.5/MM_TO_CSS_PX/(zoom/100)} fill="#f59e0b" stroke="#fff" strokeWidth={1.4/MM_TO_CSS_PX/(zoom/100)} vectorEffect="non-scaling-stroke"/><line x1={hit.x-5/MM_TO_CSS_PX/(zoom/100)} y1={hit.y} x2={hit.x+5/MM_TO_CSS_PX/(zoom/100)} y2={hit.y} stroke="#f59e0b" strokeWidth={1/MM_TO_CSS_PX/(zoom/100)} vectorEffect="non-scaling-stroke"/><line x1={hit.x} y1={hit.y-5/MM_TO_CSS_PX/(zoom/100)} x2={hit.x} y2={hit.y+5/MM_TO_CSS_PX/(zoom/100)} stroke="#f59e0b" strokeWidth={1/MM_TO_CSS_PX/(zoom/100)} vectorEffect="non-scaling-stroke"/></g>)}</svg></div>{cadHud.intersections.slice(0,3).map((hit,index)=><div key={`cad-hit-label-${index}`} data-cad-intersection-label style={{position:'absolute',left:hit.x*MM_TO_CSS_PX+7/(zoom/100),top:hit.y*MM_TO_CSS_PX+7/(zoom/100),zIndex:100003,pointerEvents:'none',background:'rgba(120,53,15,.92)',color:'#fff7ed',padding:`${2/(zoom/100)}px ${5/(zoom/100)}px`,fontSize:9/(zoom/100),borderRadius:3/(zoom/100),whiteSpace:'nowrap'}}>{hit.distanceMm.toFixed(2)} mm</div>)}<div data-cad-angle-hud style={{position:'absolute',left:cadHud.xMm*MM_TO_CSS_PX+10/(zoom/100),top:cadHud.yMm*MM_TO_CSS_PX-30/(zoom/100),zIndex:100002,pointerEvents:'none',background:'rgba(17,24,39,.92)',color:'white',padding:`${4/(zoom/100)}px ${7/(zoom/100)}px`,fontSize:11/(zoom/100),borderRadius:4/(zoom/100),fontVariantNumeric:'tabular-nums',whiteSpace:'nowrap',boxShadow:'0 1px 3px rgba(0,0,0,.25)'}}>{cadHud.label?`${cadHud.label} · `:''}{cadHud.angleDeg.toFixed(1)}° · {cadHud.lengthMm.toFixed(2)} mm</div></>}
  {cadHud&&((interactionMode==='DRAW_SHAPE'&&drawShapeType==='LINE')||interactionMode==='ANGLE_LINE')&&drawDraft&&<div data-cad-dynamic-input onPointerDown={e=>e.stopPropagation()} onPointerUp={e=>e.stopPropagation()} onPointerMove={e=>e.stopPropagation()} onClick={e=>e.stopPropagation()} onDoubleClick={e=>e.stopPropagation()} style={{position:'absolute',left:drawDraft.startX*MM_TO_CSS_PX+12/(zoom/100),top:drawDraft.startY*MM_TO_CSS_PX+12/(zoom/100),zIndex:100010,display:'flex',alignItems:'center',gap:4/(zoom/100),background:'rgba(17,24,39,.96)',color:'white',padding:`${4/(zoom/100)}px ${6/(zoom/100)}px`,borderRadius:4/(zoom/100),boxShadow:'0 2px 6px rgba(0,0,0,.28)',fontSize:10/(zoom/100)}}><span>L</span><input ref={cadLengthInputRef} aria-label="CAD line length" type="number" min="0.01" step="0.01" value={cadDynamicInput.focused==='LENGTH'?cadDynamicInput.length:cadHud.lengthMm.toFixed(2)} onPointerDown={e=>e.stopPropagation()} onPointerMove={e=>e.stopPropagation()} onFocus={()=>setCadDynamicInput(v=>({length:v.length||cadHud.lengthMm.toFixed(2),angle:v.angle||cadHud.guideAngleDeg.toFixed(2),focused:'LENGTH'}))} onChange={e=>setCadDynamicInput(v=>({...v,length:e.target.value,focused:'LENGTH'}))} onKeyDown={e=>{e.stopPropagation();if(e.key==='Tab'){e.preventDefault();setCadDynamicInput(v=>({...v,focused:'ANGLE'}));queueMicrotask(()=>cadAngleInputRef.current?.focus());}else if(e.key==='Enter'){e.preventDefault();commitDynamicCadLine();}else if(e.key==='Escape'){e.preventDefault();setInteractionMode('SELECT');}}} style={{width:62/(zoom/100),fontSize:10/(zoom/100),padding:`${2/(zoom/100)}px ${3/(zoom/100)}px`}}/><span>mm</span><span>A</span><input ref={cadAngleInputRef} aria-label="CAD line angle" type="number" step="0.01" value={cadDynamicInput.focused==='ANGLE'?cadDynamicInput.angle:cadHud.guideAngleDeg.toFixed(2)} onPointerDown={e=>e.stopPropagation()} onPointerMove={e=>e.stopPropagation()} onFocus={()=>setCadDynamicInput(v=>({length:v.length||cadHud.lengthMm.toFixed(2),angle:v.angle||cadHud.guideAngleDeg.toFixed(2),focused:'ANGLE'}))} onChange={e=>setCadDynamicInput(v=>({...v,angle:e.target.value,focused:'ANGLE'}))} onKeyDown={e=>{e.stopPropagation();if(e.key==='Tab'){e.preventDefault();setCadDynamicInput(v=>({...v,focused:'LENGTH'}));queueMicrotask(()=>cadLengthInputRef.current?.focus());}else if(e.key==='Enter'){e.preventDefault();commitDynamicCadLine();}else if(e.key==='Escape'){e.preventDefault();setInteractionMode('SELECT');}}} style={{width:58/(zoom/100),fontSize:10/(zoom/100),padding:`${2/(zoom/100)}px ${3/(zoom/100)}px`}}/><span>°</span></div>}
  {interactionMode==='DRAW_SHAPE'&&drawShapeType==='CIRCLE'&&drawDraft&&(()=>{const liveRadius=Math.hypot(drawDraft.currentX-drawDraft.startX,drawDraft.currentY-drawDraft.startY);return <div data-cad-circle-radius-input onPointerDown={e=>e.stopPropagation()} onPointerUp={e=>e.stopPropagation()} onPointerMove={e=>e.stopPropagation()} onClick={e=>e.stopPropagation()} style={{position:'absolute',left:drawDraft.startX*MM_TO_CSS_PX+12/(zoom/100),top:drawDraft.startY*MM_TO_CSS_PX+12/(zoom/100),zIndex:100011,display:'flex',alignItems:'center',gap:4/(zoom/100),background:'rgba(17,24,39,.96)',color:'white',padding:`${4/(zoom/100)}px ${6/(zoom/100)}px`,borderRadius:4/(zoom/100),boxShadow:'0 2px 6px rgba(0,0,0,.28)',fontSize:10/(zoom/100)}}><span>R</span><input ref={cadCircleRadiusInputRef} aria-label="CAD circle radius" type="number" min="0.5" step="0.01" value={cadCircleRadiusInput.focused?cadCircleRadiusInput.radius:liveRadius.toFixed(2)} onPointerDown={e=>e.stopPropagation()} onPointerMove={e=>e.stopPropagation()} onFocus={()=>setCadCircleRadiusInput(v=>({radius:v.radius||liveRadius.toFixed(2),focused:true}))} onChange={e=>setCadCircleRadiusInput({radius:e.target.value,focused:true})} onKeyDown={e=>{e.stopPropagation();if(e.key==='Enter'){e.preventDefault();commitDynamicCadCircle();}else if(e.key==='Escape'){e.preventDefault();setInteractionMode('SELECT');}}} style={{width:72/(zoom/100),fontSize:10/(zoom/100),padding:`${2/(zoom/100)}px ${3/(zoom/100)}px`}}/><span>mm</span></div>;})()}
  {projectedOrthoGuide&&<div data-cad-projected-ortho-guide style={{position:'absolute',inset:0,pointerEvents:'none',zIndex:100005}}><svg width="100%" height="100%" viewBox={`0 0 ${artboard.widthMm} ${artboard.heightMm}`} preserveAspectRatio="none"><line x1={projectedOrthoGuide.verticalFrom.x} y1={projectedOrthoGuide.verticalFrom.y} x2={projectedOrthoGuide.point.x} y2={projectedOrthoGuide.point.y} stroke="#22c55e" strokeWidth={1/MM_TO_CSS_PX/(zoom/100)} strokeDasharray={`${2/MM_TO_CSS_PX/(zoom/100)} ${2/MM_TO_CSS_PX/(zoom/100)}`} vectorEffect="non-scaling-stroke"/><line x1={projectedOrthoGuide.horizontalFrom.x} y1={projectedOrthoGuide.horizontalFrom.y} x2={projectedOrthoGuide.point.x} y2={projectedOrthoGuide.point.y} stroke="#22c55e" strokeWidth={1/MM_TO_CSS_PX/(zoom/100)} strokeDasharray={`${2/MM_TO_CSS_PX/(zoom/100)} ${2/MM_TO_CSS_PX/(zoom/100)}`} vectorEffect="non-scaling-stroke"/></svg></div>}
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
  {cardinalHover&&(()=>{const activeDetail=boundarySnap?.detailId?.startsWith('CARDINAL_')?boundarySnap.detailId:undefined;return <div data-cad-cardinal-hover-points style={{position:'absolute',inset:0,pointerEvents:'none',zIndex:100004}}><svg width="100%" height="100%" viewBox={`0 0 ${artboard.widthMm} ${artboard.heightMm}`} preserveAspectRatio="none">{cardinalHover.points.map(point_=>{const active=activeDetail===`CARDINAL_${point_.angle}`&&boundarySnap?.elementId===cardinalHover.elementId;const r=(active?5:3.6)/MM_TO_CSS_PX/(zoom/100);return <g key={`cardinal-${point_.angle}`} data-cardinal-angle={point_.angle} data-snap-state={active?'LOCKED':'AVAILABLE'}><circle cx={point_.x} cy={point_.y} r={r} fill={active?'#22c55e':'#ffffff'} stroke={active?'#16a34a':'#64748b'} strokeWidth={(active?2:1.4)/MM_TO_CSS_PX/(zoom/100)} vectorEffect="non-scaling-stroke"/><line x1={point_.x-r*1.8} y1={point_.y} x2={point_.x+r*1.8} y2={point_.y} stroke={active?'#16a34a':'#64748b'} strokeWidth={1/MM_TO_CSS_PX/(zoom/100)} vectorEffect="non-scaling-stroke"/><line x1={point_.x} y1={point_.y-r*1.8} x2={point_.x} y2={point_.y+r*1.8} stroke={active?'#16a34a':'#64748b'} strokeWidth={1/MM_TO_CSS_PX/(zoom/100)} vectorEffect="non-scaling-stroke"/></g>;})}</svg>{cardinalHover.points.map(point_=>{const active=activeDetail===`CARDINAL_${point_.angle}`&&boundarySnap?.elementId===cardinalHover.elementId;return <span key={`cardinal-label-${point_.angle}`} data-cardinal-label style={{position:'absolute',left:point_.x*MM_TO_CSS_PX+6/(zoom/100),top:point_.y*MM_TO_CSS_PX-16/(zoom/100),fontSize:9/(zoom/100),fontWeight:700,color:active?'#15803d':'#475569',background:'rgba(255,255,255,.88)',padding:`${1/(zoom/100)}px ${3/(zoom/100)}px`,borderRadius:3/(zoom/100),whiteSpace:'nowrap'}}>{point_.angle}°</span>;})}</div>;})()}
  {(boundaryHover||boundarySnap)&&(()=>{const feedback=boundarySnap??boundaryHover!;const target=artboard.elements.find(element=>element.id===feedback.elementId);if(!target||(target.type!=='PATH'&&target.type!=='SHAPE'))return null;const geo=target.type==='PATH'?target.geometry:shapeToPathGeometry(target.shape,target.size);const locked=boundarySnap?.elementId===target.id;return <div data-snap-target-boundary data-snap-state={locked?'LOCKED':'HOVER'} style={{position:'absolute',left:target.position.xMm*MM_TO_CSS_PX,top:target.position.yMm*MM_TO_CSS_PX,width:target.size.widthMm*MM_TO_CSS_PX,height:target.size.heightMm*MM_TO_CSS_PX,transform:`rotate(${target.rotationDeg}deg)`,transformOrigin:'center',pointerEvents:'none',zIndex:99998}}><svg viewBox={`0 0 ${target.size.widthMm} ${target.size.heightMm}`} preserveAspectRatio="none" style={{width:'100%',height:'100%',overflow:'visible'}}><path d={geometryToSvgPath(geo)} fill="none" stroke={locked?'#22c55e':'var(--accent-color)'} strokeWidth={(locked?2.4:1.4)/MM_TO_CSS_PX/(zoom/100)} vectorEffect="non-scaling-stroke" opacity={locked?1:.65}/></svg></div>;})()}
  {spacingGuides.map((guide,index)=>guide.axis==='X'?<div key={`spacing-x-${index}`} data-spacing-guide style={{position:'absolute',left:guide.fromMm*MM_TO_CSS_PX,top:guide.crossMm*MM_TO_CSS_PX,width:Math.max(0,(guide.toMm-guide.fromMm)*MM_TO_CSS_PX),height:0,borderTop:`${1/(zoom/100)}px dashed #db2777`,pointerEvents:'none',zIndex:100002}}><span style={{position:'absolute',left:'50%',top:-18/(zoom/100),transform:'translateX(-50%)',fontSize:10/(zoom/100),padding:`${1/(zoom/100)}px ${4/(zoom/100)}px`,background:'#fff',color:'#be185d',border:`${1/(zoom/100)}px solid #f9a8d4`,borderRadius:3/(zoom/100),whiteSpace:'nowrap'}}>{normalizeDisplayValue(guide.gapMm)} mm</span><i style={{position:'absolute',left:0,top:-4/(zoom/100),height:8/(zoom/100),borderLeft:`${1/(zoom/100)}px solid #db2777`}}/><i style={{position:'absolute',right:0,top:-4/(zoom/100),height:8/(zoom/100),borderRight:`${1/(zoom/100)}px solid #db2777`}}/></div>:<div key={`spacing-y-${index}`} data-spacing-guide style={{position:'absolute',left:guide.crossMm*MM_TO_CSS_PX,top:guide.fromMm*MM_TO_CSS_PX,height:Math.max(0,(guide.toMm-guide.fromMm)*MM_TO_CSS_PX),width:0,borderLeft:`${1/(zoom/100)}px dashed #db2777`,pointerEvents:'none',zIndex:100002}}><span style={{position:'absolute',left:6/(zoom/100),top:'50%',transform:'translateY(-50%)',fontSize:10/(zoom/100),padding:`${1/(zoom/100)}px ${4/(zoom/100)}px`,background:'#fff',color:'#be185d',border:`${1/(zoom/100)}px solid #f9a8d4`,borderRadius:3/(zoom/100),whiteSpace:'nowrap'}}>{normalizeDisplayValue(guide.gapMm)} mm</span><i style={{position:'absolute',top:0,left:-4/(zoom/100),width:8/(zoom/100),borderTop:`${1/(zoom/100)}px solid #db2777`}}/><i style={{position:'absolute',bottom:0,left:-4/(zoom/100),width:8/(zoom/100),borderBottom:`${1/(zoom/100)}px solid #db2777`}}/></div>)}
   {eraserPoints.length>0&&<svg data-eraser-lasso viewBox={`0 0 ${artboard.widthMm} ${artboard.heightMm}`} preserveAspectRatio="none" style={{position:'absolute',inset:0,width:'100%',height:'100%',overflow:'visible',pointerEvents:'none',zIndex:100003}}><polyline points={eraserPoints.map(p=>`${p.xMm},${p.yMm}`).join(' ')} fill="none" stroke="rgba(239,68,68,.55)" strokeWidth={12/MM_TO_CSS_PX/(zoom/100)} strokeLinecap="round" strokeLinejoin="round"/></svg>}
  {boundarySnap&&(()=>{const scale=zoom/100,size=10/scale,left=boundarySnap.point.x*MM_TO_CSS_PX-size/2,top=boundarySnap.point.y*MM_TO_CSS_PX-size/2,label=boundarySnap.kind.replace('_',' ');const common:React.CSSProperties={position:'absolute',left,top,width:size,height:size,boxSizing:'border-box',pointerEvents:'none',zIndex:100000};if(boundarySnap.kind==='INTERSECTION')return <div data-boundary-snap-marker data-snap-kind={boundarySnap.kind} title={label} style={{...common,color:'#22c55e',fontSize:12/scale,lineHeight:`${size}px`,fontWeight:800,textAlign:'center'}}>×</div>;const square=boundarySnap.kind==='LINE_ENDPOINT'||boundarySnap.kind==='VERTEX';return <div data-boundary-snap-marker data-snap-kind={boundarySnap.kind} title={label} style={{...common,borderRadius:square?'2px':'50%',border:`${2/scale}px solid #22c55e`,background:'white'}}/>;})()}
  {multiSelectionBounds&&interactionMode==='SELECT'&&<div className="card-multi-selection-box" style={{left:multiSelectionBounds.xMm*MM_TO_CSS_PX,top:multiSelectionBounds.yMm*MM_TO_CSS_PX,width:multiSelectionBounds.widthMm*MM_TO_CSS_PX,height:multiSelectionBounds.heightMm*MM_TO_CSS_PX}}>
    {(['nw','n','ne','e','se','s','sw','w'] as const).map(h=><i key={h} className={`card-transform-handle ${h}`} onPointerDown={ev=>{capture(ev);const p=point(ev);beginHistoryTransaction();interaction.current={mode:'MULTI_RESIZE',elements:multiSelectionElements.map(element=>structuredClone(element)),bounds:{...multiSelectionBounds},anchor:h.toUpperCase() as Op extends {mode:'MULTI_RESIZE';anchor:infer A}?A:never,startX:p.xMm,startY:p.yMm};}}/>)}
  </div>}
  {[...artboard.elements].sort((a,b)=>a.zIndex-b.zIndex||a.id.localeCompare(b.id)).filter(e=>e.visible && (!e.runtimeHidden || showHiddenElements)).map(e=>{
    const isSelected=selection.elementIds.includes(e.id);
    const trimmerTarget = interactionMode === 'TRIMMER' ? trimmerTargets.get(e.id) : undefined;
    const isPathEditing = trimmerTarget !== undefined || ((interactionMode==='EDIT_PATH' || interactionMode==='SCISSORS') && isSelected && e.type === 'PATH');
    const showSelectionBox = isSelected && interactionMode !== 'PEN' && interactionMode !== 'FLEXIBLE_LINE' && interactionMode !== 'SPLIT' && interactionMode !== 'SCISSORS' && interactionMode !== 'TRIMMER' && interactionMode !== 'ERASER' && interactionMode !== 'FILL_BUCKET' && !isPathEditing;
    const isPrimarySelection = selection.elementIds.length > 1 && selection.primaryElementId === e.id;
    const showHandles = selection.elementIds.length === 1 && isSelected && !e.locked && interactionMode !== 'PEN' && interactionMode !== 'FLEXIBLE_LINE' && interactionMode !== 'SPLIT' && interactionMode !== 'SCISSORS' && interactionMode !== 'TRIMMER' && interactionMode !== 'ERASER' && interactionMode !== 'FILL_BUCKET' && !isPathEditing;
    const inspectionGeometry=showHandles&&(e.type==='SHAPE'||e.type==='PATH')?vectorGeometryForElement(e):null;
    const panelClip=focusedPackagingPanel?packagingClipInsets(e,focusedPackagingPanel):undefined;
    const packagingClipPath=panelClip&&e.rotationDeg===0?`inset(${panelClip.topMm*MM_TO_CSS_PX}px ${panelClip.rightMm*MM_TO_CSS_PX}px ${panelClip.bottomMm*MM_TO_CSS_PX}px ${panelClip.leftMm*MM_TO_CSS_PX}px)`:undefined;
    return <div key={e.id} data-element-id={e.id} className={`card-design-element-shell has-visual type-${e.type.toLowerCase()} ${showSelectionBox?'selected':''} ${isPrimarySelection?'primary-selected':''} ${e.locked?'locked':''} ${e.runtimeHidden?'ghosted':''} ${isPathEditing?'path-editing':''}`} style={{left:e.position.xMm*MM_TO_CSS_PX,top:e.position.yMm*MM_TO_CSS_PX,width:e.size.widthMm*MM_TO_CSS_PX,height:e.size.heightMm*MM_TO_CSS_PX,transform:`rotate(${e.rotationDeg}deg)`,opacity:e.runtimeHidden?e.opacity*0.4:e.opacity,zIndex:e.zIndex+1,outline:e.runtimeHidden?'1px dashed var(--accent-color)':undefined,cursor:interactionMode==='TRIMMER'?TRIMMER_CURSOR:undefined, clipPath:packagingClipPath,pointerEvents: (interactionMode === 'PEN' || interactionMode === 'FLEXIBLE_LINE' || interactionMode === 'DRAW_SHAPE' || interactionMode === 'SPLIT' || interactionMode === 'MIRROR_LINE' || interactionMode === 'XLINE' || interactionMode === 'RAY' || interactionMode === 'ANGLE_LINE' || interactionMode==='ERASER') ? 'none' : undefined}} onDoubleClick={ev=>{if(e.type==='PATH'&&!e.locked){ev.stopPropagation();setInteractionMode('EDIT_PATH');setPathSelectedNodeIds([]);}}} onPointerDown={ev=>{if(ev.button!==0)return;if(interactionMode==='REFERENCE_ALIGN'){ev.preventDefault();ev.stopPropagation();const p=point(ev);handleReferenceAlignClick(e,{x:p.xMm,y:p.yMm});return;}if(interactionMode==='FILL_BUCKET'){ev.preventDefault();ev.stopPropagation();applyBucketFill(e);return;}if(interactionMode==='PEN' || interactionMode === 'FLEXIBLE_LINE' || interactionMode==='DRAW_SHAPE' || interactionMode==='SPLIT' || interactionMode==='MIRROR_LINE' || interactionMode==='XLINE' || interactionMode==='RAY' || interactionMode==='ANGLE_LINE' || interactionMode==='TRIMMER')return;capture(ev);const p=point(ev),groupIds=e.metadata?.faceGeneration==='AUTO_SECTION'&&!ev.altKey?[e.id]:expandElementIdsToGroups(artboard,[e.id]),toggle=ev.ctrlKey||ev.metaKey||ev.shiftKey;let next:DesignSelectionState;if(toggle){const remove=groupIds.every(gid=>selection.elementIds.includes(gid));next=selection;for(const gid of groupIds)if(remove===next.elementIds.includes(gid))next=toggleSelection(next,gid);if(!remove)next={...next,primaryElementId:e.id};}else next=isSelected?selection:{artboardId:artboard.id,elementIds:groupIds,primaryElementId:e.id};setSelection(next);if(interactionMode==='EDIT_PATH' && (!isSelected || e.type !== 'PATH' || toggle)){setInteractionMode('SELECT');setPathSelectedNodeIds([]);} if(!toggle&&!e.locked&&next.elementIds.includes(e.id)){ if (!(interactionMode==='EDIT_PATH' && e.type === 'PATH' && isSelected)) { beginHistoryTransaction();interaction.current={mode:'MOVE',lastX:p.xMm,lastY:p.yMm,ids:next.elementIds.flatMap(elementId=>{const selected=artboard.elements.find(item=>item.id===elementId);return selected?.metadata?.faceGeneration==='AUTO_SECTION'?[elementId]:expandElementIdsToGroups(artboard,[elementId]);})}; }}}}>
    <ElementVisual element={e} assets={assets} mutate={commitMutate} artboardId={artboard.id} artboard={artboard}/>
    {inspectionGeometry&&<VectorSelectionInspectionOverlay element={e} geometry={inspectionGeometry} zoom={zoom}/>} 
    {showHandles&&<><i className="card-rotation-stem"/><i className="card-rotation-handle" onPointerDown={ev=>{capture(ev);const p=point(ev),c={xMm:e.position.xMm+e.size.widthMm/2,yMm:e.position.yMm+e.size.heightMm/2};beginHistoryTransaction();interaction.current={mode:'ROTATE',element:e,startAngle:Math.atan2(p.yMm-c.yMm,p.xMm-c.xMm),startRotation:e.rotationDeg};}}/>{(['nw','n','ne','e','se','s','sw','w'] as const).map(h=><i key={h} className={`card-transform-handle ${h}`} onPointerDown={ev=>{capture(ev);const p=point(ev);beginHistoryTransaction();interaction.current={mode:'RESIZE',element:e,anchor:h.toUpperCase() as Op extends {mode:'RESIZE';anchor:infer A}?A:never,startX:p.xMm,startY:p.yMm,defaultKeepAspect:e.type==='IMAGE'?(e.maintainAspectRatio??true):false,centerBased:ev.altKey};}}/>)}</>}
    {isPathEditing && <PathNodeEditor element={(trimmerTarget ?? e) as PathDesignElement} zoom={zoom} interactionMode={interactionMode} pathSelectedNodeIds={pathSelectedNodeIds} setPathSelectedNodeIds={setPathSelectedNodeIds} pathSelectedSegmentIds={pathSelectedSegmentIds} setPathSelectedSegmentIds={setPathSelectedSegmentIds} mutate={commitMutate} artboardId={artboard.id} beginHistoryTransaction={beginHistoryTransaction} endHistoryTransaction={endHistoryTransaction} onTrimGeometry={geometry=>commitTrimFragments(e.id,geometry)} allElements={artboard.elements} artboard={artboard} snapEnabled={snapEnabled} gridSnapEnabled={gridSnapEnabled} guideSnapEnabled={guideSnapEnabled} gridSizeMm={gridSizeMm} showSmartCenters={showSmartCenters} symmetryMode={pathSymmetryMode} />}
   </div>})}
  {showSmartCenters&&<><div data-artboard-center-guide="x" className="card-smart-center-guide vertical" style={{left:(artboard.widthMm/2)*MM_TO_CSS_PX}}/><div data-artboard-center-guide="y" className="card-smart-center-guide horizontal" style={{top:(artboard.heightMm/2)*MM_TO_CSS_PX}}/></>}
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

 function VectorSelectionInspectionOverlay({element,geometry,zoom}:{element:DesignElement;geometry:PathGeometry;zoom:number}){
  const scale=zoom/100,byId=new Map(geometry.points.map(point=>[point.id,point] as const));
  const endpointIds=new Set(geometry.segments.flatMap(segment=>[segment.fromPointId,segment.toPointId]));
  const midpoints=geometry.segments.map(segment=>{const from=byId.get(segment.fromPointId),to=byId.get(segment.toPointId);return from&&to?{id:segment.id,x:(from.x+to.x)/2,y:(from.y+to.y)/2}:null;}).filter((point):point is {id:string;x:number;y:number}=>Boolean(point));
  const markerRadius=3.2/MM_TO_CSS_PX/scale;
  return <div className="card-vector-inspection" data-vector-selection-inspection style={{position:'absolute',inset:0,pointerEvents:'none',zIndex:4}}>
   <svg width="100%" height="100%" viewBox={`0 0 ${element.size.widthMm} ${element.size.heightMm}`} preserveAspectRatio="none" style={{overflow:'visible'}}>
    {geometry.points.filter(point=>endpointIds.has(point.id)).map(point=><rect key={`endpoint-${point.id}`} data-vector-endpoint x={point.x-markerRadius} y={point.y-markerRadius} width={markerRadius*2} height={markerRadius*2} fill="#fff" stroke="#2563eb" strokeWidth={1.4/MM_TO_CSS_PX/scale} vectorEffect="non-scaling-stroke"/>)}
    {midpoints.map(point=><circle key={`midpoint-${point.id}`} data-vector-midpoint cx={point.x} cy={point.y} r={markerRadius*.85} fill="#fef3c7" stroke="#d97706" strokeWidth={1.3/MM_TO_CSS_PX/scale} vectorEffect="non-scaling-stroke"/>)}
    <circle data-vector-center cx={element.size.widthMm/2} cy={element.size.heightMm/2} r={markerRadius} fill="#dbeafe" stroke="#2563eb" strokeWidth={1.3/MM_TO_CSS_PX/scale} vectorEffect="non-scaling-stroke"/>
   </svg>
   <span data-vector-measurement style={{position:'absolute',left:'50%',bottom:-24/scale,transform:`translateX(-50%) scale(${1/scale})`,transformOrigin:'top center',padding:'2px 5px',borderRadius:3,background:'rgba(15,23,42,.9)',color:'#fff',fontSize:10,whiteSpace:'nowrap'}}>{normalizeDisplayValue(element.size.widthMm)} × {normalizeDisplayValue(element.size.heightMm)} mm · {normalizeDisplayValue(element.rotationDeg)}°</span>
  </div>;
 }

 function LayerPanel({artboard,selection,interactionMode,setSelection,mutate,duplicateSelected,groupSelected,ungroupSelected,regroupSelected,canRegroup}:{artboard:Artboard;selection:DesignSelectionState;interactionMode:'SELECT'|'EDIT_PATH'|'SCISSORS'|'PEN'|'TRIMMER'|'SPLIT'|'ERASER'|'FILL_BUCKET'|'DRAW_SHAPE'|'FLEXIBLE_LINE'|'MIRROR_LINE'|'XLINE'|'RAY'|'ANGLE_LINE'|'ARC'|'REFERENCE_ALIGN';setSelection:(s:DesignSelectionState)=>void;mutate:(f:(t:DesignTemplate)=>DesignTemplate)=>void;duplicateSelected:()=>void;groupSelected:()=>void;ungroupSelected:()=>void;regroupSelected:()=>void;canRegroup:boolean}){
  const layers=orderedLayers(artboard),selectedSet=new Set(selection.elementIds);
  const [collapsedGroups,setCollapsedGroups]=useState<Record<string,boolean>>({});
  const selectedGroups=[...new Set(selection.elementIds.map(id=>groupForElement(artboard,id)?.id).filter(Boolean) as string[])];
  const groupById=new Map(artboard.groups.map(group=>[group.id,group] as const));
  const renderedGroups=new Set<string>();
  const layerUnits:Array<{kind:'GROUP';group:Artboard['groups'][number];members:DesignElement[]}|{kind:'ELEMENT';element:DesignElement}>=[];
  for(const layer of layers){
    const group=layer.groupId?groupById.get(layer.groupId):undefined;
    if(!group){layerUnits.push({kind:'ELEMENT',element:layer});continue;}
    if(renderedGroups.has(group.id))continue;
    renderedGroups.add(group.id);
    const memberSet=new Set(group.elementIds);
    layerUnits.push({kind:'GROUP',group,members:layers.filter(item=>memberSet.has(item.id))});
  }
  const getLayerIcon=(type:string)=>{
    switch(type){
      case 'TEXT':return <Type size={14}/>;
      case 'IMAGE':return <ImageIcon size={14}/>;
      case 'SVG':return <PenLine size={14}/>;
      case 'SHAPE':return <Box size={14}/>;
      default:return <Shapes size={14}/>;
    }
  };
  const selectGroup=(group:Artboard['groups'][number])=>{
    const members=layers.filter(layer=>group.elementIds.includes(layer.id));
    setSelection({artboardId:artboard.id,elementIds:members.map(member=>member.id),primaryElementId:members[0]?.id});
  };
  const renameGroupOnBlur=(group:Artboard['groups'][number],value:string)=>{
    const name=value.trim();if(name&&name!==group.name)mutate(t=>renameGroup(t,artboard.id,group.id,name));
  };
  const orderDisabled=!selection.elementIds.length||interactionMode!=='SELECT';
  return <div className="card-layers-panel">
    <div className="card-panel-heading"><div><strong>Layers</strong><small>{layers.length} element{layers.length===1?'':'s'} · {artboard.groups.length} group{artboard.groups.length===1?'':'s'}</small></div></div>
    <div className="card-layer-toolbar">
      <div className="card-layer-actions">
        <button onClick={duplicateSelected} disabled={!selection.elementIds.length}>Duplicate</button>
        <button onClick={groupSelected} disabled={selection.elementIds.length<2||selectedGroups.length>0}>Group</button>
        <button onClick={ungroupSelected} disabled={!selectedGroups.length}>Ungroup</button>
        <button onClick={regroupSelected} disabled={!canRegroup}>Regroup</button>
      </div>
      <div className="card-layer-order-actions" aria-label="Layer order actions">
        <button title="Bring to front" aria-label="Bring to front" disabled={orderDisabled} onClick={()=>mutate(t=>moveLayers(t,artboard.id,selection.elementIds,'FRONT'))}><ArrowUp size={12}/><ArrowUp size={12}/><span>Front</span></button>
        <button title="Move up" aria-label="Move up" disabled={orderDisabled} onClick={()=>mutate(t=>moveLayers(t,artboard.id,selection.elementIds,'FORWARD'))}><ArrowUp size={12}/><span>Up</span></button>
        <button title="Move down" aria-label="Move down" disabled={orderDisabled} onClick={()=>mutate(t=>moveLayers(t,artboard.id,selection.elementIds,'BACKWARD'))}><ArrowDown size={12}/><span>Down</span></button>
        <button title="Send to back" aria-label="Send to back" disabled={orderDisabled} onClick={()=>mutate(t=>moveLayers(t,artboard.id,selection.elementIds,'BACK'))}><ArrowDown size={12}/><ArrowDown size={12}/><span>Back</span></button>
      </div>
    </div>
    <div className="card-layer-list">
      {layerUnits.length?layerUnits.map(unit=>{
        if(unit.kind==='GROUP'){
          const {group,members}=unit,groupSelected=group.elementIds.length===selection.elementIds.length&&group.elementIds.every(id=>selectedSet.has(id));
          const collapsed=Boolean(collapsedGroups[group.id]);
          const groupVisible=members.every(member=>member.visible),groupLocked=members.every(member=>member.locked);
          return <div key={group.id} className={`card-layer-group-container ${groupSelected?'active':''}`}>
            <div className="card-layer-group-header" onClick={()=>selectGroup(group)}>
              <button className="card-layer-collapse" title={collapsed?'Expand group':'Collapse group'} aria-label={collapsed?'Expand group':'Collapse group'} onClick={event=>{event.stopPropagation();setCollapsedGroups(current=>({...current,[group.id]:!collapsed}));}}>{collapsed?<ChevronRight size={14}/>:<ChevronDown size={14}/>}</button>
              <div className="card-layer-group-icon"><Layers3 size={14}/></div>
              <div className="card-layer-group-title">
                <input key={`${group.id}:${group.name}`} aria-label={`Rename group ${group.name}`} defaultValue={group.name} onClick={event=>event.stopPropagation()} onBlur={event=>renameGroupOnBlur(group,event.target.value)} onKeyDown={event=>{if(event.key==='Enter')(event.currentTarget as HTMLInputElement).blur();if(event.key==='Escape'){event.currentTarget.value=group.name;(event.currentTarget as HTMLInputElement).blur();}}}/>
                <small>{members.length} item{members.length===1?'':'s'}</small>
              </div>
              <div className="card-layer-group-quick-actions" onClick={event=>event.stopPropagation()}>
                <button title={groupVisible?'Hide group':'Show group'} onClick={()=>mutate(t=>setGroupVisibility(t,artboard.id,group.id,!groupVisible))}>{groupVisible?<Eye size={12}/>:<EyeOff size={12}/>}</button>
                <button title={groupLocked?'Unlock group':'Lock group'} onClick={()=>mutate(t=>setGroupLocked(t,artboard.id,group.id,!groupLocked))}>{groupLocked?<Lock size={12}/>:<Unlock size={12}/>}</button>
              </div>
            </div>
            <div className="card-layer-group-order" aria-label={`${group.name} layer order`}>
              <button title="Bring group to front" disabled={interactionMode!=='SELECT'} onClick={()=>mutate(t=>moveLayers(t,artboard.id,group.elementIds,'FRONT'))}><ArrowUp size={12}/><ArrowUp size={12}/></button>
              <button title="Move group up" disabled={interactionMode!=='SELECT'} onClick={()=>mutate(t=>moveLayers(t,artboard.id,group.elementIds,'FORWARD'))}><ArrowUp size={12}/></button>
              <button title="Move group down" disabled={interactionMode!=='SELECT'} onClick={()=>mutate(t=>moveLayers(t,artboard.id,group.elementIds,'BACKWARD'))}><ArrowDown size={12}/></button>
              <button title="Send group to back" disabled={interactionMode!=='SELECT'} onClick={()=>mutate(t=>moveLayers(t,artboard.id,group.elementIds,'BACK'))}><ArrowDown size={12}/><ArrowDown size={12}/></button>
            </div>
            {!collapsed&&<div className="card-layer-group-children">{members.map(layer=><div key={layer.id} className={`card-layer-child ${selectedSet.has(layer.id)?'active':''}`}>
              <div className="card-layer-child-guide"/>
              <div className="card-layer-icon">{getLayerIcon(layer.type)}</div>
              <input aria-label={`Rename ${layer.name}`} value={layer.name||''} placeholder={layer.type} onChange={event=>mutate(t=>renameElement(t,artboard.id,layer.id,event.target.value))}/>
              <span className="card-layer-child-state" title="Inherited from group">{layer.locked?<Lock size={11}/>:null}{!layer.visible?<EyeOff size={11}/>:null}</span>
            </div>)}</div>}
          </div>;
        }
        const layer=unit.element;
        return <div key={layer.id} className={`card-layer-row ${selectedSet.has(layer.id)?'active':''}`}>
          <button className="card-layer-main" title={layer.metadata?.faceGeneration==='AUTO_SECTION'?'Click: select section · Alt+Click: select component':undefined} onClick={event=>setSelection({artboardId:artboard.id,elementIds:layer.metadata?.faceGeneration==='AUTO_SECTION'&&!event.altKey?[layer.id]:expandElementIdsToGroups(artboard,[layer.id]),primaryElementId:layer.id})}>
            <div className="card-layer-icon">{getLayerIcon(layer.type)}</div>
            <div className="card-layer-content"><input aria-label={`Rename ${layer.name}`} value={layer.name||''} placeholder={layer.type} onClick={event=>event.stopPropagation()} onChange={event=>mutate(t=>renameElement(t,artboard.id,layer.id,event.target.value))}/></div>
          </button>
          <div className="card-layer-mini">
            <button title={layer.visible?(layer.runtimeHidden?'Hidden by condition':'Hide'):'Show'} style={{color:layer.runtimeHidden?'var(--accent-color)':undefined}} onClick={()=>mutate(t=>setElementVisibility(t,artboard.id,layer.id,!layer.visible))}>{layer.visible?(layer.runtimeHidden?<EyeOff size={12}/>:<Eye size={12}/>):<EyeOff size={12}/>}</button>
            <button title={layer.locked?'Unlock':'Lock'} onClick={()=>mutate(t=>setElementLocked(t,artboard.id,layer.id,!layer.locked))}>{layer.locked?<Lock size={12}/>:<Unlock size={12}/>}</button>
            <button title="Bring to front" disabled={interactionMode!=='SELECT'} onClick={()=>mutate(t=>moveLayers(t,artboard.id,[layer.id],'FRONT'))}><ArrowUp size={12}/><ArrowUp size={12}/></button>
            <button title="Bring forward" disabled={interactionMode!=='SELECT'} onClick={()=>mutate(t=>moveLayers(t,artboard.id,[layer.id],'FORWARD'))}><ArrowUp size={12}/></button>
            <button title="Send backward" disabled={interactionMode!=='SELECT'} onClick={()=>mutate(t=>moveLayers(t,artboard.id,[layer.id],'BACKWARD'))}><ArrowDown size={12}/></button>
            <button title="Send to back" disabled={interactionMode!=='SELECT'} onClick={()=>mutate(t=>moveLayers(t,artboard.id,[layer.id],'BACK'))}><ArrowDown size={12}/><ArrowDown size={12}/></button>
          </div>
        </div>;
      }):<div className="card-layer-empty">Add an element to create the first layer.</div>}
    </div>
  </div>;
}

function ElementVisual({element,assets,mutate,artboardId,artboard}:{element:DesignElement;assets:DesignTemplate['sharedAssets'];mutate:(f:(t:DesignTemplate)=>DesignTemplate)=>void;artboardId:string;artboard:Artboard}){
 if(element.type==='TEXT'){const displayText=applyTextCase(element.text,element.style.textCase);const paint=textPaintStyle(element.style);const textPath=element.style.textPath;const autoFontSize=resolveTextAutoFitPt(displayText,element);const edit=()=>{const value=window.prompt('Edit text',element.text);if(value!==null)mutate(t=>updateDesignElement(t,artboardId,element.id,e=>e.type==='TEXT'?{...e,text:value}:e));};if(textPath&&textPath.mode!=='BOX'){const pathInfo=resolveTextPathInfo(element,artboard);const clean=element.id.replace(/[^a-zA-Z0-9_-]/g,'');const svgPaint=textSvgPaint(element.style,clean);return <svg className="card-text-path-visual" viewBox="0 0 100 100" preserveAspectRatio="none" style={{width:'100%',height:'100%',overflow:'visible'}} onDoubleClick={ev=>{ev.stopPropagation();edit();}}><defs>{svgPaint.defs}</defs><path id={`text-path-${clean}`} d={pathInfo.d} transform={pathInfo.transform} fill="none" stroke="none"/>{textPathStrokeLayers(element.style,element.size.widthMm).map(layer=><text key={layer.id} aria-hidden="true" fontFamily={element.style.fontFamily} fontSize={Math.max(1,autoFontSize)*100/Math.max(1,element.size.heightMm*2.83465)} fontWeight={element.style.fontWeight} fontStyle={element.style.italic?'italic':'normal'} letterSpacing={element.style.letterSpacingPt*100/Math.max(1,element.size.widthMm*2.83465)} fill="transparent" stroke={layer.color} strokeWidth={layer.width} strokeLinejoin="round" paintOrder="stroke" opacity={layer.opacity}><textPath href={`#text-path-${clean}`} startOffset={`${textPath.startOffsetPct??50}%`} textAnchor="middle">{renderRichTextSvgSegments(displayText,element.style)}</textPath></text>)}<text fontFamily={element.style.fontFamily} fontSize={Math.max(1,autoFontSize)*100/Math.max(1,element.size.heightMm*2.83465)} fontWeight={element.style.fontWeight} fontStyle={element.style.italic?'italic':'normal'} letterSpacing={element.style.letterSpacingPt*100/Math.max(1,element.size.widthMm*2.83465)} fill={svgPaint.fill} stroke={hasLayerStroke(element.style)?undefined:textPathStrokeColor(element.style)} strokeWidth={hasLayerStroke(element.style)?undefined:textPathStrokeWidth(element.style,element.size.widthMm)} style={{filter:textSvgFilter(element.shadow,element.style.glow,element.style.advancedEffects,element.style.layerEffects)}}><textPath href={`#text-path-${clean}`} startOffset={`${textPath.startOffsetPct??50}%`} textAnchor="middle">{renderRichTextSvgSegments(displayText,element.style)}</textPath></text></svg>;}const layerStrokes=textHtmlStrokeLayers(element.style.layerEffects);return <div className="card-text-visual" style={{fontFamily:element.style.fontFamily,fontSize:`${autoFontSize}pt`,fontWeight:element.style.fontWeight,fontStyle:element.style.italic?'italic':'normal',textDecoration:[element.style.underline?'underline':'',element.style.strikethrough?'line-through':''].filter(Boolean).join(' ')||'none',color:paint.color,textAlign:(element.style.paragraphAlignment??element.style.alignment).toLowerCase() as React.CSSProperties['textAlign'],lineHeight:element.style.lineHeight,letterSpacing:`${element.style.letterSpacingPt}pt`,textShadow:[textEffectShadowCss(element.shadow,element.style.glow,element.style.advancedEffects),textLayerEffectsShadowCss(element.style.layerEffects)].filter(Boolean).join(', ')||undefined,padding:`${Math.max(0,element.style.paddingMm??0)*MM_TO_CSS_PX}px`,display:'flex',alignItems:element.style.verticalAlignment==='CENTER'?'center':element.style.verticalAlignment==='BOTTOM'?'flex-end':'flex-start',justifyContent:'stretch',...paint.backgroundStyle,...textStrokeStyle(hasLayerStroke(element.style)?undefined:element.style.stroke)}} onDoubleClick={ev=>{ev.stopPropagation();edit();}}><span className="card-text-layer-stack" style={{width:'100%'}}>{layerStrokes.map(layer=><span key={layer.id} aria-hidden="true" className="card-text-stroke-layer" style={{WebkitTextStroke:`${layer.widthPx}px ${layer.color}`,opacity:layer.opacity,mixBlendMode:textBlendModeCss(layer.blendMode),zIndex:layer.zIndex,textShadow:'none'}}>{renderRichTextHtmlSegments(displayText,element.style)}</span>)}<span className="card-text-fill-layer">{renderRichTextHtmlSegments(displayText,element.style)}</span></span></div>;}
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

function PathNodeEditor({element, zoom, interactionMode, pathSelectedNodeIds, setPathSelectedNodeIds, pathSelectedSegmentIds, setPathSelectedSegmentIds, mutate, artboardId, beginHistoryTransaction, endHistoryTransaction, onTrimGeometry, allElements, artboard, snapEnabled, gridSnapEnabled, guideSnapEnabled, gridSizeMm,showSmartCenters,symmetryMode}: {element: PathDesignElement; zoom: number; interactionMode: string; pathSelectedNodeIds: string[]; setPathSelectedNodeIds: React.Dispatch<React.SetStateAction<string[]>>; pathSelectedSegmentIds: string[]; setPathSelectedSegmentIds: (m: string[]) => void; mutate: (f: (t: DesignTemplate) => DesignTemplate) => void; artboardId: string; beginHistoryTransaction: () => void; endHistoryTransaction: () => void; onTrimGeometry: (geometry: PathDesignElement['geometry']) => void; allElements?: DesignElement[]; artboard:Artboard; snapEnabled:boolean; gridSnapEnabled:boolean; guideSnapEnabled:boolean; gridSizeMm:number; showSmartCenters:boolean; symmetryMode:'OFF'|'H'|'V'}) {
  const [nodeSnap,setNodeSnap]=useState<PointSnapResult|null>(null);
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
  const pathCenter={x:element.size.widthMm/2,y:element.size.heightMm/2};
  const findMirrorNode=(points:PathDesignElement['geometry']['points'],sourceId:string,mode:'H'|'V')=>{
    const source=points.find(point=>point.id===sourceId);if(!source)return undefined;
    const target=mode==='H'?{x:2*pathCenter.x-source.x,y:source.y}:{x:source.x,y:2*pathCenter.y-source.y};
    const tolerance=Math.max(2,8/(MM_TO_CSS_PX*(zoom/100)));
    return points.filter(point=>point.id!==sourceId).map(point=>({point,d:Math.hypot(point.x-target.x,point.y-target.y)})).sort((a,b)=>a.d-b.d)[0]?.d<=tolerance?points.filter(point=>point.id!==sourceId).map(point=>({point,d:Math.hypot(point.x-target.x,point.y-target.y)})).sort((a,b)=>a.d-b.d)[0]?.point:undefined;
  };
  const nodeSymmetryGuides=(()=>{
    const selected=new Set(pathSelectedNodeIds),pairs:Array<{mode:'H'|'V';a:typeof activeGeometry.points[number];b:typeof activeGeometry.points[number];distance:number}>=[];const seen=new Set<string>();
    for(const point of activeGeometry.points){if(!selected.has(point.id))continue;for(const mode of ['H','V'] as const){const mirror=findMirrorNode(activeGeometry.points,point.id,mode);if(!mirror||!selected.has(mirror.id))continue;const key=[mode,...[point.id,mirror.id].sort()].join(':');if(seen.has(key))continue;seen.add(key);pairs.push({mode,a:point,b:mirror,distance:mode==='H'?Math.abs(point.x-pathCenter.x):Math.abs(point.y-pathCenter.y)});}}
    return pairs;
  })();

  // CAD LINE grip geometry editing. Unlike object rotation, this keeps the chosen
  // start/end/center anchor fixed and recalculates only the line endpoints.
  const cadLineSegment = element.metadata?.cadGeometryKind === 'LINE' && !activeGeometry.closed && activeGeometry.segments.length === 1 && activeGeometry.segments[0]?.type === 'LINE' ? activeGeometry.segments[0] : null;
  const cadLineStartId = cadLineSegment?.fromPointId ?? null;
  const cadLineEndId = cadLineSegment?.toPointId ?? null;
  const getCadLineMetrics = useCallback(() => {
    if (!cadLineSegment || !cadLineStartId || !cadLineEndId) return null;
    const start = activeGeometry.points.find(point => point.id === cadLineStartId);
    const end = activeGeometry.points.find(point => point.id === cadLineEndId);
    if (!start || !end) return null;
    const startWorld = localToWorld({x:start.x,y:start.y}, element);
    const endWorld = localToWorld({x:end.x,y:end.y}, element);
    return {
      startWorld,
      endWorld,
      lengthMm: Math.hypot(endWorld.x-startWorld.x,endWorld.y-startWorld.y),
      angleDeg: Math.atan2(endWorld.y-startWorld.y,endWorld.x-startWorld.x)*180/Math.PI,
    };
  }, [activeGeometry.points, cadLineEndId, cadLineSegment, cadLineStartId, element]);
  const [cadLineAnchor,setCadLineAnchor]=useState<'START'|'END'|'CENTER'>('START');
  const [cadLineLengthInput,setCadLineLengthInput]=useState('');
  const [cadLineAngleInput,setCadLineAngleInput]=useState('');
  useEffect(()=>{
    const metrics=getCadLineMetrics();
    if(!metrics)return;
    setCadLineLengthInput(String(normalizeDisplayValue(metrics.lengthMm)));
    setCadLineAngleInput(String(normalizeDisplayValue(metrics.angleDeg)));
  },[getCadLineMetrics]);
  useEffect(()=>{
    if(pathSelectedNodeIds.length!==1)return;
    if(pathSelectedNodeIds[0]===cadLineStartId)setCadLineAnchor('START');
    else if(pathSelectedNodeIds[0]===cadLineEndId)setCadLineAnchor('END');
  },[cadLineEndId,cadLineStartId,pathSelectedNodeIds]);
  const applyCadLineGeometry=()=>{
    if(element.locked||!cadLineSegment||!cadLineStartId||!cadLineEndId)return;
    const metrics=getCadLineMetrics();if(!metrics)return;
    const lengthMm=Number(cadLineLengthInput),angleDeg=Number(cadLineAngleInput);
    if(!Number.isFinite(lengthMm)||lengthMm<=0.001||!Number.isFinite(angleDeg))return;
    const radians=angleDeg*Math.PI/180,ux=Math.cos(radians),uy=Math.sin(radians);
    let startWorld={...metrics.startWorld},endWorld={...metrics.endWorld};
    if(cadLineAnchor==='START'){
      endWorld={x:startWorld.x+ux*lengthMm,y:startWorld.y+uy*lengthMm};
    }else if(cadLineAnchor==='END'){
      startWorld={x:endWorld.x-ux*lengthMm,y:endWorld.y-uy*lengthMm};
    }else{
      const center={x:(startWorld.x+endWorld.x)/2,y:(startWorld.y+endWorld.y)/2};
      startWorld={x:center.x-ux*lengthMm/2,y:center.y-uy*lengthMm/2};
      endWorld={x:center.x+ux*lengthMm/2,y:center.y+uy*lengthMm/2};
    }
    beginHistoryTransaction();
    mutate(t=>{
      const art=t.artboards.find(a=>a.id===artboardId);if(!art)return t;
      const current=art.elements.find(candidate=>candidate.id===element.id) as PathDesignElement|undefined;if(!current||current.type!=='PATH')return t;
      const startLocal=worldToLocal(startWorld,current),endLocal=worldToLocal(endWorld,current);
      const geometry={...current.geometry,points:current.geometry.points.map(point=>point.id===cadLineStartId?{...point,x:startLocal.x,y:startLocal.y,inHandle:undefined,outHandle:undefined}:point.id===cadLineEndId?{...point,x:endLocal.x,y:endLocal.y,inHandle:undefined,outHandle:undefined}:point)};
      const normalized=normalizePathFragment(geometry,current);
      return {...t,artboards:t.artboards.map(a=>a.id!==artboardId?a:{...a,elements:a.elements.map(candidate=>candidate.id!==current.id?candidate:{...current,geometry:normalized.geometry,position:normalized.position,size:normalized.size})})};
    });
    endHistoryTransaction();
  };


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

  const extendCadLineEndpointToBoundary=(pointId:string)=>{
    if(element.metadata?.cadGeometryKind!=='LINE'||activeGeometry.closed)return false;
    const endpoints=getPathEndpoints(activeGeometry);if(!endpoints.includes(pointId))return false;
    const attached=activeGeometry.segments.find(segment=>segment.fromPointId===pointId||segment.toPointId===pointId);
    if(!attached||attached.type!=='LINE')return false;
    const neighborId=attached.fromPointId===pointId?attached.toPointId:attached.fromPointId;
    const endpoint=activeGeometry.points.find(point=>point.id===pointId),neighbor=activeGeometry.points.find(point=>point.id===neighborId);
    if(!endpoint||!neighbor)return false;
    const endpointWorld=localToWorld({x:endpoint.x,y:endpoint.y},element),neighborWorld=localToWorld({x:neighbor.x,y:neighbor.y},element);
    const angleDeg=Math.atan2(endpointWorld.y-neighborWorld.y,endpointWorld.x-neighborWorld.x)*180/Math.PI;
    const hit=findCadRayIntersections(allElements??[],endpointWorld,angleDeg,[element.id])[0];
    if(!hit)return false;
    beginHistoryTransaction();
    mutate(t=>{
      const art=t.artboards.find(a=>a.id===artboardId);if(!art)return t;
      const current=art.elements.find(candidate=>candidate.id===element.id) as PathDesignElement|undefined;if(!current||current.type!=='PATH')return t;
      const localHit=worldToLocal({x:hit.x,y:hit.y},current);
      const geometry={...current.geometry,points:current.geometry.points.map(point=>point.id===pointId?{...point,x:localHit.x,y:localHit.y,inHandle:undefined,outHandle:undefined}:point)};
      const normalized=normalizePathFragment(geometry,current);
      return {...t,artboards:t.artboards.map(a=>a.id!==artboardId?a:{...a,elements:a.elements.map(candidate=>candidate.id!==current.id?candidate:{...current,geometry:normalized.geometry,position:normalized.position,size:normalized.size,metadata:{...current.metadata,cadEndTargetId:hit.elementId}})})};
    });
    endHistoryTransaction();
    setPathSelectedNodeIds([pointId]);
    return true;
  };
  const pointOnSegment=(seg:typeof activeGeometry.segments[0],t:number)=>{const p1=activeGeometry.points.find(point=>point.id===seg.fromPointId),p2=activeGeometry.points.find(point=>point.id===seg.toPointId);if(!p1||!p2)return null;if(seg.type==='LINE')return{x:p1.x+(p2.x-p1.x)*t,y:p1.y+(p2.y-p1.y)*t};const h1=p1.outHandle||p1,h2=p2.inHandle||p2,mt=1-t;return{x:mt**3*p1.x+3*mt**2*t*h1.x+3*mt*t**2*h2.x+t**3*p2.x,y:mt**3*p1.y+3*mt**2*t*h1.y+3*mt*t**2*h2.y+t**3*p2.y};};
  const acquireTrimSnap=(segmentId:string,clickPoint:{x:number;y:number})=>{const segment=activeGeometry.segments.find(candidate=>candidate.id===segmentId);if(!segment)return null;const tolerance=8/(MM_TO_CSS_PX*(zoom/100)),from=activeGeometry.points.find(point=>point.id===segment.fromPointId),to=activeGeometry.points.find(point=>point.id===segment.toPointId);for(const node of [from,to])if(node&&Math.hypot(clickPoint.x-node.x,clickPoint.y-node.y)<=tolerance)return{segmentId,t:node.id===segment.fromPointId?0:1,x:node.x,y:node.y,kind:'NODE' as const,nodeId:node.id};const intervals=computeIntervals(segmentId),cuts=[...new Set(intervals.flatMap(interval=>[interval.tStart,interval.tEnd]).filter(t=>t>0.001&&t<0.999))];let intersection:null|{segmentId:string;t:number;x:number;y:number;kind:'INTERSECTION'}=null,best=Infinity;for(const t of cuts){const point=pointOnSegment(segment,t);if(!point)continue;const distance=Math.hypot(clickPoint.x-point.x,clickPoint.y-point.y);if(distance<=tolerance&&distance<best){best=distance;intersection={segmentId,t,x:point.x,y:point.y,kind:'INTERSECTION'};}}if(intersection)return intersection;const hit=hitTestSegment(activeGeometry,segmentId,clickPoint),nearest=pointOnSegment(segment,hit.t);return nearest?{segmentId,t:hit.t,x:nearest.x,y:nearest.y,kind:'NEAREST' as const}:null;};

  return <div className="card-path-node-editor" style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',cursor:interactionMode==='TRIMMER'?TRIMMER_CURSOR:undefined}}>
    {interactionMode==='EDIT_PATH'&&cadLineSegment&&<div data-cad-line-geometry-hud onPointerDown={event=>event.stopPropagation()} onDoubleClick={event=>event.stopPropagation()} style={{position:'absolute',left:0,top:-72,zIndex:30,display:'flex',alignItems:'center',gap:6,whiteSpace:'nowrap',background:'var(--bg-primary)',border:'1px solid var(--border-color)',borderRadius:6,padding:'6px 8px',fontSize:11,boxShadow:'0 2px 8px rgba(0,0,0,.12)'}}>
      <strong>LINE</strong>
      <label>Anchor <select aria-label="Line angle anchor" value={cadLineAnchor} disabled={element.locked} onChange={event=>setCadLineAnchor(event.target.value as 'START'|'END'|'CENTER')}><option value="START">Start</option><option value="END">End</option><option value="CENTER">Center</option></select></label>
      <label>L <input aria-label="Line length mm" value={cadLineLengthInput} disabled={element.locked} inputMode="decimal" onChange={event=>setCadLineLengthInput(event.target.value)} onKeyDown={event=>{if(event.key==='Enter'){event.preventDefault();applyCadLineGeometry();}}} style={{width:64}}/> mm</label>
      <label>A <input aria-label="Line angle degrees" value={cadLineAngleInput} disabled={element.locked} inputMode="decimal" onChange={event=>setCadLineAngleInput(event.target.value)} onKeyDown={event=>{if(event.key==='Enter'){event.preventDefault();applyCadLineGeometry();}}} style={{width:58}}/> °</label>
      <button type="button" disabled={element.locked} onClick={applyCadLineGeometry}>Apply</button>
    </div>}
    {interactionMode==='TRIMMER'&&selectedInterval&&<div style={{position:'absolute',left:0,top:-38,zIndex:20,whiteSpace:'nowrap',background:'var(--bg-primary)',border:'1px solid var(--border-color)',borderRadius:4,padding:'4px 6px',fontSize:11}}>ERASE SEGMENT — Press Delete to remove selected interval</div>}
    {interactionMode === 'TRIMMER' && trimStartNodeId && <div onPointerDown={event=>event.stopPropagation()} style={{position:'absolute',left:0,top:-38,zIndex:20,display:'flex',gap:4,alignItems:'center',whiteSpace:'nowrap',background:'var(--bg-primary)',border:'1px solid var(--border-color)',borderRadius:4,padding:'4px 6px'}}>
      <span style={{fontSize:11}}>{trimEndNodeId ? 'ERASE SEGMENT — Press Delete to remove selected interval' : 'ERASE SEGMENT — Select second point'}</span>
      {trimEndNodeId && <button type="button" onClick={deleteManualTrimRange}>Delete Segment</button>}
      {trimRoutes.length > 1 && <button type="button" onClick={()=>setTrimRouteIndex(index=>(index+1)%trimRoutes.length)}>Switch Side</button>}
      <button type="button" onClick={clearManualTrim}>Clear Trim Selection</button>
    </div>}
    <svg style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',pointerEvents:'none',overflow:'visible'}} viewBox={`0 0 ${element.size.widthMm} ${element.size.heightMm}`} preserveAspectRatio="none">
      {interactionMode==='EDIT_PATH'&&showSmartCenters&&<g data-path-center-guides pointerEvents="none"><line x1={pathCenter.x} y1={0} x2={pathCenter.x} y2={element.size.heightMm} className="card-path-center-guide"/><line x1={0} y1={pathCenter.y} x2={element.size.widthMm} y2={pathCenter.y} className="card-path-center-guide"/></g>}
      {interactionMode==='EDIT_PATH'&&showSmartCenters&&nodeSymmetryGuides.map((guide,index)=>guide.mode==='H'?<g key={`node-eq-h-${index}`} data-node-equidistance-guide pointerEvents="none"><line x1={guide.a.x} y1={guide.a.y} x2={pathCenter.x} y2={guide.a.y} className="card-path-equal-guide"/><line x1={pathCenter.x} y1={guide.b.y} x2={guide.b.x} y2={guide.b.y} className="card-path-equal-guide"/><text x={pathCenter.x} y={(guide.a.y+guide.b.y)/2-1} textAnchor="middle" className="card-path-guide-label">{normalizeDisplayValue(guide.distance)} mm = {normalizeDisplayValue(guide.distance)} mm</text></g>:<g key={`node-eq-v-${index}`} data-node-equidistance-guide pointerEvents="none"><line x1={guide.a.x} y1={guide.a.y} x2={guide.a.x} y2={pathCenter.y} className="card-path-equal-guide"/><line x1={guide.b.x} y1={pathCenter.y} x2={guide.b.x} y2={guide.b.y} className="card-path-equal-guide"/><text x={(guide.a.x+guide.b.x)/2+1} y={pathCenter.y} className="card-path-guide-label">{normalizeDisplayValue(guide.distance)} mm = {normalizeDisplayValue(guide.distance)} mm</text></g>)}
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
      {interactionMode==='EDIT_PATH'&&nodeSnap&&(()=>{const local=worldToLocal(nodeSnap.point,element);const radius=4/MM_TO_CSS_PX/(zoom/100),label=nodeSnap.label??(nodeSnap.kind==='INTERSECTION'?'Intersection':nodeSnap.kind==='LINE_ENDPOINT'?'Endpoint':nodeSnap.kind==='VERTEX'?'Vertex':nodeSnap.kind==='BOUNDARY'?'Boundary':nodeSnap.kind);return <g data-node-snap-marker data-snap-kind={nodeSnap.kind} data-snap-label={label} pointerEvents="none"><circle cx={local.x} cy={local.y} r={radius} fill="white" stroke="#22c55e" strokeWidth={1.6/MM_TO_CSS_PX/(zoom/100)}/><line x1={local.x-radius*1.5} y1={local.y} x2={local.x+radius*1.5} y2={local.y} stroke="#22c55e" strokeWidth={1/MM_TO_CSS_PX/(zoom/100)}/><line x1={local.x} y1={local.y-radius*1.5} x2={local.x} y2={local.y+radius*1.5} stroke="#22c55e" strokeWidth={1/MM_TO_CSS_PX/(zoom/100)}/><text x={local.x+radius*1.8} y={local.y-radius*1.8} fill="#15803d" fontSize={9/MM_TO_CSS_PX/(zoom/100)}>{label}</text></g>;})()}
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
              } else if (interactionMode === 'EDIT_PATH' && ev.shiftKey) {
                const shell = ev.currentTarget.closest('.card-path-node-editor') as HTMLElement;
                if (!shell) return;
                const r = shell.getBoundingClientRect();
                const clickPt = {
                  x: (ev.clientX - r.left) / r.width * element.size.widthMm,
                  y: (ev.clientY - r.top) / r.height * element.size.heightMm
                };
                const { t } = hitTestSegment(activeGeometry, seg.id as string, clickPt);
                const clampedT = Math.max(0.001, Math.min(0.999, t));
                const insertResult = insertPathNodeWithSymmetry(
                  activeGeometry,
                  seg.id as string,
                  clampedT,
                  symmetryMode,
                  pathCenter,
                  Math.max(0.35, 10 / (MM_TO_CSS_PX * (zoom / 100))),
                );
                if (!insertResult.insertedPointIds.length) return;
                beginHistoryTransaction();
                mutate(t_ => {
                  const art = t_.artboards.find(a => a.id === artboardId);
                  if (!art) return t_;
                  const el = art.elements.find(e => e.id === element.id) as PathDesignElement;
                  if (!el || el.type !== 'PATH') return t_;
                  return {
                    ...t_,
                    artboards: t_.artboards.map(a => a.id === artboardId
                      ? { ...a, elements: a.elements.map(e => e.id === el.id ? { ...e, geometry: insertResult.geometry } : e) }
                      : a)
                  };
                });
                endHistoryTransaction();
                setPathSelectedSegmentIds([]);
                setPathSelectedNodeIds(prev => [...new Set([...prev, ...insertResult.insertedPointIds])]);
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
          const up = () => {endHistoryTransaction();window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);};
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
          const up = () => {endHistoryTransaction();window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);};
          window.addEventListener('pointermove',move);window.addEventListener('pointerup',up);
        }}/>}
        <i className={`card-path-node ${isSelected?'selected':''}`} style={{position:'absolute',left:p.x*MM_TO_CSS_PX,top:p.y*MM_TO_CSS_PX,width:interactionMode==='TRIMMER'?trimNodeHitSize:(isSelected?12:9),height:interactionMode==='TRIMMER'?trimNodeHitSize:(isSelected?12:9),marginLeft:interactionMode==='TRIMMER'?-trimNodeHitSize/2:(isSelected?-6:-4.5),marginTop:interactionMode==='TRIMMER'?-trimNodeHitSize/2:(isSelected?-6:-4.5),background:interactionMode==='TRIMMER'?`radial-gradient(circle, ${p.id===trimStartNodeId?'#22c55e':p.id===trimEndNodeId?'#3b82f6':'white'} 0 3px, var(--accent-color) 3px 4px, transparent 4px)`:undefined,backgroundColor:interactionMode==='TRIMMER'?undefined:isSelected?'#ef4444':'white',border:interactionMode==='TRIMMER'?'none':isSelected?'2px solid #b91c1c':'1.5px solid #ef4444',boxShadow:interactionMode==='TRIMMER'?undefined:isSelected?'0 0 0 2px rgba(255,255,255,.9),0 0 0 3px rgba(239,68,68,.35)':undefined,borderRadius:'50%',cursor:interactionMode==='TRIMMER'?TRIMMER_CURSOR:'pointer',zIndex:interactionMode==='TRIMMER'?10:undefined}} onDoubleClick={ev=>{if(interactionMode==='EDIT_PATH'){ev.preventDefault();ev.stopPropagation();if(extendCadLineEndpointToBoundary(p.id))return;}}} onPointerDown={ev=>{
          ev.stopPropagation();
          if(interactionMode==='EDIT_PATH'&&p.id===cadLineStartId)setCadLineAnchor('START');
          else if(interactionMode==='EDIT_PATH'&&p.id===cadLineEndId)setCadLineAnchor('END');
          if (interactionMode === 'TRIMMER') {
            ev.preventDefault();
            selectTrimNode(p.id);
            return;
          }
          ev.currentTarget.setPointerCapture(ev.pointerId);
          const toggle = ev.shiftKey;
          const dragIds = toggle
            ? (pathSelectedNodeIds.includes(p.id) ? pathSelectedNodeIds.filter(id=>id!==p.id) : [...pathSelectedNodeIds, p.id])
            : (pathSelectedNodeIds.includes(p.id) ? pathSelectedNodeIds : [p.id]);
          setPathSelectedNodeIds(prev => {
            if (toggle) return prev.includes(p.id) ? prev.filter(id=>id!==p.id) : [...prev, p.id];
            return prev.includes(p.id) ? prev : [p.id];
          });
          beginHistoryTransaction();
          const shell = ev.currentTarget.parentElement!.parentElement!;
          const r = shell.getBoundingClientRect();
          const connectedSegments=element.geometry.segments.filter(segment=>segment.fromPointId===p.id||segment.toPointId===p.id);
          const fixedPointId=connectedSegments.length===1?(connectedSegments[0]!.fromPointId===p.id?connectedSegments[0]!.toPointId:connectedSegments[0]!.fromPointId):undefined;
          const fixedPoint=fixedPointId?element.geometry.points.find(point=>point.id===fixedPointId):undefined;
          const stretchLineStart=fixedPoint?localToWorld({x:fixedPoint.x,y:fixedPoint.y},element):undefined;
          const move = (eMove: PointerEvent) => {
            const rawLocal={x:(eMove.clientX-r.left)/r.width*element.size.widthMm,y:(eMove.clientY-r.top)/r.height*element.size.heightMm};
            const rawWorld=localToWorld(rawLocal,element);
            const artboardRect=(shell.closest('.card-artboard-canvas') as HTMLElement|null)?.getBoundingClientRect();
            const toleranceMm=artboardRect&&artboardRect.width>0?POINT_SNAP_SCREEN_TOLERANCE_PX/artboardRect.width*artboard.widthMm:POINT_SNAP_SCREEN_TOLERANCE_PX/(MM_TO_CSS_PX*(zoom/100));
            const snap=snapEnabled?resolvePointSnap(artboard,rawWorld,{toleranceMm,excludeIds:[element.id],lineStart:stretchLineStart,snapToBoundaries:true,snapToVertices:true,snapToIntersections:Boolean(stretchLineStart),snapToGuides:guideSnapEnabled,snapToGrid:gridSnapEnabled,snapToObjectCenters:true,snapToArtboardCenter:true,gridSizeMm}):undefined;
            const effectiveLocal=snap?worldToLocal(snap.point,element):rawLocal;
            const lx=effectiveLocal.x,ly=effectiveLocal.y;
            setNodeSnap(snap??null);
            mutate(t => {
              const art = t.artboards.find(a=>a.id===artboardId);
              if (!art) return t;
              const el = art.elements.find(e=>e.id===element.id) as PathDesignElement;
              if (!el) return t;
              const anchor = el.geometry.points.find(point => point.id === p.id);
              if (!anchor) return t;
              const dx = lx - anchor.x; const dy = ly - anchor.y;
              const deltas=new Map<string,{dx:number;dy:number}>();
              for(const id of dragIds)deltas.set(id,{dx,dy});
              if(symmetryMode!=='OFF'){
                for(const id of dragIds){
                  const source=el.geometry.points.find(point=>point.id===id);
                  const mirror=findMirrorNode(el.geometry.points,id,symmetryMode);
                  if(!source||!mirror||dragIds.includes(mirror.id))continue;
                  deltas.set(mirror.id,symmetryMode==='H'?{dx:-dx,dy}:{dx,dy:-dy});
                }
              }
              const updatedPoints = el.geometry.points.map(pt => {
                const delta=deltas.get(pt.id);if(!delta)return pt;
                return {
                  ...pt, x: pt.x + delta.dx, y: pt.y + delta.dy,
                  inHandle: pt.inHandle ? {x:pt.inHandle.x+delta.dx, y:pt.inHandle.y+delta.dy} : undefined,
                  outHandle: pt.outHandle ? {x:pt.outHandle.x+delta.dx, y:pt.outHandle.y+delta.dy} : undefined
                };
              });
              return {
                ...t, artboards: t.artboards.map(a=>a.id===artboardId ? {
                  ...a, elements: a.elements.map(e=>e.id===element.id ? {...e, geometry: {...el.geometry, points: updatedPoints}} : e)
                } : a)
              };
            });
          };
          const up = () => {
            setNodeSnap(null);
            endHistoryTransaction();
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


function vectorFillPaint(fill:DesignFill,ids:{linear:string;radial:string;pattern:string;image:string}){
 if(fill.type==='SOLID')return fill.color;
 if(fill.type==='LINEAR_GRADIENT')return `url(#${ids.linear})`;
 if(fill.type==='RADIAL_GRADIENT')return `url(#${ids.radial})`;
 if(fill.type==='PATTERN')return `url(#${ids.pattern})`;
 if(fill.type==='IMAGE')return `url(#${ids.image})`;
 return 'transparent';
}
function vectorFillOpacity(fill:DesignFill){return fill.type==='SOLID'||fill.type==='IMAGE'?(fill.opacity??1):1;}
function vectorStrokeProps(stroke:DesignStroke,unitScale=1){
 const dash=normalizeStrokeDashArray(stroke)?.map(value=>value*unitScale).join(' ');
 return {
  stroke:stroke.style==='NONE'?'none':stroke.color,
  strokeOpacity:stroke.opacity??1,
  strokeDasharray:dash,
  strokeDashoffset:(stroke.dashOffset??0)*unitScale,
  strokeLinecap:(stroke.lineCap??'BUTT').toLowerCase() as 'butt'|'round'|'square',
  strokeLinejoin:(stroke.lineJoin??'MITER').toLowerCase() as 'miter'|'round'|'bevel',
  strokeMiterlimit:stroke.miterLimit??4,
 };
}
function PatternFillDef({id,fill}:{id:string;fill:Extract<DesignFill,{type:'PATTERN'}>}){
 const p=fill.pattern,size=Math.max(.025,.12*p.scale),opacity=p.opacity??1;
 return <pattern id={id} patternUnits="objectBoundingBox" width={size} height={size} viewBox="0 0 10 10" preserveAspectRatio="none" patternTransform={`rotate(${p.rotationDeg})`}>
  <rect x="0" y="0" width="10" height="10" fill={p.background}/>
  {p.kind==='HATCH'&&<path d="M 0 10 L 10 0" stroke={p.foreground} strokeOpacity={opacity} strokeWidth="0.8"/>}
  {p.kind==='DOT'&&<circle cx="5" cy="5" r="1.6" fill={p.foreground} fillOpacity={opacity}/>} 
  {p.kind==='CHECKER'&&<><rect x="0" y="0" width="5" height="5" fill={p.foreground} fillOpacity={opacity}/><rect x="5" y="5" width="5" height="5" fill={p.foreground} fillOpacity={opacity}/></>}
 </pattern>;
}
function VectorFillDefs({fill,ids,assets,width,height}:{fill:DesignFill;ids:{linear:string;radial:string;pattern:string;image:string};assets:DesignTemplate['sharedAssets'];width:number;height:number}){
 return <defs>
  {fill.type==='LINEAR_GRADIENT'&&<linearGradient id={ids.linear} gradientTransform={`rotate(${fill.gradient.angleDeg} .5 .5)`}>{fill.gradient.stops.map((stop,index)=><stop key={index} offset={`${stop.offset}%`} stopColor={stop.color} stopOpacity={stop.opacity??1}/>)}</linearGradient>}
  {fill.type==='RADIAL_GRADIENT'&&<radialGradient id={ids.radial} cx={`${fill.gradient.centerX}%`} cy={`${fill.gradient.centerY}%`} r={`${fill.gradient.radius}%`} fx={`${fill.gradient.focalX??fill.gradient.centerX}%`} fy={`${fill.gradient.focalY??fill.gradient.centerY}%`}>{fill.gradient.stops.map((stop,index)=><stop key={index} offset={`${stop.offset}%`} stopColor={stop.color} stopOpacity={stop.opacity??1}/>)}</radialGradient>}
  {fill.type==='PATTERN'&&<PatternFillDef id={ids.pattern} fill={fill}/>} 
  {fill.type==='IMAGE'&&<ImageFillPattern id={ids.image} fill={fill} assets={assets} width={width} height={height}/>} 
 </defs>;
}
function ArtboardBackgroundVisual({artboard,assets}:{artboard:Artboard;assets:DesignTemplate['sharedAssets']}){
 const clean=artboard.id.replace(/[^a-zA-Z0-9_-]/g,'');
 const ids={linear:`artboard-gradient-${clean}`,radial:`artboard-radial-${clean}`,pattern:`artboard-pattern-${clean}`,image:`artboard-image-${clean}`};
 const fill=vectorFillPaint(artboard.background,ids),fillOpacity=vectorFillOpacity(artboard.background);
 return <svg data-artboard-background width="100%" height="100%" viewBox={`0 0 ${artboard.widthMm} ${artboard.heightMm}`} preserveAspectRatio="none" style={{position:'absolute',inset:0,zIndex:0,pointerEvents:'none',overflow:'hidden'}}>
  <VectorFillDefs fill={artboard.background} ids={ids} assets={assets} width={artboard.widthMm} height={artboard.heightMm}/>
  <rect x="0" y="0" width={artboard.widthMm} height={artboard.heightMm} fill={fill} fillOpacity={fillOpacity}/>
 </svg>;
}

function PathVisual({element,assets}:{element:PathDesignElement;assets:DesignTemplate['sharedAssets']}) {
  const clean=element.id.replace(/[^a-zA-Z0-9_-]/g,'');
  const ids={linear:`gradient-${clean}`,radial:`radial-${clean}`,pattern:`pattern-${clean}`,image:`image-fill-${clean}`};
  const fill=vectorFillPaint(element.fill,ids),fillOpacity=vectorFillOpacity(element.fill);
  const strokeProps=vectorStrokeProps(element.stroke,1);
  const sw=Math.max(0.1,element.stroke.widthMm);
  const d=geometryToSvgPath(element.geometry),w=element.size.widthMm,h=element.size.heightMm,label=element.label;
  return <div className="card-path-visual" style={{position:'relative',width:'100%',height:'100%'}}>
   <svg style={{filter:dropShadowCss(element.shadow),width:'100%',height:'100%',overflow:'visible',position:'absolute',top:0,left:0}} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
    <VectorFillDefs fill={element.fill} ids={ids} assets={assets} width={w} height={h}/>
    <path d={d} fill={fill} fillOpacity={fillOpacity} strokeWidth={element.stroke.style==='NONE'?0:sw} {...strokeProps}/>
   </svg>
   {label?.enabled&&label.text&&<div data-path-label style={{position:'absolute',inset:`${Math.max(0,label.paddingMm)*MM_TO_CSS_PX}px`,display:'flex',alignItems:label.verticalAlignment==='TOP'?'flex-start':label.verticalAlignment==='BOTTOM'?'flex-end':'center',justifyContent:label.alignment==='LEFT'?'flex-start':label.alignment==='RIGHT'?'flex-end':'center',overflow:'hidden',pointerEvents:'none',fontFamily:label.fontFamily,fontSize:`${label.fontSizePt}pt`,fontWeight:label.fontWeight,fontStyle:label.italic?'italic':'normal',textDecoration:label.underline?'underline':'none',color:label.color,lineHeight:label.lineHeight,textAlign:label.alignment.toLowerCase() as React.CSSProperties['textAlign'],whiteSpace:'pre-wrap',wordBreak:'break-word'}}>{label.text}</div>}
  </div>;
}
function ImageFillPattern({id,fill,assets,width,height}:{id:string;fill:Extract<DesignFill,{type:'IMAGE'}>;assets:DesignTemplate['sharedAssets'];width:number;height:number}){
 const source=resolveRasterImageFillSource(fill,assets);if(!source)return null;
 const preserveAspectRatio=fill.fit==='FIT'?'xMidYMid meet':fill.fit==='FILL'?'xMidYMid slice':'none';
 const t=normalizeImageFillTransform(fill.transform),cx=width/2,cy=height/2,dx=t.offsetX/100*width,dy=t.offsetY/100*height;
 const transform=`translate(${cx+dx} ${cy+dy}) rotate(${t.rotationDeg}) scale(${t.scale}) translate(${-cx} ${-cy})`;
 return <pattern id={id} patternUnits="userSpaceOnUse" width={width} height={height}><image href={source} x="0" y="0" width={width} height={height} preserveAspectRatio={preserveAspectRatio} transform={transform}/></pattern>;
}
function ShapeVisual({element,assets}:{element:ShapeDesignElement;assets:DesignTemplate['sharedAssets']}){
 const clean=element.id.replace(/[^a-zA-Z0-9_-]/g,''),ids={linear:`gradient-${clean}`,radial:`radial-${clean}`,pattern:`pattern-${clean}`,image:`image-fill-${clean}`};
 const fill=vectorFillPaint(element.fill,ids),fillOpacity=vectorFillOpacity(element.fill),sw=Math.max(.4,element.stroke.widthMm*MM_TO_CSS_PX),strokeProps=vectorStrokeProps(element.stroke,MM_TO_CSS_PX);
 const common={fill,fillOpacity,strokeWidth:element.stroke.style==='NONE'?0:sw,...strokeProps,vectorEffect:'non-scaling-stroke' as const};
 const label=element.label;
 return <div className="card-shape-visual" style={{position:'relative',width:'100%',height:'100%',filter:dropShadowCss(element.shadow)}}>
   <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',transform:`scale(${element.flipX?-1:1},${element.flipY?-1:1})`}} viewBox="0 0 100 100" preserveAspectRatio="none">
     <VectorFillDefs fill={element.fill} ids={ids} assets={assets} width={100} height={100}/>
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


function FontFamilyOptions({currentFont,includeKeepCurrent=false}:{currentFont?:string;includeKeepCurrent?:boolean}){
  const manager=useContext(FontManagerContext);
  const uploadedFamilies=manager.uploadedFonts.map(asset=>String(asset.metadata.fontFamily));
  const known=new Set([...DESIGN_FONT_FAMILIES,...uploadedFamilies]);
  const isCustom=!!currentFont&&!known.has(currentFont);
  return <>
    {includeKeepCurrent&&<option value="">Keep current</option>}
    {isCustom&&<option value={currentFont}>{currentFont} (Current / Installed)</option>}
    {!!manager.favorites.length&&<optgroup label="★ Favorites">{manager.favorites.map(font=><option key={`fav-${font}`} value={font} style={{fontFamily:font}}>{font}</option>)}</optgroup>}
    {!!manager.recent.length&&<optgroup label="Recent">{manager.recent.map(font=><option key={`recent-${font}`} value={font} style={{fontFamily:font}}>{font}</option>)}</optgroup>}
    {!!uploadedFamilies.length&&<optgroup label="My Fonts">{uploadedFamilies.map(font=><option key={`uploaded-${font}`} value={font} style={{fontFamily:font}}>{font}</option>)}</optgroup>}
    {DESIGN_FONT_GROUPS.map(group=><optgroup key={group.label} label={group.label}>{group.fonts.map(font=><option key={`${group.label}-${font}`} value={font} style={{fontFamily:font}}>{font}</option>)}</optgroup>)}
  </>;
}

function FontManagerPanel({currentFont,onSelect}:{currentFont:string;onSelect:(family:string)=>void}){
  const manager=useContext(FontManagerContext);
  const uploadRef=useRef<HTMLInputElement|null>(null);
  const [query,setQuery]=useState('');
  const uploaded=manager.uploadedFonts.filter(asset=>String(asset.metadata.fontFamily).toLowerCase().includes(query.trim().toLowerCase()));
  const currentUploaded=manager.uploadedFonts.find(asset=>asset.metadata.fontFamily===currentFont);
  const currentRegistered=currentUploaded?manager.registered.includes(currentFont):(()=>{try{return document.fonts.check(`16px "${currentFont.replace(/"/g,'')}"`)}catch{return false}})();
  return <div className="card-property-details card-font-manager" data-font-manager>
    <div className="card-property-note"><strong>Font Manager</strong><span>{manager.uploadedFonts.length} custom font{manager.uploadedFonts.length===1?'':'s'} saved</span></div>
    <div className={`card-print-quality ${currentRegistered?'good':'warning'}`}><strong>{currentRegistered?'Font available':'Font may be missing'}</strong><span>{currentRegistered?`${currentFont} is available for canvas rendering.`:`${currentFont} is not confirmed on this computer. Export may fall back unless the font is installed or uploaded.`}</span></div>
    <div className="card-user-assets-toolbar"><button type="button" className="primary" onClick={()=>uploadRef.current?.click()}><Upload size={14}/>Upload Font</button><small>TTF, OTF, WOFF, WOFF2 · max 5 MB</small></div>
    <input ref={uploadRef} hidden type="file" multiple accept={FONT_FILE_ACCEPT} onChange={e=>{if(e.target.files)void manager.uploadFonts(e.target.files);e.currentTarget.value='';}}/>
    {manager.status&&<div className="card-asset-library-status">{manager.status}</div>}
    <label>Search My Fonts<input type="search" value={query} placeholder="Search uploaded fonts…" onChange={e=>setQuery(e.target.value)}/></label>
    {!!manager.recent.length&&<div><small>Recent</small><div className="card-font-chip-row">{manager.recent.slice(0,6).map(font=><button type="button" key={font} className={font===currentFont?'active':''} style={{fontFamily:font}} onClick={()=>{onSelect(font);manager.markRecent(font)}}>{font}</button>)}</div></div>}
    {!!uploaded.length?<div className="card-font-list">{uploaded.map(asset=>{const family=String(asset.metadata.fontFamily);const fav=manager.favorites.includes(family);const registered=manager.registered.includes(family);return <div key={asset.id} className={`card-font-item ${family===currentFont?'active':''}`}>
      <button type="button" className="card-font-preview" style={{fontFamily:family}} onClick={()=>{onSelect(family);manager.markRecent(family)}}><strong>{family}</strong><span>Ag 0123 · {String(asset.metadata.fontFormat??'FONT')}</span></button>
      <div className="card-user-asset-actions"><button type="button" title={fav?'Remove favorite':'Add favorite'} onClick={()=>manager.toggleFavorite(family)}>{fav?'★':'☆'}</button><button type="button" disabled={!registered} title={registered?'Loaded':'Font failed to load'}>{registered?'✓':'!'}</button><button type="button" className="danger" title="Remove font" onClick={()=>void manager.deleteFont(asset)}><Trash2 size={12}/></button></div>
    </div>})}</div>:<div className="card-empty-library"><strong>No custom fonts yet.</strong><span>Upload licensed TTF/OTF/WOFF fonts and they will appear in My Fonts.</span></div>}
    {!currentRegistered&&<label>Replace missing font<select defaultValue="" onChange={e=>{if(e.target.value){onSelect(e.target.value);manager.markRecent(e.target.value);}}}><option value="">Choose replacement…</option><FontFamilyOptions currentFont={currentFont}/></select></label>}
  </div>;
}

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
  {element.type==='TEXT'&&<AdvancedTextProperties element={element} update={update} artboard={artboard} availableFields={availableFields} datasourceStatus={datasourceStatus}/>} {element.type==='SHAPE'&&<AdvancedShapeProperties element={element} update={update} assets={assets} mutate={mutate} artboardId={artboardId} availableFields={availableFields} datasourceStatus={datasourceStatus}/>} {element.type==='PATH'&&<AdvancedPathProperties element={element} update={update} assets={assets} mutate={mutate} artboardId={artboardId} availableFields={availableFields} datasourceStatus={datasourceStatus}/>} {element.type==='IMAGE'&&<AdvancedImageProperties element={element} asset={asset} update={update} mutate={mutate} artboardId={artboardId} availableFields={availableFields} datasourceStatus={datasourceStatus}/>} {element.type==='SVG'&&<SvgProperties element={element} asset={asset} update={update} availableFields={availableFields} datasourceStatus={datasourceStatus}/>} {element.type==='QR'&&<AdvancedQrProperties element={element as QrDesignElement} update={update} availableFields={availableFields} />} {element.type==='BARCODE'&&<AdvancedBarcodeProperties element={element as BarcodeDesignElement} update={update} availableFields={availableFields} />} 
  <ConditionalVisibilityProperties element={element} update={update} availableFields={availableFields} datasourceStatus={datasourceStatus}/>
  {(element.type==='IMAGE'||element.type==='SVG')&&<Section sectionKey="ADVANCED" title="Print Quality"><ElementPrintQuality element={element} asset={asset} print={artboard.print}/></Section>} 
  <Section sectionKey="TRANSFORM" title="Transform"><div className="card-property-grid">{num('X (mm)',element.position.xMm,v=>mutate(t=>setElementPosition(t,artboardId,element.id,{xMm:v,yMm:element.position.yMm})))}{num('Y (mm)',element.position.yMm,v=>mutate(t=>setElementPosition(t,artboardId,element.id,{xMm:element.position.xMm,yMm:v})))}{num('Width (mm)',element.size.widthMm,v=>mutate(t=>resizeElement(t,artboardId,element.id,{widthMm:v,heightMm:element.size.heightMm})))}{num('Height (mm)',element.size.heightMm,v=>mutate(t=>resizeElement(t,artboardId,element.id,{widthMm:element.size.widthMm,heightMm:v})))}</div>{num('Rotation (°)',element.rotationDeg,v=>mutate(t=>rotateElement(t,artboardId,element.id,v)))}<div className="card-property-note"><span>Drag resize: Shift toggles aspect lock · Alt resizes from center · Shift+Rotate snaps to 15°</span></div><div className="card-layer-action-grid" data-in-place-flip-inspector><button disabled={element.locked||!(element.type==='SHAPE'||element.type==='PATH'||element.type==='IMAGE'||element.type==='SVG')} title="Flip Horizontally in Place" onClick={()=>mutate(t=>flipElementsInPlace(t,artboardId,[element.id],'VERTICAL'))}>↔ Flip H</button><button disabled={element.locked||!(element.type==='SHAPE'||element.type==='PATH'||element.type==='IMAGE'||element.type==='SVG')} title="Flip Vertically in Place" onClick={()=>mutate(t=>flipElementsInPlace(t,artboardId,[element.id],'HORIZONTAL'))}>↕ Flip V</button></div><div className="card-layer-action-grid" data-page-center-mirror-inspector><button disabled={element.locked} title="Create Mirrored Copy Across Page Horizontal Center" onClick={()=>mutate(t=>mirrorElementsAcrossArtboard(t,artboardId,[element.id],'HORIZONTAL'))}>↕ Page Mirror H</button><button disabled={element.locked} title="Create Mirrored Copy Across Page Vertical Center" onClick={()=>mutate(t=>mirrorElementsAcrossArtboard(t,artboardId,[element.id],'VERTICAL'))}>↔ Page Mirror V</button></div></Section>
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
function StrokeControls({stroke,onChange}:{stroke?:ShapeDesignElement['stroke'];onChange:(stroke:ShapeDesignElement['stroke'])=>void}){
 const s:DesignStroke=stroke??{color:'#000000',widthMm:0,style:'NONE',opacity:1,lineCap:'BUTT',lineJoin:'MITER',miterLimit:4,dashOffset:0};
 const patch=(p:Partial<DesignStroke>)=>onChange({...s,...p});
 const normalizedDashText=(s.dashArray??[2,1]).join(', ');
 const [dashDraft,setDashDraft]=useState(normalizedDashText);
 const [dashError,setDashError]=useState('');
 useEffect(()=>{setDashDraft(normalizedDashText);setDashError('');},[normalizedDashText]);
 const commitDashDraft=()=>{
  const parsed=parseStrokeDashPatternText(dashDraft);
  if(!parsed.dashArray){setDashError(parsed.error??'Invalid dash pattern.');return false;}
  patch({dashArray:parsed.dashArray});setDashDraft(parsed.dashArray.join(', '));setDashError('');return true;
 };
 return <div className="card-property-details" data-phase82-stroke-controls>
  <label>Style<select value={s.style} onChange={e=>patch({style:e.target.value as DesignStroke['style']})}><option value="NONE">None</option><option value="SOLID">Solid</option><option value="DASHED">Dashed</option><option value="DOTTED">Dotted</option><option value="CUSTOM">Custom Dash</option></select></label>
  {s.style!=='NONE'&&<>
   <label>Color<div className="card-color-row"><input type="color" value={s.color} onChange={e=>patch({color:e.target.value})}/><input value={s.color} onChange={e=>patch({color:e.target.value})}/></div></label>
   <div className="card-property-grid"><label>Width (mm)<input type="number" min="0" step=".1" value={s.widthMm} onChange={e=>patch({widthMm:Math.max(0,Number(e.target.value)||0)})}/></label><label>Opacity (%)<input type="number" min="0" max="100" value={Math.round((s.opacity??1)*100)} onChange={e=>patch({opacity:clamp(Number(e.target.value)||0,0,100)/100})}/></label></div>
   <div className="card-property-grid"><label>Line cap<select value={s.lineCap??'BUTT'} onChange={e=>patch({lineCap:e.target.value as DesignStroke['lineCap']})}><option value="BUTT">Butt</option><option value="ROUND">Round</option><option value="SQUARE">Square</option></select></label><label>Line join<select value={s.lineJoin??'MITER'} onChange={e=>patch({lineJoin:e.target.value as DesignStroke['lineJoin']})}><option value="MITER">Miter</option><option value="ROUND">Round</option><option value="BEVEL">Bevel</option></select></label></div>
   {(s.lineJoin??'MITER')==='MITER'&&<label>Miter limit<input type="number" min="1" step=".5" value={s.miterLimit??4} onChange={e=>patch({miterLimit:Math.max(1,Number(e.target.value)||4)})}/></label>}
   {s.style==='CUSTOM'&&<label>Dash pattern (mm)<input aria-label="Custom dash pattern" type="text" inputMode="decimal" value={dashDraft} onChange={e=>{setDashDraft(e.target.value);setDashError('');}} onBlur={commitDashDraft} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();commitDashDraft();e.currentTarget.blur();}else if(e.key==='Escape'){setDashDraft(normalizedDashText);setDashError('');e.currentTarget.blur();}}} placeholder="12, 3, 2, 3" aria-invalid={dashError?true:undefined} aria-describedby="custom-dash-help"/><small id="custom-dash-help" style={{color:dashError?'var(--danger, #b91c1c)':'var(--text-secondary)'}}>{dashError||'Comma or space separated positive lengths, e.g. 12, 3, 2, 3. Press Enter or leave the field to apply.'}</small></label>}
   {s.style==='CUSTOM'&&<label>Dash offset (mm)<input type="number" step=".1" value={s.dashOffset??0} onChange={e=>patch({dashOffset:Number(e.target.value)||0})}/></label>}
   <label title="Inside and Outside stroke alignment are deferred until renderer/export parity is guaranteed.">Stroke alignment<select value="CENTER" disabled aria-label="Stroke alignment"><option value="CENTER">Center</option></select><small style={{color:'var(--text-secondary)'}}>Center is supported in this phase. Inside/Outside are deferred.</small></label>
  </>}
 </div>;
}
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

function TextLayerEffectsControls({effects,onChange,onMigrate}:{effects:TextLayerEffect[]|undefined;onChange:(effects:TextLayerEffect[])=>void;onMigrate:()=>void}){
  const normalized=normalizeTextLayerEffects(effects);
  const [addType,setAddType]=useState<TextLayerEffectType>('STROKE');
  const labels:Record<TextLayerEffectType,string>={STROKE:'Stroke',COLOR_OVERLAY:'Color Overlay',GRADIENT_OVERLAY:'Gradient Overlay',PATTERN_OVERLAY:'Pattern Overlay',INNER_SHADOW:'Inner Shadow',INNER_GLOW:'Inner Glow',OUTER_GLOW:'Outer Glow',DROP_SHADOW:'Drop Shadow',BEVEL_EMBOSS:'Bevel & Emboss'};
  const patchEffect=(effectId:string,patch:Partial<TextLayerEffect>)=>onChange(normalized.map(effect=>effect.id===effectId?{...effect,...patch,settings:patch.settings?{...effect.settings,...patch.settings}:effect.settings}:effect));
  const patchSettings=(effectId:string,settings:Partial<TextLayerEffect['settings']>)=>onChange(normalized.map(effect=>effect.id===effectId?{...effect,settings:{...effect.settings,...settings}}:effect));
  const add=()=>onChange(addTextLayerEffect(normalized,addType,id(`text-effect-${addType.toLowerCase()}`)));
  return <div className="card-text-layer-effects-engine" data-text6a-layer-effects>
    <div className="card-property-note"><strong>Photoshop-like Layer Effects</strong><span>Stack-based foundation. Effects are saved independently and can be enabled, duplicated, reset, or removed.</span></div>
    <div className="card-segmented-control"><button onClick={()=>onChange(addTextLayerEffect(normalized,'STROKE',id('text-effect-stroke')))}>+ Stroke</button><button onClick={()=>onChange(addTextLayerEffect(normalized,'COLOR_OVERLAY',id('text-effect-color-overlay')))}>+ Color</button><button onClick={()=>onChange(addTextLayerEffect(normalized,'GRADIENT_OVERLAY',id('text-effect-gradient-overlay')))}>+ Gradient</button><button onClick={()=>onChange(addTextLayerEffect(normalized,'PATTERN_OVERLAY',id('text-effect-pattern-overlay')))}>+ Pattern</button><button onClick={()=>onChange(addTextLayerEffect(normalized,'DROP_SHADOW',id('text-effect-drop-shadow')))}>+ Shadow</button></div><div className="card-property-grid"><label>Add Effect<select value={addType} onChange={e=>setAddType(e.target.value as TextLayerEffectType)}>{(Object.keys(labels) as TextLayerEffectType[]).map(type=><option key={type} value={type}>{labels[type]}</option>)}</select></label><button className="primary" onClick={add}>+ Add</button></div>
    {!normalized.length&&<div className="card-property-note"><span>No Layer Effects in the new stack yet.</span><button className="secondary" onClick={onMigrate}>Import Current Effects</button></div>}
    {normalized.map((effect,index)=><details key={effect.id} className="card-text-layer-effect-row" open={index===0}>
      <summary><label className="card-check-row" onClick={e=>e.stopPropagation()}><input type="checkbox" checked={effect.enabled} onChange={e=>onChange(toggleTextLayerEffect(normalized,effect.id,e.target.checked))}/><strong>{effect.name||labels[effect.type]}</strong></label><span>{Math.round((effect.opacity??1)*100)}%</span></summary>
      <div className="card-property-details">
        <div className="card-property-grid"><label>Opacity %<input type="number" min="0" max="100" value={Math.round((effect.opacity??1)*100)} onChange={e=>patchEffect(effect.id,{opacity:clamp(Number(e.target.value)||0,0,100)/100})}/></label><label>Blend<select value={effect.blendMode??'NORMAL'} onChange={e=>patchEffect(effect.id,{blendMode:e.target.value as TextLayerEffect['blendMode']})}><option value="NORMAL">Normal</option><option value="MULTIPLY">Multiply</option><option value="SCREEN">Screen</option><option value="OVERLAY">Overlay</option><option value="SOFT_LIGHT">Soft Light</option></select></label></div>
        {effect.type==='STROKE'&&<><label>Color<input type="color" value={effect.settings.color??'#111827'} onChange={e=>patchSettings(effect.id,{color:e.target.value})}/></label><div className="card-property-grid"><label>Width (mm)<input type="number" min="0" step=".05" value={effect.settings.widthMm??.25} onChange={e=>patchSettings(effect.id,{widthMm:Math.max(0,Number(e.target.value)||0)})}/></label><label>Position<select value={effect.settings.position??'CENTER'} onChange={e=>patchSettings(effect.id,{position:e.target.value as 'INSIDE'|'CENTER'|'OUTSIDE'})}><option value="INSIDE">Inside</option><option value="CENTER">Center</option><option value="OUTSIDE">Outside</option></select></label></div></>}
        {effect.type==='COLOR_OVERLAY'&&<label>Overlay Color<input type="color" value={effect.settings.color??'#7c3aed'} onChange={e=>patchSettings(effect.id,{color:e.target.value})}/></label>}
        {effect.type==='GRADIENT_OVERLAY'&&(()=>{const gradient=effect.settings.gradient??{type:'LINEAR' as const,angleDeg:90,stops:[{offset:0,color:'#ffffff',opacity:1},{offset:100,color:'#7c3aed',opacity:1}]};const stops=gradient.stops.length?gradient.stops:[{offset:0,color:'#ffffff',opacity:1},{offset:100,color:'#7c3aed',opacity:1}];const updateStops=(next:typeof stops)=>patchSettings(effect.id,{gradient:{...gradient,stops:next.sort((a,b)=>a.offset-b.offset)} as typeof gradient});return <><div className="card-property-grid"><label>Style<select value={gradient.type} onChange={e=>patchSettings(effect.id,{gradient:e.target.value==='RADIAL'?{type:'RADIAL',centerX:50,centerY:50,radius:50,stops:stops.map(stop=>({...stop}))}:{type:'LINEAR',angleDeg:90,stops:stops.map(stop=>({...stop}))}})}><option value="LINEAR">Linear</option><option value="RADIAL">Radial</option></select></label>{gradient.type==='LINEAR'?<label>Angle (°)<input type="number" value={gradient.angleDeg} onChange={e=>patchSettings(effect.id,{gradient:{...gradient,angleDeg:Number(e.target.value)||0}})}/></label>:<label>Radius %<input type="number" min="1" max="200" value={gradient.radius} onChange={e=>patchSettings(effect.id,{gradient:{...gradient,radius:clamp(Number(e.target.value)||50,1,200)}})}/></label>}<label>Scale %<input type="number" min="10" max="400" value={effect.settings.gradientScalePct??100} onChange={e=>patchSettings(effect.id,{gradientScalePct:clamp(Number(e.target.value)||100,10,400)})}/></label><label className="card-check-row"><input type="checkbox" checked={effect.settings.gradientReverse===true} onChange={e=>patchSettings(effect.id,{gradientReverse:e.target.checked})}/>Reverse</label></div><div className="card-property-note"><strong>Gradient Stops</strong><span>Add, remove and reposition color stops.</span></div>{stops.map((stop,i)=><div key={`${effect.id}-stop-${i}`} className="card-property-grid"><label>Color<input type="color" value={stop.color} onChange={e=>updateStops(stops.map((item,index)=>index===i?{...item,color:e.target.value}:item))}/></label><label>Position %<input type="number" min="0" max="100" value={stop.offset} onChange={e=>updateStops(stops.map((item,index)=>index===i?{...item,offset:clamp(Number(e.target.value)||0,0,100)}:item))}/></label><label>Opacity %<input type="number" min="0" max="100" value={Math.round((stop.opacity??1)*100)} onChange={e=>updateStops(stops.map((item,index)=>index===i?{...item,opacity:clamp(Number(e.target.value)||0,0,100)/100}:item))}/></label>{stops.length>2?<button className="secondary" onClick={()=>updateStops(stops.filter((_,index)=>index!==i))}>Remove</button>:<span/>}</div>)}<button className="secondary" onClick={()=>updateStops([...stops,{offset:50,color:'#ffffff',opacity:1}])}>+ Add Gradient Stop</button></>})()}
        {effect.type==='PATTERN_OVERLAY'&&(()=>{const pattern=effect.settings.pattern??{kind:'HATCH' as const,foreground:'#111827',background:'#ffffff',scale:8,rotationDeg:45,opacity:1};return <><div className="card-property-grid"><label>Pattern<select value={pattern.kind} onChange={e=>patchSettings(effect.id,{pattern:{...pattern,kind:e.target.value as typeof pattern.kind}})}><option value="HATCH">Hatch</option><option value="DOT">Dots</option><option value="CHECKER">Checker</option></select></label><label>Scale<input type="number" min="2" max="100" value={pattern.scale} onChange={e=>patchSettings(effect.id,{pattern:{...pattern,scale:clamp(Number(e.target.value)||8,2,100)}})}/></label><label>Rotation °<input type="number" value={pattern.rotationDeg} onChange={e=>patchSettings(effect.id,{pattern:{...pattern,rotationDeg:Number(e.target.value)||0}})}/></label><label>Pattern Opacity %<input type="number" min="0" max="100" value={Math.round((pattern.opacity??1)*100)} onChange={e=>patchSettings(effect.id,{pattern:{...pattern,opacity:clamp(Number(e.target.value)||0,0,100)/100}})}/></label></div><div className="card-property-grid"><label>Foreground<input type="color" value={pattern.foreground} onChange={e=>patchSettings(effect.id,{pattern:{...pattern,foreground:e.target.value}})}/></label><label>Background<input type="color" value={pattern.background} onChange={e=>patchSettings(effect.id,{pattern:{...pattern,background:e.target.value}})}/></label><label>Offset X<input type="number" value={effect.settings.patternOffsetX??0} onChange={e=>patchSettings(effect.id,{patternOffsetX:Number(e.target.value)||0})}/></label><label>Offset Y<input type="number" value={effect.settings.patternOffsetY??0} onChange={e=>patchSettings(effect.id,{patternOffsetY:Number(e.target.value)||0})}/></label></div></>})()}
        {(effect.type==='DROP_SHADOW'||effect.type==='INNER_SHADOW')&&<><label>Color<input type="color" value={effect.settings.color??'#111827'} onChange={e=>patchSettings(effect.id,{color:e.target.value})}/></label><div className="card-property-grid"><label>Offset X<input type="number" step=".05" value={effect.settings.offsetXmm??.2} onChange={e=>patchSettings(effect.id,{offsetXmm:Number(e.target.value)||0})}/></label><label>Offset Y<input type="number" step=".05" value={effect.settings.offsetYmm??.2} onChange={e=>patchSettings(effect.id,{offsetYmm:Number(e.target.value)||0})}/></label><label>Blur<input type="number" min="0" step=".05" value={effect.settings.blurMm??.4} onChange={e=>patchSettings(effect.id,{blurMm:Math.max(0,Number(e.target.value)||0)})}/></label><label>Spread %<input type="number" min="0" max="100" value={Math.round((effect.settings.spread??0)*100)} onChange={e=>patchSettings(effect.id,{spread:clamp(Number(e.target.value)||0,0,100)/100})}/></label></div></>}{effect.type==='DROP_SHADOW'&&<div className="card-property-grid"><label>Angle (°)<input type="number" value={effect.settings.angleDeg??Math.round(Math.atan2(effect.settings.offsetYmm??.5,effect.settings.offsetXmm??.5)*180/Math.PI)} onChange={e=>{const angle=Number(e.target.value)||0,d=effect.settings.distanceMm??Math.hypot(effect.settings.offsetXmm??.5,effect.settings.offsetYmm??.5),r=angle*Math.PI/180;patchSettings(effect.id,{angleDeg:angle,distanceMm:d,offsetXmm:Math.cos(r)*d,offsetYmm:Math.sin(r)*d})}}/></label><label>Distance (mm)<input type="number" min="0" step=".05" value={effect.settings.distanceMm??Math.hypot(effect.settings.offsetXmm??.5,effect.settings.offsetYmm??.5)} onChange={e=>{const d=Math.max(0,Number(e.target.value)||0),angle=effect.settings.angleDeg??45,r=angle*Math.PI/180;patchSettings(effect.id,{distanceMm:d,angleDeg:angle,offsetXmm:Math.cos(r)*d,offsetYmm:Math.sin(r)*d})}}/></label></div>}
        {(effect.type==='INNER_GLOW'||effect.type==='OUTER_GLOW')&&<><label>Color<input type="color" value={effect.settings.color??'#ffffff'} onChange={e=>patchSettings(effect.id,{color:e.target.value})}/></label><div className="card-property-grid"><label>Size / Blur<input type="number" min="0" step=".05" value={effect.settings.blurMm??.8} onChange={e=>patchSettings(effect.id,{blurMm:Math.max(0,Number(e.target.value)||0)})}/></label><label>Spread %<input type="number" min="0" max="100" value={Math.round((effect.settings.spread??0)*100)} onChange={e=>patchSettings(effect.id,{spread:clamp(Number(e.target.value)||0,0,100)/100})}/></label></div></>}
        {effect.type==='BEVEL_EMBOSS'&&<><div className="card-property-grid"><label>Depth (mm)<input type="number" min=".05" step=".05" value={effect.settings.depthMm??.35} onChange={e=>patchSettings(effect.id,{depthMm:Math.max(.05,Number(e.target.value)||.05)})}/></label><label>Size (mm)<input type="number" min=".05" step=".05" value={effect.settings.sizeMm??.35} onChange={e=>patchSettings(effect.id,{sizeMm:Math.max(.05,Number(e.target.value)||.05)})}/></label><label>Soften (mm)<input type="number" min="0" step=".05" value={effect.settings.softenMm??.1} onChange={e=>patchSettings(effect.id,{softenMm:Math.max(0,Number(e.target.value)||0)})}/></label><label>Direction<select value={effect.settings.direction??'UP'} onChange={e=>patchSettings(effect.id,{direction:e.target.value as 'UP'|'DOWN'})}><option value="UP">Up</option><option value="DOWN">Down</option></select></label></div><div className="card-property-grid"><label>Highlight<input type="color" value={effect.settings.highlightColor??'#ffffff'} onChange={e=>patchSettings(effect.id,{highlightColor:e.target.value})}/></label><label>Shadow<input type="color" value={effect.settings.shadowColor??'#111827'} onChange={e=>patchSettings(effect.id,{shadowColor:e.target.value})}/></label></div></>}
        <div className="card-segmented-control"><button disabled={index===0} onClick={()=>onChange(moveTextLayerEffect(normalized,effect.id,'UP'))}>↑</button><button disabled={index===normalized.length-1} onClick={()=>onChange(moveTextLayerEffect(normalized,effect.id,'DOWN'))}>↓</button><button onClick={()=>onChange(duplicateTextLayerEffect(normalized,effect.id,id('text-effect-copy')))}>Duplicate</button><button onClick={()=>onChange(resetTextLayerEffect(normalized,effect.id))}>Reset</button><button className="danger" onClick={()=>onChange(removeTextLayerEffect(normalized,effect.id))}>Remove</button></div>
      </div>
    </details>)}
  </div>;
}

function AdvancedTextProperties({element,update,artboard,availableFields,datasourceStatus}:{element:TextDesignElement;update:(f:(e:DesignElement)=>DesignElement)=>void;artboard:Artboard;availableFields:import('@document-tool/contracts').FieldDefinition[];datasourceStatus:string}){
  const fontManager=useContext(FontManagerContext);
  const patch=(p:Partial<TextDesignElement>)=>update(e=>e.type==='TEXT'?{...e,...p}:e);
  const style=(p:Partial<TextDesignElement['style']>)=>patch({style:{...element.style,...p}});
  const textBinding=getTextBinding(element);
  const isBound=!!textBinding;
  const isMissingField=isBound&&textBinding.sourceType==='FIELD'&&!availableFields.some(f=>f.name===textBinding.fieldPath);
  
  const bindingMode = element.textBindingMode === 'TEMPLATE' ? 'TEMPLATE' : 'FULL';
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [richSelection,setRichSelection]=useState({start:0,end:0});
  const updateRichSelection=()=>{const input=textareaRef.current;if(!input)return;setRichSelection({start:input.selectionStart??0,end:input.selectionEnd??0});};
  const hasRichSelection=richSelection.end>richSelection.start;
  const applyRichStyle=(runStyle:TextStyleRunStyle)=>{
    if(!hasRichSelection)return;
    style({runs:applyTextStyleRun(element.text,element.style.runs,richSelection.start,richSelection.end,runStyle,id('text-run'))});
  };
  const clearRichStyle=()=>{
    if(!hasRichSelection)return;
    style({runs:clearTextStyleRuns(element.text,element.style.runs,richSelection.start,richSelection.end)});
  };
  const selectedText=hasRichSelection?element.text.slice(richSelection.start,richSelection.end):'';

  const handleInsertField = (fieldPath: string) => {
    if (fieldPath === '__NONE__') return;
    const txt = textareaRef.current;
    if (txt) {
      const start = txt.selectionStart;
      const end = txt.selectionEnd;
      const val = element.text;
      const newText = val.substring(0, start) + `{{${fieldPath}}}` + val.substring(end);
      patch({text:newText,style:{...element.style,runs:rebaseTextStyleRunsOnEdit(element.text,newText,element.style.runs)}});
      setTimeout(() => {
         txt.focus();
         txt.setSelectionRange(start + fieldPath.length + 4, start + fieldPath.length + 4);
      }, 0);
    } else {
      {const newText=element.text+`{{${fieldPath}}}`;patch({text:newText,style:{...element.style,runs:rebaseTextStyleRunsOnEdit(element.text,newText,element.style.runs)}});}
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
  
  const paragraphAlignment=element.style.paragraphAlignment??element.style.alignment;
  const fill=element.style.fill??{type:'SOLID' as const,color:element.style.color,opacity:1};
  const setFillType=(type:'SOLID'|'LINEAR_GRADIENT'|'RADIAL_GRADIENT')=>{if(type==='SOLID')style({fill:{type:'SOLID',color:element.style.color,opacity:1}});else if(type==='LINEAR_GRADIENT')style({fill:{type:'LINEAR_GRADIENT',gradient:{type:'LINEAR',angleDeg:0,stops:[{offset:0,color:element.style.color,opacity:1},{offset:100,color:'#7c3aed',opacity:1}]}}});else style({fill:{type:'RADIAL_GRADIENT',gradient:{type:'RADIAL',centerX:50,centerY:50,radius:70,stops:[{offset:0,color:element.style.color,opacity:1},{offset:100,color:'#7c3aed',opacity:1}]}}})};
  const setGradientStop=(index:number,color:string)=>{if(fill.type==='LINEAR_GRADIENT')style({fill:{type:'LINEAR_GRADIENT',gradient:{...fill.gradient,stops:fill.gradient.stops.map((stop,i)=>i===index?{...stop,color}:stop)}}});if(fill.type==='RADIAL_GRADIENT')style({fill:{type:'RADIAL_GRADIENT',gradient:{...fill.gradient,stops:fill.gradient.stops.map((stop,i)=>i===index?{...stop,color}:stop)}}})};
  const textStroke=element.style.stroke??{color:'#111827',widthMm:0,opacity:1};
  const glow=element.style.glow??{enabled:false,color:'#60a5fa',blurMm:1.5,opacity:.65};
  const advancedEffects=element.style.advancedEffects??{bevel:{enabled:false,depthMm:.35,highlightColor:'#ffffff',shadowColor:'#111827',intensity:.65},highlight:{enabled:false,color:'#ffffff',offsetYmm:-.25,blurMm:.25,opacity:.6},longShadow:{enabled:false,color:'#111827',distanceMm:2,angleDeg:45,opacity:.45},innerShadow:{enabled:false,color:'#111827',offsetXmm:.18,offsetYmm:.18,blurMm:.3,opacity:.45},innerGlow:{enabled:false,color:'#ffffff',blurMm:.7,opacity:.45},secondaryStroke:{enabled:false,color:'#ffffff',widthMm:.35,opacity:1},reflection:{enabled:false,color:'#ffffff',offsetYmm:.35,blurMm:.35,opacity:.35},grain:{enabled:false,color:'#111827',amount:35,opacity:.18}};
  const applyMaterialPreset=(preset:NonNullable<TextDesignElement['style']['materialPreset']>)=>{
    if(preset==='CUSTOM'){style({materialPreset:'CUSTOM'});return;}
    if(preset==='GOLD'){style({materialPreset:preset,fill:{type:'LINEAR_GRADIENT',gradient:{type:'LINEAR',angleDeg:90,stops:[{offset:0,color:'#6f4e00',opacity:1},{offset:24,color:'#fff2a8',opacity:1},{offset:48,color:'#d4af37',opacity:1},{offset:72,color:'#fff7c7',opacity:1},{offset:100,color:'#8a5f00',opacity:1}]}},stroke:{color:'#6f4e00',widthMm:.22,opacity:1},glow:{enabled:false,color:'#facc15',blurMm:.8,opacity:.25},advancedEffects:{...advancedEffects,bevel:{enabled:true,depthMm:.3,highlightColor:'#fff8d6',shadowColor:'#704b00',intensity:.75},highlight:{enabled:true,color:'#fffbe8',offsetYmm:-.2,blurMm:.18,opacity:.7}}});patch({shadow:{enabled:true,offsetXmm:.45,offsetYmm:.55,blurMm:.5,color:'#3b2500',opacity:.35}});return;}
    if(preset==='SILVER'){style({materialPreset:preset,fill:{type:'LINEAR_GRADIENT',gradient:{type:'LINEAR',angleDeg:90,stops:[{offset:0,color:'#50545b',opacity:1},{offset:25,color:'#f5f7fa',opacity:1},{offset:50,color:'#aeb4bd',opacity:1},{offset:75,color:'#ffffff',opacity:1},{offset:100,color:'#666b73',opacity:1}]}},stroke:{color:'#4b5563',widthMm:.18,opacity:1},advancedEffects:{...advancedEffects,bevel:{enabled:true,depthMm:.28,highlightColor:'#ffffff',shadowColor:'#3f4650',intensity:.72},highlight:{enabled:true,color:'#ffffff',offsetYmm:-.18,blurMm:.15,opacity:.75}}});patch({shadow:{enabled:true,offsetXmm:.35,offsetYmm:.45,blurMm:.45,color:'#111827',opacity:.28}});return;}
    if(preset==='CHROME'){style({materialPreset:preset,fill:{type:'LINEAR_GRADIENT',gradient:{type:'LINEAR',angleDeg:90,stops:[{offset:0,color:'#16191d',opacity:1},{offset:20,color:'#f8fafc',opacity:1},{offset:38,color:'#767d87',opacity:1},{offset:55,color:'#ffffff',opacity:1},{offset:70,color:'#4b5563',opacity:1},{offset:100,color:'#d1d5db',opacity:1}]}},stroke:{color:'#111827',widthMm:.2,opacity:1},advancedEffects:{...advancedEffects,bevel:{enabled:true,depthMm:.36,highlightColor:'#ffffff',shadowColor:'#111827',intensity:.82},highlight:{enabled:true,color:'#ffffff',offsetYmm:-.25,blurMm:.12,opacity:.85}}});patch({shadow:{enabled:true,offsetXmm:.5,offsetYmm:.65,blurMm:.6,color:'#000000',opacity:.38}});return;}
    if(preset==='NEON'){style({materialPreset:preset,fill:{type:'SOLID',color:'#f8fbff',opacity:1},color:'#f8fbff',stroke:{color:'#67e8f9',widthMm:.18,opacity:1},glow:{enabled:true,color:'#22d3ee',blurMm:2.4,opacity:.92},advancedEffects:{...advancedEffects,bevel:{...advancedEffects.bevel!,enabled:false},highlight:{...advancedEffects.highlight!,enabled:false}}});patch({shadow:{enabled:false,offsetXmm:0,offsetYmm:0,blurMm:0,color:'#000000',opacity:0}});return;}
    if(preset==='GLASS'){style({materialPreset:preset,fill:{type:'LINEAR_GRADIENT',gradient:{type:'LINEAR',angleDeg:90,stops:[{offset:0,color:'#ffffff',opacity:.9},{offset:45,color:'#c7e7ff',opacity:.5},{offset:100,color:'#6fb7e9',opacity:.75}]}},stroke:{color:'#ffffff',widthMm:.16,opacity:.75},glow:{enabled:true,color:'#dff5ff',blurMm:.9,opacity:.45},advancedEffects:{...advancedEffects,bevel:{enabled:true,depthMm:.22,highlightColor:'#ffffff',shadowColor:'#5b8ba8',intensity:.5},highlight:{enabled:true,color:'#ffffff',offsetYmm:-.22,blurMm:.18,opacity:.8}}});patch({shadow:{enabled:true,offsetXmm:.3,offsetYmm:.45,blurMm:.8,color:'#4b7894',opacity:.25}});return;}
    if(preset==='ROSE_GOLD'){style({materialPreset:preset,fill:{type:'LINEAR_GRADIENT',gradient:{type:'LINEAR',angleDeg:90,stops:[{offset:0,color:'#6d2f3b',opacity:1},{offset:22,color:'#ffd6cf',opacity:1},{offset:48,color:'#d98b86',opacity:1},{offset:72,color:'#ffe2dc',opacity:1},{offset:100,color:'#8e4b50',opacity:1}]}},stroke:{color:'#7a3f48',widthMm:.2,opacity:1},advancedEffects:{...advancedEffects,bevel:{enabled:true,depthMm:.3,highlightColor:'#fff1ed',shadowColor:'#6d2f3b',intensity:.72},highlight:{enabled:true,color:'#ffffff',offsetYmm:-.2,blurMm:.15,opacity:.72}}});patch({shadow:{enabled:true,offsetXmm:.35,offsetYmm:.5,blurMm:.45,color:'#4a1f28',opacity:.3}});return;}
    if(preset==='BRONZE'){style({materialPreset:preset,fill:{type:'LINEAR_GRADIENT',gradient:{type:'LINEAR',angleDeg:90,stops:[{offset:0,color:'#3f2415',opacity:1},{offset:28,color:'#d89b5b',opacity:1},{offset:52,color:'#8f5b32',opacity:1},{offset:78,color:'#f0bd7d',opacity:1},{offset:100,color:'#4d2c19',opacity:1}]}},stroke:{color:'#3f2415',widthMm:.22,opacity:1},advancedEffects:{...advancedEffects,bevel:{enabled:true,depthMm:.32,highlightColor:'#ffd7a3',shadowColor:'#3f2415',intensity:.7},grain:{enabled:true,color:'#3a2012',amount:32,opacity:.16}}});patch({shadow:{enabled:true,offsetXmm:.4,offsetYmm:.55,blurMm:.35,color:'#2a160d',opacity:.35}});return;}
    if(preset==='COPPER'){style({materialPreset:preset,fill:{type:'LINEAR_GRADIENT',gradient:{type:'LINEAR',angleDeg:90,stops:[{offset:0,color:'#5b2617',opacity:1},{offset:24,color:'#f4a77c',opacity:1},{offset:48,color:'#b85c38',opacity:1},{offset:74,color:'#ffd0b3',opacity:1},{offset:100,color:'#6f2c19',opacity:1}]}},stroke:{color:'#642815',widthMm:.2,opacity:1},advancedEffects:{...advancedEffects,bevel:{enabled:true,depthMm:.28,highlightColor:'#ffe2d1',shadowColor:'#5b2617',intensity:.72},highlight:{enabled:true,color:'#fff4eb',offsetYmm:-.18,blurMm:.13,opacity:.68}}});patch({shadow:{enabled:true,offsetXmm:.35,offsetYmm:.5,blurMm:.4,color:'#3b170d',opacity:.32}});return;}
    if(preset==='STEEL'){style({materialPreset:preset,fill:{type:'LINEAR_GRADIENT',gradient:{type:'LINEAR',angleDeg:90,stops:[{offset:0,color:'#1f2937',opacity:1},{offset:25,color:'#d6dde5',opacity:1},{offset:50,color:'#697586',opacity:1},{offset:75,color:'#f7fafc',opacity:1},{offset:100,color:'#374151',opacity:1}]}},stroke:{color:'#111827',widthMm:.22,opacity:1},advancedEffects:{...advancedEffects,bevel:{enabled:true,depthMm:.34,highlightColor:'#ffffff',shadowColor:'#111827',intensity:.8},grain:{enabled:true,color:'#111827',amount:20,opacity:.1}}});patch({shadow:{enabled:true,offsetXmm:.45,offsetYmm:.6,blurMm:.45,color:'#111827',opacity:.3}});return;}
    if(preset==='HOLOGRAPHIC'){style({materialPreset:preset,fill:{type:'LINEAR_GRADIENT',gradient:{type:'LINEAR',angleDeg:28,stops:[{offset:0,color:'#7dd3fc',opacity:1},{offset:18,color:'#c4b5fd',opacity:1},{offset:36,color:'#f9a8d4',opacity:1},{offset:54,color:'#fde68a',opacity:1},{offset:72,color:'#86efac',opacity:1},{offset:100,color:'#67e8f9',opacity:1}]}},stroke:{color:'#ffffff',widthMm:.16,opacity:.75},glow:{enabled:true,color:'#a5f3fc',blurMm:.9,opacity:.4},advancedEffects:{...advancedEffects,highlight:{enabled:true,color:'#ffffff',offsetYmm:-.18,blurMm:.18,opacity:.72},reflection:{enabled:true,color:'#ffffff',offsetYmm:.35,blurMm:.25,opacity:.3}}});patch({shadow:{enabled:true,offsetXmm:.25,offsetYmm:.4,blurMm:.5,color:'#6d5cae',opacity:.2}});return;}
    if(preset==='GLITTER'){style({materialPreset:preset,fill:{type:'LINEAR_GRADIENT',gradient:{type:'LINEAR',angleDeg:35,stops:[{offset:0,color:'#7c2d12',opacity:1},{offset:20,color:'#fbbf24',opacity:1},{offset:40,color:'#fff7ae',opacity:1},{offset:60,color:'#f59e0b',opacity:1},{offset:80,color:'#fff1a8',opacity:1},{offset:100,color:'#92400e',opacity:1}]}},stroke:{color:'#78350f',widthMm:.22,opacity:1},glow:{enabled:true,color:'#fde68a',blurMm:.7,opacity:.35},advancedEffects:{...advancedEffects,grain:{enabled:true,color:'#ffffff',amount:75,opacity:.4},highlight:{enabled:true,color:'#ffffff',offsetYmm:-.15,blurMm:.08,opacity:.8}}});patch({shadow:{enabled:true,offsetXmm:.35,offsetYmm:.55,blurMm:.4,color:'#451a03',opacity:.32}});return;}
    if(preset==='FOIL'){style({materialPreset:preset,fill:{type:'LINEAR_GRADIENT',gradient:{type:'LINEAR',angleDeg:75,stops:[{offset:0,color:'#4b5563',opacity:1},{offset:18,color:'#ffffff',opacity:1},{offset:36,color:'#94a3b8',opacity:1},{offset:54,color:'#f8fafc',opacity:1},{offset:72,color:'#64748b',opacity:1},{offset:100,color:'#e2e8f0',opacity:1}]}},stroke:{color:'#475569',widthMm:.16,opacity:.85},advancedEffects:{...advancedEffects,reflection:{enabled:true,color:'#ffffff',offsetYmm:.28,blurMm:.16,opacity:.5},highlight:{enabled:true,color:'#ffffff',offsetYmm:-.2,blurMm:.1,opacity:.8}}});patch({shadow:{enabled:true,offsetXmm:.25,offsetYmm:.4,blurMm:.35,color:'#334155',opacity:.22}});return;}
    if(preset==='PLASTIC'){style({materialPreset:preset,fill:{type:'LINEAR_GRADIENT',gradient:{type:'LINEAR',angleDeg:90,stops:[{offset:0,color:'#5b21b6',opacity:1},{offset:40,color:'#8b5cf6',opacity:1},{offset:65,color:'#c4b5fd',opacity:1},{offset:100,color:'#4c1d95',opacity:1}]}},stroke:{color:'#3b0764',widthMm:.18,opacity:1},advancedEffects:{...advancedEffects,bevel:{enabled:true,depthMm:.3,highlightColor:'#ede9fe',shadowColor:'#3b0764',intensity:.72},reflection:{enabled:true,color:'#ffffff',offsetYmm:.25,blurMm:.18,opacity:.55}}});patch({shadow:{enabled:true,offsetXmm:.4,offsetYmm:.55,blurMm:.6,color:'#2e1065',opacity:.3}});return;}
    if(preset==='CANDY'){style({materialPreset:preset,fill:{type:'LINEAR_GRADIENT',gradient:{type:'LINEAR',angleDeg:90,stops:[{offset:0,color:'#be123c',opacity:1},{offset:40,color:'#fb7185',opacity:1},{offset:62,color:'#fecdd3',opacity:1},{offset:100,color:'#9f1239',opacity:1}]}},stroke:{color:'#881337',widthMm:.2,opacity:1},glow:{enabled:true,color:'#fda4af',blurMm:.55,opacity:.28},advancedEffects:{...advancedEffects,bevel:{enabled:true,depthMm:.28,highlightColor:'#fff1f2',shadowColor:'#881337',intensity:.72},reflection:{enabled:true,color:'#ffffff',offsetYmm:.22,blurMm:.12,opacity:.65}}});patch({shadow:{enabled:true,offsetXmm:.35,offsetYmm:.5,blurMm:.5,color:'#4c0519',opacity:.3}});return;}
    if(preset==='FROSTED_GLASS'){style({materialPreset:preset,fill:{type:'LINEAR_GRADIENT',gradient:{type:'LINEAR',angleDeg:90,stops:[{offset:0,color:'#ffffff',opacity:.78},{offset:45,color:'#dbeafe',opacity:.35},{offset:100,color:'#93c5fd',opacity:.55}]}},stroke:{color:'#ffffff',widthMm:.2,opacity:.68},glow:{enabled:true,color:'#e0f2fe',blurMm:1.2,opacity:.5},advancedEffects:{...advancedEffects,innerGlow:{enabled:true,color:'#ffffff',blurMm:.8,opacity:.55},grain:{enabled:true,color:'#ffffff',amount:24,opacity:.12}}});patch({shadow:{enabled:true,offsetXmm:.2,offsetYmm:.4,blurMm:.8,color:'#64748b',opacity:.2}});return;}
    if(preset==='RETRO'){style({materialPreset:preset,fill:{type:'LINEAR_GRADIENT',gradient:{type:'LINEAR',angleDeg:0,stops:[{offset:0,color:'#fb7185',opacity:1},{offset:50,color:'#facc15',opacity:1},{offset:100,color:'#2dd4bf',opacity:1}]}},stroke:{color:'#312e81',widthMm:.28,opacity:1},advancedEffects:{...advancedEffects,secondaryStroke:{enabled:true,color:'#fef3c7',widthMm:.45,opacity:1},longShadow:{enabled:true,color:'#312e81',distanceMm:2.2,angleDeg:45,opacity:.55}}});patch({shadow:{enabled:false,offsetXmm:0,offsetYmm:0,blurMm:0,color:'#000000',opacity:0}});return;}
    if(preset==='COMIC'){style({materialPreset:preset,fill:{type:'SOLID',color:'#facc15',opacity:1},color:'#facc15',stroke:{color:'#111827',widthMm:.3,opacity:1},advancedEffects:{...advancedEffects,secondaryStroke:{enabled:true,color:'#ffffff',widthMm:.48,opacity:1},longShadow:{enabled:true,color:'#111827',distanceMm:1.4,angleDeg:45,opacity:.8}}});patch({shadow:{enabled:false,offsetXmm:0,offsetYmm:0,blurMm:0,color:'#000000',opacity:0}});return;}
    if(preset==='GRUNGE'){style({materialPreset:preset,fill:{type:'SOLID',color:'#b45309',opacity:1},color:'#b45309',stroke:{color:'#451a03',widthMm:.24,opacity:.95},advancedEffects:{...advancedEffects,grain:{enabled:true,color:'#451a03',amount:90,opacity:.35},innerShadow:{enabled:true,color:'#451a03',offsetXmm:.18,offsetYmm:.18,blurMm:.28,opacity:.5}}});patch({shadow:{enabled:true,offsetXmm:.25,offsetYmm:.35,blurMm:.15,color:'#451a03',opacity:.3}});return;}
    if(preset==='INK_STAMP'){style({materialPreset:preset,fill:{type:'SOLID',color:'#7f1d1d',opacity:.92},color:'#7f1d1d',stroke:{color:'#450a0a',widthMm:.1,opacity:.8},advancedEffects:{...advancedEffects,grain:{enabled:true,color:'#450a0a',amount:100,opacity:.42}}});patch({shadow:{enabled:false,offsetXmm:0,offsetYmm:0,blurMm:0,color:'#000000',opacity:0}});return;}
    if(preset==='EMBOSSED_PAPER'){style({materialPreset:preset,fill:{type:'SOLID',color:'#f1eadc',opacity:1},color:'#f1eadc',stroke:{color:'#c8bda8',widthMm:.06,opacity:.6},advancedEffects:{...advancedEffects,bevel:{enabled:true,depthMm:.22,highlightColor:'#ffffff',shadowColor:'#b7aa94',intensity:.55},innerShadow:{enabled:true,color:'#b7aa94',offsetXmm:.12,offsetYmm:.12,blurMm:.22,opacity:.35}}});patch({shadow:{enabled:false,offsetXmm:0,offsetYmm:0,blurMm:0,color:'#000000',opacity:0}});return;}
    if(preset==='ENGRAVED'){style({materialPreset:preset,fill:{type:'SOLID',color:'#4b5563',opacity:1},color:'#4b5563',stroke:{color:'#111827',widthMm:.12,opacity:.85},advancedEffects:{...advancedEffects,innerShadow:{enabled:true,color:'#000000',offsetXmm:.22,offsetYmm:.22,blurMm:.24,opacity:.6},highlight:{enabled:true,color:'#d1d5db',offsetYmm:-.12,blurMm:.08,opacity:.45}}});patch({shadow:{enabled:false,offsetXmm:0,offsetYmm:0,blurMm:0,color:'#000000',opacity:0}});return;}
    if(preset==='WOOD'){style({materialPreset:preset,fill:{type:'LINEAR_GRADIENT',gradient:{type:'LINEAR',angleDeg:0,stops:[{offset:0,color:'#5b341d',opacity:1},{offset:35,color:'#b77945',opacity:1},{offset:65,color:'#7c4425',opacity:1},{offset:100,color:'#d49a68',opacity:1}]}},stroke:{color:'#3f2414',widthMm:.2,opacity:1},advancedEffects:{...advancedEffects,grain:{enabled:true,color:'#3f2414',amount:70,opacity:.28},bevel:{enabled:true,depthMm:.18,highlightColor:'#e6b98b',shadowColor:'#3f2414',intensity:.45}}});patch({shadow:{enabled:true,offsetXmm:.35,offsetYmm:.5,blurMm:.35,color:'#2d190e',opacity:.3}});return;}
    if(preset==='STONE'){style({materialPreset:preset,fill:{type:'LINEAR_GRADIENT',gradient:{type:'LINEAR',angleDeg:90,stops:[{offset:0,color:'#44403c',opacity:1},{offset:42,color:'#a8a29e',opacity:1},{offset:65,color:'#78716c',opacity:1},{offset:100,color:'#d6d3d1',opacity:1}]}},stroke:{color:'#292524',widthMm:.2,opacity:1},advancedEffects:{...advancedEffects,grain:{enabled:true,color:'#292524',amount:80,opacity:.3},bevel:{enabled:true,depthMm:.26,highlightColor:'#e7e5e4',shadowColor:'#292524',intensity:.55}}});patch({shadow:{enabled:true,offsetXmm:.4,offsetYmm:.55,blurMm:.3,color:'#1c1917',opacity:.32}});return;}
    if(preset==='LEATHER'){style({materialPreset:preset,fill:{type:'SOLID',color:'#78350f',opacity:1},color:'#78350f',stroke:{color:'#451a03',widthMm:.22,opacity:1},advancedEffects:{...advancedEffects,grain:{enabled:true,color:'#451a03',amount:65,opacity:.24},innerShadow:{enabled:true,color:'#451a03',offsetXmm:.16,offsetYmm:.16,blurMm:.3,opacity:.45},highlight:{enabled:true,color:'#d97706',offsetYmm:-.1,blurMm:.12,opacity:.25}}});patch({shadow:{enabled:true,offsetXmm:.3,offsetYmm:.45,blurMm:.3,color:'#451a03',opacity:.28}});return;}
    if(preset==='GRADIENT_NEON'){style({materialPreset:preset,fill:{type:'LINEAR_GRADIENT',gradient:{type:'LINEAR',angleDeg:0,stops:[{offset:0,color:'#22d3ee',opacity:1},{offset:50,color:'#a78bfa',opacity:1},{offset:100,color:'#f472b6',opacity:1}]}},stroke:{color:'#ffffff',widthMm:.12,opacity:.85},glow:{enabled:true,color:'#c084fc',blurMm:2.1,opacity:.85},advancedEffects:{...advancedEffects,innerGlow:{enabled:true,color:'#ffffff',blurMm:.45,opacity:.5}}});patch({shadow:{enabled:false,offsetXmm:0,offsetYmm:0,blurMm:0,color:'#000000',opacity:0}});return;}
    if(preset==='OUTLINE_NEON'){style({materialPreset:preset,fill:{type:'SOLID',color:'#0f172a',opacity:.05},color:'#0f172a',stroke:{color:'#22d3ee',widthMm:.28,opacity:1},glow:{enabled:true,color:'#22d3ee',blurMm:2.3,opacity:.95},advancedEffects:{...advancedEffects,secondaryStroke:{enabled:true,color:'#cffafe',widthMm:.12,opacity:.9}}});patch({shadow:{enabled:false,offsetXmm:0,offsetYmm:0,blurMm:0,color:'#000000',opacity:0}});return;}
    if(preset==='VINTAGE'){style({materialPreset:preset,fill:{type:'SOLID',color:'#d6a85f',opacity:1},color:'#d6a85f',stroke:{color:'#4f3422',widthMm:.25,opacity:1},glow:{enabled:false,color:'#000000',blurMm:0,opacity:0},advancedEffects:{...advancedEffects,bevel:{enabled:true,depthMm:.18,highlightColor:'#f2d092',shadowColor:'#4f3422',intensity:.4},highlight:{...advancedEffects.highlight!,enabled:false},longShadow:{enabled:true,color:'#5d3b26',distanceMm:1.4,angleDeg:45,opacity:.35}}});patch({shadow:{enabled:true,offsetXmm:.45,offsetYmm:.55,blurMm:.2,color:'#3d291d',opacity:.35}});}
  };
  return <><Section sectionKey="TYPOGRAPHY" title="Typography"><label>Content<textarea ref={textareaRef} value={element.text} onSelect={updateRichSelection} onKeyUp={updateRichSelection} onMouseUp={updateRichSelection} onChange={e=>{const nextText=e.target.value;patch({text:nextText,style:{...element.style,runs:rebaseTextStyleRunsOnEdit(element.text,nextText,element.style.runs)}});setRichSelection({start:e.target.selectionStart??0,end:e.target.selectionEnd??0});}}/></label><label>Font Family<select value={element.style.fontFamily} onChange={e=>{style({fontFamily:e.target.value});fontManager.markRecent(e.target.value)}}><FontFamilyOptions currentFont={element.style.fontFamily}/></select></label><label>Custom / Installed Font<input type="text" value={element.style.fontFamily} placeholder="Type installed font name, e.g. Gotham" onChange={e=>style({fontFamily:e.target.value})} onBlur={e=>fontManager.markRecent(e.target.value)}/><span className="card-field-hint">Installed fonts can be referenced by family name. For portable designs, upload the licensed font to My Fonts below.</span></label><FontManagerPanel currentFont={element.style.fontFamily} onSelect={family=>style({fontFamily:family})}/><div className="card-property-grid"><label>Size (pt)<input type="number" min="1" value={element.style.fontSizePt} onChange={e=>style({fontSizePt:Math.max(1,Number(e.target.value)||1)})}/></label><label>Font Style / Weight<select value={element.style.fontWeight} onChange={e=>style({fontWeight:Number(e.target.value)})}>{FONT_WEIGHT_OPTIONS.map(item=><option key={item.value} value={item.value}>{item.label} ({item.value})</option>)}</select></label></div><div className="card-segmented-control triple"><button className={element.style.italic?'active':''} onClick={()=>style({italic:!element.style.italic})}>Italic</button><button className={element.style.underline?'active':''} onClick={()=>style({underline:!element.style.underline})}>Underline</button><button className={element.style.fontWeight>=700?'active':''} onClick={()=>style({fontWeight:element.style.fontWeight>=700?400:700})}>Bold</button></div><div className="card-segmented-control"><button className={element.style.strikethrough?'active':''} onClick={()=>style({strikethrough:!element.style.strikethrough})}>Strike</button><select value={element.style.textCase??'NONE'} onChange={e=>style({textCase:e.target.value as NonNullable<TextDesignElement['style']['textCase']>})}><option value="NONE">Original Case</option><option value="UPPERCASE">UPPERCASE</option><option value="LOWERCASE">lowercase</option><option value="TITLE">Title Case</option></select></div><div className="card-property-grid"><label>Line height<input type="number" min=".5" step=".1" value={element.style.lineHeight} onChange={e=>style({lineHeight:Math.max(.5,Number(e.target.value)||1.2)})}/></label><label>Letter spacing (pt)<input type="number" step=".1" value={element.style.letterSpacingPt} onChange={e=>style({letterSpacingPt:Number(e.target.value)||0})}/></label></div></Section>
  <Section sectionKey="TYPOGRAPHY" title="Rich Text Selection"><div className="card-property-note"><strong>{hasRichSelection?`${richSelection.end-richSelection.start} characters selected`:'Select text in Content'}</strong><span>{hasRichSelection?selectedText.slice(0,48):'Highlight part of the text above, then style only that range.'}</span></div><div className="card-segmented-control triple"><button disabled={!hasRichSelection} onClick={()=>applyRichStyle({fontWeight:700})}>Bold</button><button disabled={!hasRichSelection} onClick={()=>applyRichStyle({italic:true})}>Italic</button><button disabled={!hasRichSelection} onClick={()=>applyRichStyle({underline:true})}>Underline</button></div><div className="card-segmented-control"><button disabled={!hasRichSelection} onClick={()=>applyRichStyle({baselineShift:'SUPERSCRIPT'})}>Superscript</button><button disabled={!hasRichSelection} onClick={()=>applyRichStyle({baselineShift:'SUBSCRIPT'})}>Subscript</button><button disabled={!hasRichSelection} onClick={()=>applyRichStyle({baselineShift:'NORMAL'})}>Normal</button></div><div className="card-property-grid"><label>Selection Color<input type="color" disabled={!hasRichSelection} defaultValue="#7c3aed" onChange={e=>applyRichStyle({color:e.target.value})}/></label><label>Selection Size (pt)<input type="number" min="1" disabled={!hasRichSelection} placeholder={String(element.style.fontSizePt)} onChange={e=>{const value=Number(e.target.value);if(value>0)applyRichStyle({fontSizePt:value});}}/></label></div><label>Selection Font<select disabled={!hasRichSelection} defaultValue="" onChange={e=>{if(e.target.value){applyRichStyle({fontFamily:e.target.value});fontManager.markRecent(e.target.value)}}}><FontFamilyOptions currentFont={element.style.fontFamily} includeKeepCurrent/></select></label><div className="card-segmented-control"><button disabled={!hasRichSelection} onClick={()=>applyRichStyle({strikethrough:true})}>Strike</button><button disabled={!hasRichSelection} onClick={clearRichStyle}>Clear Selection Style</button></div><div className="card-property-note"><span>Rich style ranges</span><strong>{element.style.runs?.length??0}</strong></div></Section>
  <Section sectionKey="TYPOGRAPHY" title="Paragraph"><label>Horizontal Alignment<div className="card-segmented-control"><button className={paragraphAlignment==='LEFT'?'active':''} onClick={()=>style({alignment:'LEFT',paragraphAlignment:'LEFT'})}>Left</button><button className={paragraphAlignment==='CENTER'?'active':''} onClick={()=>style({alignment:'CENTER',paragraphAlignment:'CENTER'})}>Center</button><button className={paragraphAlignment==='RIGHT'?'active':''} onClick={()=>style({alignment:'RIGHT',paragraphAlignment:'RIGHT'})}>Right</button><button className={paragraphAlignment==='JUSTIFY'?'active':''} onClick={()=>style({paragraphAlignment:'JUSTIFY'})}>Justify</button></div></label><label>Vertical Alignment<div className="card-segmented-control triple"><button className={(element.style.verticalAlignment??'TOP')==='TOP'?'active':''} onClick={()=>style({verticalAlignment:'TOP'})}>Top</button><button className={element.style.verticalAlignment==='CENTER'?'active':''} onClick={()=>style({verticalAlignment:'CENTER'})}>Middle</button><button className={element.style.verticalAlignment==='BOTTOM'?'active':''} onClick={()=>style({verticalAlignment:'BOTTOM'})}>Bottom</button></div></label><label>Text box padding (mm)<input type="number" min="0" step=".5" value={element.style.paddingMm??0} onChange={e=>style({paddingMm:Math.max(0,Number(e.target.value)||0)})}/></label></Section>
  <Section sectionKey="TYPOGRAPHY" title="Advanced Text Layout"><label>Text Layout<select value={element.style.textPath?.mode??'BOX'} onChange={e=>style({textPath:{...(element.style.textPath??{startOffsetPct:50,reverse:false,side:'OUTSIDE'}),mode:e.target.value as NonNullable<TextDesignElement['style']['textPath']>['mode']}})}><option value="BOX">Normal Text Box</option><option value="ARC_UP">Arc Up</option><option value="ARC_DOWN">Arc Down</option><option value="CIRCLE">Circular Text</option><option value="PATH">Text on Path</option></select></label>{(element.style.textPath?.mode??'BOX')!=='BOX'&&<><label>Start Offset (%)<input type="range" min="0" max="100" step="1" value={element.style.textPath?.startOffsetPct??50} onChange={e=>style({textPath:{...(element.style.textPath??{mode:'ARC_UP'}),startOffsetPct:Number(e.target.value)}})}/></label><div className="card-segmented-control"><button className={element.style.textPath?.reverse?'active':''} onClick={()=>style({textPath:{...(element.style.textPath??{mode:'ARC_UP'}),reverse:!element.style.textPath?.reverse}})}>Reverse Direction</button></div>{element.style.textPath?.mode==='CIRCLE'&&<label>Circle Placement<div className="card-segmented-control"><button className={(element.style.textPath?.side??'OUTSIDE')==='OUTSIDE'?'active':''} onClick={()=>style({textPath:{...(element.style.textPath??{mode:'CIRCLE'}),side:'OUTSIDE'}})}>Outside</button><button className={element.style.textPath?.side==='INSIDE'?'active':''} onClick={()=>style({textPath:{...(element.style.textPath??{mode:'CIRCLE'}),side:'INSIDE'}})}>Inside</button></div></label>}{element.style.textPath?.mode==='PATH'&&<label>Source Path<select value={element.style.textPath?.pathElementId??''} onChange={e=>style({textPath:{...(element.style.textPath??{mode:'PATH'}),pathElementId:e.target.value||undefined}})}><option value="">Select PATH…</option>{artboard.elements.filter(item=>item.type==='PATH').map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label>}</>}<div className="card-property-details"><strong>Auto Fit</strong><label className="card-check-row"><input type="checkbox" checked={element.style.autoFit?.enabled??false} onChange={e=>style({autoFit:{enabled:e.target.checked,minFontSizePt:element.style.autoFit?.minFontSizePt??6}})}/>Shrink text to fit box</label><label>Minimum font size (pt)<input type="number" min="1" step="1" disabled={!(element.style.autoFit?.enabled??false)} value={element.style.autoFit?.minFontSizePt??6} onChange={e=>style({autoFit:{enabled:true,minFontSizePt:Math.max(1,Number(e.target.value)||1)}})}/></label></div><div className="card-property-details"><strong>Compatibility</strong><div className="card-property-note"><span>Canvas rendering</span><strong>Supported</strong></div><div className="card-property-note"><span>PNG / PDF / JPEG export</span><strong>Supported</strong></div><div className="card-property-note"><span>Gradient text fill</span><strong>Supported</strong></div><div className="card-property-note"><span>Text outline</span><strong>Supported</strong></div></div></Section>
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
  <Section sectionKey="TYPOGRAPHY" title="Fill & Outline"><label>Text Fill<select value={fill.type==='LINEAR_GRADIENT'?'LINEAR_GRADIENT':fill.type==='RADIAL_GRADIENT'?'RADIAL_GRADIENT':'SOLID'} onChange={e=>setFillType(e.target.value as 'SOLID'|'LINEAR_GRADIENT'|'RADIAL_GRADIENT')}><option value="SOLID">Solid</option><option value="LINEAR_GRADIENT">Linear Gradient</option><option value="RADIAL_GRADIENT">Radial Gradient</option></select></label>{fill.type==='SOLID'&&<label>Text color<div className="card-color-row"><input type="color" value={fill.color} onChange={e=>{style({color:e.target.value,fill:{...fill,color:e.target.value}})}}/><input value={fill.color} onChange={e=>style({color:e.target.value,fill:{...fill,color:e.target.value}})}/></div></label>}{(fill.type==='LINEAR_GRADIENT'||fill.type==='RADIAL_GRADIENT')&&<><div className="card-property-grid"><label>Start Color<input type="color" value={fill.gradient.stops[0]?.color??'#111827'} onChange={e=>setGradientStop(0,e.target.value)}/></label><label>End Color<input type="color" value={fill.gradient.stops[fill.gradient.stops.length-1]?.color??'#7c3aed'} onChange={e=>setGradientStop(fill.gradient.stops.length-1,e.target.value)}/></label></div>{fill.type==='LINEAR_GRADIENT'&&<label>Gradient Angle (°)<input type="number" value={fill.gradient.angleDeg} onChange={e=>style({fill:{type:'LINEAR_GRADIENT',gradient:{...fill.gradient,angleDeg:Number(e.target.value)||0}}})}/></label>}</>}<div className="card-property-details"><label className="card-check-row"><input type="checkbox" checked={textStroke.widthMm>0} onChange={e=>style({stroke:{...textStroke,widthMm:e.target.checked?Math.max(.25,textStroke.widthMm||.25):0}})}/>Text Outline</label>{textStroke.widthMm>0&&<><label>Outline color<input type="color" value={textStroke.color} onChange={e=>style({stroke:{...textStroke,color:e.target.value}})}/></label><label>Outline width (mm)<input type="number" min=".05" step=".05" value={textStroke.widthMm} onChange={e=>style({stroke:{...textStroke,widthMm:Math.max(.05,Number(e.target.value)||.05)}})}/></label></>}</div><OpacityControl value={element.opacity} onChange={opacity=>patch({opacity})}/></Section>
  <Section sectionKey="TYPOGRAPHY" title="Layer Effects Engine"><TextLayerEffectsControls effects={element.style.layerEffects} onChange={layerEffects=>style({layerEffects,materialPreset:'CUSTOM'})} onMigrate={()=>style({layerEffects:migrateLegacyTextEffects(element.style,prefix=>id(`text6a-${prefix}`)),materialPreset:'CUSTOM'})}/></Section><Section sectionKey="TYPOGRAPHY" title="Effects"><div className="card-property-details"><strong>Drop Shadow</strong><ShadowControls shadow={element.shadow} onChange={shadow=>patch({shadow})}/></div><div className="card-property-details"><label className="card-check-row"><input type="checkbox" checked={glow.enabled} onChange={e=>style({glow:{...glow,enabled:e.target.checked},materialPreset:'CUSTOM'})}/>Outer Glow</label>{glow.enabled&&<><label>Glow color<input type="color" value={glow.color} onChange={e=>style({glow:{...glow,color:e.target.value},materialPreset:'CUSTOM'})}/></label><div className="card-property-grid"><label>Blur (mm)<input type="number" min="0" step=".1" value={glow.blurMm} onChange={e=>style({glow:{...glow,blurMm:Math.max(0,Number(e.target.value)||0)},materialPreset:'CUSTOM'})}/></label><label>Opacity (%)<input type="number" min="0" max="100" value={Math.round(glow.opacity*100)} onChange={e=>style({glow:{...glow,opacity:clamp(Number(e.target.value)||0,0,100)/100},materialPreset:'CUSTOM'})}/></label></div></>}</div><div className="card-property-details"><label className="card-check-row"><input type="checkbox" checked={advancedEffects.bevel?.enabled??false} onChange={e=>style({advancedEffects:{...advancedEffects,bevel:{...(advancedEffects.bevel??{depthMm:.35,highlightColor:'#ffffff',shadowColor:'#111827',intensity:.65}),enabled:e.target.checked}},materialPreset:'CUSTOM'})}/>Bevel / Emboss</label>{advancedEffects.bevel?.enabled&&<><div className="card-property-grid"><label>Depth (mm)<input type="number" min=".05" step=".05" value={advancedEffects.bevel.depthMm} onChange={e=>style({advancedEffects:{...advancedEffects,bevel:{...advancedEffects.bevel!,depthMm:Math.max(.05,Number(e.target.value)||.05)}},materialPreset:'CUSTOM'})}/></label><label>Intensity (%)<input type="number" min="0" max="100" value={Math.round(advancedEffects.bevel.intensity*100)} onChange={e=>style({advancedEffects:{...advancedEffects,bevel:{...advancedEffects.bevel!,intensity:clamp(Number(e.target.value)||0,0,100)/100}},materialPreset:'CUSTOM'})}/></label></div><div className="card-property-grid"><label>Highlight<input type="color" value={advancedEffects.bevel.highlightColor} onChange={e=>style({advancedEffects:{...advancedEffects,bevel:{...advancedEffects.bevel!,highlightColor:e.target.value}},materialPreset:'CUSTOM'})}/></label><label>Shadow<input type="color" value={advancedEffects.bevel.shadowColor} onChange={e=>style({advancedEffects:{...advancedEffects,bevel:{...advancedEffects.bevel!,shadowColor:e.target.value}},materialPreset:'CUSTOM'})}/></label></div></>}</div><div className="card-property-details"><label className="card-check-row"><input type="checkbox" checked={advancedEffects.highlight?.enabled??false} onChange={e=>style({advancedEffects:{...advancedEffects,highlight:{...(advancedEffects.highlight??{color:'#ffffff',offsetYmm:-.25,blurMm:.25,opacity:.6}),enabled:e.target.checked}},materialPreset:'CUSTOM'})}/>Highlight / Shine</label>{advancedEffects.highlight?.enabled&&<><label>Highlight color<input type="color" value={advancedEffects.highlight.color} onChange={e=>style({advancedEffects:{...advancedEffects,highlight:{...advancedEffects.highlight!,color:e.target.value}},materialPreset:'CUSTOM'})}/></label><div className="card-property-grid"><label>Offset Y<input type="number" step=".05" value={advancedEffects.highlight.offsetYmm} onChange={e=>style({advancedEffects:{...advancedEffects,highlight:{...advancedEffects.highlight!,offsetYmm:Number(e.target.value)||0}},materialPreset:'CUSTOM'})}/></label><label>Blur<input type="number" min="0" step=".05" value={advancedEffects.highlight.blurMm} onChange={e=>style({advancedEffects:{...advancedEffects,highlight:{...advancedEffects.highlight!,blurMm:Math.max(0,Number(e.target.value)||0)}},materialPreset:'CUSTOM'})}/></label></div></>}</div><div className="card-property-details"><label className="card-check-row"><input type="checkbox" checked={advancedEffects.longShadow?.enabled??false} onChange={e=>style({advancedEffects:{...advancedEffects,longShadow:{...(advancedEffects.longShadow??{color:'#111827',distanceMm:2,angleDeg:45,opacity:.45}),enabled:e.target.checked}},materialPreset:'CUSTOM'})}/>Long Shadow</label>{advancedEffects.longShadow?.enabled&&<><label>Shadow color<input type="color" value={advancedEffects.longShadow.color} onChange={e=>style({advancedEffects:{...advancedEffects,longShadow:{...advancedEffects.longShadow!,color:e.target.value}},materialPreset:'CUSTOM'})}/></label><div className="card-property-grid"><label>Distance (mm)<input type="number" min="0" step=".1" value={advancedEffects.longShadow.distanceMm} onChange={e=>style({advancedEffects:{...advancedEffects,longShadow:{...advancedEffects.longShadow!,distanceMm:Math.max(0,Number(e.target.value)||0)}},materialPreset:'CUSTOM'})}/></label><label>Angle (°)<input type="number" value={advancedEffects.longShadow.angleDeg} onChange={e=>style({advancedEffects:{...advancedEffects,longShadow:{...advancedEffects.longShadow!,angleDeg:Number(e.target.value)||0}},materialPreset:'CUSTOM'})}/></label></div></>}</div></Section><Section sectionKey="TYPOGRAPHY" title="Layer Effects">
  <div className="card-property-details"><label className="card-check-row"><input type="checkbox" checked={advancedEffects.innerShadow?.enabled??false} onChange={e=>style({advancedEffects:{...advancedEffects,innerShadow:{...(advancedEffects.innerShadow??{color:'#111827',offsetXmm:.18,offsetYmm:.18,blurMm:.3,opacity:.45}),enabled:e.target.checked}},materialPreset:'CUSTOM'})}/>Inner Shadow</label>{advancedEffects.innerShadow?.enabled&&<><label>Color<input type="color" value={advancedEffects.innerShadow.color} onChange={e=>style({advancedEffects:{...advancedEffects,innerShadow:{...advancedEffects.innerShadow!,color:e.target.value}},materialPreset:'CUSTOM'})}/></label><div className="card-property-grid"><label>X (mm)<input type="number" step=".05" value={advancedEffects.innerShadow.offsetXmm} onChange={e=>style({advancedEffects:{...advancedEffects,innerShadow:{...advancedEffects.innerShadow!,offsetXmm:Number(e.target.value)||0}},materialPreset:'CUSTOM'})}/></label><label>Y (mm)<input type="number" step=".05" value={advancedEffects.innerShadow.offsetYmm} onChange={e=>style({advancedEffects:{...advancedEffects,innerShadow:{...advancedEffects.innerShadow!,offsetYmm:Number(e.target.value)||0}},materialPreset:'CUSTOM'})}/></label><label>Blur<input type="number" min="0" step=".05" value={advancedEffects.innerShadow.blurMm} onChange={e=>style({advancedEffects:{...advancedEffects,innerShadow:{...advancedEffects.innerShadow!,blurMm:Math.max(0,Number(e.target.value)||0)}},materialPreset:'CUSTOM'})}/></label><label>Opacity %<input type="number" min="0" max="100" value={Math.round(advancedEffects.innerShadow.opacity*100)} onChange={e=>style({advancedEffects:{...advancedEffects,innerShadow:{...advancedEffects.innerShadow!,opacity:clamp(Number(e.target.value)||0,0,100)/100}},materialPreset:'CUSTOM'})}/></label></div></>}</div>
  <div className="card-property-details"><label className="card-check-row"><input type="checkbox" checked={advancedEffects.innerGlow?.enabled??false} onChange={e=>style({advancedEffects:{...advancedEffects,innerGlow:{...(advancedEffects.innerGlow??{color:'#ffffff',blurMm:.7,opacity:.45}),enabled:e.target.checked}},materialPreset:'CUSTOM'})}/>Inner Glow</label>{advancedEffects.innerGlow?.enabled&&<><label>Color<input type="color" value={advancedEffects.innerGlow.color} onChange={e=>style({advancedEffects:{...advancedEffects,innerGlow:{...advancedEffects.innerGlow!,color:e.target.value}},materialPreset:'CUSTOM'})}/></label><div className="card-property-grid"><label>Blur<input type="number" min="0" step=".05" value={advancedEffects.innerGlow.blurMm} onChange={e=>style({advancedEffects:{...advancedEffects,innerGlow:{...advancedEffects.innerGlow!,blurMm:Math.max(0,Number(e.target.value)||0)}},materialPreset:'CUSTOM'})}/></label><label>Opacity %<input type="number" min="0" max="100" value={Math.round(advancedEffects.innerGlow.opacity*100)} onChange={e=>style({advancedEffects:{...advancedEffects,innerGlow:{...advancedEffects.innerGlow!,opacity:clamp(Number(e.target.value)||0,0,100)/100}},materialPreset:'CUSTOM'})}/></label></div></>}</div>
  <div className="card-property-details"><label className="card-check-row"><input type="checkbox" checked={advancedEffects.secondaryStroke?.enabled??false} onChange={e=>style({advancedEffects:{...advancedEffects,secondaryStroke:{...(advancedEffects.secondaryStroke??{color:'#ffffff',widthMm:.35,opacity:1}),enabled:e.target.checked}},materialPreset:'CUSTOM'})}/>Second Outline</label>{advancedEffects.secondaryStroke?.enabled&&<><label>Color<input type="color" value={advancedEffects.secondaryStroke.color} onChange={e=>style({advancedEffects:{...advancedEffects,secondaryStroke:{...advancedEffects.secondaryStroke!,color:e.target.value}},materialPreset:'CUSTOM'})}/></label><div className="card-property-grid"><label>Width (mm)<input type="number" min=".02" step=".05" value={advancedEffects.secondaryStroke.widthMm} onChange={e=>style({advancedEffects:{...advancedEffects,secondaryStroke:{...advancedEffects.secondaryStroke!,widthMm:Math.max(.02,Number(e.target.value)||.02)}},materialPreset:'CUSTOM'})}/></label><label>Opacity %<input type="number" min="0" max="100" value={Math.round(advancedEffects.secondaryStroke.opacity*100)} onChange={e=>style({advancedEffects:{...advancedEffects,secondaryStroke:{...advancedEffects.secondaryStroke!,opacity:clamp(Number(e.target.value)||0,0,100)/100}},materialPreset:'CUSTOM'})}/></label></div></>}</div>
  <div className="card-property-details"><label className="card-check-row"><input type="checkbox" checked={advancedEffects.reflection?.enabled??false} onChange={e=>style({advancedEffects:{...advancedEffects,reflection:{...(advancedEffects.reflection??{color:'#ffffff',offsetYmm:.35,blurMm:.35,opacity:.35}),enabled:e.target.checked}},materialPreset:'CUSTOM'})}/>Reflection / Gloss</label>{advancedEffects.reflection?.enabled&&<><label>Color<input type="color" value={advancedEffects.reflection.color} onChange={e=>style({advancedEffects:{...advancedEffects,reflection:{...advancedEffects.reflection!,color:e.target.value}},materialPreset:'CUSTOM'})}/></label><div className="card-property-grid"><label>Offset Y<input type="number" step=".05" value={advancedEffects.reflection.offsetYmm} onChange={e=>style({advancedEffects:{...advancedEffects,reflection:{...advancedEffects.reflection!,offsetYmm:Number(e.target.value)||0}},materialPreset:'CUSTOM'})}/></label><label>Blur<input type="number" min="0" step=".05" value={advancedEffects.reflection.blurMm} onChange={e=>style({advancedEffects:{...advancedEffects,reflection:{...advancedEffects.reflection!,blurMm:Math.max(0,Number(e.target.value)||0)}},materialPreset:'CUSTOM'})}/></label></div></>}</div>
  <div className="card-property-details"><label className="card-check-row"><input type="checkbox" checked={advancedEffects.grain?.enabled??false} onChange={e=>style({advancedEffects:{...advancedEffects,grain:{...(advancedEffects.grain??{color:'#111827',amount:35,opacity:.18}),enabled:e.target.checked}},materialPreset:'CUSTOM'})}/>Grain / Texture</label>{advancedEffects.grain?.enabled&&<><label>Grain Color<input type="color" value={advancedEffects.grain.color} onChange={e=>style({advancedEffects:{...advancedEffects,grain:{...advancedEffects.grain!,color:e.target.value}},materialPreset:'CUSTOM'})}/></label><div className="card-property-grid"><label>Amount<input type="number" min="0" max="100" value={advancedEffects.grain.amount} onChange={e=>style({advancedEffects:{...advancedEffects,grain:{...advancedEffects.grain!,amount:clamp(Number(e.target.value)||0,0,100)}},materialPreset:'CUSTOM'})}/></label><label>Opacity %<input type="number" min="0" max="100" value={Math.round(advancedEffects.grain.opacity*100)} onChange={e=>style({advancedEffects:{...advancedEffects,grain:{...advancedEffects.grain!,opacity:clamp(Number(e.target.value)||0,0,100)/100}},materialPreset:'CUSTOM'})}/></label></div></>}</div>
</Section><Section sectionKey="TYPOGRAPHY" title="Style Presets"><div className="card-text-style-presets"><button className={element.style.materialPreset==='GOLD'?'active':''} onClick={()=>applyMaterialPreset('GOLD')}>Gold</button><button className={element.style.materialPreset==='SILVER'?'active':''} onClick={()=>applyMaterialPreset('SILVER')}>Silver</button><button className={element.style.materialPreset==='CHROME'?'active':''} onClick={()=>applyMaterialPreset('CHROME')}>Chrome</button><button className={element.style.materialPreset==='NEON'?'active':''} onClick={()=>applyMaterialPreset('NEON')}>Neon</button><button className={element.style.materialPreset==='GLASS'?'active':''} onClick={()=>applyMaterialPreset('GLASS')}>Glass</button><button className={element.style.materialPreset==='VINTAGE'?'active':''} onClick={()=>applyMaterialPreset('VINTAGE')}>Vintage</button><button className={element.style.materialPreset==='ROSE_GOLD'?'active':''} onClick={()=>applyMaterialPreset('ROSE_GOLD')}>Rose Gold</button><button className={element.style.materialPreset==='BRONZE'?'active':''} onClick={()=>applyMaterialPreset('BRONZE')}>Bronze</button><button className={element.style.materialPreset==='COPPER'?'active':''} onClick={()=>applyMaterialPreset('COPPER')}>Copper</button><button className={element.style.materialPreset==='STEEL'?'active':''} onClick={()=>applyMaterialPreset('STEEL')}>Steel</button><button className={element.style.materialPreset==='HOLOGRAPHIC'?'active':''} onClick={()=>applyMaterialPreset('HOLOGRAPHIC')}>Holographic</button><button className={element.style.materialPreset==='GLITTER'?'active':''} onClick={()=>applyMaterialPreset('GLITTER')}>Glitter</button><button className={element.style.materialPreset==='FOIL'?'active':''} onClick={()=>applyMaterialPreset('FOIL')}>Foil</button><button className={element.style.materialPreset==='PLASTIC'?'active':''} onClick={()=>applyMaterialPreset('PLASTIC')}>Glossy Plastic</button><button className={element.style.materialPreset==='CANDY'?'active':''} onClick={()=>applyMaterialPreset('CANDY')}>Candy / Gel</button><button className={element.style.materialPreset==='FROSTED_GLASS'?'active':''} onClick={()=>applyMaterialPreset('FROSTED_GLASS')}>Frosted Glass</button><button className={element.style.materialPreset==='RETRO'?'active':''} onClick={()=>applyMaterialPreset('RETRO')}>Retro</button><button className={element.style.materialPreset==='COMIC'?'active':''} onClick={()=>applyMaterialPreset('COMIC')}>Comic</button><button className={element.style.materialPreset==='GRUNGE'?'active':''} onClick={()=>applyMaterialPreset('GRUNGE')}>Grunge</button><button className={element.style.materialPreset==='INK_STAMP'?'active':''} onClick={()=>applyMaterialPreset('INK_STAMP')}>Ink Stamp</button><button className={element.style.materialPreset==='EMBOSSED_PAPER'?'active':''} onClick={()=>applyMaterialPreset('EMBOSSED_PAPER')}>Embossed Paper</button><button className={element.style.materialPreset==='ENGRAVED'?'active':''} onClick={()=>applyMaterialPreset('ENGRAVED')}>Engraved</button><button className={element.style.materialPreset==='WOOD'?'active':''} onClick={()=>applyMaterialPreset('WOOD')}>Wood</button><button className={element.style.materialPreset==='STONE'?'active':''} onClick={()=>applyMaterialPreset('STONE')}>Stone</button><button className={element.style.materialPreset==='LEATHER'?'active':''} onClick={()=>applyMaterialPreset('LEATHER')}>Leather</button><button className={element.style.materialPreset==='GRADIENT_NEON'?'active':''} onClick={()=>applyMaterialPreset('GRADIENT_NEON')}>Gradient Neon</button><button className={element.style.materialPreset==='OUTLINE_NEON'?'active':''} onClick={()=>applyMaterialPreset('OUTLINE_NEON')}>Outline Neon</button></div><div className="card-property-note"><span>Preset remains editable. Changing effect controls marks it Custom.</span><strong>{element.style.materialPreset??'CUSTOM'}</strong></div></Section></>}
function defaultShapeLabel(): NonNullable<ShapeDesignElement['label']>{return{enabled:true,text:'Text',fontFamily:'Arial',fontSizePt:12,fontWeight:400,italic:false,underline:false,color:'#111827',alignment:'CENTER',verticalAlignment:'CENTER',paddingMm:2,lineHeight:1.2};}
function ShapeTextControls({label,onChange}:{label?:ShapeDesignElement['label'];onChange:(label:NonNullable<ShapeDesignElement['label']>|undefined)=>void}){
 const fontManager=useContext(FontManagerContext);
 const current=label??defaultShapeLabel(), patch=(p:Partial<NonNullable<ShapeDesignElement['label']>>)=>onChange({...current,...p});
 return <div className="card-property-details" data-shape-text-controls>
  <label className="card-check-row"><input type="checkbox" checked={label?.enabled??false} onChange={e=>onChange(e.target.checked?{...current,enabled:true}:undefined)}/>Enable text</label>
  {label?.enabled&&<>
   <label>Content<textarea value={current.text} onChange={e=>patch({text:e.target.value})}/></label>
   <div className="card-property-grid">
    <label>Font<select value={current.fontFamily} onChange={e=>{patch({fontFamily:e.target.value});fontManager.markRecent(e.target.value)}}><FontFamilyOptions currentFont={current.fontFamily}/></select></label>
    <label>Size (pt)<input type="number" min="1" value={current.fontSizePt} onChange={e=>patch({fontSizePt:Math.max(1,Number(e.target.value)||1)})}/></label>
    <label>Weight<select value={current.fontWeight} onChange={e=>patch({fontWeight:Number(e.target.value)})}>{FONT_WEIGHT_OPTIONS.map(item=><option key={item.value} value={item.value}>{item.label} ({item.value})</option>)}</select></label>
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
 const crop=normalizeImageFillTransform(fill?.transform);
 const imageAssets=assets.filter(asset=>asset.kind==='IMAGE'||asset.kind==='LOGO'||asset.mimeType?.startsWith('image/'));
 const sourceBinding=getFillImageSourceBinding(element);
 const imageSourceFields=availableFields.filter(field=>field.type==='string');
 const isBound=!!sourceBinding;
 const isMissingField=isBound&&sourceBinding.sourceType==='FIELD'&&!availableFields.some(field=>field.name===sourceBinding.fieldPath);
 const setFill=(next:NonNullable<typeof fill>)=>mutate(t=>updateDesignElement(t,artboardId,element.id,e=>(e.type==='SHAPE'||e.type==='PATH')?{...e,fill:next}:e));
 const setCrop=(patch:Partial<typeof crop>)=>fill&&setFill({...fill,transform:{...crop,...patch}});
 const updateBinding=(fieldPath:string)=>mutate(t=>updateDesignElement(t,artboardId,element.id,e=>{if(e.type!=='SHAPE'&&e.type!=='PATH')return e;return fieldPath==='__NONE__'?removeFillImageSourceBinding(e):setFillImageSourceFieldBinding(e,fieldPath);}));
 const upload=async(file?:File)=>{if(!file)return;if(!file.type.startsWith('image/'))return;const source=await readAsDataUrl(file);const dimensions=await readImageDimensions(source);const assetId=id('asset-shape-fill');mutate(t=>{const next=addAssetReference(t,{id:assetId,name:file.name,kind:'IMAGE',sourceType:'DATA_URL',source,mimeType:file.type,widthPx:dimensions.widthPx,heightPx:dimensions.heightPx,metadata:{originalFileName:file.name,userUploaded:true}});return updateDesignElement(next,artboardId,element.id,e=>(e.type==='SHAPE'||e.type==='PATH')?{...e,fill:{type:'IMAGE',assetId,fit:'FILL',opacity:1}}:e);});};
 const selectedAsset=fill?assets.find(asset=>asset.id===fill.assetId):undefined;
 const fillOriginalAssetId=typeof selectedAsset?.metadata?.backgroundRemovalOriginalAssetId==='string'?selectedAsset.metadata.backgroundRemovalOriginalAssetId:null;
 const [fillBgTolerance,setFillBgTolerance]=useState(28);
 const [fillBgSoftness,setFillBgSoftness]=useState(55);
 const [fillBgFeather,setFillBgFeather]=useState(12);
 const [fillBgFringe,setFillBgFringe]=useState(45);
 const [fillBgPreview,setFillBgPreview]=useState<string|null>(null);
 const [fillBgBusy,setFillBgBusy]=useState(false);
 const [fillBgMessage,setFillBgMessage]=useState('');
 const canRemoveFillBackground=!!selectedAsset?.source&&!isBound&&selectedAsset.kind!=='SVG';
 const dynamicFillBgConfig=element.metadata?.[DYNAMIC_FILL_BG_REMOVAL_METADATA_KEY] as {enabled?:boolean;settings?:unknown}|undefined;
 const dynamicFillBgEnabled=dynamicFillBgConfig?.enabled===true;
 const saveDynamicFillBackground=()=>{const settings={mode:'AUTO' as const,tolerance:fillBgTolerance,edgeSoftness:fillBgSoftness,feather:fillBgFeather,fringeCleanup:fillBgFringe,noiseCleanup:10};mutate(t=>updateDesignElement(t,artboardId,element.id,e=>(e.type==='SHAPE'||e.type==='PATH')?{...e,metadata:{...(e.metadata??{}),[DYNAMIC_FILL_BG_REMOVAL_METADATA_KEY]:{enabled:true,settings}}}:e));setFillBgMessage('Per-record dynamic fill background removal enabled with current settings.');};
 const disableDynamicFillBackground=()=>{mutate(t=>updateDesignElement(t,artboardId,element.id,e=>{if(e.type!=='SHAPE'&&e.type!=='PATH')return e;const metadata={...(e.metadata??{})};delete metadata[DYNAMIC_FILL_BG_REMOVAL_METADATA_KEY];return {...e,metadata};}));setFillBgMessage('Per-record dynamic fill background removal disabled.');};
 useEffect(()=>{setFillBgPreview(null);setFillBgMessage('');},[fill?.assetId]);
 const previewFillBackgroundRemoval=async()=>{
   if(!selectedAsset?.source||!canRemoveFillBackground)return;
   setFillBgBusy(true);setFillBgMessage('');
   try{
     const result=await processImageBackground(selectedAsset.source,{mode:'AUTO',tolerance:fillBgTolerance,edgeSoftness:fillBgSoftness,feather:fillBgFeather,fringeCleanup:fillBgFringe,noiseCleanup:10});
     setFillBgPreview(result.dataUrl);
     setFillBgMessage('Transparent fill preview ready.');
   }catch(error){setFillBgMessage(error instanceof Error?error.message:'Image-fill background removal failed.');}
   finally{setFillBgBusy(false);}
 };
 const applyFillBackgroundRemoval=()=>{
   if(!selectedAsset||!fillBgPreview)return;
   const derived=createBackgroundRemovedAsset(selectedAsset,fillBgPreview,{mode:'AUTO',tolerance:fillBgTolerance,edgeSoftness:fillBgSoftness,feather:fillBgFeather,fringeCleanup:fillBgFringe,noiseCleanup:10},id('asset-bg-fill'));
   mutate(t=>applyBackgroundRemovedAssetToImageFill(t,artboardId,element.id,derived));
   setFillBgMessage('Transparent derived image applied to shape fill.');
 };
 const resetFillBackgroundRemoval=()=>{
   if(!fillOriginalAssetId)return;
   mutate(t=>resetImageFillBackgroundRemoval(t,artboardId,element.id));
   setFillBgMessage('Original fill image restored.');
 };
 return <div className="card-property-details" data-shape-image-fill-controls data-phase82-image-crop-controls>
  <label>Image<select value={fill?.assetId??''} onChange={e=>e.target.value&&setFill({type:'IMAGE',assetId:e.target.value,fit:fill?.fit??'FILL',opacity:fill?.opacity??1,transform:fill?.transform})}><option value="">Select image…</option>{imageAssets.map(asset=><option key={asset.id} value={asset.id}>{asset.name}</option>)}</select></label>
  <label className="secondary">Upload image<input aria-label="Upload shape fill image" type="file" accept="image/*" onChange={e=>{void upload(e.target.files?.[0]);e.currentTarget.value='';}}/></label>
  <label>Dynamic image field
   {imageSourceFields.length===0?<div style={{fontSize:'11px',color:'var(--text-secondary)',marginTop:'4px'}}>{availableFields.length===0?datasourceStatus:'No string/image source fields available.'}</div>:<SearchableFieldPicker availableFields={imageSourceFields} currentFieldPath={sourceBinding?.fieldPath??'__NONE__'} onSelectField={updateBinding}/>} 
  </label>
  {isBound&&<div style={{fontSize:'11px',color:'var(--text-secondary)'}}>Fallback: selected image asset</div>}
  {isMissingField&&<div style={{color:'red',fontSize:'11px'}}>⚠ {sourceBinding.fieldPath} Not available in current datasource</div>}
  {isBound&&<button className="secondary" onClick={()=>updateBinding('__NONE__')}>Remove Image Binding</button>}
  {fill&&<>
   <label>Fit<select value={fill.fit} onChange={e=>setFill({...fill,fit:e.target.value as typeof fill.fit})}><option value="FIT">Fit</option><option value="FILL">Fill / Crop</option><option value="STRETCH">Stretch</option></select></label>
   <label>Image opacity<input type="range" min="0" max="1" step="0.05" value={fill.opacity??1} onChange={e=>setFill({...fill,opacity:Number(e.target.value)})}/></label>
   <div className="card-property-grid"><label>Zoom (%)<input type="number" min="10" max="1000" step="5" value={Math.round(crop.scale*100)} onChange={e=>setCrop({scale:clamp(Number(e.target.value)||100,10,1000)/100})}/></label><label>Rotation (°)<input type="number" min="-360" max="360" step="1" value={Math.round(crop.rotationDeg)} onChange={e=>setCrop({rotationDeg:Number(e.target.value)||0})}/></label></div>
   <div className="card-property-grid"><label>Offset X (%)<input type="number" min="-200" max="200" step="1" value={Math.round(crop.offsetX)} onChange={e=>setCrop({offsetX:clamp(Number(e.target.value)||0,-200,200)})}/></label><label>Offset Y (%)<input type="number" min="-200" max="200" step="1" value={Math.round(crop.offsetY)} onChange={e=>setCrop({offsetY:clamp(Number(e.target.value)||0,-200,200)})}/></label></div>
   <button className="secondary" onClick={()=>setFill({...fill,transform:undefined})}>Reset Crop</button>
   <div className="card-property-note"><strong>Fill Background Removal</strong><span>Uses the same non-destructive IMG3 pipeline for static SHAPE/PATH image fills.</span></div>
   {isBound&&<div className="card-property-note"><strong>Dynamic fill</strong><span>Enable per-record removal to process each resolved Base64/data-URL image during preview and export using the current refinement settings.</span></div>}
   {isBound&&<div className="card-segmented-control"><button className={dynamicFillBgEnabled?'active':''} onClick={saveDynamicFillBackground}>{dynamicFillBgEnabled?'Update Per-Record Settings':'Enable Per-Record Removal'}</button><button disabled={!dynamicFillBgEnabled} onClick={disableDynamicFillBackground}>Disable</button></div>}
   <label>Tolerance <span>{fillBgTolerance}</span><input type="range" min="0" max="100" value={fillBgTolerance} onChange={e=>setFillBgTolerance(Number(e.target.value))}/></label>
   <label>Edge Softness <span>{fillBgSoftness}</span><input type="range" min="0" max="100" value={fillBgSoftness} onChange={e=>setFillBgSoftness(Number(e.target.value))}/></label>
   <label>Feather <span>{fillBgFeather}</span><input type="range" min="0" max="100" value={fillBgFeather} onChange={e=>setFillBgFeather(Number(e.target.value))}/></label>
   <label>Fringe Cleanup <span>{fillBgFringe}</span><input type="range" min="0" max="100" value={fillBgFringe} onChange={e=>setFillBgFringe(Number(e.target.value))}/></label>
   <div className="card-segmented-control"><button disabled={!canRemoveFillBackground||fillBgBusy} onClick={()=>void previewFillBackgroundRemoval()}>{fillBgBusy?'Processing…':'Preview Fill Removal'}</button><button className="primary" disabled={!fillBgPreview||fillBgBusy} onClick={applyFillBackgroundRemoval}>Apply as Copy</button><button disabled={!fillOriginalAssetId} onClick={resetFillBackgroundRemoval}>Reset Original</button></div>
   {fillBgPreview&&<div className="card-bg-removal-preview"><img src={fillBgPreview} alt="Shape fill background removal preview" draggable={false}/></div>}
   {fillBgMessage&&<div className="card-asset-library-status" aria-live="polite">{fillBgMessage}</div>}
  </>}
 </div>;
}
function GradientStopsEditor({stops,onChange}:{stops:Extract<DesignFill,{type:'LINEAR_GRADIENT'}>['gradient']['stops'];onChange:(stops:Extract<DesignFill,{type:'LINEAR_GRADIENT'}>['gradient']['stops'])=>void}){
 const setStop=(index:number,patch:Partial<(typeof stops)[number]>)=>onChange(stops.map((stop,i)=>i===index?{...stop,...patch}:stop));
 return <div className="card-gradient-editor" data-phase82-gradient-stops>{stops.map((stop,index)=><div className="card-gradient-stop" key={index}><input type="color" value={stop.color} onChange={e=>setStop(index,{color:e.target.value})}/><input aria-label="Stop position" type="number" min="0" max="100" value={stop.offset} onChange={e=>setStop(index,{offset:clamp(Number(e.target.value)||0,0,100)})}/><input aria-label="Stop opacity" title="Stop opacity %" type="number" min="0" max="100" value={Math.round((stop.opacity??1)*100)} onChange={e=>setStop(index,{opacity:clamp(Number(e.target.value)||0,0,100)/100})}/><button disabled={index===0} onClick={()=>onChange(moveItem(stops,index,index-1))}>↑</button><button disabled={index===stops.length-1} onClick={()=>onChange(moveItem(stops,index,index+1))}>↓</button><button disabled={stops.length<=2} onClick={()=>onChange(stops.filter((_,i)=>i!==index))}>×</button></div>)}<button onClick={()=>onChange([...stops,{offset:100,color:'#ffffff',opacity:1}])}>Add Stop</button></div>;
}
function VectorFillControls({element,fill,onChange,assets,mutate,artboardId,availableFields,datasourceStatus}:{element:ShapeDesignElement|PathDesignElement;fill:DesignFill;onChange:(fill:DesignFill)=>void;assets:DesignTemplate['sharedAssets'];mutate:(f:(t:DesignTemplate)=>DesignTemplate)=>void;artboardId:string;availableFields:import('@document-tool/contracts').FieldDefinition[];datasourceStatus:string}){
 const solid=fill.type==='SOLID'?fill:{type:'SOLID' as const,color:'#dbeafe',opacity:1};
 const linear=fill.type==='LINEAR_GRADIENT'?fill.gradient:{type:'LINEAR' as const,angleDeg:0,stops:[{offset:0,color:'#2563eb',opacity:1},{offset:100,color:'#dbeafe',opacity:1}]};
 const radial=fill.type==='RADIAL_GRADIENT'?fill.gradient:DEFAULT_RADIAL_GRADIENT;
 const pattern=fill.type==='PATTERN'?fill.pattern:DEFAULT_PATTERN_FILL;
 const selectFill=(value:string)=>{
   if(value==='NONE')onChange({type:'NONE'});
   else if(value==='SOLID')onChange(solid);
   else if(value==='LINEAR_GRADIENT')onChange({type:'LINEAR_GRADIENT',gradient:linear});
   else if(value==='RADIAL_GRADIENT')onChange({type:'RADIAL_GRADIENT',gradient:{...radial,stops:radial.stops.map(stop=>({...stop}))}});
   else if(value==='PATTERN')onChange({type:'PATTERN',pattern:{...pattern}});
   else if(value==='IMAGE')onChange(fill.type==='IMAGE'?fill:{type:'IMAGE',assetId:'',fit:'FILL',opacity:1});
 };
 return <div className="card-property-details" data-phase82-fill-controls>
  <label>Fill<select value={fill.type} onChange={e=>selectFill(e.target.value)}><option value="SOLID">Solid</option><option value="NONE">Transparent</option><option value="LINEAR_GRADIENT">Linear Gradient</option><option value="RADIAL_GRADIENT">Radial Gradient</option><option value="PATTERN">Pattern</option><option value="IMAGE">Image</option></select></label>
  {fill.type==='SOLID'&&<><label>Fill color<div className="card-color-row"><input type="color" value={fill.color} onChange={e=>onChange({...fill,color:e.target.value})}/><input value={fill.color} readOnly/></div></label><label>Fill opacity (%)<input type="number" min="0" max="100" value={Math.round((fill.opacity??1)*100)} onChange={e=>onChange({...fill,opacity:clamp(Number(e.target.value)||0,0,100)/100})}/></label></>}
  {fill.type==='LINEAR_GRADIENT'&&<><label>Angle (°)<input type="number" min="0" max="360" value={fill.gradient.angleDeg} onChange={e=>onChange({type:'LINEAR_GRADIENT',gradient:{...fill.gradient,angleDeg:clamp(Number(e.target.value)||0,0,360)}})}/></label><GradientStopsEditor stops={fill.gradient.stops} onChange={stops=>onChange({type:'LINEAR_GRADIENT',gradient:{...fill.gradient,stops}})}/></>}
  {fill.type==='RADIAL_GRADIENT'&&<><div className="card-property-grid"><label>Center X (%)<input type="number" min="0" max="100" value={fill.gradient.centerX} onChange={e=>onChange({type:'RADIAL_GRADIENT',gradient:{...fill.gradient,centerX:clamp(Number(e.target.value)||0,0,100)}})}/></label><label>Center Y (%)<input type="number" min="0" max="100" value={fill.gradient.centerY} onChange={e=>onChange({type:'RADIAL_GRADIENT',gradient:{...fill.gradient,centerY:clamp(Number(e.target.value)||0,0,100)}})}/></label><label>Radius (%)<input type="number" min="1" max="200" value={fill.gradient.radius} onChange={e=>onChange({type:'RADIAL_GRADIENT',gradient:{...fill.gradient,radius:clamp(Number(e.target.value)||1,1,200)}})}/></label></div><GradientStopsEditor stops={fill.gradient.stops} onChange={stops=>onChange({type:'RADIAL_GRADIENT',gradient:{...fill.gradient,stops}})}/></>}
  {fill.type==='PATTERN'&&<><label>Pattern<select value={fill.pattern.kind} onChange={e=>onChange({type:'PATTERN',pattern:{...fill.pattern,kind:e.target.value as typeof fill.pattern.kind}})}><option value="HATCH">Hatch</option><option value="DOT">Dots</option><option value="CHECKER">Checker</option></select></label><div className="card-property-grid"><label>Foreground<input type="color" value={fill.pattern.foreground} onChange={e=>onChange({type:'PATTERN',pattern:{...fill.pattern,foreground:e.target.value}})}/></label><label>Background<input type="color" value={fill.pattern.background} onChange={e=>onChange({type:'PATTERN',pattern:{...fill.pattern,background:e.target.value}})}/></label><label>Scale<input type="number" min="0.25" max="8" step=".25" value={fill.pattern.scale} onChange={e=>onChange({type:'PATTERN',pattern:{...fill.pattern,scale:clamp(Number(e.target.value)||1,.25,8)}})}/></label><label>Rotation (°)<input type="number" min="0" max="360" value={fill.pattern.rotationDeg} onChange={e=>onChange({type:'PATTERN',pattern:{...fill.pattern,rotationDeg:clamp(Number(e.target.value)||0,0,360)}})}/></label></div><label>Pattern opacity (%)<input type="number" min="0" max="100" value={Math.round((fill.pattern.opacity??1)*100)} onChange={e=>onChange({type:'PATTERN',pattern:{...fill.pattern,opacity:clamp(Number(e.target.value)||0,0,100)/100}})}/></label></>}
  {fill.type==='IMAGE'&&<ShapeImageFillControls element={element} assets={assets} mutate={mutate} artboardId={artboardId} availableFields={availableFields} datasourceStatus={datasourceStatus}/>} 
 </div>;
}

function ArtboardBackgroundControls({artboard,template,mutate,availableFields,datasourceStatus}:{artboard:Artboard;template:DesignTemplate;mutate:(f:(t:DesignTemplate)=>DesignTemplate)=>void;availableFields:import('@document-tool/contracts').FieldDefinition[];datasourceStatus:string}){
 const fill=artboard.background;
 const assets=template.sharedAssets;
 const imageAssets=assets.filter(asset=>asset.kind==='IMAGE'||asset.kind==='LOGO'||asset.mimeType?.startsWith('image/'));
 const binding=getArtboardBackgroundImageSourceBinding(artboard);
 const imageFields=availableFields.filter(field=>field.type==='string');
 const setFill=(next:DesignFill)=>mutate(t=>setArtboardBackground(t,artboard.id,next));
 const solid=fill.type==='SOLID'?fill:{type:'SOLID' as const,color:'#ffffff',opacity:1};
 const linear=fill.type==='LINEAR_GRADIENT'?fill.gradient:{type:'LINEAR' as const,angleDeg:0,stops:[{offset:0,color:'#2563eb',opacity:1},{offset:100,color:'#ffffff',opacity:1}]};
 const radial=fill.type==='RADIAL_GRADIENT'?fill.gradient:DEFAULT_RADIAL_GRADIENT;
 const pattern=fill.type==='PATTERN'?fill.pattern:DEFAULT_PATTERN_FILL;
 const selectType=(value:string)=>{if(value==='NONE')setFill({type:'NONE'});else if(value==='SOLID')setFill(solid);else if(value==='LINEAR_GRADIENT')setFill({type:'LINEAR_GRADIENT',gradient:linear});else if(value==='RADIAL_GRADIENT')setFill({type:'RADIAL_GRADIENT',gradient:{...radial,stops:radial.stops.map(stop=>({...stop}))}});else if(value==='PATTERN')setFill({type:'PATTERN',pattern:{...pattern}});else if(value==='IMAGE')setFill(fill.type==='IMAGE'?fill:{type:'IMAGE',assetId:imageAssets[0]?.id??'',fit:'FILL',opacity:1});};
 const upload=async(file?:File)=>{if(!file||!file.type.startsWith('image/'))return;const source=await readAsDataUrl(file);const dimensions=await readImageDimensions(source);const assetId=id('asset-artboard-bg');mutate(t=>{const next=addAssetReference(t,{id:assetId,name:file.name,kind:'IMAGE',sourceType:'DATA_URL',source,mimeType:file.type,widthPx:dimensions.widthPx,heightPx:dimensions.heightPx,metadata:{originalFileName:file.name,userUploaded:true}});return setArtboardBackground(next,artboard.id,{type:'IMAGE',assetId,fit:'FILL',opacity:1});});};
 const updateBinding=(fieldPath:string)=>mutate(t=>({...t,artboards:t.artboards.map(a=>a.id!==artboard.id?a:fieldPath==='__NONE__'?removeArtboardBackgroundImageSourceBinding(a):setArtboardBackgroundImageSourceFieldBinding(a,fieldPath))}));
 const crop=fill.type==='IMAGE'?normalizeImageFillTransform(fill.transform):normalizeImageFillTransform(undefined);
 return <div className="card-property-details" data-phase86-artboard-background-controls>
  <label>Background fill<select value={fill.type} onChange={e=>selectType(e.target.value)}><option value="SOLID">Solid</option><option value="NONE">Transparent</option><option value="LINEAR_GRADIENT">Linear Gradient</option><option value="RADIAL_GRADIENT">Radial Gradient</option><option value="PATTERN">Pattern</option><option value="IMAGE">Image</option></select></label>
  {fill.type==='SOLID'&&<><label>Color<div className="card-color-row"><input type="color" value={fill.color} onChange={e=>setFill({...fill,color:e.target.value})}/><input value={fill.color} readOnly/></div></label><label>Opacity (%)<input type="number" min="0" max="100" value={Math.round((fill.opacity??1)*100)} onChange={e=>setFill({...fill,opacity:clamp(Number(e.target.value)||0,0,100)/100})}/></label></>}
  {fill.type==='LINEAR_GRADIENT'&&<><label>Angle (°)<input type="number" min="0" max="360" value={fill.gradient.angleDeg} onChange={e=>setFill({type:'LINEAR_GRADIENT',gradient:{...fill.gradient,angleDeg:clamp(Number(e.target.value)||0,0,360)}})}/></label><GradientStopsEditor stops={fill.gradient.stops} onChange={stops=>setFill({type:'LINEAR_GRADIENT',gradient:{...fill.gradient,stops}})}/></>}
  {fill.type==='RADIAL_GRADIENT'&&<><div className="card-property-grid"><label>Center X (%)<input type="number" min="0" max="100" value={fill.gradient.centerX} onChange={e=>setFill({type:'RADIAL_GRADIENT',gradient:{...fill.gradient,centerX:clamp(Number(e.target.value)||0,0,100)}})}/></label><label>Center Y (%)<input type="number" min="0" max="100" value={fill.gradient.centerY} onChange={e=>setFill({type:'RADIAL_GRADIENT',gradient:{...fill.gradient,centerY:clamp(Number(e.target.value)||0,0,100)}})}/></label><label>Radius (%)<input type="number" min="1" max="200" value={fill.gradient.radius} onChange={e=>setFill({type:'RADIAL_GRADIENT',gradient:{...fill.gradient,radius:clamp(Number(e.target.value)||1,1,200)}})}/></label></div><GradientStopsEditor stops={fill.gradient.stops} onChange={stops=>setFill({type:'RADIAL_GRADIENT',gradient:{...fill.gradient,stops}})}/></>}
  {fill.type==='PATTERN'&&<><label>Pattern<select value={fill.pattern.kind} onChange={e=>setFill({type:'PATTERN',pattern:{...fill.pattern,kind:e.target.value as typeof fill.pattern.kind}})}><option value="HATCH">Hatch</option><option value="DOT">Dots</option><option value="CHECKER">Checker</option></select></label><div className="card-property-grid"><label>Foreground<input type="color" value={fill.pattern.foreground} onChange={e=>setFill({type:'PATTERN',pattern:{...fill.pattern,foreground:e.target.value}})}/></label><label>Background<input type="color" value={fill.pattern.background} onChange={e=>setFill({type:'PATTERN',pattern:{...fill.pattern,background:e.target.value}})}/></label><label>Scale<input type="number" min="0.25" max="8" step=".25" value={fill.pattern.scale} onChange={e=>setFill({type:'PATTERN',pattern:{...fill.pattern,scale:clamp(Number(e.target.value)||1,.25,8)}})}/></label><label>Rotation (°)<input type="number" min="0" max="360" value={fill.pattern.rotationDeg} onChange={e=>setFill({type:'PATTERN',pattern:{...fill.pattern,rotationDeg:clamp(Number(e.target.value)||0,0,360)}})}/></label></div><label>Pattern opacity (%)<input type="number" min="0" max="100" value={Math.round((fill.pattern.opacity??1)*100)} onChange={e=>setFill({type:'PATTERN',pattern:{...fill.pattern,opacity:clamp(Number(e.target.value)||0,0,100)/100}})}/></label></>}
  {fill.type==='IMAGE'&&<><label>Image<select value={fill.assetId} onChange={e=>setFill({...fill,assetId:e.target.value})}><option value="">Select image…</option>{imageAssets.map(asset=><option key={asset.id} value={asset.id}>{asset.name}</option>)}</select></label><label className="secondary">Upload background image<input aria-label="Upload artboard background image" type="file" accept="image/*" onChange={e=>{void upload(e.target.files?.[0]);e.currentTarget.value='';}}/></label><label>Dynamic image field{imageFields.length===0?<div style={{fontSize:'11px',color:'var(--text-secondary)',marginTop:4}}>{availableFields.length===0?datasourceStatus:'No string/image source fields available.'}</div>:<SearchableFieldPicker availableFields={imageFields} currentFieldPath={binding?.fieldPath??'__NONE__'} onSelectField={updateBinding}/>}</label>{binding&&<button className="secondary" onClick={()=>updateBinding('__NONE__')}>Remove Image Binding</button>}<label>Fit<select value={fill.fit} onChange={e=>setFill({...fill,fit:e.target.value as typeof fill.fit})}><option value="FIT">Fit</option><option value="FILL">Fill / Crop</option><option value="STRETCH">Stretch</option></select></label><label>Image opacity<input type="range" min="0" max="1" step="0.05" value={fill.opacity??1} onChange={e=>setFill({...fill,opacity:Number(e.target.value)})}/></label><div className="card-property-grid"><label>Zoom (%)<input type="number" min="10" max="1000" step="5" value={Math.round(crop.scale*100)} onChange={e=>setFill({...fill,transform:{...crop,scale:clamp(Number(e.target.value)||100,10,1000)/100}})}/></label><label>Rotation (°)<input type="number" min="-360" max="360" value={crop.rotationDeg} onChange={e=>setFill({...fill,transform:{...crop,rotationDeg:Number(e.target.value)||0}})}/></label></div><div className="card-property-grid"><label>Offset X (%)<input type="number" min="-200" max="200" value={crop.offsetX} onChange={e=>setFill({...fill,transform:{...crop,offsetX:clamp(Number(e.target.value)||0,-200,200)}})}/></label><label>Offset Y (%)<input type="number" min="-200" max="200" value={crop.offsetY} onChange={e=>setFill({...fill,transform:{...crop,offsetY:clamp(Number(e.target.value)||0,-200,200)}})}/></label></div><button className="secondary" onClick={()=>setFill({...fill,transform:undefined})}>Reset Crop</button></>}
 </div>;
}

function AdvancedShapeProperties({element,update,assets,mutate,artboardId,availableFields,datasourceStatus}:{element:ShapeDesignElement;update:(f:(e:DesignElement)=>DesignElement)=>void;assets:DesignTemplate['sharedAssets'];mutate:(f:(t:DesignTemplate)=>DesignTemplate)=>void;artboardId:string;availableFields:import('@document-tool/contracts').FieldDefinition[];datasourceStatus:string}){
 const patch=(p:Partial<ShapeDesignElement>)=>update(e=>e.type==='SHAPE'?{...e,...p}:e);
 return <><Section sectionKey="APPEARANCE" title="Appearance"><label>Shape Kind<input type="text" value={shapeLabel(element.shape)} readOnly disabled/></label><VectorFillControls element={element} fill={element.fill} onChange={fill=>patch({fill})} assets={assets} mutate={mutate} artboardId={artboardId} availableFields={availableFields} datasourceStatus={datasourceStatus}/><OpacityControl value={element.opacity} onChange={opacity=>patch({opacity})}/></Section><Section sectionKey="APPEARANCE" title="Shape Text"><ShapeTextControls label={element.label} onChange={label=>patch({label})}/></Section><Section sectionKey="APPEARANCE" title="Stroke"><StrokeControls stroke={element.stroke} onChange={stroke=>patch({stroke})}/></Section><Section sectionKey="ADVANCED" title="Shadow"><ShadowControls shadow={element.shadow} onChange={shadow=>patch({shadow})}/></Section></>;
}
function AdvancedPathProperties({element,update,assets,mutate,artboardId,availableFields,datasourceStatus}:{element:PathDesignElement;update:(f:(e:DesignElement)=>DesignElement)=>void;assets:DesignTemplate['sharedAssets'];mutate:(f:(t:DesignTemplate)=>DesignTemplate)=>void;artboardId:string;availableFields:import('@document-tool/contracts').FieldDefinition[];datasourceStatus:string}){
 const patch=(p:Partial<PathDesignElement>)=>update(e=>e.type==='PATH'?{...e,...p}:e);
 return <><Section sectionKey="APPEARANCE" title="Appearance"><label>Shape Kind<input type="text" value={element.name} readOnly disabled/></label><VectorFillControls element={element} fill={element.fill} onChange={fill=>patch({fill})} assets={assets} mutate={mutate} artboardId={artboardId} availableFields={availableFields} datasourceStatus={datasourceStatus}/><OpacityControl value={element.opacity} onChange={opacity=>patch({opacity})}/></Section><Section sectionKey="APPEARANCE" title="Shape Text"><ShapeTextControls label={element.label} onChange={label=>patch({label})}/></Section><Section sectionKey="APPEARANCE" title="Stroke"><StrokeControls stroke={element.stroke} onChange={stroke=>patch({stroke})}/></Section><Section sectionKey="ADVANCED" title="Shadow"><ShadowControls shadow={element.shadow} onChange={shadow=>patch({shadow})}/></Section></>;
}
function AdvancedImageProperties({element,asset,update,mutate,artboardId,availableFields,datasourceStatus}:{element:ImageDesignElement;asset?:AssetReference;update:(f:(e:DesignElement)=>DesignElement)=>void;mutate:(f:(t:DesignTemplate)=>DesignTemplate)=>void;artboardId:string;availableFields:import('@document-tool/contracts').FieldDefinition[];datasourceStatus:string}){
  const patch=(p:Partial<ImageDesignElement>)=>update(e=>e.type==='IMAGE'?{...e,...p}:e);
  const sourceBinding=getSourceBinding(element);
  const isBound=!!sourceBinding;
  const isMissingField=isBound&&sourceBinding.sourceType==='FIELD'&&!availableFields.some(f=>f.name===sourceBinding.fieldPath);
  const [bgMode,setBgMode]=useState<'AUTO'|'COLOR'>('AUTO');
  const [bgTolerance,setBgTolerance]=useState(28);
  const [bgColor,setBgColor]=useState('#ffffff');
  const [bgEdgeSoftness,setBgEdgeSoftness]=useState(0);
  const [bgFeather,setBgFeather]=useState(0);
  const [bgFringeCleanup,setBgFringeCleanup]=useState(0);
  const [bgNoiseCleanup,setBgNoiseCleanup]=useState(0);
  const [bgBrushMode,setBgBrushMode]=useState<'NONE'|'ERASE'|'RESTORE'>('NONE');
  const [bgBrushSize,setBgBrushSize]=useState(24);
  const [bgBrushSoftness,setBgBrushSoftness]=useState(65);
  const [bgBrushEdits,setBgBrushEdits]=useState<BackgroundRemovalBrushEdit[]>([]);
  const [bgPreview,setBgPreview]=useState<string|null>(null);
  const [bgPreviewEnabled,setBgPreviewEnabled]=useState(false);
  const [bgBefore,setBgBefore]=useState(false);
  const [bgProcessing,setBgProcessing]=useState(false);
  const [bgPicking,setBgPicking]=useState(false);
  const [bgDrawing,setBgDrawing]=useState(false);
  const [bgMessage,setBgMessage]=useState('');
  const currentSource=asset?.source??'';
  const originalAssetId=typeof asset?.metadata?.backgroundRemovalOriginalAssetId==='string'?asset.metadata.backgroundRemovalOriginalAssetId:null;
  const canProcess=!!asset&&asset.kind!=='SVG'&&!!currentSource&&!isBound;
  const dynamicBgConfig=element.metadata?.[DYNAMIC_BG_REMOVAL_METADATA_KEY] as {enabled?:boolean;settings?:unknown}|undefined;
  const dynamicBgEnabled=dynamicBgConfig?.enabled===true;
  const colorToRgb=(value:string)=>{const hex=value.replace('#','');return {r:parseInt(hex.slice(0,2)||'ff',16),g:parseInt(hex.slice(2,4)||'ff',16),b:parseInt(hex.slice(4,6)||'ff',16)};};
  const rgbToHex=(c:{r:number;g:number;b:number})=>`#${[c.r,c.g,c.b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('')}`;
  const previewSettings=useMemo(()=>({
    mode:bgMode,
    tolerance:bgTolerance,
    backgroundColor:bgMode==='COLOR'?colorToRgb(bgColor):undefined,
    edgeSoftness:bgEdgeSoftness,
    feather:bgFeather,
    fringeCleanup:bgFringeCleanup,
    noiseCleanup:bgNoiseCleanup,
    brushEdits:bgBrushEdits,
  }),[bgMode,bgTolerance,bgColor,bgEdgeSoftness,bgFeather,bgFringeCleanup,bgNoiseCleanup,bgBrushEdits]);
  const saveDynamicBackground=()=>{const settings={...previewSettings,brushEdits:undefined};update(e=>e.type==='IMAGE'?{...e,metadata:{...(e.metadata??{}),[DYNAMIC_BG_REMOVAL_METADATA_KEY]:{enabled:true,settings}}}:e);setBgMessage('Per-record dynamic background removal enabled with current settings.');};
  const disableDynamicBackground=()=>{update(e=>{if(e.type!=='IMAGE')return e;const metadata={...(e.metadata??{})};delete metadata[DYNAMIC_BG_REMOVAL_METADATA_KEY];return {...e,metadata};});setBgMessage('Per-record dynamic background removal disabled.');};
  const runBackgroundPreview=useCallback(async()=>{
    if(!canProcess||!asset)return;
    setBgProcessing(true);setBgMessage('');
    try{
      const result=await processImageBackground(currentSource,previewSettings);
      setBgPreview(result.dataUrl);setBgPreviewEnabled(true);
      if(bgMode==='AUTO')setBgColor(rgbToHex(result.backgroundColor));
      const pct=result.totalPixels?Math.round(result.removedPixels/result.totalPixels*100):0;
      const editLabel=bgBrushEdits.length?` · ${bgBrushEdits.length} brush step${bgBrushEdits.length===1?'':'s'} applied`:'';
      setBgMessage(`${pct}% transparent background preview ready${editLabel}.`);
    }catch(error){setBgMessage(error instanceof Error?error.message:'Background preview failed.');}
    finally{setBgProcessing(false);}
  },[canProcess,asset,currentSource,previewSettings,bgMode,bgBrushEdits.length]);
  useEffect(()=>{
    setBgPreview(null);setBgPreviewEnabled(false);setBgMessage('');setBgPicking(false);setBgDrawing(false);setBgBrushEdits([]);setBgBefore(false);setBgBrushMode('NONE');
  },[element.assetId]);
  useEffect(()=>{
    if(!bgPreviewEnabled||!canProcess)return;
    const handle=window.setTimeout(()=>{void runBackgroundPreview();},220);
    return()=>window.clearTimeout(handle);
  },[previewSettings,bgPreviewEnabled,canProcess,runBackgroundPreview]);
  const applyBackgroundCopy=()=>{
    if(!asset||!bgPreview)return;
    const derivedId=id('asset-bg-removed');
    const derived=createBackgroundRemovedAsset(asset,bgPreview,previewSettings,derivedId);
    mutate(t=>applyBackgroundRemovedAssetToImage(t,artboardId,element.id,derived));
    setBgMessage('Transparent derived copy applied. Original asset is preserved.');
  };
  const resetBackground=()=>{
    if(!originalAssetId)return;
    mutate(t=>resetImageBackgroundRemoval(t,artboardId,element.id));
    setBgMessage('Original image restored.');
  };
  const pickPreviewColor=async(event:React.MouseEvent<HTMLImageElement>)=>{
    if(!bgPicking||!currentSource)return;
    const rect=event.currentTarget.getBoundingClientRect();
    try{
      const picked=await sampleImageColor(currentSource,(event.clientX-rect.left)/Math.max(1,rect.width),(event.clientY-rect.top)/Math.max(1,rect.height));
      setBgMode('COLOR');setBgColor(rgbToHex(picked));setBgPicking(false);setBgMessage(`Picked ${rgbToHex(picked)}. Preview updated.`);
    }catch(error){setBgMessage(error instanceof Error?error.message:'Unable to sample image color.');}
  };
  const createBrushEdit=(event:React.MouseEvent<HTMLImageElement>):BackgroundRemovalBrushEdit|null=>{
    if(bgBrushMode==='NONE')return null;
    const rect=event.currentTarget.getBoundingClientRect();
    const width=Math.max(1,rect.width),height=Math.max(1,rect.height);
    const x=(event.clientX-rect.left)/width,y=(event.clientY-rect.top)/height;
    if(x<0||x>1||y<0||y>1)return null;
    return {mode:bgBrushMode,x,y,radius:bgBrushSize/Math.max(width,height),softness:bgBrushSoftness};
  };
  const pushBrushEdit=(event:React.MouseEvent<HTMLImageElement>)=>{
    const edit=createBrushEdit(event);
    if(!edit)return;
    setBgBrushEdits(current=>[...current,edit]);
  };
  const beginBrush=(event:React.MouseEvent<HTMLImageElement>)=>{
    if(bgBrushMode==='NONE'||bgPicking||!bgPreview)return;
    setBgDrawing(true);
    pushBrushEdit(event);
  };
  const moveBrush=(event:React.MouseEvent<HTMLImageElement>)=>{
    if(!bgDrawing||bgBrushMode==='NONE'||bgPicking||!bgPreview)return;
    pushBrushEdit(event);
  };
  const endBrush=()=>setBgDrawing(false);
  const clearBrushEdits=()=>{setBgBrushEdits([]);setBgMessage('Brush edits cleared.');};
  const undoBrushEdit=()=>{setBgBrushEdits(current=>current.slice(0,-1));setBgMessage('Last brush step removed.');};
  const previewImageSrc=bgBefore||!bgPreview?currentSource:bgPreview;
  const previewInteractive=bgPicking||bgBrushMode!=='NONE';
  return <><Section sectionKey="APPEARANCE" title="Image"><label>Fit<select value={element.fit} onChange={e=>patch({fit:e.target.value as ImageDesignElement['fit']})}><option value="FIT">Fit</option><option value="FILL">Fill</option><option value="STRETCH">Stretch</option></select></label><div className="card-segmented-control"><button className={element.flipX?'active':''} onClick={()=>patch({flipX:!element.flipX})}>Flip X</button><button className={element.flipY?'active':''} onClick={()=>patch({flipY:!element.flipY})}>Flip Y</button></div><label className="card-check-row"><input type="checkbox" checked={element.maintainAspectRatio??true} onChange={e=>patch({maintainAspectRatio:e.target.checked})}/>Lock aspect ratio</label></Section>
  <Section sectionKey="APPEARANCE" title="Background Removal">
    <div className="card-property-note"><strong>Non-destructive</strong><span>Border-connected pixels are removed; internal matching details stay protected. IMG3 adds feather, fringe cleanup, and manual erase/restore brushes.</span></div>
    {isBound&&<div className="card-property-note"><strong>Dynamic image detected</strong><span>Static preview buttons are disabled while bound, but per-record removal can process each Base64/data-URL record during canvas preview, single export, and bulk export.</span></div>}
    {isBound&&<div className="card-segmented-control"><button className={dynamicBgEnabled?'active':''} onClick={saveDynamicBackground}>{dynamicBgEnabled?'Update Per-Record Settings':'Enable Per-Record Removal'}</button><button disabled={!dynamicBgEnabled} onClick={disableDynamicBackground}>Disable</button></div>}
    <label>Mode<select value={bgMode} onChange={e=>setBgMode(e.target.value as 'AUTO'|'COLOR')}><option value="AUTO">Auto Background</option><option value="COLOR">Selected Color</option></select></label>
    {bgMode==='COLOR'&&<label>Background Color<input type="color" value={bgColor} onChange={e=>setBgColor(e.target.value)}/></label>}
    <label>Tolerance <span>{bgTolerance}</span><input type="range" min="0" max="100" step="1" value={bgTolerance} onChange={e=>setBgTolerance(Number(e.target.value))}/></label>
    <label>Edge Softness <span>{bgEdgeSoftness}</span><input type="range" min="0" max="100" step="1" value={bgEdgeSoftness} onChange={e=>setBgEdgeSoftness(Number(e.target.value))}/></label>
    <label>Feather <span>{bgFeather}</span><input type="range" min="0" max="100" step="1" value={bgFeather} onChange={e=>setBgFeather(Number(e.target.value))}/></label>
    <label>Fringe Cleanup <span>{bgFringeCleanup}</span><input type="range" min="0" max="100" step="1" value={bgFringeCleanup} onChange={e=>setBgFringeCleanup(Number(e.target.value))}/></label>
    <label>Noise Cleanup <span>{bgNoiseCleanup}</span><input type="range" min="0" max="100" step="1" value={bgNoiseCleanup} onChange={e=>setBgNoiseCleanup(Number(e.target.value))}/></label>
    <div className="card-segmented-control"><button disabled={!canProcess||bgProcessing} onClick={()=>void runBackgroundPreview()}>{bgProcessing?'Processing…':'Preview Removal'}</button><button disabled={!canProcess} className={bgPicking?'active':''} onClick={()=>{setBgPicking(v=>!v);setBgBrushMode('NONE');setBgMessage('Click a background pixel in the preview.');}}>Eyedropper</button></div>
    <div className="card-property-note"><strong>Manual Brush</strong><span>Preview-only refine stage. Draw on the preview, then Apply as Copy when satisfied.</span></div>
    <div className="card-segmented-control"><button disabled={!canProcess} className={bgBrushMode==='ERASE'?'active':''} onClick={()=>{setBgBrushMode(mode=>mode==='ERASE'?'NONE':'ERASE');setBgPicking(false);setBgMessage('Erase brush ready. Drag over remaining background.');}}>Erase Brush</button><button disabled={!canProcess} className={bgBrushMode==='RESTORE'?'active':''} onClick={()=>{setBgBrushMode(mode=>mode==='RESTORE'?'NONE':'RESTORE');setBgPicking(false);setBgMessage('Restore brush ready. Drag over foreground to bring it back.');}}>Restore Brush</button></div>
    <label>Brush Size <span>{bgBrushSize}px</span><input type="range" min="6" max="120" step="1" value={bgBrushSize} onChange={e=>setBgBrushSize(Number(e.target.value))}/></label>
    <label>Brush Softness <span>{bgBrushSoftness}</span><input type="range" min="0" max="100" step="1" value={bgBrushSoftness} onChange={e=>setBgBrushSoftness(Number(e.target.value))}/></label>
    {(currentSource||bgPreview)&&<div className={`card-bg-removal-preview ${previewInteractive?'interactive':''} ${bgBrushMode!=='NONE'?'brush-active':''}`} data-bg-removal-preview>
      <img src={previewImageSrc} alt={bgBefore?'Original image':'Background removal preview'} draggable={false} onClick={pickPreviewColor} onMouseDown={beginBrush} onMouseMove={moveBrush} onMouseUp={endBrush} onMouseLeave={endBrush} style={{cursor:bgPicking||bgBrushMode!=='NONE'?'crosshair':'default'}}/>
    </div>}
    <div className="card-segmented-control"><button disabled={!bgPreview} className={bgBefore?'':'active'} onClick={()=>setBgBefore(false)}>After</button><button disabled={!bgPreview} className={bgBefore?'active':''} onClick={()=>setBgBefore(true)}>Before</button></div>
    <div className="card-segmented-control"><button disabled={!bgBrushEdits.length} onClick={undoBrushEdit}>Undo Brush</button><button disabled={!bgBrushEdits.length} onClick={clearBrushEdits}>Clear Brush</button></div>
    <div className="card-segmented-control"><button className="primary" disabled={!bgPreview||bgProcessing} onClick={applyBackgroundCopy}>Apply as Copy</button><button disabled={!originalAssetId} onClick={resetBackground}>Reset Original</button></div>
    {bgMessage&&<div className="card-asset-library-status" aria-live="polite">{bgMessage}</div>}
  </Section>
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
  <Section sectionKey="APPEARANCE" title="Appearance"><OpacityControl value={element.opacity} onChange={opacity=>patch({opacity})}/><label>Corner radius (mm)<input type="number" min="0" step=".5" value={element.cornerRadiusMm??0} onChange={e=>patch({cornerRadiusMm:Math.max(0,Number(e.target.value)||0)})}/></label></Section><Section sectionKey="APPEARANCE" title="Stroke"><StrokeControls stroke={element.stroke} onChange={stroke=>patch({stroke})}/></Section><Section sectionKey="ADVANCED" title="Shadow"><ShadowControls shadow={element.shadow} onChange={shadow=>patch({shadow})}/></Section></>}
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
function BatchOpacityProperties({elements,artboard,mutate}:{elements:DesignElement[];artboard:Artboard;mutate:(f:(t:DesignTemplate)=>DesignTemplate)=>void}){const compatible=elements.filter(e=>['TEXT','SHAPE','PATH','IMAGE','SVG'].includes(e.type)),first=compatible[0]?.opacity,mixed=compatible.some(e=>Math.abs(e.opacity-(first??e.opacity))>.0001),percent=Math.round((first??1)*100);if(!compatible.length)return null;return <Section sectionKey="APPEARANCE" title="Appearance"><label>Opacity {mixed?'(Mixed)':''}<div className="card-range-row"><input type="range" min="0" max="100" value={mixed?100:percent} onChange={e=>mutate(t=>updateElementsOpacity(t,artboard.id,compatible.map(x=>x.id),Number(e.target.value)/100))}/><input type="number" min="0" max="100" value={mixed?'':percent} placeholder={mixed?'Mixed':undefined} onChange={e=>{if(e.target.value==='')return;mutate(t=>updateElementsOpacity(t,artboard.id,compatible.map(x=>x.id),clamp(Number(e.target.value)||0,0,100)/100))}}/><span>{mixed?'Mixed':`${percent}%`}</span></div></label></Section>}
function ElementPrintQuality({element,asset,print}:{element:ImageDesignElement|SvgDesignElement;asset?:AssetReference;print:Artboard['print']}){if(element.type==='SVG')return <div className={`card-print-quality ${assetRenderKind(asset)==='VECTOR_SVG'?'good':'error'}`}><strong>{assetRenderKind(asset)==='VECTOR_SVG'?'Vector — resolution independent':asset?'Unsupported Asset':'Missing Asset'}</strong></div>;const quality=imagePrintQuality(element,asset,print);return <div className={`card-print-quality ${quality.status.toLowerCase()}`}><strong>{quality.message}</strong><span>Source: {asset?.widthPx&&asset?.heightPx?`${asset.widthPx} × ${asset.heightPx} px`:'Dimensions unavailable'}</span><span>Placed: {normalizeDisplayValue(element.size.widthMm)} × {normalizeDisplayValue(element.size.heightMm)} mm</span><span>Effective: {quality.effectiveDpi?`${Math.round(quality.effectiveDpi)} DPI`:'Unknown'}</span></div>}
function MultiSelectionProperties({elements,primaryElementId,artboard,mutate,groupSelected,ungroupSelected,regroupSelected,canRegroup}:{elements:DesignElement[];primaryElementId?:string;artboard:Artboard;mutate:(f:(t:DesignTemplate)=>DesignTemplate)=>void;groupSelected:()=>void;ungroupSelected:()=>void;regroupSelected:()=>void;canRegroup:boolean}){
 const [reference,setReference]=useState<DesignAlignmentReference>('SELECTION');
 const b=getSelectionBounds(elements),ids=elements.map(e=>e.id),grouped=elements.some(e=>e.groupId),unitCount=getAlignmentUnitCount(artboard,ids);
 const groupIds=[...new Set(elements.map(e=>e.groupId).filter(Boolean) as string[])];
 const singleGroup=groupIds.length===1?artboard.groups.find(g=>g.id===groupIds[0]&&g.elementIds.length===ids.length&&g.elementIds.every(id=>ids.includes(id))):undefined;
 const primary=elements.find(e=>e.id===primaryElementId)??elements[0];
 const unlocked=elements.filter(e=>!e.locked);
 const mixed=(getter:(e:DesignElement)=>number)=>resolveMixedValue(unlocked,getter,(a,b)=>Math.abs(a-b)<.0001);
 const x=mixed(e=>e.position.xMm),y=mixed(e=>e.position.yMm),w=mixed(e=>e.size.widthMm),h=mixed(e=>e.size.heightMm),r=mixed(e=>e.rotationDeg);
 const align=(mode:'LEFT'|'HCENTER'|'RIGHT'|'TOP'|'VCENTER'|'BOTTOM')=>mutate(t=>alignElements(t,artboard.id,ids,mode,reference,primary?.id));
 const distribute=(axis:'HORIZONTAL'|'VERTICAL')=>mutate(t=>distributeElements(t,artboard.id,ids,axis,reference==='PRIMARY'?'SELECTION':reference));
 const exact=(label:string,value:ReturnType<typeof mixed>,commit:(value:number)=>void,positive=false)=>{
   const key=`${label}-${value.mixed?'mixed':value.value}`;
   return <label>{label}<input key={key} type="number" step="0.1" min={positive?0.01:undefined} defaultValue={value.mixed?'':normalizeDisplayValue(value.value)} placeholder={value.mixed?'Mixed':''} onKeyDown={e=>{if(e.key==='Enter')(e.currentTarget as HTMLInputElement).blur();}} onBlur={e=>{if(e.target.value.trim()==='')return;const n=Number(e.target.value);if(Number.isFinite(n)&&(!positive||n>0))commit(n);}}/></label>;
 };
 return <div className="card-property-sections">
  <Section sectionKey="GENERAL" title="General">
    <div className="card-property-note"><strong>{elements.length} elements selected</strong><span>{unitCount} alignment unit{unitCount===1?'':'s'} · Primary: {primary?.name??'None'} · locked items stay fixed.</span></div>
    <div className="card-layer-action-grid"><button onClick={groupSelected} disabled={grouped}>Group</button><button onClick={ungroupSelected} disabled={!grouped}>Ungroup</button><button onClick={regroupSelected} disabled={!canRegroup}>Regroup</button></div>{singleGroup&&<label>Group name<input key={singleGroup.id} defaultValue={singleGroup.name} onKeyDown={e=>{if(e.key==='Enter')(e.currentTarget as HTMLInputElement).blur();}} onBlur={e=>{const name=e.target.value.trim();if(name&&name!==singleGroup.name)mutate(t=>renameGroup(t,artboard.id,singleGroup.id,name));}}/></label>}
  </Section>
  <Section sectionKey="TRANSFORM" title="Transform">
    <div className="card-layer-action-grid"><button onClick={()=>mutate(t=>scaleElements(t,artboard.id,ids,1.1))}>Scale +10%</button><button onClick={()=>mutate(t=>rotateElementsAsGroup(t,artboard.id,ids,15))}>Rotate +15°</button>{singleGroup&&<><button onClick={()=>mutate(t=>flipElementsAsGroup(t,artboard.id,ids,'VERTICAL'))}>Flip Group H</button><button onClick={()=>mutate(t=>flipElementsAsGroup(t,artboard.id,ids,'HORIZONTAL'))}>Flip Group V</button></>}</div>
    <label>Reference<select value={reference} onChange={e=>setReference(e.target.value as DesignAlignmentReference)}><option value="SELECTION">Selection bounds</option><option value="PRIMARY">Primary element</option><option value="ARTBOARD">Artboard</option></select></label>
    <div className="card-layer-action-grid card-align-grid"><button onClick={()=>align('LEFT')}>Left</button><button onClick={()=>align('HCENTER')}>H Center</button><button onClick={()=>align('RIGHT')}>Right</button><button onClick={()=>align('TOP')}>Top</button><button onClick={()=>align('VCENTER')}>V Center</button><button onClick={()=>align('BOTTOM')}>Bottom</button><button onClick={()=>distribute('HORIZONTAL')} disabled={unitCount<3||reference==='PRIMARY'} title={reference==='PRIMARY'?'Distribution uses selection or artboard bounds.':''}>Distribute H</button><button onClick={()=>distribute('VERTICAL')} disabled={unitCount<3||reference==='PRIMARY'} title={reference==='PRIMARY'?'Distribution uses selection or artboard bounds.':''}>Distribute V</button><button onClick={()=>mutate(t=>centerElementsOnArtboard(t,artboard.id,ids,'BOTH'))}>Center Artboard</button></div>
    <div className="card-layer-action-grid"><button disabled={!primary} onClick={()=>primary&&mutate(t=>matchAlignmentUnitsSize(t,artboard.id,ids,primary.id,'WIDTH'))}>Same Width</button><button disabled={!primary} onClick={()=>primary&&mutate(t=>matchAlignmentUnitsSize(t,artboard.id,ids,primary.id,'HEIGHT'))}>Same Height</button><button disabled={!primary} onClick={()=>primary&&mutate(t=>matchAlignmentUnitsSize(t,artboard.id,ids,primary.id,'BOTH'))}>Same Size</button></div>
    <div className="card-property-note"><span>Mixed values show blank. Enter a value and leave the field to apply that exact value to every unlocked selected element.</span></div>
    <div className="card-property-grid">
      {exact('X (mm)',x,n=>mutate(t=>setElementsPositionAxis(t,artboard.id,ids,'X',n)))}
      {exact('Y (mm)',y,n=>mutate(t=>setElementsPositionAxis(t,artboard.id,ids,'Y',n)))}
      {exact('Width (mm)',w,n=>mutate(t=>setElementsSizeDimension(t,artboard.id,ids,'WIDTH',n)),true)}
      {exact('Height (mm)',h,n=>mutate(t=>setElementsSizeDimension(t,artboard.id,ids,'HEIGHT',n)),true)}
      {exact('Rotation (°)',r,n=>mutate(t=>setElementsRotation(t,artboard.id,ids,n)))}
    </div>
    {b&&<div className="card-property-note"><span>Selection bounds: X {normalizeDisplayValue(b.xMm)} · Y {normalizeDisplayValue(b.yMm)} · W {normalizeDisplayValue(b.widthMm)} · H {normalizeDisplayValue(b.heightMm)} mm</span></div>}
  </Section>
 </div>}

function SvgDielineImportPanel({template,artboard,selection,mutate,setSelection,setStatus}:{template:DesignTemplate;artboard:Artboard;selection:DesignSelectionState;mutate:(f:(t:DesignTemplate)=>DesignTemplate)=>void;setSelection:(value:DesignSelectionState)=>void;setStatus:(value:string)=>void}){
 const uploadRef=useRef<HTMLInputElement>(null);const [role,setRole]=useState<ManualPackagingPanelRole>('FRONT');const [flapKind,setFlapKind]=useState<'TUCK'|'DUST'>('DUST');const [safe,setSafe]=useState(5);const [bleed,setBleed]=useState(3);const imported=artboard.metadata?.cartonDieline&&((artboard.metadata.cartonDieline as Record<string,unknown>).source==='IMPORTED_SVG');const selectedPaths=artboard.elements.filter(e=>selection.elementIds.includes(e.id)&&e.type==='PATH');
 const importFile=async(file:File|undefined)=>{if(!file)return;try{if(!file.name.toLowerCase().endsWith('.svg')&&file.type!=='image/svg+xml'){setStatus('Dieline import currently supports SVG/vector files.');return;}const text=await file.text(),result=importSvgDieline(text,id);const fatal=result.issues.find(issue=>issue.severity==='ERROR');if(fatal){setStatus(fatal.message);return;}if((artboard.elements.length>0||template.artboards.length>1)&&!window.confirm('Import SVG dieline? Current artboard/design content will be replaced. Undo remains available.'))return;mutate(t=>createSvgDielineArtboard(t,result,artboard.id,file.name.replace(/\.svg$/i,'')||'Imported Dieline'));setSelection(emptySelection(artboard.id));const warnings=result.issues.filter(i=>i.severity==='WARNING');setStatus(`SVG dieline imported · ${result.widthMm.toFixed(2)} × ${result.heightMm.toFixed(2)} mm · ${result.elements.length} vectors${warnings.length?` · ${warnings.length} warning${warnings.length===1?'':'s'}`:''}`);}catch(error){setStatus(error instanceof Error?error.message:'Unable to import SVG dieline.');}};
 const assign=(layer:'CUT'|'CREASE'|'OTHER')=>{if(!selectedPaths.length){setStatus('Select one or more imported PATH elements first.');return;}mutate(t=>assignImportedDielineLayer(t,artboard.id,selectedPaths.map(e=>e.id),layer));setStatus(`${selectedPaths.length} vector${selectedPaths.length===1?'':'s'} assigned to ${layer}.`);};
 const mapPanel=()=>{if(!selectedPaths.length){setStatus('Select the vector/region that bounds the panel first.');return;}mutate(t=>mapSelectionToPackagingPanel(t,artboard.id,selectedPaths.map(e=>e.id),role,{safeMarginMm:safe,bleedMm:bleed,flapKind}));setStatus(`${role.replaceAll('_',' ')} panel mapped from selected geometry.`);};
 const lock=()=>{const technical=artboard.elements.filter(e=>e.metadata?.technicalLayer==='CUT'||e.metadata?.technicalLayer==='CREASE');const next=!technical.length?true:technical.some(e=>!e.locked);mutate(t=>lockImportedDielineTechnicalGeometry(t,artboard.id,next));setSelection(emptySelection(artboard.id));setStatus(`Imported CUT/CREASE geometry ${next?'locked':'unlocked'}.`);};
 return <details className="card-library-section card-dieline-import" open={Boolean(imported)}><summary><span>Import Printer Dieline</span><small>Phase 9.4L–M</small></summary><div className="card-library-body" style={{display:'grid',gap:8}}><input ref={uploadRef} hidden type="file" accept="image/svg+xml,.svg" onChange={e=>{void importFile(e.target.files?.[0]);e.currentTarget.value='';}}/><button className="primary" onClick={()=>uploadRef.current?.click()}><Upload size={14}/> Import SVG Dieline</button><small className="card-library-hint">Preserves physical SVG width/height. Import paths stay editable. PDF vector recognition comes later.</small>{imported&&<><div style={{borderTop:'1px solid var(--border-color)',paddingTop:8,display:'grid',gap:6}}><strong style={{fontSize:12}}>Technical path assignment</strong><small>{selectedPaths.length} selected PATH{selectedPaths.length===1?'':'s'}</small><div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:4}}><button onClick={()=>assign('CUT')}>CUT</button><button onClick={()=>assign('CREASE')}>CREASE</button><button onClick={()=>assign('OTHER')}>Other</button></div><button onClick={lock}>Lock / Unlock CUT + CREASE</button></div><div style={{borderTop:'1px solid var(--border-color)',paddingTop:8,display:'grid',gap:6}}><strong style={{fontSize:12}}>Manual panel mapping</strong><label>Panel role<select value={role} onChange={e=>setRole(e.target.value as ManualPackagingPanelRole)}><option value="FRONT">Front</option><option value="BACK">Back</option><option value="LEFT">Left</option><option value="RIGHT">Right</option><option value="GLUE">Glue</option><option value="TOP_FRONT">Top Front</option><option value="TOP_BACK">Top Back</option><option value="TOP_LEFT">Top Left</option><option value="TOP_RIGHT">Top Right</option><option value="BOTTOM_FRONT">Bottom Front</option><option value="BOTTOM_BACK">Bottom Back</option><option value="BOTTOM_LEFT">Bottom Left</option><option value="BOTTOM_RIGHT">Bottom Right</option></select></label>{(role.startsWith('TOP_')||role.startsWith('BOTTOM_'))&&<label>Flap type<select value={flapKind} onChange={e=>setFlapKind(e.target.value as 'TUCK'|'DUST')}><option value="TUCK">Tuck flap</option><option value="DUST">Dust flap</option></select></label>}<div className="card-property-grid"><label>Safe (mm)<input type="number" min="0" step="0.5" value={safe} onChange={e=>setSafe(Math.max(0,Number(e.target.value)||0))}/></label><label>Bleed (mm)<input type="number" min="0" step="0.5" value={bleed} onChange={e=>setBleed(Math.max(0,Number(e.target.value)||0))}/></label></div><button onClick={mapPanel} disabled={!selectedPaths.length}>Map Selected Bounds as Panel</button><small className="card-library-hint">Select a closed region/path, or the vectors that define one panel. The combined selection bounds become the editable packaging panel.</small></div></>}</div></details>;
}
function CartonDielineGenerator({template,artboard,mutate,setSelection,setStatus}:{template:DesignTemplate;artboard:Artboard;mutate:(f:(t:DesignTemplate)=>DesignTemplate)=>void;setSelection:(value:DesignSelectionState)=>void;setStatus:(value:string)=>void}){
 const restored=cartonDielineInputFromTemplate(template),[input,setInput]=useState<CartonDielineInput>(restored??{...DEFAULT_CARTON_DIELINE_INPUT});
 useEffect(()=>{const next=cartonDielineInputFromTemplate(template);if(next)setInput(next);},[template.id,artboard.id]);
 const issues=validateCartonDielineInput(input),errors=issues.filter(issue=>issue.severity==='ERROR'),technicalGroups=artboard.groups.filter(group=>['CUT','CREASE','BLEED','SAFE','ANNOTATION'].includes(group.name));
 const numberField=(key:keyof Pick<CartonDielineInput,'widthMm'|'depthMm'|'heightMm'|'materialThicknessMm'|'glueFlapMm'|'tuckDepthMm'|'dustFlapMm'|'bleedMm'|'safeMarginMm'|'toleranceMm'>,label:string,step=.1)=><label>{label} (mm)<input type="number" min="0" step={step} value={input[key]} onChange={e=>setInput(current=>({...current,[key]:Number(e.target.value)}))}/></label>;
 const generate=()=>{if(errors.length){setStatus(errors[0]!.message);return;}const existing=Boolean(cartonDielineInputFromTemplate(template)),hasOtherDesign=template.artboards.length>1||artboard.elements.some(element=>!element.metadata?.technicalLayer);if((existing||hasOtherDesign)&&!window.confirm(existing?'Regenerate dieline? Existing dieline geometry will be replaced. Undo remains available.':'Generate dieline? The current design will be replaced. Undo remains available.'))return;const result=generateCartonDieline(input,id,{templateId:template.id,artboardId:artboard.id});mutate(()=>result.template);setSelection(emptySelection(artboard.id));setStatus(`${CARTON_STYLE_OPTIONS.find(item=>item.id===input.style)?.label} generated · ${result.measurements.flatWidthMm.toFixed(2)} × ${result.measurements.flatHeightMm.toFixed(2)} mm sheet`);};
 return <details className="card-library-section card-dieline-generator"><summary><span>Box Dieline Generator</span><small>Phase 9.3</small></summary><div className="card-library-body"><div className="card-dieline-form"><label>Structure<select aria-label="Carton structure" value={input.style} onChange={e=>setInput(current=>({...current,style:e.target.value as CartonStyle}))}>{CARTON_STYLE_OPTIONS.map(item=><option key={item.id} value={item.id}>{item.label}</option>)}</select></label><label>Measurement basis<select aria-label="Carton measurement basis" value={input.measurementBasis} onChange={e=>setInput(current=>({...current,measurementBasis:e.target.value as CartonMeasurementBasis}))}><option value="INTERNAL">Finished internal dimensions</option><option value="EXTERNAL">Finished external dimensions</option></select></label><div className="card-property-grid">{numberField('widthMm','Width')}{numberField('depthMm','Depth')}{numberField('heightMm','Height')}{numberField('materialThicknessMm','Material',.05)}{numberField('glueFlapMm','Glue flap')}{input.style!=='SLEEVE'&&numberField('tuckDepthMm','Tuck depth')}{input.style!=='SLEEVE'&&numberField('dustFlapMm','Dust flap')}{numberField('bleedMm','Bleed')}{numberField('safeMarginMm','Safe margin')}{numberField('toleranceMm','Tolerance',.05)}</div>{issues.map(issue=><div key={issue.code} className={`card-dieline-issue ${issue.severity.toLowerCase()}`}>{issue.message}</div>)}<button className="card-dieline-generate" disabled={errors.length>0} onClick={generate}>{restored?'Regenerate Dieline':'Generate Dieline'}</button><small className="card-library-hint">ECMA-style folding-carton geometry. Converter approval required before manufacturing.</small>{technicalGroups.length>0&&<div className="card-dieline-layer-toggles"><strong>Technical layers</strong>{technicalGroups.map(group=><button key={group.id} className={group.visible===false?'':'active'} onClick={()=>mutate(t=>setGroupVisibility(t,artboard.id,group.id,group.visible===false))}>{group.name} {group.visible===false?'Hidden':'Visible'}</button>)}</div>}</div></div></details>;
}

function StarterTemplateGallery({onLoad}:{onLoad:(id:(typeof DESIGN_STARTER_TEMPLATES)[number]['id'])=>void}){
 const [query,setQuery]=useState(''),[category,setCategory]=useState('ALL');
 const categories=['ALL',...new Set(DESIGN_STARTER_TEMPLATES.map(item=>item.category))];
 const needle=query.trim().toLowerCase(),visible=DESIGN_STARTER_TEMPLATES.filter(item=>(category==='ALL'||item.category===category)&&(!needle||[item.name,item.category,item.description,item.formatLabel,...item.tags].join(' ').toLowerCase().includes(needle)));
 return <details className="card-library-section" open><summary><span>Professional Templates</span><small>{visible.length}/{DESIGN_STARTER_TEMPLATES.length}</small></summary><div className="card-library-body"><div className="card-template-filters"><input aria-label="Search professional templates" placeholder="Search ID, wedding, label…" value={query} onChange={e=>setQuery(e.target.value)}/><select aria-label="Template category" value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(item=><option key={item} value={item}>{item==='ALL'?'All categories':item}</option>)}</select></div><div className="card-starter-template-list">{visible.map(starter=><button key={starter.id} className="card-starter-template-button card-template-preview" onClick={()=>onLoad(starter.id)}><span className="card-template-swatch" style={{background:starter.previewColor}} aria-hidden="true"/><span className="card-template-copy"><strong>{starter.name}</strong><small>{starter.category} · {starter.formatLabel}</small><span>{starter.description}</span><em>{starter.formatLabel.includes('Front + Back')?'Front + Back':'Single design'} · Editable · Print ready</em></span></button>)}{!visible.length&&<div className="card-property-note"><strong>No templates found</strong><span>Try another search or category.</span></div>}</div></div></details>;
}

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
function Properties({artboard,template,mutate,availableFields,datasourceStatus}:{artboard:Artboard;template:DesignTemplate;mutate:(f:(t:DesignTemplate)=>DesignTemplate)=>void;availableFields:import('@document-tool/contracts').FieldDefinition[];datasourceStatus:string}){
const unit=artboard.displayUnit,w=normalizeDisplayValue(mmToUnit(artboard.widthMm,unit)),h=normalizeDisplayValue(mmToUnit(artboard.heightMm,unit));
const presetRepo=useMemo(()=>new LocalStorageArtboardPresetRepository(window.localStorage),[]);
const [customPresets,setCustomPresets]=useState<CustomArtboardPreset[]>([]),[presetQuery,setPresetQuery]=useState(''),[presetCategory,setPresetCategory]=useState<'ALL'|ArtboardPresetCategory>('ALL'),[orientation,setOrientation]=useState<ArtboardOrientation>(artboard.widthMm>=artboard.heightMm?'LANDSCAPE':'PORTRAIT'),[selectedPresetId,setSelectedPresetId]=useState('');
useEffect(()=>{void presetRepo.list().then(setCustomPresets);},[presetRepo]);
useEffect(()=>{setOrientation(artboard.widthMm>=artboard.heightMm?'LANDSCAPE':'PORTRAIT');},[artboard.id,artboard.widthMm,artboard.heightMm]);
const allPresets:readonly ArtboardPreset[]=[...ARTBOARD_PRESETS,...customPresets],preset=findArtboardPresetBySize(artboard.widthMm,artboard.heightMm,allPresets),filteredPresets=searchArtboardPresets(allPresets,presetQuery,presetCategory),selectedPreset=allPresets.find(item=>item.id===(selectedPresetId||preset?.id));
const dimensions=(nw:number,nh:number)=>{const wm=unitToMm(nw,unit),hm=unitToMm(nh,unit);if(wm>0&&hm>0&&Number.isFinite(wm)&&Number.isFinite(hm))mutate(t=>resizeArtboard(t,artboard.id,wm,hm));};
const selectAndApplyPreset=(presetId:string)=>{setSelectedPresetId(presetId);const next=allPresets.find(item=>item.id===presetId);if(next)mutate(t=>applyArtboardPreset(t,artboard.id,next,orientation));};
const changeOrientation=(next:ArtboardOrientation)=>{setOrientation(next);if(selectedPreset)mutate(t=>applyArtboardPreset(t,artboard.id,selectedPreset,next));else if((next==='LANDSCAPE'&&artboard.widthMm<artboard.heightMm)||(next==='PORTRAIT'&&artboard.widthMm>artboard.heightMm))mutate(t=>resizeArtboard(t,artboard.id,artboard.heightMm,artboard.widthMm));};
const saveCustomPreset=async()=>{const label=window.prompt('Custom preset name',`${artboard.name} · ${normalizeDisplayValue(artboard.widthMm)} × ${normalizeDisplayValue(artboard.heightMm)} mm`)?.trim();if(!label)return;const print=resolvePrintSettings(artboard.print),saved=await presetRepo.save({id:id('custom-preset'),label,widthMm:artboard.widthMm,heightMm:artboard.heightMm,layout:'SINGLE',bleedMm:print.bleed.topMm,safeAreaMm:print.safeArea.topMm,preferredDpi:print.preferredRasterDpi,tags:['saved','custom']});setCustomPresets(await presetRepo.list());setSelectedPresetId(saved.id);};
const deleteCustomPreset=async()=>{if(!selectedPreset?.userDefined||!window.confirm(`Delete preset “${selectedPreset.label}”?`))return;await presetRepo.delete(selectedPreset.id);setCustomPresets(await presetRepo.list());setSelectedPresetId('');};
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
<Section sectionKey="GENERAL" title="Page Format">
 <div className="card-property-grid"><label>Search<input aria-label="Search page formats" placeholder="card, label, A4…" value={presetQuery} onChange={e=>setPresetQuery(e.target.value)}/></label><label>Category<select aria-label="Page format category" value={presetCategory} onChange={e=>setPresetCategory(e.target.value as 'ALL'|ArtboardPresetCategory)}>{ARTBOARD_PRESET_CATEGORIES.map(item=><option key={item.id} value={item.id}>{item.label}</option>)}</select></label></div>
 <label>Format<select aria-label="Page format" value={selectedPreset?.id??''} onChange={e=>selectAndApplyPreset(e.target.value)}><option value="">Custom size</option>{filteredPresets.map(item=><option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
 <label>Orientation<div className="card-segmented-control"><button className={orientation==='PORTRAIT'?'active':''} onClick={()=>changeOrientation('PORTRAIT')}>Portrait</button><button className={orientation==='LANDSCAPE'?'active':''} onClick={()=>changeOrientation('LANDSCAPE')}>Landscape</button></div></label>
 {selectedPreset&&<div className="card-property-note"><span>{selectedPreset.category} · {selectedPreset.layout??'SINGLE'} · Bleed {selectedPreset.bleedMm??3} mm</span><strong>{selectedPreset.description??`${selectedPreset.widthMm} × ${selectedPreset.heightMm} mm trim size`}</strong></div>}
 <div className="card-layer-action-grid"><button disabled={!selectedPreset} onClick={()=>{if(selectedPreset)mutate(t=>applyArtboardPreset(t,artboard.id,selectedPreset,orientation));}}>Apply Format</button><button onClick={()=>void saveCustomPreset()}>Save Current</button>{selectedPreset?.userDefined&&<button onClick={()=>void deleteCustomPreset()}>Delete Saved</button>}</div>
</Section>
<Section sectionKey="GENERAL" title="Dimensions"><div className="card-property-grid"><label>Width ({unit==='MM'?'mm':'in'})<input type="number" min="0.001" step="0.1" value={w} onChange={e=>dimensions(Number(e.target.value),h)}/></label><label>Height ({unit==='MM'?'mm':'in'})<input type="number" min="0.001" step="0.1" value={h} onChange={e=>dimensions(w,Number(e.target.value))}/></label></div><label>Display unit<select value={unit} onChange={e=>mutate(t=>setArtboardDisplayUnit(t,artboard.id,e.target.value as DesignUnit))}><option value="MM">Millimetres (mm)</option><option value="IN">Inches (in)</option></select></label><div className="card-property-note"><span>Output at 300 DPI</span><strong>{requiredPixels(artboard.widthMm,300)} × {requiredPixels(artboard.heightMm,300)} px</strong></div></Section><Section sectionKey="GENERAL" title="Background"><ArtboardBackgroundControls artboard={artboard} template={template} mutate={mutate} availableFields={availableFields} datasourceStatus={datasourceStatus}/></Section><Section sectionKey="GENERAL" title={`Guides (${artboard.guides.length})`}>{artboard.guides.length?<div className="card-guide-list">{artboard.guides.map(guide=><div key={guide.id} className="card-guide-row"><span>{guide.orientation==='VERTICAL'?'V':'H'}</span><input type="number" step="0.1" value={normalizeDisplayValue(mmToUnit(guide.positionMm,unit))} disabled={guide.locked} onChange={e=>mutate(t=>moveGuide(t,artboard.id,guide.id,unitToMm(Number(e.target.value),unit)))}/><small>{unit==='MM'?'mm':'in'}</small><button title={guide.locked?'Unlock guide':'Lock guide'} onClick={()=>mutate(t=>setGuideLocked(t,artboard.id,guide.id,!guide.locked))}>{guide.locked?'🔒':'🔓'}</button><button title="Delete guide" disabled={guide.locked} onClick={()=>mutate(t=>deleteGuide(t,artboard.id,guide.id))}>×</button></div>)}</div>:<div className="card-property-note"><span>Drag from the top or left ruler to create a guide.</span></div>}</Section><Section sectionKey="GENERAL" title="Phase 9.1"><div className="card-property-note"><strong>Professional Page Format System</strong><span>Searchable presets, orientation, front/back pairing, print defaults, custom formats and DPI dimensions are active.</span></div></Section></div>}

function PrintProperties({artboard,assets,mutate}:{artboard:Artboard;assets:AssetReference[];mutate:(f:(t:DesignTemplate)=>DesignTemplate)=>void}){const settings=resolvePrintSettings(artboard.print),preflight=useMemo(()=>validateArtboardPrint(artboard,assets),[artboard,assets]),patch=(value:Partial<Artboard['print']>)=>mutate(template=>updateArtboardPrintSettings(template,artboard.id,value)),insets=(key:'bleed'|'safeArea',label:string)=>{const current=settings[key],change=(side:keyof typeof current,value:number)=>patch({[key]:{...current,[side]:Math.max(0,value)}});return <Section sectionKey="GENERAL" title={label}><div className="card-property-grid"><label>Top (mm)<input type="number" min="0" step=".5" value={current.topMm} onChange={e=>change('topMm',Number(e.target.value)||0)}/></label><label>Right (mm)<input type="number" min="0" step=".5" value={current.rightMm} onChange={e=>change('rightMm',Number(e.target.value)||0)}/></label><label>Bottom (mm)<input type="number" min="0" step=".5" value={current.bottomMm} onChange={e=>change('bottomMm',Number(e.target.value)||0)}/></label><label>Left (mm)<input type="number" min="0" step=".5" value={current.leftMm} onChange={e=>change('leftMm',Number(e.target.value)||0)}/></label></div></Section>};return <div className="card-property-sections"><Section sectionKey="GENERAL" title="Print Settings"><label className="card-check-row"><input type="checkbox" checked={settings.showBleedInEditor} onChange={e=>patch({showBleedInEditor:e.target.checked})}/>Show Bleed</label><label className="card-check-row"><input type="checkbox" checked={settings.showSafeAreaInEditor} onChange={e=>patch({showSafeAreaInEditor:e.target.checked})}/>Show Safe Area</label><label className="card-check-row"><input type="checkbox" checked={settings.showCropMarksInEditor} onChange={e=>patch({showCropMarksInEditor:e.target.checked})}/>Show Crop Marks</label><label className="card-check-row"><input type="checkbox" checked={settings.cropMarksEnabledForExport} onChange={e=>patch({cropMarksEnabledForExport:e.target.checked})}/>Export Crop Marks</label><div className="card-property-grid"><label>Minimum DPI<input type="number" min="1" value={settings.minimumRasterDpi} onChange={e=>patch({minimumRasterDpi:Math.max(1,Number(e.target.value)||150)})}/></label><label>Preferred DPI<input type="number" min="1" value={settings.preferredRasterDpi} onChange={e=>patch({preferredRasterDpi:Math.max(1,Number(e.target.value)||300)})}/></label></div><div className="card-property-note"><span>{artboard.widthMm} × {artboard.heightMm} mm @ {settings.preferredRasterDpi} DPI</span><strong>{requiredPixels(artboard.widthMm,settings.preferredRasterDpi)} × {requiredPixels(artboard.heightMm,settings.preferredRasterDpi)} px recommended</strong></div></Section>{insets('bleed','Bleed — outside trim')}{insets('safeArea','Safe Area — inside trim')}<Section sectionKey="GENERAL" title="Print Preflight"><div className="card-preflight-summary"><span className={preflight.errors?'error':'good'}>{preflight.errors} errors</span><span className={preflight.warnings?'warning':'good'}>{preflight.warnings} warnings</span></div>{preflight.issues.slice(0,6).map(issue=><div key={issue.id} className={`card-preflight-issue ${issue.severity.toLowerCase()}`}>{issue.message}</div>)}{!preflight.issues.length&&<div className="card-print-quality good"><strong>Print Ready</strong><span>Trim size and placed assets passed preflight.</span></div>}</Section></div>}

type RulerTick={key:string;positionMm:number;major:boolean;label:string};
function rulerTicks(artboard:Artboard,zoom:number):{x:RulerTick[];y:RulerTick[]}{const unit=artboard.displayUnit;const pxPerMm=MM_TO_CSS_PX*zoom/100;const majorMm=unit==='MM'?(pxPerMm*10>=34?10:20):25.4;const minorMm=unit==='MM'?(pxPerMm*5>=12?5:10):6.35;const axis=(lengthMm:number,prefix:string)=>{const result:RulerTick[]=[];for(let positionMm=0;positionMm<=lengthMm+1e-6;positionMm+=minorMm){const major=Math.abs(positionMm/majorMm-Math.round(positionMm/majorMm))<1e-6;result.push({key:`${prefix}-${positionMm.toFixed(3)}`,positionMm,major,label:major?String(normalizeDisplayValue(mmToUnit(positionMm,unit))):''});}return result;};return{x:axis(artboard.widthMm,'x'),y:axis(artboard.heightMm,'y')};}

function moveItem<T>(items:T[],from:number,to:number):T[]{const next=[...items],item=next.splice(from,1)[0];if(item!==undefined)next.splice(to,0,item);return next}
function colorWithOpacity(colorValue:string,opacity:number):string{const value=colorValue.replace('#','');if(/^[0-9a-f]{6}$/i.test(value)){const n=parseInt(value,16);return `rgba(${n>>16},${n>>8&255},${n&255},${clamp(opacity,0,1)})`}return colorValue}
function shadowParts(shadow?:DesignShadow){return shadow?.enabled?`${shadow.offsetXmm}mm ${shadow.offsetYmm}mm ${Math.max(0,shadow.blurMm)}mm ${colorWithOpacity(shadow.color,shadow.opacity)}`:undefined}
function textShadowCss(shadow?:DesignShadow){return shadowParts(shadow)}
function textEffectShadowCss(shadow?:DesignShadow,glow?:TextDesignElement['style']['glow'],advanced?:TextDesignElement['style']['advancedEffects']){const parts:string[]=[];const shadowValue=shadowParts(shadow);if(shadowValue)parts.push(shadowValue);if(glow?.enabled){const color=colorWithOpacity(glow.color,glow.opacity);parts.push(`0 0 ${Math.max(0,glow.blurMm)}mm ${color}`);parts.push(`0 0 ${Math.max(0,glow.blurMm*.45)}mm ${color}`)}const bevel=advanced?.bevel;if(bevel?.enabled){const d=Math.max(.05,bevel.depthMm);const intensity=clamp(bevel.intensity,0,1);parts.push(`${-d}mm ${-d}mm ${Math.max(.02,d*.3)}mm ${colorWithOpacity(bevel.highlightColor,intensity)}`);parts.push(`${d}mm ${d}mm ${Math.max(.02,d*.35)}mm ${colorWithOpacity(bevel.shadowColor,intensity)}`)}const hi=advanced?.highlight;if(hi?.enabled)parts.push(`0 ${hi.offsetYmm}mm ${Math.max(0,hi.blurMm)}mm ${colorWithOpacity(hi.color,hi.opacity)}`);const inner=advanced?.innerShadow;if(inner?.enabled){const c=colorWithOpacity(inner.color,inner.opacity);parts.push(`${inner.offsetXmm}mm ${inner.offsetYmm}mm ${Math.max(0,inner.blurMm)}mm ${c}`);parts.push(`${-inner.offsetXmm*.45}mm ${-inner.offsetYmm*.45}mm ${Math.max(0,inner.blurMm*.65)}mm ${c}`)}const ig=advanced?.innerGlow;if(ig?.enabled){const c=colorWithOpacity(ig.color,ig.opacity);parts.push(`0 0 ${Math.max(.02,ig.blurMm*.35)}mm ${c}`);parts.push(`0 0 ${Math.max(.02,ig.blurMm*.7)}mm ${colorWithOpacity(ig.color,ig.opacity*.55)}`)}const second=advanced?.secondaryStroke;if(second?.enabled){const w=Math.max(.02,second.widthMm),c=colorWithOpacity(second.color,second.opacity);for(const [x,y] of [[-1,0],[1,0],[0,-1],[0,1],[-.7,-.7],[.7,-.7],[-.7,.7],[.7,.7]])parts.push(`${x*w}mm ${y*w}mm 0 ${c}`)}const refl=advanced?.reflection;if(refl?.enabled)parts.push(`0 ${refl.offsetYmm}mm ${Math.max(0,refl.blurMm)}mm ${colorWithOpacity(refl.color,refl.opacity)}`);const grain=advanced?.grain;if(grain?.enabled&&grain.amount>0){const c=colorWithOpacity(grain.color,grain.opacity),a=clamp(grain.amount,0,100)/100,spread=.04+.12*a;for(const [x,y] of [[-.8,-.2],[.65,.15],[-.25,.72],[.3,-.65]])parts.push(`${x*spread}mm ${y*spread}mm 0 ${c}`)}const ls=advanced?.longShadow;if(ls?.enabled){const distance=Math.max(0,ls.distanceMm),steps=Math.max(1,Math.min(12,Math.ceil(distance/.35))),rad=ls.angleDeg*Math.PI/180;for(let i=1;i<=steps;i++){const d=distance*i/steps;parts.push(`${Math.cos(rad)*d}mm ${Math.sin(rad)*d}mm 0 ${colorWithOpacity(ls.color,ls.opacity*(i/steps))}`)}}return parts.length?parts.join(', '):undefined}

function applyTextCase(value:string,mode?:TextDesignElement['style']['textCase']){if(mode==='UPPERCASE')return value.toUpperCase();if(mode==='LOWERCASE')return value.toLowerCase();if(mode==='TITLE')return value.replace(/\b\p{L}/gu,m=>m.toUpperCase());return value}

function resolveTextAutoFitPt(text:string,element:TextDesignElement){const config=element.style.autoFit;if(!config?.enabled)return element.style.fontSizePt;const padding=Math.max(0,element.style.paddingMm??0);const width=Math.max(1,element.size.widthMm-padding*2);const height=Math.max(1,element.size.heightMm-padding*2);const lines=text.split(/\r?\n/);const longest=Math.max(1,...lines.map(line=>line.length));const fontMm=element.style.fontSizePt*25.4/72;const estimatedWidth=longest*fontMm*.56+Math.max(0,longest-1)*(element.style.letterSpacingPt*25.4/72);const estimatedHeight=Math.max(1,lines.length)*fontMm*element.style.lineHeight;const scale=Math.min(1,width/Math.max(.001,estimatedWidth),height/Math.max(.001,estimatedHeight));return Math.max(Math.max(1,config.minFontSizePt||1),element.style.fontSizePt*scale)}
function richTextRunCss(run:TextStyleRunStyle,baseFontSize:number):React.CSSProperties{const baseline=run.baselineShift??'NORMAL';return{fontFamily:run.fontFamily,fontSize:run.fontSizePt?`${run.fontSizePt}pt`:undefined,fontWeight:run.fontWeight,fontStyle:run.italic===true?'italic':run.italic===false?'normal':undefined,textDecoration:[run.underline?'underline':'',run.strikethrough?'line-through':''].filter(Boolean).join(' ')||undefined,color:run.color,WebkitTextFillColor:run.color,verticalAlign:baseline==='SUPERSCRIPT'?'super':baseline==='SUBSCRIPT'?'sub':undefined,lineHeight:baseline==='NORMAL'?undefined:1,fontSizeAdjust:undefined,...(baseline!=='NORMAL'&&!run.fontSizePt?{fontSize:`${Math.max(1,baseFontSize*.68)}pt`}:{})}}
function renderRichTextHtmlSegments(text:string,style:TextDesignElement['style']):React.ReactNode{const segments=buildRichTextSegments(text,style.runs);if(segments.length===1&&!Object.keys(segments[0]?.style??{}).length)return text;return segments.map((segment,index)=><span key={`${segment.start}-${segment.end}-${index}`} style={richTextRunCss(segment.style,style.fontSizePt)}>{segment.text}</span>)}
function renderRichTextSvgSegments(text:string,style:TextDesignElement['style']):React.ReactNode{const segments=buildRichTextSegments(text,style.runs);if(segments.length===1&&!Object.keys(segments[0]?.style??{}).length)return text;return segments.map((segment,index)=>{const run=segment.style,baseline=run.baselineShift??'NORMAL';return <tspan key={`${segment.start}-${segment.end}-${index}`} fontFamily={run.fontFamily} fontSize={run.fontSizePt??(baseline!=='NORMAL'?Math.max(1,style.fontSizePt*.68):undefined)} fontWeight={run.fontWeight} fontStyle={run.italic===true?'italic':run.italic===false?'normal':undefined} textDecoration={[run.underline?'underline':'',run.strikethrough?'line-through':''].filter(Boolean).join(' ')||undefined} fill={run.color} baselineShift={baseline==='SUPERSCRIPT'?'super':baseline==='SUBSCRIPT'?'sub':undefined}>{segment.text}</tspan>})}
function resolveTextPathInfo(element:TextDesignElement,artboard:Artboard):{d:string;transform?:string}{const cfg=element.style.textPath;const reverse=cfg?.reverse===true;if(cfg?.mode==='ARC_UP')return{d:reverse?'M 92 78 Q 50 10 8 78':'M 8 78 Q 50 10 92 78'};if(cfg?.mode==='ARC_DOWN')return{d:reverse?'M 92 22 Q 50 90 8 22':'M 8 22 Q 50 90 92 22'};if(cfg?.mode==='CIRCLE'){const inside=cfg.side==='INSIDE';const r=inside?34:42;return{d:reverse?`M 50 ${50+r} A ${r} ${r} 0 1 0 49.99 ${50+r}`:`M 50 ${50+r} A ${r} ${r} 0 1 1 50.01 ${50+r}`}}if(cfg?.mode==='PATH'&&cfg.pathElementId){const path=artboard.elements.find(item=>item.id===cfg.pathElementId&&item.type==='PATH') as PathDesignElement|undefined;if(path){const pts=path.geometry.points;if(pts.length){const xs=pts.map(pt=>pt.x),ys=pts.map(pt=>pt.y),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys),w=Math.max(.001,maxX-minX),h=Math.max(.001,maxY-minY);const sx=84/w,sy=70/h,scale=Math.min(sx,sy),tx=8-minX*scale+(84-w*scale)/2,ty=15-minY*scale+(70-h*scale)/2;return{d:geometryToSvgPath(path.geometry),transform:`translate(${tx} ${ty}) scale(${reverse?-scale:scale} ${scale})${reverse?` translate(${-w-minX*2} 0)`:''}`}}}}return{d:reverse?'M 92 50 L 8 50':'M 8 50 L 92 50'}}
function textOverlayStops(effect:TextLayerEffect){const gradient=effect.settings.gradient;if(!gradient)return[];const stops=(effect.settings.gradientReverse?[...gradient.stops].reverse().map(stop=>({...stop,offset:100-stop.offset})):gradient.stops).map(stop=>({...stop,opacity:(stop.opacity??1)*(effect.opacity??1)}));return [...stops].sort((a,b)=>a.offset-b.offset)}
function textPatternBackground(effect:TextLayerEffect){const p=effect.settings.pattern;if(!p)return undefined;const opacity=(p.opacity??1)*(effect.opacity??1),fg=colorWithOpacity(p.foreground,opacity),bg=colorWithOpacity(p.background,opacity),scale=Math.max(2,p.scale||8);if(p.kind==='DOT')return{image:`radial-gradient(circle, ${fg} 0 22%, transparent 24%), linear-gradient(${bg},${bg})`,size:`${scale}px ${scale}px, 100% 100%`,position:`${effect.settings.patternOffsetX??0}px ${effect.settings.patternOffsetY??0}px, 0 0`};if(p.kind==='CHECKER')return{image:`conic-gradient(${fg} 25%, ${bg} 0 50%, ${fg} 0 75%, ${bg} 0)`,size:`${scale}px ${scale}px`,position:`${effect.settings.patternOffsetX??0}px ${effect.settings.patternOffsetY??0}px`};return{image:`repeating-linear-gradient(${p.rotationDeg??45}deg, ${fg} 0 1px, ${bg} 1px ${Math.max(2,scale)}px)`,size:'auto',position:`${effect.settings.patternOffsetX??0}px ${effect.settings.patternOffsetY??0}px`}}
function textOverlayCss(style:TextDesignElement['style']):React.CSSProperties|undefined{const overlays=(style.layerEffects??[]).filter(effect=>effect.enabled&&(effect.type==='COLOR_OVERLAY'||effect.type==='GRADIENT_OVERLAY'||effect.type==='PATTERN_OVERLAY'));if(!overlays.length)return undefined;const images:string[]=[],sizes:string[]=[],positions:string[]=[],blends:string[]=[];for(const effect of overlays){if(effect.type==='COLOR_OVERLAY'){const c=colorWithOpacity(effect.settings.color??'#7c3aed',effect.opacity??1);images.push(`linear-gradient(${c},${c})`);sizes.push('100% 100%');positions.push('0 0')}else if(effect.type==='GRADIENT_OVERLAY'&&effect.settings.gradient){const g=effect.settings.gradient,stops=textOverlayStops(effect).map(stop=>`${colorWithOpacity(stop.color,stop.opacity??1)} ${stop.offset}%`).join(','),scale=Math.max(10,effect.settings.gradientScalePct??100);images.push(g.type==='RADIAL'?`radial-gradient(circle at ${g.centerX}% ${g.centerY}%,${stops})`:`linear-gradient(${g.angleDeg}deg,${stops})`);sizes.push(`${scale}% ${scale}%`);positions.push('center center')}else if(effect.type==='PATTERN_OVERLAY'){const b=textPatternBackground(effect);if(b){images.push(b.image);sizes.push(b.size);positions.push(b.position)}}else continue;blends.push(textBlendModeCss(effect.blendMode) as string)}if(!images.length)return undefined;return{color:'transparent',backgroundImage:images.join(','),backgroundSize:sizes.join(','),backgroundPosition:positions.join(','),backgroundRepeat:'repeat',backgroundBlendMode:blends.join(',') as React.CSSProperties['backgroundBlendMode'],backgroundClip:'text',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}
function topTextOverlay(style:TextDesignElement['style']){return [...(style.layerEffects??[])].reverse().find(effect=>effect.enabled&&(effect.type==='COLOR_OVERLAY'||effect.type==='GRADIENT_OVERLAY'||effect.type==='PATTERN_OVERLAY'))}
function textSvgPaint(style:TextDesignElement['style'],id:string):{fill:string;defs:React.ReactNode}{const overlay=topTextOverlay(style);if(overlay?.type==='COLOR_OVERLAY')return{fill:colorWithOpacity(overlay.settings.color??'#7c3aed',overlay.opacity??1),defs:null};if(overlay?.type==='GRADIENT_OVERLAY'&&overlay.settings.gradient){const g=overlay.settings.gradient,stops=textOverlayStops(overlay);if(g.type==='LINEAR'){const gid=`text-linear-${id}`;return{fill:`url(#${gid})`,defs:<linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="0%" gradientTransform={`rotate(${g.angleDeg} .5 .5)`}>{stops.map((stop,index)=><stop key={index} offset={`${stop.offset}%`} stopColor={stop.color} stopOpacity={stop.opacity??1}/>)}</linearGradient>}}const gid=`text-radial-${id}`;return{fill:`url(#${gid})`,defs:<radialGradient id={gid} cx={`${g.centerX}%`} cy={`${g.centerY}%`} r={`${g.radius}%`}>{stops.map((stop,index)=><stop key={index} offset={`${stop.offset}%`} stopColor={stop.color} stopOpacity={stop.opacity??1}/>)}</radialGradient>}}if(overlay?.type==='PATTERN_OVERLAY'&&overlay.settings.pattern){const p=overlay.settings.pattern,gid=`text-pattern-${id}`,opacity=(p.opacity??1)*(overlay.opacity??1),scale=Math.max(2,p.scale||8),fg=colorWithOpacity(p.foreground,opacity),bg=colorWithOpacity(p.background,opacity);return{fill:`url(#${gid})`,defs:<pattern id={gid} patternUnits="userSpaceOnUse" width={scale} height={scale} patternTransform={`rotate(${p.rotationDeg??0}) translate(${overlay.settings.patternOffsetX??0} ${overlay.settings.patternOffsetY??0})`}><rect width={scale} height={scale} fill={bg}/>{p.kind==='DOT'?<circle cx={scale/2} cy={scale/2} r={Math.max(.5,scale*.22)} fill={fg}/>:p.kind==='CHECKER'?<><rect width={scale/2} height={scale/2} fill={fg}/><rect x={scale/2} y={scale/2} width={scale/2} height={scale/2} fill={fg}/></>:<path d={`M 0 ${scale} L ${scale} 0`} stroke={fg} strokeWidth={1}/>}</pattern>}}const fill=style.fill;if(fill?.type==='LINEAR_GRADIENT'){const gid=`text-linear-${id}`;return{fill:`url(#${gid})`,defs:<linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="0%" gradientTransform={`rotate(${fill.gradient.angleDeg} .5 .5)`}>{fill.gradient.stops.map((stop,index)=><stop key={index} offset={`${stop.offset}%`} stopColor={stop.color} stopOpacity={stop.opacity??1}/>)}</linearGradient>}}if(fill?.type==='RADIAL_GRADIENT'){const gid=`text-radial-${id}`;return{fill:`url(#${gid})`,defs:<radialGradient id={gid} cx={`${fill.gradient.centerX}%`} cy={`${fill.gradient.centerY}%`} r={`${fill.gradient.radius}%`}>{fill.gradient.stops.map((stop,index)=><stop key={index} offset={`${stop.offset}%`} stopColor={stop.color} stopOpacity={stop.opacity??1}/>)}</radialGradient>}}return{fill:fill?.type==='SOLID'?colorWithOpacity(fill.color,fill.opacity??1):style.color,defs:null}}
function textSvgFilter(shadow?:DesignShadow,glow?:TextDesignElement['style']['glow'],advanced?:TextDesignElement['style']['advancedEffects'],layerEffects?:TextLayerEffect[]){const value=[textEffectShadowCss(shadow,glow,advanced),textLayerEffectsShadowCss(layerEffects)].filter(Boolean).join(', ');return value?`drop-shadow(${value.split(',')[0]})`:undefined}
function textPaintStyle(style:TextDesignElement['style']):{color:string;backgroundStyle:React.CSSProperties}{const overlay=textOverlayCss(style);if(overlay)return{color:'transparent',backgroundStyle:overlay};const fill=style.fill;if(!fill||fill.type==='SOLID')return{color:fill?.type==='SOLID'?colorWithOpacity(fill.color,fill.opacity??1):style.color,backgroundStyle:{}};if(fill.type==='LINEAR_GRADIENT'){const stops=fill.gradient.stops.map(stop=>`${colorWithOpacity(stop.color,stop.opacity??1)} ${stop.offset}%`).join(',');return{color:'transparent',backgroundStyle:{backgroundImage:`linear-gradient(${fill.gradient.angleDeg}deg,${stops})`,backgroundClip:'text',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}}if(fill.type==='RADIAL_GRADIENT'){const stops=fill.gradient.stops.map(stop=>`${colorWithOpacity(stop.color,stop.opacity??1)} ${stop.offset}%`).join(',');return{color:'transparent',backgroundStyle:{backgroundImage:`radial-gradient(circle at ${fill.gradient.centerX}% ${fill.gradient.centerY}%,${stops})`,backgroundClip:'text',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}}return{color:style.color,backgroundStyle:{}}}
function textStrokeStyle(stroke?:TextDesignElement['style']['stroke']):React.CSSProperties{if(!stroke||stroke.widthMm<=0)return{};const width=Math.max(.25,stroke.widthMm*MM_TO_CSS_PX);const color=colorWithOpacity(stroke.color,stroke.opacity??1);return{WebkitTextStroke:`${width}px ${color}`}}
function textBlendModeCss(mode?:TextLayerEffect['blendMode']):React.CSSProperties['mixBlendMode']{if(mode==='MULTIPLY')return'multiply';if(mode==='SCREEN')return'screen';if(mode==='OVERLAY')return'overlay';if(mode==='SOFT_LIGHT')return'soft-light';return'normal'}
function activeTextLayerStrokes(effects?:TextLayerEffect[]){return (effects??[]).filter(effect=>effect.enabled&&effect.type==='STROKE'&&(effect.settings.widthMm??0)>0)}
function hasLayerStroke(style:TextDesignElement['style']){return activeTextLayerStrokes(style.layerEffects).length>0}
function effectiveStrokeWidthMm(effect:TextLayerEffect){const width=Math.max(0,effect.settings.widthMm??0);return effect.settings.position==='OUTSIDE'?width*2:effect.settings.position==='INSIDE'?Math.max(.01,width*.8):width}
function textHtmlStrokeLayers(effects?:TextLayerEffect[]){return activeTextLayerStrokes(effects).map((effect,index)=>({id:effect.id,widthPx:Math.max(.25,effectiveStrokeWidthMm(effect)*MM_TO_CSS_PX),color:effect.settings.color??'#111827',opacity:effect.opacity??1,blendMode:effect.blendMode,zIndex:index}))}
function textPathStrokeLayers(style:TextDesignElement['style'],widthMm:number){return activeTextLayerStrokes(style.layerEffects).map((effect,index)=>({id:effect.id,width:Math.max(.2,effectiveStrokeWidthMm(effect)*100/Math.max(1,widthMm)),color:effect.settings.color??'#111827',opacity:effect.opacity??1,index}))}
function textPathStrokeColor(style:TextDesignElement['style']){const stack=[...(style.layerEffects??[])].reverse().find(effect=>effect.enabled&&effect.type==='STROKE'&&(effect.settings.widthMm??0)>0);if(stack)return colorWithOpacity(stack.settings.color??'#111827',stack.opacity??1);return style.stroke&&style.stroke.widthMm>0?style.stroke.color:undefined}
function textPathStrokeWidth(style:TextDesignElement['style'],widthMm:number){const stack=[...(style.layerEffects??[])].reverse().find(effect=>effect.enabled&&effect.type==='STROKE'&&(effect.settings.widthMm??0)>0),w=stack?.settings.widthMm??style.stroke?.widthMm??0;return w>0?Math.max(.2,w*100/Math.max(1,widthMm)):undefined}
function textLayerEffectsShadowCss(effects?:TextLayerEffect[]){const parts:string[]=[];for(const effect of effects??[]){if(!effect.enabled)continue;const opacity=effect.opacity??1,s=effect.settings;if(effect.type==='DROP_SHADOW')parts.push(`${s.offsetXmm??.5}mm ${s.offsetYmm??.5}mm ${Math.max(0,s.blurMm??.6)}mm ${colorWithOpacity(s.color??'#111827',opacity)}`);else if(effect.type==='OUTER_GLOW'){const c=colorWithOpacity(s.color??'#60a5fa',opacity),b=Math.max(0,s.blurMm??1.5);parts.push(`0 0 ${b}mm ${c}`);parts.push(`0 0 ${Math.max(.02,b*.45)}mm ${c}`)}else if(effect.type==='INNER_SHADOW'){const c=colorWithOpacity(s.color??'#111827',opacity),x=s.offsetXmm??.2,y=s.offsetYmm??.2,b=Math.max(0,s.blurMm??.4);parts.push(`${x}mm ${y}mm ${b}mm ${c}`);parts.push(`${-x*.4}mm ${-y*.4}mm ${Math.max(.02,b*.6)}mm ${c}`)}else if(effect.type==='INNER_GLOW'){const c=colorWithOpacity(s.color??'#ffffff',opacity),b=Math.max(0,s.blurMm??.8);parts.push(`0 0 ${Math.max(.02,b*.35)}mm ${c}`);parts.push(`0 0 ${Math.max(.02,b*.7)}mm ${colorWithOpacity(s.color??'#ffffff',opacity*.55)}`)}else if(effect.type==='BEVEL_EMBOSS'){const d=Math.max(.05,s.depthMm??.35),dir=s.direction==='DOWN'?-1:1;parts.push(`${-d*dir}mm ${-d*dir}mm ${Math.max(.02,s.softenMm??.1)}mm ${colorWithOpacity(s.highlightColor??'#ffffff',opacity)}`);parts.push(`${d*dir}mm ${d*dir}mm ${Math.max(.02,s.softenMm??.1)}mm ${colorWithOpacity(s.shadowColor??'#111827',opacity)}`)}}return parts.length?parts.join(', '):undefined}

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

const clamp=(v:number,min:number,max:number)=>Math.min(max,Math.max(min,v));const sizeText=(a:Artboard)=>a.displayUnit==='IN'?`${normalizeDisplayValue(mmToUnit(a.widthMm,'IN'))} × ${normalizeDisplayValue(mmToUnit(a.heightMm,'IN'))} in`:`${normalizeDisplayValue(a.widthMm)} × ${normalizeDisplayValue(a.heightMm)} mm`;const isForm=(t:EventTarget|null)=>t instanceof HTMLInputElement||t instanceof HTMLTextAreaElement||t instanceof HTMLSelectElement||t instanceof HTMLButtonElement;const shapeLabel=(s:DesignShapeKind)=>s.toLowerCase().split('_').map(p=>p.charAt(0).toUpperCase()+p.slice(1)).join(' ');const strokeStyle=(s:DesignStroke['style'])=>s==='DASHED'||s==='CUSTOM'?'dashed':s==='DOTTED'?'dotted':'solid';
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
