import {bleedExpandedDimensions,calculateEffectiveRasterDpi,createBlankArtboard,imagePrintQuality,requiredPixels,resolveCardRenderModel,resolvePrintSettings,validateArtboardPrint,validateDesignPrint} from '../packages/design-engine/dist/index.js';

const print={...resolvePrintSettings(),cropMarksEnabledForExport:true,showCropMarksInEditor:false};
const expanded=bleedExpandedDimensions(90,50,print.bleed);
if(expanded.widthMm!==96||expanded.heightMm!==56||requiredPixels(90,300)!==1063||requiredPixels(50,300)!==591)throw new Error('Print math failed.');
const raster={id:'raster',name:'Raster',kind:'IMAGE',sourceType:'DATA_URL',source:'data:image/png;base64,AA==',mimeType:'image/png',widthPx:1200,heightPx:800};
const vector={id:'vector',name:'Vector',kind:'SVG',sourceType:'DATA_URL',source:'data:image/svg+xml,%3Csvg%2F%3E',mimeType:'image/svg+xml'};
const image={id:'image',type:'IMAGE',name:'Image',assetId:'raster',fit:'FIT',position:{xMm:5,yMm:5},size:{widthMm:50,heightMm:30},rotationDeg:0,opacity:1,visible:true,locked:false,zIndex:0};
const vectorElement={id:'svg',type:'SVG',name:'SVG',assetId:'vector',preserveVector:true,position:{xMm:60,yMm:5},size:{widthMm:20,heightMm:20},rotationDeg:0,opacity:1,visible:true,locked:false,zIndex:1};
const board={...createBlankArtboard({id:'front',name:'Front',order:0,widthMm:90,heightMm:50}),print,elements:[image,vectorElement]};
const template={kind:'CARD_DESIGN',schemaVersion:1,id:'template',name:'Print',version:1,status:'DRAFT',artboards:[board],sharedAssets:[raster,vector]};
if(calculateEffectiveRasterDpi(1200,800,50,30).status!=='GOOD')throw new Error('Raster DPI failed.');
if(imagePrintQuality({...image,assetId:'vector'},vector,print).status!=='VECTOR')throw new Error('Vector quality failed.');
if(validateArtboardPrint(board,[raster,vector]).errors!==0||validateDesignPrint(template).artboards.length!==1)throw new Error('Preflight failed.');
const model=resolveCardRenderModel(template).model;
if(!model||model.artboards[0].print.cropMarksEnabledForExport!==true||model.artboards[0].print.showCropMarksInEditor!==false||model.artboards[0].elements[1].content.assetRenderKind!=='VECTOR_SVG')throw new Error('Resolved print policy failed.');
console.log('Phase 6.3 Print Readiness smoke PASS');
