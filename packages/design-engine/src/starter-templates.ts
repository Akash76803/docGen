import type { Artboard, DesignElement, DesignTemplate, ShapeDesignElement, TextDesignElement } from '@document-tool/contracts';
import { createBlankArtboard } from './artboards.js';

export type StarterTemplateId='corporate-employee-id-cr80';
export interface DesignStarterTemplate { id:StarterTemplateId; name:string; category:string; description:string; create:(idFactory?:(prefix:string)=>string)=>DesignTemplate; }

const defaultIdFactory=(prefix:string)=>`${prefix}-${globalThis.crypto?.randomUUID?.()??`${Date.now()}-${Math.random().toString(16).slice(2)}`}`;
const solid=(color:string):ShapeDesignElement['fill']=>({type:'SOLID',color,opacity:1});
const none=():ShapeDesignElement['fill']=>({type:'NONE'});
const stroke=(color='#0f172a',widthMm=.25,style:ShapeDesignElement['stroke']['style']='SOLID'):ShapeDesignElement['stroke']=>({color,widthMm,style});

function shape(id:string,name:string,shapeType:ShapeDesignElement['shape'],x:number,y:number,w:number,h:number,z:number,fill:ShapeDesignElement['fill'],border=stroke('#000000',0,'NONE'),radius=0):ShapeDesignElement{return{id,type:'SHAPE',name,position:{xMm:x,yMm:y},size:{widthMm:w,heightMm:h},rotationDeg:0,opacity:1,visible:true,locked:false,zIndex:z,shape:shapeType,fill,stroke:border,cornerRadiusMm:radius};}
function text(id:string,name:string,value:string,x:number,y:number,w:number,h:number,z:number,sizePt:number,color:string,weight=400,align:TextDesignElement['style']['alignment']='LEFT',bindingPath?:string):TextDesignElement{return{id,type:'TEXT',name,position:{xMm:x,yMm:y},size:{widthMm:w,heightMm:h},rotationDeg:0,opacity:1,visible:true,locked:false,zIndex:z,text:value,style:{fontFamily:'Arial',fontSizePt:sizePt,fontWeight:weight,italic:false,underline:false,color,alignment:align,lineHeight:1.1,letterSpacingPt:0},binding:bindingPath?{source:'SOURCE_FIELD',path:bindingPath,missingBehavior:'FALLBACK',fallback:value}:undefined};}

function buildFront(factory:(p:string)=>string):Artboard{
 const a=createBlankArtboard({id:factory('id-front'),name:'Front',order:0,widthMm:85.6,heightMm:53.98,background:{type:'SOLID',color:'#ffffff',opacity:1}});
 a.print={bleed:{topMm:3,rightMm:3,bottomMm:3,leftMm:3},safeArea:{topMm:3,rightMm:3,bottomMm:3,leftMm:3}};
 const e:DesignElement[]=[];let z=0;
 e.push(shape(factory('front-band'),'Brand Header','RECTANGLE',0,0,85.6,12.5,z++,solid('#173b67')));
 e.push(shape(factory('front-accent'),'Accent Line','RECTANGLE',0,12.5,85.6,1.25,z++,solid('#24a6a1')));
 e.push(shape(factory('front-logo'),'Company Logo Placeholder','ROUNDED_RECTANGLE',5,3.1,16,6.4,z++,none(),stroke('#ffffff',.35,'SOLID'),1.2));
 e.push(text(factory('front-logo-text'),'Company Logo Text','YOUR LOGO',5,4.65,16,3,z++,7,'#ffffff',700,'CENTER'));
 e.push(text(factory('front-company'),'Company Name','NORTHSTAR INDUSTRIES',24,3.0,55,4.2,z++,10,'#ffffff',700));
 e.push(text(factory('front-tagline'),'Company Tagline','People • Quality • Progress',24,7.2,55,2.8,z++,5.7,'#dbeafe',400));
 e.push(shape(factory('front-photo'),'Employee Photo Placeholder','ROUNDED_RECTANGLE',5.5,18,24,28,z++,solid('#eef2f7'),stroke('#cbd5e1',.35,'SOLID'),2));
 e.push(shape(factory('front-photo-head'),'Photo Head','CIRCLE',12.8,21.5,9.5,9.5,z++,solid('#cbd5e1')));
 e.push(shape(factory('front-photo-body'),'Photo Body','ROUNDED_RECTANGLE',9.5,31.5,16,10.5,z++,solid('#cbd5e1'),stroke('#000000',0,'NONE'),5));
 e.push(text(factory('front-name-label'),'Name','EMPLOYEE NAME',34,18,45,5,z++,13,'#0f172a',700,'LEFT','Employee.Name'));
 e.push(text(factory('front-role'),'Designation','Senior Executive',34,23.4,45,3.5,z++,7.5,'#475569',400,'LEFT','Employee.Designation'));
 e.push(text(factory('front-id-label'),'Employee ID Label','EMPLOYEE ID',34,30.0,17,2.8,z++,5.7,'#64748b',700));
 e.push(text(factory('front-id'),'Employee ID','EMP-00124',34,33.0,24,3.6,z++,8.2,'#0f172a',700,'LEFT','Employee.EmployeeId'));
 e.push(text(factory('front-dept-label'),'Department Label','DEPARTMENT',34,38.0,17,2.8,z++,5.7,'#64748b',700));
 e.push(text(factory('front-dept'),'Department','Operations',34,41.0,25,3.5,z++,7.7,'#0f172a',600,'LEFT','Employee.Department'));
 e.push(shape(factory('front-qr'),'QR Placeholder','ROUNDED_RECTANGLE',65.5,31.2,14.5,14.5,z++,solid('#f8fafc'),stroke('#173b67',.35,'SOLID'),1));
 e.push(text(factory('front-qr-text'),'QR Placeholder Text','QR',65.5,36.1,14.5,4,z++,10,'#173b67',700,'CENTER','Employee.QR'));
 e.push(shape(factory('front-footer'),'Footer Bar','RECTANGLE',0,49.7,85.6,4.28,z++,solid('#173b67')));
 e.push(text(factory('front-footer-text'),'Footer Text','IDENTITY CARD • PROPERTY OF NORTHSTAR',4,50.7,77.6,2.3,z++,5.3,'#ffffff',600,'CENTER'));
 return{...a,elements:e};
}

function buildBack(factory:(p:string)=>string):Artboard{
 const a=createBlankArtboard({id:factory('id-back'),name:'Back',order:1,widthMm:85.6,heightMm:53.98,background:{type:'SOLID',color:'#ffffff',opacity:1}});
 a.print={bleed:{topMm:3,rightMm:3,bottomMm:3,leftMm:3},safeArea:{topMm:3,rightMm:3,bottomMm:3,leftMm:3}};
 const e:DesignElement[]=[];let z=0;
 e.push(shape(factory('back-band'),'Brand Header','RECTANGLE',0,0,85.6,9,z++,solid('#173b67')));
 e.push(text(factory('back-title'),'Back Heading','EMPLOYEE IDENTIFICATION',5,2.5,75.6,3.5,z++,8,'#ffffff',700,'CENTER'));
 e.push(text(factory('back-address-title'),'Company Address Label','COMPANY ADDRESS',6,13,36,2.6,z++,5.5,'#64748b',700));
 e.push(text(factory('back-address'),'Company Address','Northstar Industries\nCorporate Office, Business Park\nPune, Maharashtra 411001',6,16,42,9,z++,6.2,'#0f172a',400));
 e.push(text(factory('back-emergency-title'),'Emergency Label','EMERGENCY CONTACT',6,28,32,2.6,z++,5.5,'#64748b',700));
 e.push(text(factory('back-emergency'),'Emergency Contact','+91 98765 43210',6,31,34,3.6,z++,7,'#0f172a',600,'LEFT','Employee.EmergencyContact'));
 e.push(text(factory('back-valid-title'),'Validity Label','VALID UNTIL',52,13,22,2.6,z++,5.5,'#64748b',700));
 e.push(text(factory('back-valid'),'Validity','31 DEC 2027',52,16,26,3.6,z++,7,'#0f172a',600,'LEFT','Employee.ValidUntil'));
 e.push(text(factory('back-blood-title'),'Blood Group Label','BLOOD GROUP',52,22,22,2.6,z++,5.5,'#64748b',700));
 e.push(text(factory('back-blood'),'Blood Group','O+',52,25,20,3.8,z++,8,'#0f172a',700,'LEFT','Employee.BloodGroup'));
 e.push(shape(factory('back-sign-line'),'Signature Line','LINE',50.5,36.8,29,1,z++,none(),stroke('#334155',.3,'SOLID')));
 e.push(text(factory('back-sign'),'Authorized Sign','Authorized Signatory',50.5,38,29,3,z++,5.7,'#64748b',400,'CENTER'));
 e.push(text(factory('back-terms'),'Terms','If found, please return this card to the company. This card is non-transferable and must be surrendered on separation.',6,39.2,39,8,z++,5.2,'#475569',400));
 e.push(shape(factory('back-footer'),'Footer Bar','RECTANGLE',0,49.7,85.6,4.28,z++,solid('#24a6a1')));
 e.push(text(factory('back-web'),'Website','www.northstar.example  •  hr@northstar.example',5,50.7,75.6,2.3,z++,5.3,'#ffffff',600,'CENTER'));
 return{...a,elements:e};
}

export function createCorporateEmployeeIdTemplate(idFactory:(prefix:string)=>string=defaultIdFactory):DesignTemplate{
 return{kind:'CARD_DESIGN',schemaVersion:1,id:idFactory('card-template-id'),name:'Corporate Employee ID Card',version:1,status:'DRAFT',artboards:[buildFront(idFactory),buildBack(idFactory)],sharedAssets:[],metadata:{starterTemplateId:'corporate-employee-id-cr80',category:'ID_CARD',standard:'CR80',editable:true}};
}

export const DESIGN_STARTER_TEMPLATES:readonly DesignStarterTemplate[]=[{id:'corporate-employee-id-cr80',name:'Corporate Employee ID Card',category:'ID Card',description:'Editable CR80 employee ID card with Front and Back artboards.',create:createCorporateEmployeeIdTemplate}];
