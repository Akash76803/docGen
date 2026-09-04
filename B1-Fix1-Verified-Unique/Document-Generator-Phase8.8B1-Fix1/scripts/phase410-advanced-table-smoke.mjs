import { writeFile } from 'node:fs/promises';
import { TemplateEngine } from '@document-tool/template-engine';
import { PdfRenderer } from '@document-tool/renderer-pdf';

const group={id:'phase410-smoke',key:'INV-410',valid:true,warnings:[],sourceRowIndexes:[1,2],itemDetails:[],header:{gst:{type:'LOCAL'}},items:[{id:'ROW-A',tax:0.18,qty:2,rate:125},{id:'ROW-B',tax:0.05,qty:3,rate:90}],sourceItems:[]};
const table={id:'tb',type:'TABLE',sourcePath:'items',headerGroups:[{id:'hg',label:'Commercial',startColumnId:'tax',colspan:2}],columns:[
  {id:'n',label:'#',path:'',kind:'ROW_NUMBER'},
  {id:'tax',label:'Tax',path:'tax',format:{type:'PERCENT',percentInputMode:'FRACTION'}},
  {id:'amount',label:'Amount',path:'',kind:'FORMULA',formulaExpression:'{{q}}*{{r}}',formulaBindings:[{id:'q',label:'Qty',path:'qty'},{id:'r',label:'Rate',path:'rate'}],format:{type:'NUMBER',decimals:0}},
  {id:'igst',label:'IGST',path:'tax',visibility:{path:'gst.type',operator:'EQUALS',value:'IGST'}},
  {id:'qr',label:'QR',path:'id',kind:'QR',qr:{errorCorrection:'M',widthMm:16,heightMm:16}}
]};
const template={id:'phase410',name:'Phase410 Advanced Table Smoke',version:1,page:{size:'A4',orientation:'PORTRAIT',margins:{top:10,right:10,bottom:10,left:10},pagination:{showPageNumbers:true}},header:{blocks:[]},body:{blocks:[table]},footer:{blocks:[]}};
const built=new TemplateEngine().buildRenderModel(template,group);
if(built.errors.length||!built.model) throw new Error(`TemplateEngine failed: ${JSON.stringify(built.errors)}`);
const b=built.model.body[0]; if(b.type!=='TABLE') throw new Error('Expected TABLE render block.');
if(b.columns.some(c=>c.id==='igst')) throw new Error('Conditional IGST column should be hidden for LOCAL GST.');
if(b.rows[0]?.[1]!=='18%') throw new Error(`Expected 18%, got ${String(b.rows[0]?.[1])}`);
if(b.rows[0]?.[2]!=='250') throw new Error(`Expected formula 250, got ${String(b.rows[0]?.[2])}`);
if(!String(b.rows[0]?.[3]).startsWith('data:image/svg+xml')) throw new Error('Expected offline QR SVG data URL.');
const pdf=await new PdfRenderer().render(template,built.model,{fileNamePrefix:'phase410-advanced-table-smoke'});
await writeFile('phase410-advanced-table-smoke.pdf',pdf.content);
console.log(JSON.stringify({status:'PASS',columns:b.columns.map(c=>c.id),row0:b.rows[0].map((v,i)=>i===3?'QR_DATA_URL':v),headerGroups:b.headerGroups?.length??0,pdfBytes:pdf.content.length},null,2));
