import { removeConnectedImageBackground, type BackgroundRemovalColor, type BackgroundRemovalSettings } from '@document-tool/design-engine';

export interface BrowserBackgroundRemovalResult {
  dataUrl:string;
  widthPx:number;
  heightPx:number;
  backgroundColor:BackgroundRemovalColor;
  removedPixels:number;
  totalPixels:number;
}

function loadImage(source:string):Promise<HTMLImageElement>{
  return new Promise((resolve,reject)=>{
    const image=new Image();
    image.onload=()=>resolve(image);
    image.onerror=()=>reject(new Error('Unable to decode this image.'));
    image.src=source;
  });
}

export async function processImageBackground(source:string,settings:BackgroundRemovalSettings):Promise<BrowserBackgroundRemovalResult>{
  const image=await loadImage(source);
  const width=image.naturalWidth||image.width,height=image.naturalHeight||image.height;
  if(!width||!height)throw new Error('Image dimensions are unavailable.');
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
  const context=canvas.getContext('2d',{willReadFrequently:true});
  if(!context)throw new Error('Image processing canvas is unavailable.');
  context.clearRect(0,0,width,height);context.drawImage(image,0,0,width,height);
  let pixels:ImageData;
  try{pixels=context.getImageData(0,0,width,height);}catch{throw new Error('This image source cannot be processed locally.');}
  const result=removeConnectedImageBackground({width,height,data:pixels.data},settings);
  context.putImageData(new ImageData(result.image.data,width,height),0,0);
  return {dataUrl:canvas.toDataURL('image/png'),widthPx:width,heightPx:height,backgroundColor:result.backgroundColor,removedPixels:result.removedPixels,totalPixels:result.totalPixels};
}

export async function sampleImageColor(source:string,normalizedX:number,normalizedY:number):Promise<BackgroundRemovalColor>{
  const image=await loadImage(source);const width=image.naturalWidth||image.width,height=image.naturalHeight||image.height;
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const context=canvas.getContext('2d',{willReadFrequently:true});
  if(!context)throw new Error('Image processing canvas is unavailable.');
  context.drawImage(image,0,0,width,height);
  const x=Math.min(width-1,Math.max(0,Math.floor(normalizedX*width))),y=Math.min(height-1,Math.max(0,Math.floor(normalizedY*height)));
  const p=context.getImageData(x,y,1,1).data;return {r:p[0]??0,g:p[1]??0,b:p[2]??0};
}
