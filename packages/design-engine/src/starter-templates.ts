import type { Artboard, AssetReference, DesignTemplate, ShapeDesignElement, SvgDesignElement, TextDesignElement } from '@document-tool/contracts';
import { createBlankArtboard } from './artboards.js';
import { DECORATIVE_ASSETS, decorativeAssetReference, type DecorativeAssetId } from './decorative-assets.js';

export type StarterTemplateId=
  |'corporate-employee-id-cr80'
  |'modern-business-card'
  |'floral-invitation-a6'
  |'thank-you-card-a6'
  |'product-label-80x50'
  |'gift-voucher-180x80'
  |'simple-certificate-a4'
  |'minimal-packaging-front-100x140';
export interface DesignStarterTemplate { id:StarterTemplateId; name:string; category:string; description:string; create:(idFactory?:(prefix:string)=>string)=>DesignTemplate; }

const defaultIdFactory=(prefix:string)=>`${prefix}-${globalThis.crypto?.randomUUID?.()??`${Date.now()}-${Math.random().toString(16).slice(2)}`}`;
const solid=(color:string):ShapeDesignElement['fill']=>({type:'SOLID',color,opacity:1});
const none=():ShapeDesignElement['fill']=>({type:'NONE'});
const stroke=(color='#0f172a',widthMm=.25,style:ShapeDesignElement['stroke']['style']='SOLID'):ShapeDesignElement['stroke']=>({color,widthMm,style});
function shape(id:string,name:string,shapeType:ShapeDesignElement['shape'],x:number,y:number,w:number,h:number,z:number,fill:ShapeDesignElement['fill'],border=stroke('#000000',0,'NONE'),radius=0):ShapeDesignElement{return{id,type:'SHAPE',name,position:{xMm:x,yMm:y},size:{widthMm:w,heightMm:h},rotationDeg:0,opacity:1,visible:true,locked:false,zIndex:z,shape:shapeType,fill,stroke:border,cornerRadiusMm:radius};}
function text(id:string,name:string,value:string,x:number,y:number,w:number,h:number,z:number,sizePt:number,color:string,weight=400,align:TextDesignElement['style']['alignment']='LEFT',bindingPath?:string):TextDesignElement{return{id,type:'TEXT',name,position:{xMm:x,yMm:y},size:{widthMm:w,heightMm:h},rotationDeg:0,opacity:1,visible:true,locked:false,zIndex:z,text:value,style:{fontFamily:'Arial',fontSizePt:sizePt,fontWeight:weight,italic:false,underline:false,color,alignment:align,lineHeight:1.1,letterSpacingPt:0},binding:bindingPath?{source:'SOURCE_FIELD',path:bindingPath,missingBehavior:'FALLBACK',fallback:value}:undefined};}
function svg(id:string,name:string,assetId:string,x:number,y:number,w:number,h:number,z:number,rotationDeg=0):SvgDesignElement{return{id,type:'SVG',name,assetId,position:{xMm:x,yMm:y},size:{widthMm:w,heightMm:h},rotationDeg,opacity:1,visible:true,locked:false,zIndex:z,preserveVector:true};}
function print(a:Artboard,bleed=3,safe=3):Artboard{return{...a,print:{bleed:{topMm:bleed,rightMm:bleed,bottomMm:bleed,leftMm:bleed},safeArea:{topMm:safe,rightMm:safe,bottomMm:safe,leftMm:safe}}};}
function art(factory:(p:string)=>string,name:string,order:number,w:number,h:number,bg='#ffffff'){return print(createBlankArtboard({id:factory(`art-${name.toLowerCase().replace(/\s+/g,'-')}`),name,order,widthMm:w,heightMm:h,background:{type:'SOLID',color:bg,opacity:1}}));}
function assets(...ids:DecorativeAssetId[]):AssetReference[]{return ids.map(id=>decorativeAssetReference(DECORATIVE_ASSETS.find(a=>a.id===id)!));}
function template(factory:(p:string)=>string,name:string,id:StarterTemplateId,category:string,artboards:Artboard[],sharedAssets:AssetReference[]=[]):DesignTemplate{return{kind:'CARD_DESIGN',schemaVersion:1,id:factory(`template-${id}`),name,version:1,status:'DRAFT',artboards,sharedAssets,metadata:{starterTemplateId:id,category,editable:true}};}

export function createCorporateEmployeeIdTemplate(f:(p:string)=>string=defaultIdFactory):DesignTemplate{
 const front=art(f,'Front',0,85.6,53.98); const back=art(f,'Back',1,85.6,53.98); let z=0;
 front.elements=[shape(f('id-head'),'Header','RECTANGLE',0,0,85.6,13,z++,solid('#173b67')),text(f('id-co'),'Company','NORTHSTAR INDUSTRIES',25,3,55,4,z++,10,'#fff',700),shape(f('id-photo'),'Photo','ROUNDED_RECTANGLE',6,18,23,27,z++,solid('#eef2f7'),stroke('#cbd5e1',.3),2),text(f('id-name'),'Employee Name','EMPLOYEE NAME',34,18,45,5,z++,13,'#0f172a',700,'LEFT','Employee.Name'),text(f('id-role'),'Designation','Senior Executive',34,24,42,4,z++,7,'#475569',400,'LEFT','Employee.Designation'),text(f('id-id'),'Employee ID','EMP-00124',34,32,28,4,z++,8,'#0f172a',700,'LEFT','Employee.EmployeeId'),text(f('id-dept'),'Department','Operations',34,39,28,4,z++,7,'#0f172a',600,'LEFT','Employee.Department'),shape(f('id-qr'),'QR','ROUNDED_RECTANGLE',66,31,14,14,z++,none(),stroke('#173b67',.35),1),text(f('id-qrt'),'QR','QR',66,36,14,4,z++,10,'#173b67',700,'CENTER','Employee.QR')];
 z=0;back.elements=[shape(f('id-bh'),'Header','RECTANGLE',0,0,85.6,9,z++,solid('#173b67')),text(f('id-bt'),'Heading','EMPLOYEE IDENTIFICATION',5,2.5,75.6,3.5,z++,8,'#fff',700,'CENTER'),text(f('id-ba'),'Address','Northstar Industries\nCorporate Office, Pune',6,14,40,8,z++,6,'#0f172a'),text(f('id-be'),'Emergency','Emergency: +91 98765 43210',6,28,38,4,z++,6.5,'#0f172a',600,'LEFT','Employee.EmergencyContact'),text(f('id-bv'),'Validity','Valid Until: 31 DEC 2027',50,14,30,4,z++,6.5,'#0f172a',600,'LEFT','Employee.ValidUntil'),text(f('id-bg'),'Blood','Blood Group: O+',50,22,28,4,z++,6.5,'#0f172a',600,'LEFT','Employee.BloodGroup'),shape(f('id-sign'),'Signature','LINE',50,37,30,1,z++,none(),stroke('#334155',.3)),text(f('id-terms'),'Terms','If found, please return this card to the company.',6,40,38,6,z++,5.2,'#475569')];
 return template(f,'Corporate Employee ID Card','corporate-employee-id-cr80','ID Card',[front,back]);
}

export function createModernBusinessCardTemplate(f:(p:string)=>string=defaultIdFactory):DesignTemplate{
 const front=art(f,'Front',0,90,50,'#0f172a'),back=art(f,'Back',1,90,50,'#ffffff');let z=0;
 front.elements=[shape(f('bc-accent'),'Accent','RECTANGLE',0,0,7,50,z++,solid('#14b8a6')),text(f('bc-name'),'Name','AKASH GAIKWAD',14,16,65,6,z++,16,'#fff',700),text(f('bc-role'),'Role','SALESFORCE DEVELOPER',14,24,60,4,z++,7,'#99f6e4',600),text(f('bc-tag'),'Tag','Build • Automate • Scale',14,33,56,4,z++,6.5,'#cbd5e1')];
 z=0;back.elements=[text(f('bc-company'),'Company','YOUR COMPANY',10,8,70,6,z++,14,'#0f172a',700,'CENTER'),shape(f('bc-line'),'Divider','RECTANGLE',25,17,40,1,z++,solid('#14b8a6')),text(f('bc-contact'),'Contact','+91 98765 43210\nhello@example.com\nwww.example.com',16,23,58,16,z++,7,'#334155',500,'CENTER'),text(f('bc-address'),'Address','Pune, Maharashtra, India',15,42,60,4,z++,6,'#64748b',400,'CENTER')];
 return template(f,'Modern Business Card','modern-business-card','Business Card',[front,back]);
}

export function createFloralInvitationTemplate(f:(p:string)=>string=defaultIdFactory):DesignTemplate{
 const a=art(f,'Invitation',0,105,148,'#fffaf5');const aa=assets('floral-corner-rose','floral-divider','botanical-branch');let z=0;
 a.elements=[svg(f('inv-fl1'),'Floral Corner','floral-corner-rose',4,4,30,30,z++),svg(f('inv-fl2'),'Floral Corner','floral-corner-rose',71,114,30,30,z++,180),text(f('inv-small'),'Invite Label','YOU ARE INVITED',16,35,73,5,z++,7,'#9a6b4f',700,'CENTER'),text(f('inv-title'),'Title','A BEAUTIFUL CELEBRATION',12,45,81,12,z++,18,'#5f4739',700,'CENTER'),svg(f('inv-divider'),'Divider','floral-divider',25,61,55,10,z++),text(f('inv-body'),'Details','Saturday, 12 December\n6:30 PM onwards\nThe Garden Pavilion, Pune',14,78,77,25,z++,9,'#6b584d',400,'CENTER'),text(f('inv-footer'),'Footer','With love,\nThe Sharma Family',20,112,65,14,z++,8,'#9a6b4f',600,'CENTER')];
 return template(f,'Floral Invitation Card','floral-invitation-a6','Invitation',[a],aa);
}

export function createThankYouCardTemplate(f:(p:string)=>string=defaultIdFactory):DesignTemplate{
 const a=art(f,'Front',0,148,105,'#f8fafc');const aa=assets('floral-wreath','minimal-flower');let z=0;
 a.elements=[svg(f('ty-wreath'),'Wreath','floral-wreath',54,14,40,40,z++),text(f('ty-title'),'Title','THANK YOU',26,57,96,10,z++,22,'#1f2937',700,'CENTER'),text(f('ty-body'),'Message','Your support means more than words can say.',30,71,88,10,z++,9,'#64748b',400,'CENTER'),text(f('ty-sign'),'Signature','With gratitude,\nYour Brand',40,88,68,10,z++,7,'#475569',600,'CENTER')];
 return template(f,'Elegant Thank You Card','thank-you-card-a6','Thank You',[a],aa);
}

export function createProductLabelTemplate(f:(p:string)=>string=defaultIdFactory):DesignTemplate{
 const a=art(f,'Label',0,80,50,'#f7fee7');const aa=assets('botanical-branch');let z=0;
 a.elements=[shape(f('pl-frame'),'Frame','ROUNDED_RECTANGLE',2,2,76,46,z++,none(),stroke('#4d7c0f',.45),3),svg(f('pl-leaf'),'Botanical','botanical-branch',42,3,34,15,z++),text(f('pl-brand'),'Brand','AURAA NATURALS',7,8,42,5,z++,12,'#365314',700),text(f('pl-name'),'Product','PREMIUM AROMA',7,18,50,6,z++,15,'#1f2937',700),text(f('pl-sub'),'Subtitle','Fresh • Natural Inspired • Long Lasting',7,27,58,5,z++,6.5,'#4b5563'),text(f('pl-meta'),'Meta','Net Qty: 10 ml   |   MRP: ₹___',7,38,55,4,z++,6,'#4b5563')];
 return template(f,'Botanical Product Label','product-label-80x50','Product Label',[a],aa);
}

export function createGiftVoucherTemplate(f:(p:string)=>string=defaultIdFactory):DesignTemplate{
 const a=art(f,'Voucher',0,180,80,'#111827');const aa=assets('premium-corner','mandala-bloom');let z=0;
 a.elements=[svg(f('gv-c1'),'Corner','premium-corner',4,4,25,25,z++),svg(f('gv-c2'),'Corner','premium-corner',151,51,25,25,z++,180),text(f('gv-label'),'Label','GIFT VOUCHER',25,15,130,8,z++,18,'#fbbf24',700,'CENTER'),text(f('gv-value'),'Value','₹ 2,500',35,30,110,12,z++,28,'#ffffff',700,'CENTER'),text(f('gv-code'),'Code','CODE: GIFT-2026-001',48,50,84,6,z++,8,'#d1d5db',600,'CENTER'),text(f('gv-exp'),'Expiry','Valid until 31 Dec 2026',50,62,80,5,z++,6.5,'#9ca3af',400,'CENTER')];
 return template(f,'Premium Gift Voucher','gift-voucher-180x80','Voucher',[a],aa);
}

export function createCertificateTemplate(f:(p:string)=>string=defaultIdFactory):DesignTemplate{
 const a=art(f,'Certificate',0,297,210,'#fffdf7');const aa=assets('ornamental-frame','floral-divider');let z=0;
 a.elements=[shape(f('cert-border'),'Border','RECTANGLE',8,8,281,194,z++,none(),stroke('#b8860b',.8)),shape(f('cert-border2'),'Inner Border','RECTANGLE',13,13,271,184,z++,none(),stroke('#d6b85a',.3)),text(f('cert-top'),'Top','CERTIFICATE',48,36,201,10,z++,12,'#806000',700,'CENTER'),text(f('cert-title'),'Title','OF ACHIEVEMENT',38,52,221,18,z++,28,'#1f2937',700,'CENTER'),text(f('cert-presented'),'Presented','PROUDLY PRESENTED TO',80,82,137,6,z++,8,'#6b7280',600,'CENTER'),text(f('cert-name'),'Recipient','RECIPIENT NAME',50,94,197,16,z++,24,'#111827',700,'CENTER','Recipient.Name'),shape(f('cert-line'),'Name Line','LINE',70,113,157,1,z++,none(),stroke('#b8860b',.4)),text(f('cert-body'),'Body','For outstanding achievement and contribution.',55,126,187,10,z++,10,'#4b5563',400,'CENTER'),text(f('cert-date'),'Date','Date: ____________',40,169,80,6,z++,8,'#374151'),text(f('cert-sign'),'Sign','Authorized Signature',177,169,80,6,z++,8,'#374151',400,'CENTER')];
 return template(f,'Simple Achievement Certificate','simple-certificate-a4','Certificate',[a],aa);
}

export function createPackagingFrontTemplate(f:(p:string)=>string=defaultIdFactory):DesignTemplate{
 const a=art(f,'Front Panel',0,100,140,'#fff7ed');const aa=assets('floral-corner-leaf','floral-divider');let z=0;
 a.elements=[svg(f('pkg-corner'),'Leaf Corner','floral-corner-leaf',3,3,32,32,z++),text(f('pkg-brand'),'Brand','AURAA DREAMS',14,35,72,8,z++,18,'#7c2d12',700,'CENTER'),text(f('pkg-tag'),'Tagline','Breathe Beauty. Drive Bliss.',16,46,68,6,z++,8,'#9a3412',500,'CENTER'),svg(f('pkg-div'),'Divider','floral-divider',23,58,54,10,z++),text(f('pkg-product'),'Product','LUXURY CAR FRAGRANCE',12,74,76,9,z++,14,'#431407',700,'CENTER'),text(f('pkg-sub'),'Sub','Premium Aroma • Long Lasting',16,88,68,6,z++,7,'#7c2d12',500,'CENTER'),shape(f('pkg-space'),'Product Window','ROUNDED_RECTANGLE',25,102,50,24,z++,none(),stroke('#c2410c',.35,'DASHED'),4),text(f('pkg-note'),'Note','Fragrance / MRP / Batch / MFG',20,130,60,5,z++,6,'#9a3412',500,'CENTER')];
 return template(f,'Minimal Packaging Front Panel','minimal-packaging-front-100x140','Packaging Panel',[a],aa);
}

export const DESIGN_STARTER_TEMPLATES:readonly DesignStarterTemplate[]=[
{id:'corporate-employee-id-cr80',name:'Corporate Employee ID Card',category:'ID Card',description:'CR80 Front + Back employee identity card.',create:createCorporateEmployeeIdTemplate},
{id:'modern-business-card',name:'Modern Business Card',category:'Business Card',description:'Professional dark Front + Back business card.',create:createModernBusinessCardTemplate},
{id:'floral-invitation-a6',name:'Floral Invitation Card',category:'Invitation',description:'Elegant A6 invitation with editable botanical ornaments.',create:createFloralInvitationTemplate},
{id:'thank-you-card-a6',name:'Elegant Thank You Card',category:'Thank You',description:'Clean A6 thank-you card with floral wreath.',create:createThankYouCardTemplate},
{id:'product-label-80x50',name:'Botanical Product Label',category:'Product Label',description:'80 × 50 mm product label with botanical decoration.',create:createProductLabelTemplate},
{id:'gift-voucher-180x80',name:'Premium Gift Voucher',category:'Voucher',description:'Premium dark gift voucher with ornamental corners.',create:createGiftVoucherTemplate},
{id:'simple-certificate-a4',name:'Simple Achievement Certificate',category:'Certificate',description:'A4 landscape achievement certificate.',create:createCertificateTemplate},
{id:'minimal-packaging-front-100x140',name:'Minimal Packaging Front Panel',category:'Packaging Panel',description:'Editable 100 × 140 mm flat packaging front panel.',create:createPackagingFrontTemplate},
];
