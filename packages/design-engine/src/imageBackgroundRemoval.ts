export type BackgroundRemovalMode = 'AUTO' | 'COLOR';

export interface BackgroundRemovalColor { r:number; g:number; b:number; }

export interface BackgroundRemovalSettings {
  mode: BackgroundRemovalMode;
  tolerance: number; // 0..100
  backgroundColor?: BackgroundRemovalColor;
}

export interface RgbaImageDataLike {
  width:number;
  height:number;
  data:Uint8ClampedArray;
}

export interface BackgroundRemovalResult {
  image:RgbaImageDataLike;
  backgroundColor:BackgroundRemovalColor;
  removedPixels:number;
  totalPixels:number;
}

const clamp=(value:number,min:number,max:number)=>Math.min(max,Math.max(min,value));
const colorDistance=(r:number,g:number,b:number,c:BackgroundRemovalColor)=>Math.hypot(r-c.r,g-c.g,b-c.b);

function dominantBorderColor(image:RgbaImageDataLike):BackgroundRemovalColor {
  const {width,height,data}=image;
  if(width<=0||height<=0)return {r:255,g:255,b:255};
  const buckets=new Map<string,{count:number,r:number,g:number,b:number}>();
  const add=(x:number,y:number)=>{
    const i=(y*width+x)*4;
    if((data[i+3]??0)===0)return;
    const r=data[i]??0,g=data[i+1]??0,b=data[i+2]??0;
    const key=`${Math.round(r/16)}:${Math.round(g/16)}:${Math.round(b/16)}`;
    const bucket=buckets.get(key)??{count:0,r:0,g:0,b:0};
    bucket.count++;bucket.r+=r;bucket.g+=g;bucket.b+=b;buckets.set(key,bucket);
  };
  for(let x=0;x<width;x++){add(x,0);if(height>1)add(x,height-1);}
  for(let y=1;y<height-1;y++){add(0,y);if(width>1)add(width-1,y);}
  const best=[...buckets.values()].sort((a,b)=>b.count-a.count)[0];
  if(!best)return {r:255,g:255,b:255};
  return {r:Math.round(best.r/best.count),g:Math.round(best.g/best.count),b:Math.round(best.b/best.count)};
}

export function resolveBackgroundRemovalColor(image:RgbaImageDataLike,settings:BackgroundRemovalSettings):BackgroundRemovalColor {
  if(settings.mode==='COLOR'&&settings.backgroundColor)return {
    r:clamp(Math.round(settings.backgroundColor.r),0,255),
    g:clamp(Math.round(settings.backgroundColor.g),0,255),
    b:clamp(Math.round(settings.backgroundColor.b),0,255),
  };
  return dominantBorderColor(image);
}

/**
 * Removes only pixels connected to an outer image edge. This intentionally preserves
 * matching colors inside the foreground (for example white petals on a white backdrop).
 */
export function removeConnectedImageBackground(image:RgbaImageDataLike,settings:BackgroundRemovalSettings):BackgroundRemovalResult {
  const {width,height}=image;
  const source=image.data;
  const out=new Uint8ClampedArray(source);
  if(width<=0||height<=0||source.length<width*height*4){
    return {image:{width,height,data:out},backgroundColor:{r:255,g:255,b:255},removedPixels:0,totalPixels:Math.max(0,width*height)};
  }
  const backgroundColor=resolveBackgroundRemovalColor(image,settings);
  const tolerance=clamp(Number.isFinite(settings.tolerance)?settings.tolerance:28,0,100);
  const threshold=(tolerance/100)*441.67295593;
  const visited=new Uint8Array(width*height);
  const queue=new Int32Array(width*height);
  let head=0,tail=0,removed=0;
  let opaquePixels=0;
  for(let pixel=0;pixel<width*height;pixel++)if((source[pixel*4+3]??0)>0)opaquePixels++;
  const matches=(pixel:number)=>{
    const i=pixel*4;
    const alpha=source[i+3]??0;
    if(alpha===0)return true;
    return colorDistance(source[i]??0,source[i+1]??0,source[i+2]??0,backgroundColor)<=threshold;
  };
  const enqueue=(pixel:number)=>{if(visited[pixel]||!matches(pixel))return;visited[pixel]=1;queue[tail++]=pixel;};
  for(let x=0;x<width;x++){enqueue(x);if(height>1)enqueue((height-1)*width+x);}
  for(let y=1;y<height-1;y++){enqueue(y*width);if(width>1)enqueue(y*width+width-1);}
  while(head<tail){
    const pixel=queue[head++]!;
    const x=pixel%width,y=Math.floor(pixel/width),i=pixel*4;
    if((out[i+3]??0)!==0){out[i+3]=0;removed++;}
    if(x>0)enqueue(pixel-1);
    if(x+1<width)enqueue(pixel+1);
    if(y>0)enqueue(pixel-width);
    if(y+1<height)enqueue(pixel+width);
  }
  // Safety guard for AUTO mode: a nearly uniform/no-background image should not be destroyed.
  if(settings.mode==='AUTO'&&opaquePixels>0&&removed/opaquePixels>=0.985){
    return {image:{width,height,data:new Uint8ClampedArray(source)},backgroundColor,removedPixels:0,totalPixels:width*height};
  }
  return {image:{width,height,data:out},backgroundColor,removedPixels:removed,totalPixels:width*height};
}

import type { AssetReference, DesignTemplate } from '@document-tool/contracts';

export function createBackgroundRemovedAsset(
  sourceAsset:AssetReference,
  resultSource:string,
  settings:BackgroundRemovalSettings,
  id:string,
  appliedAt=new Date().toISOString(),
):AssetReference {
  const originalAssetId=typeof sourceAsset.metadata?.backgroundRemovalOriginalAssetId==='string'
    ? sourceAsset.metadata.backgroundRemovalOriginalAssetId
    : sourceAsset.id;
  return {
    id,
    name:`${sourceAsset.name} · Background Removed`,
    kind:'IMAGE',
    sourceType:'DATA_URL',
    source:resultSource,
    mimeType:'image/png',
    widthPx:sourceAsset.widthPx,
    heightPx:sourceAsset.heightPx,
    metadata:{
      ...sourceAsset.metadata,
      backgroundRemovalDerived:true,
      backgroundRemovalOriginalAssetId:originalAssetId,
      backgroundRemovalSourceAssetId:sourceAsset.id,
      backgroundRemovalSettings:{...settings},
      backgroundRemovalAppliedAt:appliedAt,
    },
  };
}

export function applyBackgroundRemovedAssetToImage(template:DesignTemplate,artboardId:string,elementId:string,derivedAsset:AssetReference):DesignTemplate {
  const sharedAssets=template.sharedAssets.some(asset=>asset.id===derivedAsset.id)
    ? template.sharedAssets.map(asset=>asset.id===derivedAsset.id?derivedAsset:asset)
    : [...template.sharedAssets,derivedAsset];
  return {...template,sharedAssets,artboards:template.artboards.map(artboard=>artboard.id!==artboardId?artboard:{...artboard,elements:artboard.elements.map(element=>element.id===elementId&&element.type==='IMAGE'?{...element,assetId:derivedAsset.id}:element)})};
}

export function resetImageBackgroundRemoval(template:DesignTemplate,artboardId:string,elementId:string):DesignTemplate {
  const artboard=template.artboards.find(item=>item.id===artboardId);
  const element=artboard?.elements.find(item=>item.id===elementId);
  if(!element||element.type!=='IMAGE')return template;
  const asset=template.sharedAssets.find(item=>item.id===element.assetId);
  const originalAssetId=typeof asset?.metadata?.backgroundRemovalOriginalAssetId==='string'?asset.metadata.backgroundRemovalOriginalAssetId:null;
  if(!originalAssetId||!template.sharedAssets.some(item=>item.id===originalAssetId))return template;
  return {...template,artboards:template.artboards.map(item=>item.id!==artboardId?item:{...item,elements:item.elements.map(candidate=>candidate.id===elementId&&candidate.type==='IMAGE'?{...candidate,assetId:originalAssetId}:candidate)})};
}
