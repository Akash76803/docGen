import { CombinedPdfError, CombinedPdfRenderer, PdfRenderer } from '@document-tool/renderer-pdf';
import fs from 'node:fs';
import path from 'node:path';

const layout={widthPercent:100,alignment:'LEFT',marginTop:0,marginRight:0,marginBottom:1,marginLeft:0,keepTogether:false,breakBefore:false,breakAfter:false};
const text={fontFamily:'Arial',fontSize:9,bold:false,italic:false,underline:false,textColor:'#000000',backgroundColor:'#FFFFFF',alignment:'LEFT',lineHeight:1.2};
const page={size:'A4',orientation:'PORTRAIT',margins:{top:12,right:12,bottom:12,left:12},pagination:{repeatHeader:true,repeatFooter:true,showPageNumbers:true,pageNumberPosition:'BOTTOM_CENTER',footerMode:'REPEAT_PAGE'}};
const onePixelJpeg='data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAH/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAEFAqf/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAEDAQE/Aaf/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAECAQE/Aaf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAY/Aqf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAE/IX//2gAMAwEAAgADAAAAEP/EABQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQMBAT8QH//EABQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQIBAT8QH//EABQQAQAAAAAAAAAAAAAAAAAAABD/2gAIAQEAAT8QH//Z';

function fixture(id,label,rows=0,pageDef=page,{image=false,lastPageFooter=false}={}){
 const pd=lastPageFooter?{...pageDef,pagination:{...pageDef.pagination,footerMode:'LAST_PAGE_ONLY',repeatFooter:false}}:pageDef;
 const header=[{id:'h-'+id,type:'TEXT',text:'HEADER '+label,style:text,layout}];
 if(image) header.push({id:'img-'+id,type:'IMAGE',sourceType:'DATA_URL',source:onePixelJpeg,altText:'logo',width:8,height:8,maintainAspectRatio:true,alignment:'LEFT',layout});
 const body=[{id:'body-'+id,type:'TEXT',text:'BODY '+label,style:text,layout}];
 if(rows) body.push({id:'table-'+id,type:'TABLE',showHeader:true,showBorder:true,columns:[{id:'d',label:'Description',path:'d',widthPercent:70,alignment:'LEFT',headerAlignment:'LEFT',headerStyle:text,cellStyle:text},{id:'a',label:'Amount',path:'a',widthPercent:30,alignment:'RIGHT',headerAlignment:'RIGHT',headerStyle:text,cellStyle:text}],rows:Array.from({length:rows},(_,i)=>['Item '+label+' '+(i+1),14839.02+i]),footerRows:[{id:'total',cells:[{id:'l',colspan:1,value:'Total',alignment:'RIGHT',style:{...text,bold:true}},{id:'v',colspan:1,value:'38922.31',alignment:'RIGHT',style:{...text,bold:true}}],style:text,backgroundColor:'#FFFFFF'}],empty:false,widthPercent:100,alignment:'LEFT',headerStyle:text,cellStyle:text,border:{width:1,color:'#CBD5E1',style:'SOLID'},cellPadding:{top:2,right:2,bottom:2,left:2},layout});
 const model={variables:{},page:pd,header,body,footer:[{id:'f-'+id,type:'TEXT',text:'FOOTER '+label,style:text,layout}],metadata:{documentGroupId:id}};
 const template={id:'t-'+id,name:'T '+label,version:1,page:pd,header:{blocks:[]},body:{blocks:[]},footer:{blocks:[]}};
 return {documentGroupId:id,label,template,model};
}
const dec=new TextDecoder('latin1');
const pdfText=b=>dec.decode(b);
const pageCount=b=>(pdfText(b).match(/\/Type \/Page\b/g)||[]).length;
const assert=(cond,msg)=>{if(!cond)throw new Error(msg)};
const renderer=new CombinedPdfRenderer();

const basic=await renderer.render([fixture('a','INV-A'),fixture('b','INV-B')],{pageNumbering:'PER_DOCUMENT',totalDocumentsHint:2});
assert(basic.documentCount===2&&basic.totalPages===2&&pageCount(basic.content)===2,'basic combined page boundary');
assert((pdfText(basic.content).match(/Page 1 of 1/g)||[]).length===2,'per-document numbering');

const global=await renderer.render([fixture('a','INV-A'),fixture('b','INV-B')],{pageNumbering:'GLOBAL'});
assert(pdfText(global.content).includes('Page 1 of 2')&&pdfText(global.content).includes('Page 2 of 2'),'global numbering');

const long=fixture('long','LONG',85);
const single=await new PdfRenderer().render(long.template,long.model);
const oneCombined=await renderer.render([long]);
assert(pageCount(single.content)===oneCombined.totalPages,'single-vs-combined pagination parity');

let resolved=[];
await renderer.render([
 {documentGroupId:'a',resolve:async()=>{resolved.push('a');const x=fixture('a','A');return{template:x.template,model:x.model}}},
 {documentGroupId:'b',resolve:async()=>{resolved.push('b');const x=fixture('b','B');return{template:x.template,model:x.model}}},
]);
assert(resolved.join(',')==='a,b','lazy sequential resolution');

const duplicate=await renderer.render([fixture('a','FIRST'),fixture('a','DUPLICATE'),fixture('b','SECOND')]);
assert(duplicate.documentCount===2&&!pdfText(duplicate.content).includes('DUPLICATE'),'duplicate group dedupe');

const landscape={...page,orientation:'LANDSCAPE'};
const mixed=await renderer.render([fixture('p','PORTRAIT'),fixture('l','LANDSCAPE',0,landscape)]);
const boxes=[...pdfText(mixed.content).matchAll(/\/MediaBox \[0 0 ([0-9.]+) ([0-9.]+)\]/g)].map(m=>m[1]+'x'+m[2]);
assert(new Set(boxes).size>=2,'mixed physical page sizes');

const withImages=await renderer.render([fixture('img1','IMG-1',0,page,{image:true}),fixture('img2','IMG-2',0,page,{image:true})]);
const imagePdf=pdfText(withImages.content);
assert(imagePdf.includes('/D1_Im1')&&imagePdf.includes('/D2_Im1'),'image resource namespacing');

let completed=0,cancelled=false;
try{await renderer.render([fixture('c1','C1'),fixture('c2','C2')],{shouldCancel:()=>completed>=1,onDocumentComplete:()=>completed++});}catch(e){cancelled=e instanceof CombinedPdfError&&e.code==='COMBINED_PDF_CANCELLED'}
assert(cancelled,'boundary cancellation');

const bad=fixture('bad','BAD',1);
bad.model.body.push({id:'tail-too-large',type:'SPACER',height:400,layout:{...layout,keepTogether:true}});
let failedSafe=false;
try{await renderer.render([fixture('ok','OK'),bad])}catch(e){failedSafe=e instanceof CombinedPdfError&&e.code==='DOCUMENT_RENDER_FAILED'&&e.documentGroupId==='bad'&&e.message.includes('TRAILING_BLOCK_EXCEEDS_PAGE')}
assert(failedSafe,'fail-fast document context');

let empty=false;
try{await renderer.render([])}catch(e){empty=e instanceof CombinedPdfError&&e.code==='EMPTY_DOCUMENT_SELECTION'}
assert(empty,'empty selection validation');

console.log(JSON.stringify({status:'PASS',basicPages:basic.totalPages,longPages:oneCombined.totalPages,lazyResolution:resolved,mixedPageSizes:[...new Set(boxes)],imageNamespaced:true,cancellation:true,failFast:true},null,2));
