import html2canvasModule, { type Options as Html2CanvasOptions } from 'html2canvas';
import type { ResolvedExportDocument } from '@document-tool/renderer-sdk';
import type { PhysicalPageRasterizer, PngDpi, RasterPage } from './png-renderer.js';

export type ExactPageProvider=(document:ResolvedExportDocument)=>Promise<readonly HTMLElement[]>|readonly HTMLElement[];
const html2canvas=((html2canvasModule as unknown as {default?:unknown}).default??html2canvasModule) as unknown as (element:HTMLElement,options?:Partial<Html2CanvasOptions>)=>Promise<HTMLCanvasElement>;

/**
 * Rasterizes the isolated physical Exact page directly from DOM. SVG
 * foreignObject serialization is deliberately avoided because WebView2 marks
 * those canvases as cross-origin/tainted even after resources are inlined.
 */
export class BrowserExactPageRasterizer implements PhysicalPageRasterizer {
  constructor(private readonly pages:ExactPageProvider,private readonly transparentBackground:(document:ResolvedExportDocument)=>boolean=()=>false){}
  async getPageCount(document:ResolvedExportDocument):Promise<number>{return(await this.pages(document)).length;}
  async rasterizePage(document:ResolvedExportDocument,pageIndex:number,width:number,height:number,dpi:PngDpi):Promise<RasterPage>{
    const nodes=await this.pages(document);const node=nodes[pageIndex];if(!node)throw new Error(`Exact page ${pageIndex+1} is unavailable.`);
    await decodeImages(node);
    const token=`export-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    node.dataset.rasterCaptureToken=token;
    try{
      const captured=await html2canvas(node,{
        backgroundColor:null,
        scale:dpi/96,
        useCORS:true,
        allowTaint:false,
        logging:false,
        imageTimeout:15000,
        foreignObjectRendering:false,
        removeContainer:true,
        onclone:(clonedDocument:Document)=>{
          const clone=clonedDocument.querySelector<HTMLElement>(`[data-raster-capture-token="${token}"]`);
          if(!clone)return;
          clone.style.transform='none';clone.style.zoom='1';clone.style.boxShadow='none';clone.style.margin='0';
          if(this.transparentBackground(document)){clone.style.setProperty('background','transparent','important');clone.style.setProperty('--page-bg','transparent');}
        },
      });
      // Normalize browser sub-pixel rounding to the physical dimensions already
      // calculated from millimetres and DPI by the shared fidelity contract.
      const output=node.ownerDocument.createElement('canvas');output.width=width;output.height=height;
      const context=output.getContext('2d',{alpha:true,willReadFrequently:true});if(!context)throw new Error('Canvas 2D is unavailable.');
      context.drawImage(captured,0,0,width,height);
      const data=context.getImageData(0,0,width,height);
      return{width,height,rgba:new Uint8Array(data.data.buffer.slice(0))};
    }finally{delete node.dataset.rasterCaptureToken;}
  }
}

async function decodeImages(root:HTMLElement):Promise<void>{await Promise.all(Array.from(root.querySelectorAll('img')).map(async image=>{try{if(typeof image.decode==='function')await image.decode();}catch{/* html2canvas skips unsafe/unavailable resources */}}));}
