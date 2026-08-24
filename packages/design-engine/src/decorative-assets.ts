import type { AssetReference } from '@document-tool/contracts';

export type DecorativeAssetId =
  | 'floral-corner-rose'
  | 'floral-corner-leaf'
  | 'floral-divider'
  | 'floral-wreath'
  | 'botanical-branch'
  | 'ornamental-frame'
  | 'mandala-bloom'
  | 'vine-strip'
  | 'minimal-flower'
  | 'premium-corner';

export interface DecorativeAssetDefinition {
  id: DecorativeAssetId;
  name: string;
  category: 'Floral'|'Frame'|'Ornament';
  source: string;
  defaultWidthMm: number;
  defaultHeightMm: number;
}

const svgData=(body:string,viewBox='0 0 200 200')=>`data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`)}`;

export const DECORATIVE_ASSETS: readonly DecorativeAssetDefinition[] = [
  {id:'floral-corner-rose',name:'Rose Floral Corner',category:'Floral',defaultWidthMm:28,defaultHeightMm:28,source:svgData('<path d="M12 188C28 126 70 76 132 42"/><path d="M40 148c-26-3-34-26-24-44 24 2 38 19 24 44Z"/><path d="M76 103c-25-9-26-34-10-49 22 8 31 30 10 49Z"/><path d="M118 57c-5-26 15-42 35-36 7 23-7 42-35 36Z"/><path d="M142 39c8-24 35-28 50-10-7 23-28 31-50 10Z"/><circle cx="134" cy="45" r="14"/><path d="M128 45c8-10 18-8 20 1-7 8-15 10-20-1Z"/>')},
  {id:'floral-corner-leaf',name:'Leaf Corner',category:'Floral',defaultWidthMm:30,defaultHeightMm:30,source:svgData('<path d="M8 192C42 132 92 78 190 8"/><path d="M42 147c-28 3-38-18-31-37 25-2 42 13 31 37Z"/><path d="M75 111c-25-2-34-23-24-41 24 1 38 18 24 41Z"/><path d="M111 77c-21-8-24-29-11-45 22 5 32 23 11 45Z"/><path d="M146 43c-12-17-4-36 14-43 17 14 15 32-14 43Z"/>')},
  {id:'floral-divider',name:'Floral Divider',category:'Floral',defaultWidthMm:55,defaultHeightMm:10,source:svgData('<path d="M6 100h58m72 0h58"/><path d="M72 100c12-26 44-26 56 0-12 26-44 26-56 0Z"/><path d="M83 94c-12-14-8-31 7-39 16 10 16 26-7 39Z"/><path d="M117 94c12-14 8-31-7-39-16 10-16 26 7 39Z"/><circle cx="100" cy="100" r="8"/>')},
  {id:'floral-wreath',name:'Botanical Wreath',category:'Floral',defaultWidthMm:42,defaultHeightMm:42,source:svgData('<circle cx="100" cy="100" r="62"/><path d="M44 118c-25-2-32-21-22-36 21 0 34 13 22 36Zm22-54c-20-12-17-31-3-42 18 9 22 25 3 42Zm90 54c25-2 32-21 22-36-21 0-34 13-22 36Zm-22-54c20-12 17-31 3-42-18 9-22 25-3 42Z"/>')},
  {id:'botanical-branch',name:'Botanical Branch',category:'Floral',defaultWidthMm:45,defaultHeightMm:18,source:svgData('<path d="M10 148C58 122 105 82 190 42"/><path d="M54 124c-21 4-31-10-27-25 19-4 32 7 27 25Zm28-22c-13-16-5-31 10-36 14 13 11 27-10 36Zm36-23c-15-14-9-30 6-36 15 12 13 27-6 36Zm34-18c-12-15-4-29 10-34 14 12 10 26-10 34Z"/>')},
  {id:'ornamental-frame',name:'Ornamental Frame',category:'Frame',defaultWidthMm:70,defaultHeightMm:45,source:svgData('<rect x="12" y="12" width="176" height="176" rx="6"/><rect x="24" y="24" width="152" height="152" rx="4"/><path d="M12 58c28 0 46-18 46-46M188 58c-28 0-46-18-46-46M12 142c28 0 46 18 46 46M188 142c-28 0-46 18-46 46"/>')},
  {id:'mandala-bloom',name:'Mandala Bloom',category:'Ornament',defaultWidthMm:32,defaultHeightMm:32,source:svgData('<circle cx="100" cy="100" r="18"/><path d="M100 16c18 26 18 42 0 66-18-24-18-40 0-66Zm0 168c18-26 18-42 0-66-18 24-18 40 0 66ZM16 100c26-18 42-18 66 0-24 18-40 18-66 0Zm168 0c-26-18-42-18-66 0 24 18 40 18 66 0Z"/><path d="M40 40c30 6 41 17 42 42-25-1-36-12-42-42Zm120 0c-30 6-41 17-42 42 25-1 36-12 42-42ZM40 160c30-6 41-17 42-42-25 1-36 12-42 42Zm120 0c-30-6-41-17-42-42 25 1 36 12 42 42Z"/>')},
  {id:'vine-strip',name:'Decorative Vine',category:'Floral',defaultWidthMm:60,defaultHeightMm:14,source:svgData('<path d="M6 105c38-52 76 48 112 0s55-36 76-8"/><path d="M43 83c-14-11-10-26 3-33 14 10 14 23-3 33Zm45 28c-14 11-10 26 3 33 14-10 14-23-3-33Zm49-25c-14-11-10-26 3-33 14 10 14 23-3 33Z"/>')},
  {id:'minimal-flower',name:'Minimal Flower',category:'Floral',defaultWidthMm:18,defaultHeightMm:18,source:svgData('<circle cx="100" cy="100" r="11"/><path d="M100 28c28 8 35 31 14 55-22-5-30-28-14-55Zm0 144c28-8 35-31 14-55-22 5-30 28-14 55ZM28 100c8-28 31-35 55-14-5 22-28 30-55 14Zm144 0c-8-28-31-35-55-14 5 22 28 30 55 14Z"/>')},
  {id:'premium-corner',name:'Premium Ornamental Corner',category:'Ornament',defaultWidthMm:25,defaultHeightMm:25,source:svgData('<path d="M8 192V92C8 46 46 8 92 8h100"/><path d="M26 174v-70c0-44 34-78 78-78h70"/><path d="M18 77c28 0 59-31 59-59M43 93c26-4 46-24 50-50"/><circle cx="31" cy="31" r="8"/>')},
] as const;

export function decorativeAssetReference(def:DecorativeAssetDefinition, id=def.id):AssetReference {
  return {id,name:def.name,kind:def.category==='Frame'?'FRAME':'DECORATION',sourceType:'EMBEDDED',source:def.source,mimeType:'image/svg+xml',metadata:{builtIn:true,category:def.category,decorativeAssetId:def.id}};
}
