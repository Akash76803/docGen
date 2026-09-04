import { TemplateEngine } from '../packages/template-engine/dist/index.js';
const template={id:'p411',name:'p411',page:{size:'A4',orientation:'PORTRAIT',margins:{top:10,right:10,bottom:10,left:10}},header:{blocks:[]},body:{blocks:[{id:'txt',type:'TEXT',text:'Invoice: {{invoice}}\nGST: {{rate}}\n\nThank you.',fieldTokens:{rate:{format:{type:'PERCENT',percentInputMode:'FRACTION',decimals:0}}}}]},footer:{blocks:[]}};
const group={id:'g',key:'g',header:{invoice:'INV-001',rate:.18},items:[],sourceItems:[]};
const r=new TemplateEngine().buildRenderModel(template,group);
if(r.errors.length||r.model?.body?.[0]?.text!=='Invoice: INV-001\nGST: 18%\n\nThank you.') throw new Error('Phase 4.11 rich-text smoke failed');
console.log(JSON.stringify({status:'PASS',text:r.model.body[0].text},null,2));
