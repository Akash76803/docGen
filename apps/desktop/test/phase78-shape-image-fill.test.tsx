import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Artboard, AssetReference, ShapeDesignElement } from '@document-tool/contracts';
import { IsolatedCardExportCanvas } from '../src/pages/CardExportCanvas';

const asset:AssetReference={id:'photo',name:'Photo',kind:'IMAGE',sourceType:'DATA_URL',source:'data:image/png;base64,AAAA',mimeType:'image/png'};
const shape:ShapeDesignElement={id:'star',type:'SHAPE',name:'Star',shape:'STAR',position:{xMm:5,yMm:5},size:{widthMm:30,heightMm:30},rotationDeg:0,opacity:1,visible:true,locked:false,zIndex:1,fill:{type:'IMAGE',assetId:'photo',fit:'FILL',opacity:.8},stroke:{style:'SOLID',color:'#000000',widthMm:.5}};
const artboard:Artboard={id:'front',name:'Front',order:0,widthMm:90,heightMm:50,displayUnit:'MM',background:{type:'SOLID',color:'#ffffff'},elements:[shape],guides:[],groups:[],print:{bleed:{topMm:0,rightMm:0,bottomMm:0,leftMm:0},safeArea:{topMm:0,rightMm:0,bottomMm:0,leftMm:0}}};

describe('Phase 7.8 shape image fill',()=>{
 it('clips an exported image pattern to the selected shape geometry',()=>{
  const html=renderToStaticMarkup(<IsolatedCardExportCanvas artboard={artboard} assets={[asset]}/>);
  expect(html).toContain('<pattern');
  expect(html).toContain('href="data:image/png;base64,AAAA"');
  expect(html).toContain('preserveAspectRatio="xMidYMid slice"');
  expect(html).toContain('fill="url(#star-image-fill)"');
 });
 it('exposes image fill upload, asset selection, and all fit modes in the inspector',()=>{
  const source=readFileSync(resolve(process.cwd(),'apps/desktop/src/pages/CardDesigner.tsx'),'utf8');
  expect(source).toContain('data-shape-image-fill-controls');
  expect(source).toContain('Upload shape fill image');
  expect(source).toContain('<option value="FIT">Fit</option>');
  expect(source).toContain('<option value="FILL">Fill / Crop</option>');
  expect(source).toContain('<option value="STRETCH">Stretch</option>');
 });
});
