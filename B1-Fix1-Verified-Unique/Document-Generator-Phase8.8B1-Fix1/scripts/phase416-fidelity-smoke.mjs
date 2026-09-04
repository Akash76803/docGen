import { PdfRenderer } from '../packages/renderer-pdf/dist/pdf-renderer.js';
import { resolvePageGeometry, resolveFidelityColumnWidths, isFinancialDisplayValue } from '../packages/renderer-sdk/dist/fidelity.js';

const layout={widthPercent:60,alignment:'RIGHT',marginTop:0,marginRight:0,marginBottom:0,marginLeft:0,keepTogether:false,breakBefore:false,breakAfter:false};
const text={fontFamily:'Arial',fontSize:9,bold:false,italic:false,underline:false,textColor:'#000000',backgroundColor:'#FFFFFF',alignment:'LEFT',lineHeight:1.2};
const page={size:'A4',orientation:'PORTRAIT',margins:{top:10,right:14,bottom:12,left:16},pagination:{repeatHeader:true,footerMode:'FLOW',showPageNumbers:false}};
const columns=['HSN','GST','Taxable Amt.','SGST','CGST','IGST','Total'].map((label,i)=>({id:`c${i}`,label,widthPercent:[16,12,18,11,11,11,21][i],alignment:i<2?'CENTER':'RIGHT',headerAlignment:'CENTER',style:text}));
const row=['73201020','18.00%','₹9,588.15','₹862.93','₹862.93','₹0.00','₹11,314.01'].map((value,i)=>({id:`v${i}`,columnId:`c${i}`,value,alignment:i<2?'CENTER':'RIGHT',style:text}));
const total=['Total','','₹9,588.15','₹862.93','₹862.93','₹0.00','₹11,314.02'].map((value,i)=>({id:`t${i}`,columnId:`c${i}`,value,alignment:i===0?'RIGHT':i===1?'CENTER':'RIGHT',style:{...text,bold:true}}));
const summary={id:'tax',type:'SUMMARY_TABLE',showHeader:true,showBorder:true,columns,rows:[{id:'r',cells:row,style:text,backgroundColor:'#FFFFFF',bold:false}],totalRow:{id:'tr',cells:total,style:{...text,bold:true},backgroundColor:'#FFFFFF',bold:true},widthPercent:60,alignment:'RIGHT',headerStyle:text,cellStyle:text,border:{width:1,color:'#94A3B8',style:'SOLID'},cellPadding:{top:1,right:1,bottom:1,left:1},layout};
const model={variables:{},page,body:[summary],metadata:{documentGroupId:'phase416-smoke'}};
const template={id:'phase416-smoke',name:'Phase416 Smoke',version:1,page,header:{blocks:[]},body:{blocks:[]},footer:{blocks:[]}};
const result=await new PdfRenderer().render(template,model);
const pdf=new TextDecoder('latin1').decode(result.content);
const geometry=resolvePageGeometry(page);
const widths=resolveFidelityColumnWidths([{widthPercent:16},{widthPercent:12},{widthPercent:18},{widthPercent:11},{widthPercent:11},{widthPercent:11},{widthPercent:21}],600);
const checks={
  pageContentWidthMm:geometry.contentWidthMm,
  widthsTotal:Number(widths.reduce((a,b)=>a+b,0).toFixed(3)),
  rupeeNoRsFallback:!pdf.includes('Rs.'),
  numericPayloadPreserved:pdf.includes('9,588.15')&&pdf.includes('11,314.01'),
  financialClassification:isFinancialDisplayValue('₹11,314.01'),
};
if(checks.pageContentWidthMm!==180 || checks.widthsTotal!==600 || !checks.rupeeNoRsFallback || !checks.numericPayloadPreserved || !checks.financialClassification){
  console.error(JSON.stringify({status:'FAIL',checks},null,2));process.exit(1);
}
console.log(JSON.stringify({status:'PASS',checks},null,2));
