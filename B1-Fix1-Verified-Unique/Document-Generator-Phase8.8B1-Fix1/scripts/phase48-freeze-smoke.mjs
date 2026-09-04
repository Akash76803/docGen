import assert from 'node:assert/strict';
import { canPlace, DEFAULT_PAGINATION_POLICY, PAGINATION_EPSILON_MM, PAGINATION_SAFETY_GAP_MM } from '../packages/renderer-sdk/dist/index.js';
import { PdfRenderer } from '../packages/renderer-pdf/dist/pdf-renderer.js';

assert.equal(PAGINATION_SAFETY_GAP_MM,3);
assert.equal(PAGINATION_EPSILON_MM,.1);
assert.equal(DEFAULT_PAGINATION_POLICY.trailingBlockMode,'ATOMIC');
assert.equal(canPlace(20,10,12,3,.1),false);
assert.equal(canPlace(25,10,12,3,.1),true);

const layout={widthPercent:100,alignment:'LEFT',marginTop:0,marginRight:0,marginBottom:0,marginLeft:0,keepTogether:false,breakBefore:false,breakAfter:false};
const text={fontFamily:'Arial',fontSize:9,bold:false,italic:false,underline:false,textColor:'#000000',backgroundColor:'#FFFFFF',alignment:'LEFT',lineHeight:1.2};
const page={size:'A4',orientation:'PORTRAIT',margins:{top:12,right:12,bottom:12,left:12},pagination:{repeatHeader:true,repeatFooter:true,showPageNumbers:true,pageNumberPosition:'BOTTOM_CENTER',footerMode:'REPEAT_PAGE'}};
const table={id:'t',type:'TABLE',showHeader:true,showBorder:true,columns:[{id:'d',label:'Description',path:'d',widthPercent:70,alignment:'LEFT',headerAlignment:'LEFT',headerStyle:text,cellStyle:text},{id:'a',label:'Amount',path:'a',widthPercent:30,alignment:'RIGHT',headerAlignment:'RIGHT',headerStyle:text,cellStyle:text}],rows:Array.from({length:80},(_,i)=>[`Item ${i+1}`,14839.02+i]),footerRows:[{id:'f',cells:[{id:'l',colspan:1,value:'Total',alignment:'RIGHT',style:text},{id:'v',colspan:1,value:'38922.31',alignment:'RIGHT',style:text}],style:text,backgroundColor:'#FFFFFF'}],empty:false,widthPercent:100,alignment:'LEFT',headerStyle:text,cellStyle:text,border:{width:1,color:'#CBD5E1',style:'SOLID'},cellPadding:{top:2,right:2,bottom:2,left:2},layout};
const model={variables:{},page,header:[{id:'h',type:'TEXT',text:'FREEZE HEADER',style:text,layout}],body:[table],footer:[{id:'ft',type:'TEXT',text:'FREEZE FOOTER',style:text,layout}],metadata:{documentGroupId:'smoke'}};
const template={id:'phase48-smoke',name:'Phase48 Smoke',version:1,page,header:{blocks:[]},body:{blocks:[]},footer:{blocks:[]}};
let diag;
const out=await new PdfRenderer().render(template,model,{options:{onDiagnostics:d=>diag=d}});
const raw=new TextDecoder('latin1').decode(out.content);
const pages=(raw.match(/\/Type \/Page\b/g)||[]).length;
assert.ok(pages>1);
assert.equal((raw.match(/FREEZE HEADER/g)||[]).length,pages);
assert.equal(diag.pageCount,pages);
assert.ok(raw.includes('14839.02'));

const oversize={...model,body:[{...table,rows:[['One row',1]]},{id:'tail',type:'SPACER',height:400,layout:{...layout,keepTogether:true}}]};
await assert.rejects(()=>new PdfRenderer().render(template,oversize),/TRAILING_BLOCK_EXCEEDS_PAGE/);
console.log(JSON.stringify({status:'PASS',pages,diagnostics:diag},null,2));
